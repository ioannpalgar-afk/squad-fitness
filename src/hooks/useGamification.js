import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { calculateXP, levelFromXP, levelProgress, xpForLevel, bestEstimate1RM } from '../utils/calculations'
import { getRankForLevel, MILESTONES, BADGES } from '../data/constants'

// Compute which badges are unlocked from raw stats + extra data
export function computeUnlockedBadges(rawStats, extraData = {}) {
  const unlocked = new Set()
  const {
    workoutCount, streak, prCount, uniqueExercises, tonnageTons,
    allHabitsDays, habitCompletions, bodyMetricEntries, weightIncreases,
  } = rawStats

  const {
    maxBenchWeight = 0,
    maxSquatWeight = 0,
    maxDeadliftWeight = 0,
    bodyWeight = 0,
    fatLossPct = 0,
    muscleGainKg = 0,
    isRecomp = false,
    hasEarlyBird = false,
    hasNightOwl = false,
    hasWeekendWarrior = false,
    weeklyVolumes = [],
  } = extraData

  // === CONSISTENCY ===
  if (workoutCount >= 1) unlocked.add('first-spark')
  if (streak >= 3) unlocked.add('streak-3')
  if (streak >= 7) unlocked.add('streak-7')
  if (streak >= 14) unlocked.add('streak-14')
  if (streak >= 30) unlocked.add('streak-30')
  if (streak >= 60) unlocked.add('streak-60')
  if (streak >= 100) unlocked.add('streak-100')
  if (workoutCount >= 10) unlocked.add('workouts-10')
  if (workoutCount >= 25) unlocked.add('workouts-25')
  if (workoutCount >= 50) unlocked.add('workouts-50')
  if (workoutCount >= 100) unlocked.add('workouts-100')
  if (workoutCount >= 200) unlocked.add('workouts-200')

  // === STRENGTH ===
  if (prCount >= 1) unlocked.add('first-pr')
  if (prCount >= 5) unlocked.add('prs-5')
  if (prCount >= 10) unlocked.add('prs-10')
  if (prCount >= 25) unlocked.add('prs-25')
  if (maxBenchWeight >= 60) unlocked.add('bench-60')
  if (maxBenchWeight >= 100) unlocked.add('bench-100')
  if (maxSquatWeight >= 100) unlocked.add('squat-100')
  if (maxDeadliftWeight >= 100) unlocked.add('deadlift-100')
  if (bodyWeight > 0 && maxBenchWeight >= bodyWeight) unlocked.add('bw-bench')
  if (weightIncreases >= 5) unlocked.add('weight-up')
  if (weightIncreases >= 15) unlocked.add('weight-up-15')

  // === VOLUME ===
  if (tonnageTons >= 1) unlocked.add('tonnage-1')
  if (tonnageTons >= 5) unlocked.add('tonnage-5')
  if (tonnageTons >= 10) unlocked.add('tonnage-10')
  if (tonnageTons >= 25) unlocked.add('tonnage-25')
  if (tonnageTons >= 50) unlocked.add('tonnage-50')
  if (tonnageTons >= 100) unlocked.add('tonnage-100')
  if (weeklyVolumes.some(v => v >= 10000)) unlocked.add('week-volume')

  // === HABITS ===
  if (allHabitsDays >= 1) unlocked.add('perfect-day')
  if (allHabitsDays >= 7) unlocked.add('perfect-7')
  if (allHabitsDays >= 30) unlocked.add('perfect-30')
  if (habitCompletions >= 100) unlocked.add('habits-100')
  if (habitCompletions >= 500) unlocked.add('habits-500')
  if (habitCompletions >= 1000) unlocked.add('habits-1000')

  // === BODY ===
  if (bodyMetricEntries >= 1) unlocked.add('first-measure')
  if (bodyMetricEntries >= 10) unlocked.add('measures-10')
  if (bodyMetricEntries >= 25) unlocked.add('measures-25')
  if (fatLossPct >= 3) unlocked.add('fat-loss-3')
  if (fatLossPct >= 5) unlocked.add('fat-loss-5')
  if (muscleGainKg >= 2) unlocked.add('muscle-gain-2')
  if (isRecomp) unlocked.add('recomp')

  // === EXPLORER ===
  if (uniqueExercises >= 5) unlocked.add('exercises-5')
  if (uniqueExercises >= 15) unlocked.add('exercises-15')
  if (uniqueExercises >= 30) unlocked.add('exercises-30')
  if (hasEarlyBird) unlocked.add('early-bird')
  if (hasNightOwl) unlocked.add('night-owl')
  if (hasWeekendWarrior) unlocked.add('weekend-warrior')

  // === SQUAD badges are computed separately via useSquadGamification ===

  return unlocked
}

