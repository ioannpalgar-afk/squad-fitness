import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Trophy, Users, BarChart3, Zap, Scale, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import AvatarWithMood from '../components/avatar/AvatarWithMood'
import LeaderboardRow from '../components/squad/LeaderboardRow'
import WorkoutDetailCard from '../components/squad/WorkoutDetailCard'
import MemberProfileModal from '../components/squad/MemberProfileModal'
import PageWrapper from '../components/layout/PageWrapper'
import { ESCENAS, EMOJI_ASSETS } from '../data/constants'
import { useSquadGamification } from '../hooks/useGamification'
import { useSquadBodyHistory } from '../hooks/useBodyMetrics'
import { bestEstimate1RM } from '../utils/calculations'

const TABS = [
  { id: 'ranking', label: 'Ranking', icon: Trophy },
  { id: 'miembros', label: 'Miembros', icon: Users },
  { id: 'comparar', label: 'Comparar', icon: BarChart3 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg bg-bg-tertiary px-3 py-2 text-xs" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-text-secondary">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-mono font-bold" style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Squad() {
  const { user, profile } = useAuth()
  const [members, setMembers] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [memberStats, setMemberStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ranking')
  const [compareMetric, setCompareMetric] = useState('weight')
  const [selectedMember, setSelectedMember] = useState(null)

  const { squadStats, loading: gamLoading } = useSquadGamification()
  const { squadHistory, loading: histLoading } = useSquadBodyHistory()

  const userColor = profile?.color || '#00F0FF'

  useEffect(() => {
    async function fetchSquad() {
      const { data: profiles } = await supabase.from('profiles').select('*')

      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          profile:profiles(name, color),
          routine:routines(
            name,
            routine_exercises(
              exercise_id, sets_target, reps_target, weight_target, rest_seconds, sort_order,
              exercise:exercises(name, muscle_group)
            )
          ),
          session_sets(
            exercise_id, set_number, reps, weight, set_type,
            exercise:exercises(name, muscle_group)
          )
        `)
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

      // Fetch detailed stats per member
      const statsMap = {}
      for (const p of (profiles || [])) {
        const { count: totalWorkouts } = await supabase
          .from('workout_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', p.id)
          .not('finished_at', 'is', null)

        const { data: sets } = await supabase
          .from('session_sets')
          .select('exercise_id, reps, weight, session:workout_sessions!inner(user_id)')
          .eq('session.user_id', p.id)

        const allSets = sets || []
        const totalTonnage = allSets.reduce((sum, s) => sum + (Number(s.weight) || 0) * (s.reps || 0), 0)
        const uniqueExercises = new Set(allSets.map(s => s.exercise_id)).size

        // Top PRs
        const prMap = {}
        allSets.forEach(s => {
          if (!s.weight || !s.reps) return
          const e1rm = bestEstimate1RM(Number(s.weight), s.reps)
          if (!prMap[s.exercise_id] || e1rm > prMap[s.exercise_id].e1rm) {
            prMap[s.exercise_id] = { e1rm, weight: Number(s.weight), reps: s.reps }
          }
        })

        // Get latest body metric
        const { data: latestMetric } = await supabase
          .from('body_metrics')
          .select('weight, body_fat_pct, muscle_mass')
          .eq('user_id', p.id)
          .not('weight', 'is', null)
          .order('date', { ascending: false })
          .limit(1)

        statsMap[p.id] = {
          totalWorkouts: totalWorkouts || 0,
          totalTonnage: Math.round(totalTonnage),
          uniqueExercises,
          prCount: Object.keys(prMap).length,
          latestMetric: latestMetric?.[0] || null,
        }
      }
      setMemberStats(statsMap)
      setLoading(false)
    }
    fetchSquad()
  }, [])

  // Build comparison chart data
  const comparisonData = (() => {
    if (histLoading || !squadHistory.length) return []
    // Merge all members' data by date
    const dateMap = {}
    squadHistory.forEach(member => {
      member.entries.forEach(entry => {
        const dateKey = format(new Date(entry.date), 'dd/MM', { locale: es })
        if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey }
        const val = compareMetric === 'weight' ? entry.weight
          : compareMetric === 'bodyFat' ? entry.body_fat_pct
          : compareMetric === 'muscle' ? entry.muscle_mass
          : compareMetric === 'chest' ? entry.chest
          : compareMetric === 'waist' ? entry.waist
          : compareMetric === 'bicep' ? entry.bicep_right
          : entry.weight
        if (val) dateMap[dateKey][member.name] = Number(val)
      })
    })
    return Object.values(dateMap)
  })()

  const COMPARE_OPTIONS = [
    { id: 'weight', label: 'Peso (kg)' },
    { id: 'bodyFat', label: 'Grasa %' },
    { id: 'muscle', label: 'Músculo (kg)' },
    { id: 'chest', label: 'Pecho (cm)' },
    { id: 'waist', label: 'Cintura (cm)' },
    { id: 'bicep', label: 'Bícep (cm)' },
  ]

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

      {/* Tabs */}
      <div className="mb-5 flex gap-1.5 rounded-xl bg-bg-secondary p-1">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-wider transition"
              style={activeTab === tab.id
                ? { background: `${userColor}15`, color: userColor }
                : { color: '#555568' }
              }
            >
              <Icon size={13} /> {tab.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="card animate-pulse py-12 text-center text-sm text-text-muted">Cargando...</div>
      ) : (
        <>
          {/* ====== TAB: RANKING ====== */}
          {activeTab === 'ranking' && (
            <>
              {/* Podium */}
              {members.length >= 3 && (
                <section className="mb-6">
                  <div className="relative flex items-end justify-center gap-2 rounded-2xl px-4 pt-4 pb-2"
                    style={{ background: 'linear-gradient(180deg, rgba(255,215,0,0.06) 0%, transparent 100%)' }}
                  >
                    {/* 2nd place */}
                    <div className="flex flex-col items-center">
                      <AvatarWithMood name={members[1]?.name} color={members[1]?.color || '#BF00FF'} avatarBase={members[1]?.name?.toLowerCase()} size="sm" />
                      <div className="mt-1 flex h-16 w-16 items-end justify-center rounded-t-lg"
                        style={{ background: `linear-gradient(180deg, ${members[1]?.color || '#BF00FF'}22, transparent)` }}>
                        <span className="text-lg">🥈</span>
                      </div>
                    </div>
                    {/* 1st place */}
                    <div className="flex flex-col items-center">
                      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <AvatarWithMood name={members[0]?.name} color={members[0]?.color || '#00F0FF'} avatarBase={members[0]?.name?.toLowerCase()} size="md" />
                      </motion.div>
                      <div className="mt-1 flex h-24 w-20 items-end justify-center rounded-t-lg"
                        style={{ background: 'linear-gradient(180deg, rgba(255,215,0,0.15), transparent)' }}>
                        <span className="text-2xl">👑</span>
                      </div>
                    </div>
                    {/* 3rd place */}
                    <div className="flex flex-col items-center">
                      <AvatarWithMood name={members[2]?.name} color={members[2]?.color || '#FF3D5A'} avatarBase={members[2]?.name?.toLowerCase()} size="sm" />
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
                  <span className="text-base">{EMOJI_ASSETS.trophy}</span>
                  <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Ranking semanal</h2>
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

              {/* XP Ranking */}
              {!gamLoading && squadStats.length > 0 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <Zap size={16} style={{ color: '#FFD700' }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Ranking XP</h2>
                  </div>
                  <div className="space-y-2">
                    {squadStats.map((member, i) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                        style={{ background: '#14141F', border: `1px solid ${member.id === user?.id ? `${userColor}33` : 'rgba(255,255,255,0.04)'}` }}
                      >
                        <span className="font-mono text-sm font-bold text-text-muted">#{i + 1}</span>
                        <AvatarWithMood name={member.name} color={member.color} avatarBase={member.name?.toLowerCase()} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold">{member.name}</p>
                            <span className="rounded-full px-1.5 py-0.5 text-[8px] font-black tracking-wider"
                              style={{ background: `${member.rank.color}22`, color: member.rank.color }}>
                              {member.rank.name}
                            </span>
                          </div>
                          <p className="font-mono text-[10px] text-text-muted">Lvl {member.level}</p>
                        </div>
                        <p className="font-mono text-xs font-bold" style={{ color: member.rank.color }}>
                          {member.xp.toLocaleString()} XP
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Activity feed */}
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-base">{EMOJI_ASSETS.lightning}</span>
                  <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Actividad reciente</h2>
                </div>
                {recentActivity.length === 0 ? (
                  <div className="card py-6 text-center">
                    <img src={ESCENAS.emptyState} alt="" className="mx-auto mb-3 h-24 w-auto object-contain opacity-80" />
                    <p className="text-sm text-text-muted">Nadie ha entrenado aún...</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentActivity.slice(0, 10).map((a, i) => (
                      <WorkoutDetailCard
                        key={a.id}
                        session={a}
                        userColor={userColor}
                        isCurrentUser={a.user_id === user?.id}
                        delay={i}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* ====== TAB: MIEMBROS ====== */}
          {activeTab === 'miembros' && (
            <section>
              <div className="space-y-4">
                {members.map((member, i) => {
                  const stats = memberStats[member.id]
                  const gamStats = squadStats?.find(s => s.id === member.id)
                  return (
                    <motion.button
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMember(member)}
                      className="w-full overflow-hidden rounded-2xl text-left"
                      style={{ background: '#14141F', border: `1px solid ${member.color}22` }}
                    >
                      {/* Member header */}
                      <div className="flex items-center gap-4 p-4" style={{ background: `linear-gradient(135deg, ${member.color}10, transparent)` }}>
                        <AvatarWithMood name={member.name} color={member.color} avatarBase={member.name?.toLowerCase()} size="lg" />
                        <div className="flex-1">
                          <h3 className="text-base font-bold">{member.name}</h3>
                          {member.nickname && (
                            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: member.color }}>
                              {member.nickname}
                            </p>
                          )}
                          {gamStats && (
                            <div className="mt-1 flex items-center gap-2">
                              <span className="rounded-full px-1.5 py-0.5 text-[8px] font-black tracking-wider"
                                style={{ background: `${gamStats.rank.color}22`, color: gamStats.rank.color }}>
                                {gamStats.rank.name}
                              </span>
                              <span className="font-mono text-[10px] text-text-muted">
                                Lvl {gamStats.level} · {gamStats.xp.toLocaleString()} XP
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats grid */}
                      {stats && (
                        <div className="grid grid-cols-4 gap-px bg-bg-surface/30 p-px">
                          {[
                            { value: stats.totalWorkouts, label: 'Entrenos', color: member.color },
                            { value: `${(stats.totalTonnage / 1000).toFixed(1)}t`, label: 'Tonnage', color: '#FFD700' },
                            { value: stats.uniqueExercises, label: 'Ejercicios', color: '#BF00FF' },
                            { value: stats.prCount, label: 'PRs', color: '#00FF88' },
                          ].map(s => (
                            <div key={s.label} className="bg-bg-primary py-2.5 text-center">
                              <p className="font-mono text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
                              <p className="text-[8px] text-text-muted">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Body metrics */}
                      {stats?.latestMetric && (
                        <div className="flex gap-4 px-4 py-3">
                          {stats.latestMetric.weight && (
                            <div>
                              <p className="font-mono text-xs font-bold" style={{ color: member.color }}>{stats.latestMetric.weight}kg</p>
                              <p className="text-[8px] text-text-muted">Peso</p>
                            </div>
                          )}
                          {stats.latestMetric.body_fat_pct && (
                            <div>
                              <p className="font-mono text-xs font-bold text-neon-red">{stats.latestMetric.body_fat_pct}%</p>
                              <p className="text-[8px] text-text-muted">Grasa</p>
                            </div>
                          )}
                          {stats.latestMetric.muscle_mass && (
                            <div>
                              <p className="font-mono text-xs font-bold text-neon-green">{stats.latestMetric.muscle_mass}kg</p>
                              <p className="text-[8px] text-text-muted">Músculo</p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </section>
          )}

          {/* ====== TAB: COMPARAR ====== */}
          {activeTab === 'comparar' && (
            <>
              {/* Metric selector */}
              <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
                {COMPARE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setCompareMetric(opt.id)}
                    className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition"
                    style={compareMetric === opt.id
                      ? { background: `${userColor}22`, color: userColor, border: `1px solid ${userColor}44` }
                      : { background: '#1E1E2E', color: '#8888A0', border: '1px solid rgba(255,255,255,0.06)' }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Comparison chart */}
              {comparisonData.length > 2 ? (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp size={16} style={{ color: userColor }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                      {COMPARE_OPTIONS.find(o => o.id === compareMetric)?.label} - Comparativa
                    </h2>
                  </div>
                  <div className="card">
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="#555568" fontSize={10} />
                        <YAxis stroke="#555568" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip content={<CustomTooltip />} />
                        {squadHistory.map(member => (
                          <Line
                            key={member.id}
                            type="monotone"
                            dataKey={member.name}
                            stroke={member.color}
                            strokeWidth={2}
                            dot={{ fill: member.color, r: 2 }}
                            connectNulls
                            style={{ filter: `drop-shadow(0 0 4px ${member.color}55)` }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-2 flex justify-center gap-4">
                      {squadHistory.map(m => (
                        <span key={m.id} className="flex items-center gap-1 text-[10px]">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              ) : (
                <div className="card py-8 text-center">
                  <Scale size={32} className="mx-auto mb-3 text-text-muted" />
                  <p className="text-sm text-text-muted">Sin datos suficientes para comparar</p>
                  <p className="mt-1 text-xs text-text-muted">Añade mediciones corporales para ver la comparativa</p>
                </div>
              )}

              {/* Latest values comparison table */}
              {!histLoading && squadHistory.length > 0 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <Scale size={16} style={{ color: '#BF00FF' }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                      Últimas mediciones
                    </h2>
                  </div>
                  <div className="overflow-hidden rounded-xl" style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="grid grid-cols-4 gap-px bg-bg-surface/20">
                      <div className="bg-bg-primary p-2" />
                      {squadHistory.map(m => (
                        <div key={m.id} className="bg-bg-primary p-2 text-center">
                          <p className="text-[10px] font-bold" style={{ color: m.color }}>{m.name}</p>
                        </div>
                      ))}
                    </div>
                    {['weight', 'body_fat_pct', 'muscle_mass', 'chest', 'waist', 'bicep_right'].map(field => {
                      const labels = { weight: 'Peso', body_fat_pct: 'Grasa %', muscle_mass: 'Músculo', chest: 'Pecho', waist: 'Cintura', bicep_right: 'Bícep' }
                      const units = { weight: 'kg', body_fat_pct: '%', muscle_mass: 'kg', chest: 'cm', waist: 'cm', bicep_right: 'cm' }
                      return (
                        <div key={field} className="grid grid-cols-4 gap-px bg-bg-surface/20">
                          <div className="bg-bg-primary px-2 py-1.5">
                            <p className="text-[10px] text-text-muted">{labels[field]}</p>
                          </div>
                          {squadHistory.map(m => {
                            const latest = m.entries.filter(e => e[field]).pop()
                            return (
                              <div key={m.id} className="bg-bg-primary px-2 py-1.5 text-center">
                                <p className="font-mono text-[10px] font-bold">
                                  {latest?.[field] ? `${Number(latest[field]).toFixed(1)}${units[field]}` : '—'}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}

      {/* Member profile modal */}
      {selectedMember && (
        <MemberProfileModal
          member={selectedMember}
          stats={memberStats[selectedMember.id]}
          gamStats={squadStats?.find(s => s.id === selectedMember.id)}
          recentSessions={recentActivity.filter(a => a.user_id === selectedMember.id).slice(0, 5)}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </PageWrapper>
  )
}
