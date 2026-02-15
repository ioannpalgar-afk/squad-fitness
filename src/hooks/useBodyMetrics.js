import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { exponentialMovingAverage } from '../utils/calculations'

export function useBodyMetrics() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [latest, setLatest] = useState(null)

  const fetchMetrics = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    const entries = data || []
    setMetrics(entries)
    setLatest(entries.length > 0 ? entries[entries.length - 1] : null)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchMetrics() }, [fetchMetrics])

  // Save a new body metric entry
  async function saveMetric(entry) {
    const { error } = await supabase.from('body_metrics').insert({
      user_id: user.id,
      ...entry,
    })
    if (!error) await fetchMetrics()
    return { error }
  }

  // Update an existing entry
  async function updateMetric(id, updates) {
    const { error } = await supabase.from('body_metrics')
      .update(updates)
      .eq('id', id)
    if (!error) await fetchMetrics()
    return { error }
  }

  // Delete an entry
  async function deleteMetric(id) {
    const { error } = await supabase.from('body_metrics').delete().eq('id', id)
    if (!error) await fetchMetrics()
    return { error }
  }

  // Computed data for charts
  const weightData = metrics
    .filter(m => m.weight)
    .map(m => ({
      date: new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      rawDate: m.date,
      weight: Number(m.weight),
    }))

  const weightValues = weightData.map(d => d.weight)
  const trendValues = exponentialMovingAverage(weightValues, 7)
  const weightChartData = weightData.map((d, i) => ({
    ...d,
    trend: trendValues[i],
  }))

  // Full metrics entries (with body fat, measurements, etc.)
  const fullEntries = metrics.filter(m => m.body_fat_pct || m.muscle_mass || m.waist)

  // Body fat trend
  const bodyFatData = fullEntries
    .filter(m => m.body_fat_pct)
    .map(m => ({
      date: new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      bodyFat: Number(m.body_fat_pct),
      muscleMass: m.muscle_mass ? Number(m.muscle_mass) : null,
    }))

  // Measurements trend
  const measurementData = fullEntries
    .filter(m => m.chest || m.waist || m.bicep_right)
    .map(m => ({
      date: new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      chest: m.chest ? Number(m.chest) : null,
      waist: m.waist ? Number(m.waist) : null,
      hip: m.hip ? Number(m.hip) : null,
      bicep: m.bicep_right ? Number(m.bicep_right) : null,
      thigh: m.thigh_right ? Number(m.thigh_right) : null,
    }))

  // Deltas (first vs latest full entry)
  const deltas = fullEntries.length >= 2 ? {
    weight: latest?.weight && fullEntries[0].weight
      ? Math.round((Number(latest.weight) - Number(fullEntries[0].weight)) * 10) / 10
      : null,
    bodyFat: latest?.body_fat_pct && fullEntries[0].body_fat_pct
      ? Math.round((Number(latest.body_fat_pct) - Number(fullEntries[0].body_fat_pct)) * 10) / 10
      : null,
    muscleMass: latest?.muscle_mass && fullEntries[0].muscle_mass
      ? Math.round((Number(latest.muscle_mass) - Number(fullEntries[0].muscle_mass)) * 10) / 10
      : null,
    waist: latest?.waist && fullEntries[0].waist
      ? Math.round((Number(latest.waist) - Number(fullEntries[0].waist)) * 10) / 10
      : null,
  } : null

  return {
    metrics, loading, latest, deltas,
    weightChartData, bodyFatData, measurementData, fullEntries,
    saveMetric, updateMetric, deleteMetric, fetchMetrics,
  }
}

// Fetch any user's body metrics (for squad comparisons)
export function useSquadBodyMetrics() {
  const [squadMetrics, setSquadMetrics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data: profiles } = await supabase.from('profiles').select('id, name, color')
      if (!profiles) { setLoading(false); return }

      const result = []
      for (const p of profiles) {
        const { data } = await supabase
          .from('body_metrics')
          .select('date, weight, body_fat_pct, muscle_mass')
          .eq('user_id', p.id)
          .order('date', { ascending: false })
          .limit(1)

        result.push({
          ...p,
          latest: data?.[0] || null,
        })
      }
      setSquadMetrics(result)
      setLoading(false)
    }
    fetch()
  }, [])

  return { squadMetrics, loading }
}

// Fetch all body metrics history for all squad members (for comparison charts)
export function useSquadBodyHistory() {
  const [squadHistory, setSquadHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data: profiles } = await supabase.from('profiles').select('id, name, color')
      if (!profiles) { setLoading(false); return }

      const result = []
      for (const p of profiles) {
        const { data } = await supabase
          .from('body_metrics')
          .select('date, weight, body_fat_pct, muscle_mass, chest, waist, bicep_right, thigh_right')
          .eq('user_id', p.id)
          .order('date', { ascending: true })

        result.push({
          ...p,
          entries: (data || []).filter(m => m.weight),
        })
      }
      setSquadHistory(result)
      setLoading(false)
    }
    fetch()
  }, [])

  return { squadHistory, loading }
}
