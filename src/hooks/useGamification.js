import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { calculateXP, levelFromXP, levelProgress, xpForLevel, bestEstimate1RM } from '../utils/calculations'
import { getRankForLevel, MILESTONES } from '../data/constants'

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
      const [sessionsRes, setsRes, habitsRes, configsRes, metricsRes] = await Promise.all([
        supabase
          .from('workout_sessions')
          .select('id, started_at, finished_at, duration_minutes')
          .eq('user_id', userId)
          .not('finished_at', 'is', null),
        supabase
          .from('session_sets')
          .select('exercise_id, reps, weight, session:workout_sessions!inner(user_id)')
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
          .select('id')
          .eq('user_id', userId),
      ])

      const sessions = sessionsRes.data || []
      const sets = setsRes.data || []
      const habits = habitsRes.data || []
      const configs = configsRes.data || []
      const metrics = metricsRes.data || []

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
      // (simplified: count unique exercises with > 1 different weight used)
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
      const sortedDates = Object.keys(habitsByDate).sort().reverse()
      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
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
