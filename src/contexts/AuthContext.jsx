import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

const SQUAD_PASSWORD = 'squad-fitness-2024!'

function deriveEmail(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    + '@squad.app'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchAllProfiles() {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, color, nickname')
      .order('name')
    return data || []
  }

  async function signInByName(name) {
    const email = deriveEmail(name)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: SQUAD_PASSWORD,
    })
    if (error) throw error
    return data
  }

  async function signUpByName(name) {
    const email = deriveEmail(name)
    const { data, error } = await supabase.auth.signUp({
      email,
      password: SQUAD_PASSWORD,
      options: { data: { name } },
    })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signInByName, signUpByName, signOut,
      fetchAllProfiles,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
