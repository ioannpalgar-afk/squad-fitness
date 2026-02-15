import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useExercises() {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchExercises() {
    setLoading(true)
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('muscle_group')
      .order('name')
    if (!error) setExercises(data || [])
    setLoading(false)
  }

  async function addExercise(name, muscleGroup, userId) {
    const { data, error } = await supabase
      .from('exercises')
      .insert({ name, muscle_group: muscleGroup, created_by: userId })
      .select()
      .single()
    if (!error && data) {
      setExercises(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    }
    return { data, error }
  }

  useEffect(() => { fetchExercises() }, [])

  const muscleGroups = [...new Set(exercises.map(e => e.muscle_group))]

  return { exercises, muscleGroups, loading, addExercise, refetch: fetchExercises }
}
