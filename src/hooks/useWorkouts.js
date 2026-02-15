import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useWorkouts() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSessions = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        routine:routines (name),
        session_sets (
          *,
          exercise:exercises (name, muscle_group)
        )
      `)
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
    setSessions(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  async function startSession(routineId) {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({ user_id: user.id, routine_id: routineId })
      .select()
      .single()
    return { data, error }
  }

  async function finishSession(sessionId, durationMinutes, notes) {
    const { error } = await supabase
      .from('workout_sessions')
      .update({
        finished_at: new Date().toISOString(),
        duration_minutes: durationMinutes,
        notes,
      })
      .eq('id', sessionId)
    if (!error) await fetchSessions()
    return { error }
  }

  async function logSet(sessionId, exerciseId, setNumber, reps, weight) {
    const { data, error } = await supabase
      .from('session_sets')
      .insert({
        session_id: sessionId,
        exercise_id: exerciseId,
        set_number: setNumber,
        reps,
        weight,
        completed: true,
      })
      .select(`*, exercise:exercises (name, muscle_group)`)
      .single()
    return { data, error }
  }

  async function deleteSession(sessionId) {
    const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId)
    if (!error) setSessions(prev => prev.filter(s => s.id !== sessionId))
    return { error }
  }

  return { sessions, loading, fetchSessions, startSession, finishSession, logSet, deleteSession }
}

export function useFriendActivity() {
  const { user } = useAuth()
  const [activity, setActivity] = useState([])

  useEffect(() => {
    if (!user) return
    async function fetch() {
      const { data } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          profile:profiles (name, color),
          routine:routines (name)
        `)
        .neq('user_id', user.id)
        .not('finished_at', 'is', null)
        .order('finished_at', { ascending: false })
        .limit(10)
      setActivity(data || [])
    }
    fetch()
  }, [user])

  return activity
}

// Detect inactive squad members for taunts
export function useSquadTaunts() {
  const { user } = useAuth()
  const [taunts, setTaunts] = useState([])

  useEffect(() => {
    if (!user) return
    async function check() {
      const { data: profiles } = await supabase.from('profiles').select('id, name, color')
      if (!profiles) return

      const others = profiles.filter(p => p.id !== user.id)
      const now = new Date()
      const result = []

      for (const p of others) {
        // Check last completed habit entry
        const { data: lastEntry } = await supabase
          .from('routine_entries')
          .select('date')
          .eq('user_id', p.id)
          .eq('completed', true)
          .order('date', { ascending: false })
          .limit(1)

        // Check last workout
        const { data: lastWorkout } = await supabase
          .from('workout_sessions')
          .select('finished_at')
          .eq('user_id', p.id)
          .not('finished_at', 'is', null)
          .order('finished_at', { ascending: false })
          .limit(1)

        const lastDate = lastEntry?.[0]?.date
        const lastFinished = lastWorkout?.[0]?.finished_at

        // Get the most recent activity date
        let latestMs = 0
        if (lastDate) latestMs = Math.max(latestMs, new Date(lastDate).getTime())
        if (lastFinished) latestMs = Math.max(latestMs, new Date(lastFinished).getTime())

        if (latestMs === 0) continue
        const daysSince = Math.floor((now.getTime() - latestMs) / (1000 * 60 * 60 * 24))

        if (daysSince >= 3) {
          result.push({ ...p, days: daysSince, key: 'inactive_3days' })
        } else if (daysSince >= 2) {
          result.push({ ...p, days: daysSince, key: 'inactive_2days' })
        } else if (daysSince >= 1) {
          result.push({ ...p, days: daysSince, key: 'inactive_1day' })
        }
      }

      setTaunts(result)
    }
    check()
  }, [user])

  return taunts
}
