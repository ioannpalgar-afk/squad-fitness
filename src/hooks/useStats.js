import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { startOfWeek, format, subWeeks, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { bestEstimate1RM } from '../utils/calculations'

export function useStats() {
  const { user } = useAuth()
  const [exerciseProgress, setExerciseProgress] = useState([])
  const [weeklyVolume, setWeeklyVolume] = useState([])
  const [personalRecords, setPersonalRecords] = useState([])
  const [muscleGroupVolume, setMuscleGroupVolume] = useState([])
  const [e1rmProgress, setE1rmProgress] = useState([])
  const [trainingFrequency, setTrainingFrequency] = useState([])
  const [totalStats, setTotalStats] = useState({ sessions: 0, sets: 0, tonnage: 0, avgDuration: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchStats() {
      setLoading(true)

      // Fetch all sets with exercise + session info
      const { data: sets } = await supabase
        .from('session_sets')
        .select(`
          *,
          exercise:exercises (name, muscle_group),
          session:workout_sessions!inner (user_id, started_at, finished_at, duration_minutes)
        `)
        .eq('session.user_id', user.id)
        .order('created_at', { ascending: true })

      if (!sets || sets.length === 0) {
        setLoading(false)
        return
      }

      // ====== EXERCISE PROGRESS (max weight per date) ======
      const progressMap = {}
      sets.forEach(set => {
        const name = set.exercise?.name
        if (!name || !set.weight) return
        const date = format(new Date(set.session.started_at), 'dd/MM', { locale: es })
        if (!progressMap[name]) progressMap[name] = {}
        if (!progressMap[name][date] || set.weight > progressMap[name][date]) {
          progressMap[name][date] = Number(set.weight)
        }
      })
      setExerciseProgress(
        Object.entries(progressMap).map(([exercise, dates]) => ({
          exercise,
          data: Object.entries(dates).map(([date, weight]) => ({ date, weight })),
        }))
      )

      // ====== E1RM PROGRESS (estimated 1RM per exercise over time) ======
      const e1rmMap = {}
      sets.forEach(set => {
        const name = set.exercise?.name
        if (!name || !set.weight || !set.reps) return
        const date = format(new Date(set.session.started_at), 'dd/MM', { locale: es })
        const e1rm = bestEstimate1RM(Number(set.weight), set.reps)
        if (!e1rmMap[name]) e1rmMap[name] = {}
        if (!e1rmMap[name][date] || e1rm > e1rmMap[name][date]) {
          e1rmMap[name][date] = e1rm
        }
      })
      setE1rmProgress(
        Object.entries(e1rmMap).map(([exercise, dates]) => ({
          exercise,
          data: Object.entries(dates).map(([date, e1rm]) => ({ date, e1rm })),
        }))
      )

      // ====== WEEKLY VOLUME ======
      const volumeMap = {}
      const now = new Date()
      for (let i = 7; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 })
        const key = format(weekStart, 'dd/MM', { locale: es })
        volumeMap[key] = 0
      }
      sets.forEach(set => {
        if (!set.weight || !set.reps) return
        const weekStart = startOfWeek(new Date(set.session.started_at), { weekStartsOn: 1 })
        const key = format(weekStart, 'dd/MM', { locale: es })
        if (volumeMap[key] !== undefined) {
          volumeMap[key] += Number(set.weight) * set.reps
        }
      })
      setWeeklyVolume(
        Object.entries(volumeMap).map(([week, volume]) => ({ week, volume: Math.round(volume) }))
      )

      // ====== MUSCLE GROUP VOLUME (weekly sets per muscle group) ======
      const mgMap = {}
      const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 })
      sets.forEach(set => {
        const group = set.exercise?.muscle_group
        if (!group) return
        const setDate = new Date(set.session.started_at)
        if (differenceInDays(now, setDate) <= 7) {
          mgMap[group] = (mgMap[group] || 0) + 1
        }
      })
      setMuscleGroupVolume(
        Object.entries(mgMap)
          .map(([muscle, sets]) => ({ muscle, sets }))
          .sort((a, b) => b.sets - a.sets)
      )

      // ====== PERSONAL RECORDS ======
      const prMap = {}
      sets.forEach(set => {
        const name = set.exercise?.name
        if (!name || !set.weight) return
        const e1rm = bestEstimate1RM(Number(set.weight), set.reps || 1)
        if (!prMap[name] || e1rm > prMap[name].e1rm) {
          prMap[name] = {
            exercise: name,
            weight: Number(set.weight),
            reps: set.reps,
            e1rm,
            muscleGroup: set.exercise?.muscle_group,
            date: format(new Date(set.session.started_at), 'dd MMM yyyy', { locale: es }),
          }
        }
      })
      setPersonalRecords(Object.values(prMap).sort((a, b) => b.e1rm - a.e1rm))

      // ====== TRAINING FREQUENCY (heatmap data, last 90 days) ======
      const freqMap = {}
      const sessionIds = new Set()
      sets.forEach(set => {
        const dateKey = format(new Date(set.session.started_at), 'yyyy/MM/dd')
        const sid = set.session_id
        if (!freqMap[dateKey]) freqMap[dateKey] = new Set()
        freqMap[dateKey].add(sid)
        sessionIds.add(sid)
      })
      setTrainingFrequency(
        Object.entries(freqMap).map(([date, sids]) => ({ date, count: sids.size }))
      )

      // ====== TOTAL STATS ======
      const uniqueSessions = {}
      sets.forEach(set => {
        if (!uniqueSessions[set.session_id]) {
          uniqueSessions[set.session_id] = {
            duration: set.session.duration_minutes || 0,
            sets: 0,
            tonnage: 0,
          }
        }
        uniqueSessions[set.session_id].sets += 1
        uniqueSessions[set.session_id].tonnage += (Number(set.weight) || 0) * (set.reps || 0)
      })
      const sessionList = Object.values(uniqueSessions)
      const totalTonnage = sessionList.reduce((s, x) => s + x.tonnage, 0)
      const totalSess = sessionList.length
      const totalSetsCount = sessionList.reduce((s, x) => s + x.sets, 0)
      const avgDur = totalSess > 0
        ? Math.round(sessionList.reduce((s, x) => s + x.duration, 0) / totalSess)
        : 0

      setTotalStats({
        sessions: totalSess,
        sets: totalSetsCount,
        tonnage: Math.round(totalTonnage),
        avgDuration: avgDur,
      })

      setLoading(false)
    }

    fetchStats()
  }, [user])

  return {
    exerciseProgress, weeklyVolume, personalRecords,
    muscleGroupVolume, e1rmProgress, trainingFrequency, totalStats,
    loading,
  }
}