export function useGamification(targetUserId = null) {
  const { user } = useAuth()
  const userId = targetUserId || user?.id
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    async function compute() {
      setLoading(true)

      // Fetch all data in parallel
      const [sessionsRes, setsRes, habitsRes, configsRes, metricsRes, exercisesRes] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('id, started_at, finished_at, duration_minutes')
          .eq('user_id', userId)
          .not('finished_at', 'is', null),
        supabase
          .from('session_sets')
          .select('exercise_id, reps, weight, session:workout_sessions!inner(user_id, started_at)')
          .eq('session.user_id', userId),
        supabase
          .from('routine_entries')
          .select('routine_config_id, date, completed')
          .eq('user_id', userId)
          .eq('completed', true),
        supabase
          .from('routine_configs')
          .select('id')
          .eq('user_id', userId)
          .eq('active', true),
        supabase
          .from('body_metrics')
          .select('id, weight, body_fat_pct, muscle_mass, measured_at')
          .eq('user_id', userId)
          .order('measured_at', { ascending: true }),
        supabase
          .from('exercises')
          .select('id, name'),
      ])

      const sessions = sessionsRes.data || []
      const sets = setsRes.data || []
      const habits = habitsRes.data || []
      const configs = configsRes.data || []
      const metrics = metricsRes.data || []
      const exercises = exercisesRes.data || []

      // Build exercise name map
      const exerciseMap = {}
      exercises.forEach(e => { exerciseMap[e.id] = e.name })

      const workoutCount = sessions.length
      const habitCompletions = habits.length

      // Count "perfect days" (all habits completed)
      const configCount = configs.length
      const habitsByDate = {}
      habits.forEach(h => {
        habitsByDate[h.date] = (habitsByDate[h.date] || 0) + 1
      })
      const allHabitsDays = configCount > 0
        ? Object.values(habitsByDate).filter(count => count >= configCount).length
        : 0

      // Unique exercises
      const uniqueExerciseIds = new Set(sets.map(s => s.exercise_id))
      const uniqueExercises = uniqueExerciseIds.size

      // PRs (best E1RM per exercise)
      const prMap = {}
      sets.forEach(s => {
        if (!s.weight || !s.reps) return
        const e1rm = bestEstimate1RM(Number(s.weight), s.reps)
        if (!prMap[s.exercise_id] || e1rm > prMap[s.exercise_id]) {
          prMap[s.exercise_id] = e1rm
        }
      })
      const prCount = Object.keys(prMap).length

      // Weight increases: count exercises where weight progressed
      const exerciseWeights = {}
      sets.forEach(s => {
        if (!s.weight) return
        if (!exerciseWeights[s.exercise_id]) exerciseWeights[s.exercise_id] = new Set()
        exerciseWeights[s.exercise_id].add(Number(s.weight))
      })
      const weightIncreases = Object.values(exerciseWeights)
        .filter(weights => weights.size > 1).length

      // Total tonnage
      const totalTonnage = sets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (s.reps || 0), 0)
      const tonnageTons = totalTonnage / 1000

      // Streak (from habits - consecutive days with all habits done)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      let streak = 0
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const dateStr = checkDate.toISOString().split('T')[0]
        if (habitsByDate[dateStr] && habitsByDate[dateStr] >= configCount && configCount > 0) {
          streak++
        } else if (i === 0) {
          continue // today not done yet is ok
        } else {
          break
        }
      }

      const bodyMetricEntries = metrics.length

      // === Extra data for badge checks ===

      // Max weights for specific exercises
      let maxBenchWeight = 0, maxSquatWeight = 0, maxDeadliftWeight = 0
      sets.forEach(s => {
        const name = exerciseMap[s.exercise_id] || ''
        const w = Number(s.weight) || 0
        if (name.includes('Press Banca') && !name.includes('Inclinado')) maxBenchWeight = Math.max(maxBenchWeight, w)
        if (name === 'Sentadilla') maxSquatWeight = Math.max(maxSquatWeight, w)
        if (name === 'Peso Muerto') maxDeadliftWeight = Math.max(maxDeadliftWeight, w)
      })

      // Latest body weight from metrics
      const latestWithWeight = [...metrics].reverse().find(m => m.weight)
      const bodyWeight = latestWithWeight?.weight || 0

      // Body fat loss & muscle gain
      const metricsWithFat = metrics.filter(m => m.body_fat_pct != null)
      let fatLossPct = 0
      if (metricsWithFat.length >= 2) {
        const firstFat = metricsWithFat[0].body_fat_pct
        const lastFat = metricsWithFat[metricsWithFat.length - 1].body_fat_pct
        fatLossPct = Math.max(0, firstFat - lastFat)
      }

      const metricsWithMuscle = metrics.filter(m => m.muscle_mass != null)
      let muscleGainKg = 0
      if (metricsWithMuscle.length >= 2) {
        const firstMuscle = metricsWithMuscle[0].muscle_mass
        const lastMuscle = metricsWithMuscle[metricsWithMuscle.length - 1].muscle_mass
        muscleGainKg = Math.max(0, lastMuscle - firstMuscle)
      }

      // Recomposition: gained muscle AND lost fat
      const isRecomp = fatLossPct >= 1 && muscleGainKg >= 1

      // Time-based badges
      let hasEarlyBird = false, hasNightOwl = false
      sessions.forEach(s => {
        if (s.started_at) {
          const hour = new Date(s.started_at).getHours()
          if (hour < 7) hasEarlyBird = true
          if (hour >= 22) hasNightOwl = true
        }
      })

      // Weekend warrior: check if any week had both saturday AND sunday workouts
      let hasWeekendWarrior = false
      const weekendMap = {} // week key → { sat: bool, sun: bool }
      sessions.forEach(s => {
        const d = new Date(s.started_at)
        const day = d.getDay()
        if (day === 0 || day === 6) {
          // Use ISO week start as key
          const weekStart = new Date(d)
          weekStart.setDate(weekStart.getDate() - ((day + 6) % 7))
          const key = weekStart.toISOString().split('T')[0]
          if (!weekendMap[key]) weekendMap[key] = { sat: false, sun: false }
          if (day === 6) weekendMap[key].sat = true
          if (day === 0) weekendMap[key].sun = true
        }
      })
      hasWeekendWarrior = Object.values(weekendMap).some(w => w.sat && w.sun)

      // Weekly volumes for week-volume badge
      const weekVolumes = {}
      sets.forEach(s => {
        const sessionDate = s.session?.started_at
        if (!sessionDate) return
        const d = new Date(sessionDate)
        const weekStart = new Date(d)
        weekStart.setDate(weekStart.getDate() - d.getDay())
        const key = weekStart.toISOString().split('T')[0]
        weekVolumes[key] = (weekVolumes[key] || 0) + (Number(s.weight) || 0) * (s.reps || 0)
      })
      const weeklyVolumes = Object.values(weekVolumes)

      // Calculate XP
      const rawStats = {
        workoutCount, habitCompletions, allHabitsDays, prCount,
        uniqueExercises, bodyMetricEntries, streak,
        weightIncreases, tonnageTons,
      }
      const { total: xp, breakdown } = calculateXP(rawStats)

      // Add milestone XP
      const completedMilestones = MILESTONES.filter(m => m.check(rawStats))
      const milestoneXP = completedMilestones.reduce((sum, m) => sum + m.xpReward, 0)
      const totalXP = xp + milestoneXP
      if (milestoneXP > 0) {
        breakdown.push({ source: 'Hitos completados', xp: milestoneXP, count: completedMilestones.length })
        breakdown.sort((a, b) => b.xp - a.xp)
      }

      const level = levelFromXP(totalXP)
      const progress = levelProgress(totalXP)
      const rank = getRankForLevel(level)
      const nextLevelXP = xpForLevel(level + 1)

      // Compute unlocked badges
      const unlockedBadges = computeUnlockedBadges(rawStats, {
        maxBenchWeight, maxSquatWeight, maxDeadliftWeight,
        bodyWeight, fatLossPct, muscleGainKg, isRecomp,
        hasEarlyBird, hasNightOwl, hasWeekendWarrior, weeklyVolumes,
      })

      setStats({
        xp: totalXP,
        level,
        progress,
        rank,
        nextLevelXP,
        currentLevelXP: xpForLevel(level),
        breakdown,
        milestones: MILESTONES.map(m => ({
          ...m,
          completed: m.check(rawStats),
        })),
        rawStats,
        unlockedBadges,
      })
      setLoading(false)
    }

    compute()
  }, [userId])

  return { stats, loading }
}

