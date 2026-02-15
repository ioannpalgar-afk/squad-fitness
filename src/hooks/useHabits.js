import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useHabits() {
  const { user } = useAuth()
  const [configs, setConfigs] = useState([])
  const [todayEntries, setTodayEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)

  const today = new Date().toISOString().split('T')[0]

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const [{ data: cfgs }, { data: entries }] = await Promise.all([
      supabase
        .from('routine_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('sort_order'),
      supabase
        .from('routine_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today),
    ])

    setConfigs(cfgs || [])
    setTodayEntries(entries || [])

    // Calculate streak
    if (cfgs && cfgs.length > 0) {
      const s = await calcStreak(user.id, cfgs.length)
      setStreak(s)
    }

    setLoading(false)
  }, [user, today])

  useEffect(() => { fetchData() }, [fetchData])

  async function calcStreak(userId, totalHabits) {
    const { data } = await supabase
      .from('routine_entries')
      .select('date')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('date', { ascending: false })

    if (!data || data.length === 0) return 0

    // Count completions per day
    const dateCounts = {}
    data.forEach(e => { dateCounts[e.date] = (dateCounts[e.date] || 0) + 1 })

    let s = 0
    let d = new Date()
    const todayStr = d.toISOString().split('T')[0]

    // If today not fully done, start from yesterday
    if ((dateCounts[todayStr] || 0) < totalHabits) {
      d.setDate(d.getDate() - 1)
    }

    for (let i = 0; i < 400; i++) {
      const key = d.toISOString().split('T')[0]
      if ((dateCounts[key] || 0) >= totalHabits) {
        s++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }
    return s
  }

  async function toggleHabit(configId) {
    const existing = todayEntries.find(e => e.routine_config_id === configId)

    if (existing) {
      await supabase.from('routine_entries')
        .update({
          completed: !existing.completed,
          completed_at: !existing.completed ? new Date().toISOString() : null,
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('routine_entries').insert({
        user_id: user.id,
        routine_config_id: configId,
        date: today,
        completed: true,
        completed_at: new Date().toISOString(),
      })
    }

    await fetchData()
  }

  async function createConfig({ name, icon, frequency, target, unit }) {
    const { error } = await supabase.from('routine_configs').insert({
      user_id: user.id,
      name,
      icon,
      frequency: frequency || 'daily',
      target,
      unit,
      sort_order: configs.length,
    })
    if (!error) await fetchData()
    return { error }
  }

  async function deleteConfig(id) {
    const { error } = await supabase.from('routine_configs').delete().eq('id', id)
    if (!error) await fetchData()
    return { error }
  }

  const completedToday = todayEntries.filter(e => e.completed).length
  const totalToday = configs.length
  const allDoneToday = totalToday > 0 && completedToday === totalToday

  return {
    configs, todayEntries, loading, streak,
    completedToday, totalToday, allDoneToday,
    toggleHabit, createConfig, deleteConfig, fetchData,
  }
}

// Check if ALL squad members completed all habits today
export function useSquadCompletion() {
  const [allSquadDone, setAllSquadDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const today = new Date().toISOString().split('T')[0]
      const { data: profiles } = await supabase.from('profiles').select('id')
      if (!profiles || profiles.length < 2) { setLoading(false); return }

      let allDone = true
      for (const p of profiles) {
        const { data: cfgs } = await supabase
          .from('routine_configs').select('id')
          .eq('user_id', p.id).eq('active', true)

        if (!cfgs || cfgs.length === 0) { allDone = false; break }

        const { count } = await supabase
          .from('routine_entries').select('*', { count: 'exact', head: true })
          .eq('user_id', p.id).eq('date', today).eq('completed', true)

        if ((count || 0) < cfgs.length) { allDone = false; break }
      }

      setAllSquadDone(allDone)
      setLoading(false)
    }
    check()
  }, [])

  return { allSquadDone, loading }
}
