import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWorkouts, useFriendActivity, useSquadTaunts } from '../hooks/useWorkouts'
import { useHabits, useSquadCompletion } from '../hooks/useHabits'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, LogOut, Zap, Plus, ChevronRight, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import AvatarWithMood from '../components/avatar/AvatarWithMood'
import StreakCounter from '../components/ui/StreakCounter'
import HabitCard from '../components/habits/HabitCard'
import HabitConfigModal from '../components/habits/HabitConfigModal'
import CelebrationOverlay from '../components/overlays/CelebrationOverlay'
import StreakBrokenModal from '../components/overlays/StreakBrokenModal'
import PageWrapper from '../components/layout/PageWrapper'
import { GREETINGS, ESCENAS, EMOJI_ASSETS, ALL_COMPLETE_MESSAGES, TAUNT_MESSAGES } from '../data/constants'

export default function Dashboard() {
  const { profile, signOut } = useAuth()
  const { sessions, loading: workoutsLoading } = useWorkouts()
  const friendActivity = useFriendActivity()
  const squadTaunts = useSquadTaunts()
  const {
    configs, todayEntries, loading: habitsLoading,
    streak, completedToday, totalToday, allDoneToday,
    toggleHabit, createConfig, deleteConfig,
  } = useHabits()
  const { allSquadDone } = useSquadCompletion()
  const navigate = useNavigate()

  const [showAddHabit, setShowAddHabit] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showStreakBroken, setShowStreakBroken] = useState(false)
  const [celebrationShown, setCelebrationShown] = useState(false)

  const recentSessions = sessions.slice(0, 3)
  const userColor = profile?.color || '#00F0FF'
  const loading = workoutsLoading || habitsLoading

  const greeting = useMemo(() => {
    const g = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
    return g.replace('{name}', profile?.name || 'Crack')
  }, [profile?.name])

  const allDoneMessage = useMemo(() => {
    return ALL_COMPLETE_MESSAGES[Math.floor(Math.random() * ALL_COMPLETE_MESSAGES.length)]
  }, [allDoneToday])

  // Trigger celebration overlay when full squad completes
  useEffect(() => {
    if (allSquadDone && !celebrationShown) {
      setShowCelebration(true)
      setCelebrationShown(true)
    }
  }, [allSquadDone, celebrationShown])

  function isHabitCompleted(configId) {
    return todayEntries.some(e => e.routine_config_id === configId && e.completed)
  }

  async function handleDeleteHabit(id) {
    if (confirm('¿Eliminar este hábito?')) await deleteConfig(id)
  }

  return (
    <PageWrapper>
      {/* Overlays */}
      <CelebrationOverlay show={showCelebration} onClose={() => setShowCelebration(false)} />
      <StreakBrokenModal show={showStreakBroken} onClose={() => setShowStreakBroken(false)} />
      <HabitConfigModal
        show={showAddHabit}
        onClose={() => setShowAddHabit(false)}
        onSave={createConfig}
        color={userColor}
      />

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AvatarWithMood
            name={profile?.name}
            color={userColor}
            avatarBase={profile?.name?.toLowerCase()}
            size="md"
            streak={streak}
            completedToday={completedToday}
            totalToday={totalToday}
          />
          <div>
            <p className="font-display text-[10px] uppercase tracking-wider text-text-secondary">{greeting}</p>
            <h1 className="text-lg font-bold">{profile?.name || 'Atleta'}</h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/perfil')}
          className="rounded-xl bg-bg-secondary p-2.5 transition hover:bg-bg-tertiary"
          style={{ color: userColor }}
        >
          <User size={18} />
        </button>
      </div>

      {/* Streak Badge */}
      {streak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-5 flex items-center justify-center gap-3 rounded-xl py-3"
          style={{
            background: `linear-gradient(135deg, ${userColor}08, ${userColor}03)`,
          }}
        >
          <StreakCounter count={streak} color={userColor} size="md" />
        </motion.div>
      )}

      {/* Today's habits */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{EMOJI_ASSETS.fire}</span>
            <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Hoy</h2>
            {totalToday > 0 && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{
                background: allDoneToday ? `${userColor}22` : '#252538',
                color: allDoneToday ? userColor : '#8888A0',
              }}>
                {completedToday}/{totalToday}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowAddHabit(true)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition"
            style={{ color: userColor }}
          >
            <Plus size={12} /> Añadir
          </button>
        </div>

        {configs.length === 0 ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddHabit(true)}
            className="w-full rounded-xl border border-dashed py-6 text-center transition"
            style={{ borderColor: `${userColor}33`, background: `${userColor}05` }}
          >
            <img src={ESCENAS.emptyState} alt="" className="mx-auto mb-2 h-20 w-auto object-contain opacity-60" />
            <p className="text-xs text-text-muted">Configura tus hábitos diarios</p>
            <p className="mt-1 text-xs font-semibold" style={{ color: userColor }}>+ Añadir primer hábito</p>
          </motion.button>
        ) : (
          <div className="space-y-1.5">
            {configs.map((config, i) => (
              <HabitCard
                key={config.id}
                config={config}
                completed={isHabitCompleted(config.id)}
                onToggle={toggleHabit}
                onDelete={handleDeleteHabit}
                color={userColor}
                delay={i * 0.04}
              />
            ))}
          </div>
        )}

        {/* All done message */}
        <AnimatePresence>
          {allDoneToday && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3"
              style={{ background: `${userColor}10`, border: `1px solid ${userColor}22` }}
            >
              <span className="text-lg">{EMOJI_ASSETS.party}</span>
              <p className="text-xs font-medium" style={{ color: userColor }}>{allDoneMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Progress bar */}
      {totalToday > 0 && (
        <div className="mb-6">
          <div className="h-1.5 overflow-hidden rounded-full bg-bg-surface">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedToday / totalToday) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ backgroundColor: userColor, boxShadow: `0 0 10px ${userColor}55` }}
            />
          </div>
        </div>
      )}

      {/* CTA Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/entrenos')}
        className="btn-primary mb-8 flex w-full items-center justify-center gap-3 py-4 text-base"
      >
        <Zap size={20} />
        ENTRENAR
      </motion.button>

      {/* Recent workouts */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
            Últimos entrenos
          </h2>
          <button onClick={() => navigate('/historial')} className="text-[10px] text-text-muted flex items-center gap-0.5">
            Ver todo <ChevronRight size={12} />
          </button>
        </div>
        {loading ? (
          <div className="card animate-pulse py-8 text-center text-sm text-text-muted">Cargando...</div>
        ) : recentSessions.length === 0 ? (
          <div className="card py-6 text-center">
            <img src={ESCENAS.emptyState} alt="" className="mx-auto mb-3 h-20 w-auto object-contain opacity-60" />
            <p className="text-xs text-text-muted">Empieza a entrenar para ver tu historial</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card flex items-center gap-3"
                style={{ borderLeft: `3px solid ${userColor}` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${userColor}15` }}>
                  <Dumbbell size={18} style={{ color: userColor }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{session.routine?.name || 'Entrenamiento libre'}</p>
                  <p className="text-xs text-text-muted">
                    {formatDistanceToNow(new Date(session.started_at), { addSuffix: true, locale: es })}
                    {session.duration_minutes && ` · ${session.duration_minutes} min`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold" style={{ color: userColor }}>{session.session_sets?.length || 0}</p>
                  <p className="text-[10px] text-text-muted">sets</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Squad Taunts */}
      {squadTaunts.length > 0 && (
        <section className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm">{EMOJI_ASSETS.eyes}</span>
            <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Desaparecidos</h2>
          </div>
          <div className="space-y-1.5">
            {squadTaunts.map(t => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{ background: '#1a1a28', border: '1px solid rgba(255,61,90,0.15)' }}
              >
                <AvatarWithMood name={t.name} color={t.color || '#FF3D5A'} avatarBase={t.name?.toLowerCase()} size="sm" />
                <p className="flex-1 text-xs text-text-secondary">
                  {TAUNT_MESSAGES[t.key]?.replace('{name}', t.name)}
                </p>
                <span className="text-base opacity-60">{EMOJI_ASSETS.skull}</span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Squad Activity */}
      {friendActivity.length > 0 && (
        <section className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
              Actividad del Squad
            </h2>
            <button onClick={() => navigate('/squad')} className="text-[10px] text-text-muted flex items-center gap-0.5">
              Ver todo <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {friendActivity.slice(0, 3).map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card flex items-center gap-3"
              >
                <AvatarWithMood
                  name={a.profile?.name}
                  color={a.profile?.color || '#BF00FF'}
                  avatarBase={a.profile?.name?.toLowerCase()}
                  size="sm"
                />
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">{a.profile?.name}</span>
                    {' entrenó '}
                    <span style={{ color: a.profile?.color || '#BF00FF' }}>{a.routine?.name || 'libre'}</span>
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatDistanceToNow(new Date(a.finished_at), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </PageWrapper>
  )
}