// Fetch gamification stats for all squad members
export function useSquadGamification() {
  const [squadStats, setSquadStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)

      const { data: profiles } = await supabase.from('profiles').select('id, name, color')
      if (!profiles) { setLoading(false); return }

      const results = []

      for (const profile of profiles) {
        // Get workout count
        const { count: workoutCount } = await supabase
          .from('workout_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .not('finished_at', 'is', null)

        // Get sets for XP calc
        const { data: sets } = await supabase
          .from('session_sets')
          .select('exercise_id, reps, weight, session:workout_sessions!inner(user_id)')
          .eq('session.user_id', profile.id)

        const allSets = sets || []
        const uniqueExercises = new Set(allSets.map(s => s.exercise_id)).size
        const totalTonnage = allSets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (s.reps || 0), 0)

        // PRs
        const prMap = {}
        allSets.forEach(s => {
          if (!s.weight || !s.reps) return
          const e1rm = bestEstimate1RM(Number(s.weight), s.reps)
          if (!prMap[s.exercise_id] || e1rm > prMap[s.exercise_id]) prMap[s.exercise_id] = e1rm
        })

        // Habits
        const { data: habits } = await supabase
          .from('routine_entries')
          .select('date, completed')
          .eq('user_id', profile.id)
          .eq('completed', true)

        const { data: configs } = await supabase
          .from('routine_configs')
          .select('id')
          .eq('user_id', profile.id)
          .eq('active', true)

        const { count: bodyMetricEntries } = await supabase
          .from('body_metrics')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profile.id)

        const configCount = configs?.length || 0
        const habitsByDate = {}
        ;(habits || []).forEach(h => {
          habitsByDate[h.date] = (habitsByDate[h.date] || 0) + 1
        })
        const allHabitsDays = configCount > 0
          ? Object.values(habitsByDate).filter(c => c >= configCount).length
          : 0

        const weightIncreases = Object.values(
          allSets.reduce((acc, s) => {
            if (!s.weight) return acc
            if (!acc[s.exercise_id]) acc[s.exercise_id] = new Set()
            acc[s.exercise_id].add(Number(s.weight))
            return acc
          }, {})
        ).filter(w => w.size > 1).length

        const rawStats = {
          workoutCount: workoutCount || 0,
          habitCompletions: (habits || []).length,
          allHabitsDays,
          prCount: Object.keys(prMap).length,
          uniqueExercises,
          bodyMetricEntries: bodyMetricEntries || 0,
          streak: 0,
          weightIncreases,
          tonnageTons: totalTonnage / 1000,
        }

        const { total: xp } = calculateXP(rawStats)
        const milestoneXP = MILESTONES.filter(m => m.check(rawStats)).reduce((s, m) => s + m.xpReward, 0)
        const totalXP = xp + milestoneXP
        const level = levelFromXP(totalXP)

        results.push({
          ...profile,
          xp: totalXP,
          level,
          rank: getRankForLevel(level),
          progress: levelProgress(totalXP),
          rawStats,
        })
      }

      setSquadStats(results.sort((a, b) => b.xp - a.xp))
      setLoading(false)
    }

    fetchAll()
  }, [])

  return { squadStats, loading }
}
