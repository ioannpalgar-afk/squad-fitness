import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useRoutines() {
  const { user } = useAuth()
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRoutines = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('routines')
      .select(`
        *,
        routine_exercises (
          *,
          exercise:exercises (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setRoutines(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchRoutines() }, [fetchRoutines])

  async function createRoutine(name, description) {
    const { data, error } = await supabase
      .from('routines')
      .insert({ name, description, user_id: user.id })
      .select()
      .single()
    if (!error) await fetchRoutines()
    return { data, error }
  }

  async function updateRoutine(id, updates) {
    const { error } = await supabase
      .from('routines')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) await fetchRoutines()
    return { error }
  }

  async function deleteRoutine(id) {
    const { error } = await supabase.from('routines').delete().eq('id', id)
    if (!error) setRoutines(prev => prev.filter(r => r.id !== id))
    return { error }
  }

  async function addExerciseToRoutine(routineId, exerciseId, config = {}) {
    const { error } = await supabase
      .from('routine_exercises')
      .insert({
        routine_id: routineId,
        exercise_id: exerciseId,
        sets_target: config.sets || 3,
        reps_target: config.reps || 10,
        weight_target: config.weight || null,
        sort_order: config.sortOrder || 0,
        rest_seconds: config.rest || 90,
      })
    if (!error) await fetchRoutines()
    return { error }
  }

  async function updateRoutineExercise(id, updates) {
    const { error } = await supabase
      .from('routine_exercises')
      .update(updates)
      .eq('id', id)
    if (!error) await fetchRoutines()
    return { error }
  }

  async function removeExerciseFromRoutine(id) {
    const { error } = await supabase.from('routine_exercises').delete().eq('id', id)
    if (!error) await fetchRoutines()
    return { error }
  }

  return {
    routines, loading, fetchRoutines,
    createRoutine, updateRoutine, deleteRoutine,
    addExerciseToRoutine, updateRoutineExercise, removeExerciseFromRoutine,
  }
}
