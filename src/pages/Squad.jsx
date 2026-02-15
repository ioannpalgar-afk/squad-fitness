import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Trophy, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import AvatarWithMood from '../components/avatar/AvatarWithMood'
import LeaderboardRow from '../components/squad/LeaderboardRow'
import PageWrapper from '../components/layout/PageWrapper'
import { ESCENAS } from '../data/constants'

export default function Squad() {
  const { user, profile } = useAuth()
  const [members, setMembers] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSquad() {
      const { data: profiles } = await supabase.from('profiles').select('*')

      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('*, profile:profiles(name, color), routine:routines(name)')
        .not('finished_at', 'is', null)
        .order('finished_at', { ascending: false })
        .limit(20)

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { data: weekSessions } = await supabase
        .from('workout_sessions')
        .select('user_id')
        .not('finished_at', 'is', null)
        .gte('started_at', weekAgo.toISOString())

      const countMap = {}
      weekSessions?.forEach(s => {
        countMap[s.user_id] = (countMap[s.user_id] || 0) + 1
      })

      const ranked = (profiles || [])
        .map(p => ({ ...p, weekCount: countMap[p.id] || 0 }))
        .sort((a, b) => b.weekCount - a.weekCount)

      setMembers(ranked)
      setRecentActivity(sessions || [])
      setLoading(false)
    }
    fetchSquad()
  }, [])

  return (
    <PageWrapper>
      {/* Hero banner */}
      <div className="relative -mx-4 -mt-4 mb-6 overflow-hidden rounded-b-2xl">
        <img
          src={ESCENAS.squad}
          alt="Squad"
          className="h-44 w-full object-cover"
          style={{ objectPosition: '50% 35%' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0A0A12 10%, transparent 70%)' }} />
        <h1 className="absolute bottom-3 left-4 font-display text-lg font-bold uppercase tracking-wider">
          <span className="text-glow-cyan">Squad</span>
        </h1>
      </div>

      {loading ? (
        <div className="card animate-pulse py-12 text-center text-sm text-text-muted">Cargando...</div>
      ) : (
        <>
          {/* Podium */}
          {members.length >= 3 && (
            <section className="mb-6">
              <div className="relative flex items-end justify-center gap-2 rounded-2xl px-4 pt-4 pb-2"
                style={{ background: 'linear-gradient(180deg, rgba(255,215,0,0.06) 0%, transparent 100%)' }}
              >
                {/* 2nd place */}
                <div className="flex flex-col items-center" style={{ marginBottom: 0 }}>
                  <AvatarWithMood
                    name={members[1]?.name}
                    color={members[1]?.color || '#BF00FF'}
                    avatarBase={members[1]?.name?.toLowerCase()}
                    size="sm"
                  />
                  <div className="mt-1 flex h-16 w-16 items-end justify-center rounded-t-lg"
                    style={{ background: `linear-gradient(180deg, ${members[1]?.color || '#BF00FF'}22, transparent)` }}>
                    <span className="text-lg">🥈</span>
                  </div>
                </div>

                {/* 1st place */}
                <div className="flex flex-col items-center" style={{ marginBottom: 0 }}>
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <AvatarWithMood
                      name={members[0]?.name}
                      color={members[0]?.color || '#00F0FF'}
                      avatarBase={members[0]?.name?.toLowerCase()}
                      size="md"
                    />
                  </motion.div>
                  <div className="mt-1 flex h-24 w-20 items-end justify-center rounded-t-lg"
                    style={{ background: `linear-gradient(180deg, rgba(255,215,0,0.15), transparent)` }}>
                    <span className="text-2xl">👑</span>
                  </div>
                </div>

                {/* 3rd place */}
                <div className="flex flex-col items-center" style={{ marginBottom: 0 }}>
                  <AvatarWithMood
                    name={members[2]?.name}
                    color={members[2]?.color || '#FF3D5A'}
                    avatarBase={members[2]?.name?.toLowerCase()}
                    size="sm"
                  />
                  <div className="mt-1 flex h-12 w-16 items-end justify-center rounded-t-lg"
                    style={{ background: `linear-gradient(180deg, ${members[2]?.color || '#FF3D5A'}22, transparent)` }}>
                    <span className="text-lg">🥉</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Leaderboard */}
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <img src="/assets/emojis/emoji-trophy.png" alt="" className="h-5 w-5 object-contain" />
              <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                Ranking semanal
              </h2>
            </div>
            <div className="space-y-2">
              {members.map((member, i) => (
                <LeaderboardRow
                  key={member.id}
                  position={i + 1}
                  name={member.name}
                  color={member.color || '#00F0FF'}
                  avatarBase={member.name?.toLowerCase()}
                  stat={member.weekCount}
                  statLabel="entrenos"
                  progressPct={members[0]?.weekCount > 0 ? (member.weekCount / members[0].weekCount) * 100 : 0}
                  isCurrentUser={member.id === user?.id}
                  delay={i * 0.1}
                />
              ))}
            </div>
          </section>

          {/* Activity feed */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <img src="/assets/emojis/emoji-lightning.png" alt="" className="h-5 w-5 object-contain" />
              <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                Actividad reciente
              </h2>
            </div>
            {recentActivity.length === 0 ? (
              <div className="card py-6 text-center">
                <img src={ESCENAS.emptyState} alt="" className="mx-auto mb-3 h-24 w-auto object-contain opacity-80" />
                <p className="text-sm text-text-muted">Nadie ha entrenado aún...</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-bg-secondary"
                    style={{ borderLeft: `2px solid ${a.profile?.color || '#555568'}` }}
                  >
                    <AvatarWithMood
                      name={a.profile?.name}
                      color={a.profile?.color || '#00F0FF'}
                      avatarBase={a.profile?.name?.toLowerCase()}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{a.profile?.name}</span>
                        {' entrenó '}
                        <span style={{ color: a.profile?.color || '#00F0FF' }}>{a.routine?.name || 'libre'}</span>
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {formatDistanceToNow(new Date(a.finished_at), { addSuffix: true, locale: es })}
                        {a.duration_minutes && ` · ${a.duration_minutes} min`}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </PageWrapper>
  )
}
