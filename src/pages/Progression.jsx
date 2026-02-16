import { useState } from 'react'
import { useGamification, useSquadGamification } from '../hooks/useGamification'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Trophy, Zap, Target, TrendingUp, Star, ChevronDown, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import AvatarWithMood from '../components/avatar/AvatarWithMood'
import BadgeCard from '../components/badges/BadgeCard'
import { RANKS, BADGES, BADGE_CATEGORIES, TIER_COLORS, EMOJI_ASSETS } from '../data/constants'
import { xpForLevel } from '../utils/calculations'

const XP_SOURCES = [
  { action: 'Completar un entreno', xp: 100, icon: '🏋️' },
  { action: 'Completar un hábito', xp: 20, icon: '✅' },
  { action: 'Día perfecto (todos los hábitos)', xp: 50, icon: '⭐' },
  { action: 'Nuevo récord personal', xp: 200, icon: '🏆' },
  { action: 'Ejercicio nuevo desbloqueado', xp: 75, icon: '🔓' },
  { action: 'Medición corporal registrada', xp: 30, icon: '📏' },
  { action: 'Incrementar peso en un ejercicio', xp: 50, icon: '📈' },
  { action: 'Cada 5 toneladas acumuladas', xp: 100, icon: '💪' },
  { action: 'Racha de 7 días', xp: 300, icon: '🔥' },
  { action: 'Racha de 30 días', xp: 1000, icon: '💎' },
  { action: 'Racha de 100 días', xp: 3000, icon: '👑' },
]

export default function Progression() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { stats, loading } = useGamification()
  const { squadStats, loading: squadLoading } = useSquadGamification()
  const [showAllMilestones, setShowAllMilestones] = useState(false)
  const [showPointSystem, setShowPointSystem] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState(null)

  const userColor = profile?.color || '#00F0FF'

  if (loading) {
    return (
      <PageWrapper>
        <div className="card animate-pulse py-12 text-center text-sm text-text-muted">Cargando...</div>
      </PageWrapper>
    )
  }

  if (!stats) return null

  const { xp, level, progress, rank, nextLevelXP, breakdown, milestones, rawStats, unlockedBadges } = stats
  const completedMilestones = milestones.filter(m => m.completed)
  const pendingMilestones = milestones.filter(m => !m.completed)
  const displayMilestones = showAllMilestones ? pendingMilestones : pendingMilestones.slice(0, 4)
  const totalBadges = BADGES.length
  const unlockedCount = unlockedBadges?.size || 0

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-display text-lg font-bold uppercase tracking-wider">Progresión</h1>
        <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: `${userColor}22`, color: userColor }}>
          {unlockedCount}/{totalBadges} badges
        </span>
      </div>

      {/* Level hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-2xl p-6"
        style={{
          background: rank.gradient,
          boxShadow: `0 0 40px ${rank.color}33`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/assets/backgrounds/heroes/digital-mountain.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
          }}
        />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="font-display text-4xl font-black tracking-wider" style={{ color: rank.color, textShadow: `0 0 20px ${rank.color}88` }}>
              {rank.name}
            </p>
          </motion.div>
          <p className="mt-1 text-xs text-white/60">{rank.desc}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="font-mono text-3xl font-black text-white">Lvl {level}</span>
          </div>
          <div className="mt-3">
            <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: rank.color, boxShadow: `0 0 8px ${rank.color}` }}
              />
            </div>
            <p className="mt-1 font-mono text-[10px] text-white/50">
              {xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
            </p>
          </div>
        </div>
      </motion.div>

      {/* Point System Explainer */}
      <section className="mb-8">
        <button
          onClick={() => setShowPointSystem(!showPointSystem)}
          className="mb-3 flex w-full items-center gap-2"
        >
          <Info size={16} style={{ color: '#FDCB6E' }} />
          <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
            Sistema de puntos
          </h2>
          <ChevronDown
            size={14}
            className="ml-auto text-text-muted transition-transform"
            style={{ transform: showPointSystem ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
        <AnimatePresence>
          {showPointSystem && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="mb-3 text-xs text-text-secondary">
                Cada acción que realizas suma XP. Acumula XP para subir de nivel y desbloquear rangos.
                Los badges se desbloquean al cumplir retos específicos.
              </p>
              <div className="space-y-1">
                {XP_SOURCES.map(s => (
                  <div key={s.action} className="flex items-center gap-2 rounded-lg px-3 py-2"
                    style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-sm">{s.icon}</span>
                    <span className="flex-1 text-[11px] text-text-secondary">{s.action}</span>
                    <span className="font-mono text-[11px] font-bold" style={{ color: userColor }}>+{s.xp} XP</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Badges by Category */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm">{EMOJI_ASSETS.trophy}</span>
          <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
            Badges ({unlockedCount}/{totalBadges})
          </h2>
        </div>

        <div className="space-y-4">
          {BADGE_CATEGORIES.map(cat => {
            const catBadges = BADGES.filter(b => b.category === cat.id)
            const catUnlocked = catBadges.filter(b => unlockedBadges?.has(b.id)).length
            const isExpanded = expandedCategory === cat.id

            return (
              <div key={cat.id}>
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 transition"
                  style={{
                    background: isExpanded ? `${userColor}08` : '#14141F',
                    border: isExpanded ? `1px solid ${userColor}22` : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold">{cat.name}</p>
                      <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                        style={{
                          background: catUnlocked === catBadges.length ? `${userColor}22` : '#252538',
                          color: catUnlocked === catBadges.length ? userColor : '#8888A0',
                        }}>
                        {catUnlocked}/{catBadges.length}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-text-muted">{cat.desc}</p>
                  </div>
                  {/* Mini progress */}
                  <div className="flex gap-0.5">
                    {catBadges.map(b => (
                      <div key={b.id} className="h-1.5 w-1.5 rounded-full"
                        style={{
                          backgroundColor: unlockedBadges?.has(b.id)
                            ? TIER_COLORS[b.tier].bg
                            : 'rgba(255,255,255,0.08)',
                        }}
                      />
                    ))}
                  </div>
                  <ChevronDown
                    size={14}
                    className="text-text-muted transition-transform"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        {catBadges.map((badge, i) => (
                          <BadgeCard
                            key={badge.id}
                            badge={badge}
                            unlocked={unlockedBadges?.has(badge.id)}
                            delay={i * 0.04}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      {/* Squad levels comparison */}
      {!squadLoading && squadStats.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Star size={16} style={{ color: '#FFD700' }} />
            <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
              Niveles del Squad
            </h2>
          </div>
          <div className="space-y-2">
            {squadStats.map((member, i) => {
              const memberRank = member.rank
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: '#14141F', border: `1px solid ${member.id === profile?.id ? `${userColor}33` : 'rgba(255,255,255,0.04)'}` }}
                >
                  <AvatarWithMood name={member.name} color={member.color} avatarBase={member.name?.toLowerCase()} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold">{member.name}</p>
                      <span className="rounded-full px-1.5 py-0.5 text-[8px] font-black tracking-wider"
                        style={{ background: `${memberRank.color}22`, color: memberRank.color }}>
                        {memberRank.name}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-bg-surface">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${member.progress}%`,
                          backgroundColor: memberRank.color,
                        }} />
                      </div>
                      <span className="font-mono text-[10px] text-text-muted">Lvl {member.level}</span>
                    </div>
                  </div>
                  <p className="font-mono text-xs font-bold" style={{ color: memberRank.color }}>
                    {member.xp.toLocaleString()}
                    <span className="text-[9px] text-text-muted"> XP</span>
                  </p>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {/* XP breakdown */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Zap size={16} style={{ color: userColor }} />
          <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
            Tu XP acumulado
          </h2>
        </div>
        <div className="space-y-1.5">
          {breakdown.map((b, i) => (
            <motion.div
              key={b.source}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between rounded-xl px-3 py-2.5"
              style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">{b.source}</span>
                <span className="rounded-full bg-bg-surface px-1.5 py-0.5 text-[9px] text-text-muted">
                  x{b.count}
                </span>
              </div>
              <span className="font-mono text-xs font-bold" style={{ color: userColor }}>
                +{b.xp.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Completed milestones */}
      {completedMilestones.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Trophy size={16} style={{ color: '#00FF88' }} />
            <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
              Hitos completados ({completedMilestones.length})
            </h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {completedMilestones.map(m => (
              <span key={m.id} className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.2)' }}>
                {m.label} (+{m.xpReward} XP)
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Pending milestones */}
      {pendingMilestones.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Target size={16} style={{ color: '#FDCB6E' }} />
            <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
              Próximos hitos ({pendingMilestones.length})
            </h2>
          </div>
          <div className="space-y-1.5">
            {displayMilestones.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <span className="text-xs text-text-secondary">{m.label}</span>
                <span className="font-mono text-[10px] text-text-muted">+{m.xpReward} XP</span>
              </motion.div>
            ))}
          </div>
          {pendingMilestones.length > 4 && (
            <button
              onClick={() => setShowAllMilestones(!showAllMilestones)}
              className="mt-2 w-full text-center text-[10px] font-semibold" style={{ color: userColor }}
            >
              {showAllMilestones ? 'Ver menos' : `Ver todos (${pendingMilestones.length})`}
            </button>
          )}
        </section>
      )}

      {/* Rank roadmap */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp size={16} style={{ color: '#BF00FF' }} />
          <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
            Rangos
          </h2>
        </div>
        <div className="space-y-1.5">
          {RANKS.map((r, i) => {
            const isCurrentOrPast = level >= r.minLevel
            const isCurrent = level >= r.minLevel && level <= r.maxLevel
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-xl px-3 py-3"
                style={{
                  background: isCurrent ? `${r.color}10` : '#14141F',
                  border: isCurrent ? `1px solid ${r.color}33` : '1px solid rgba(255,255,255,0.04)',
                  opacity: isCurrentOrPast ? 1 : 0.4,
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{
                  background: isCurrentOrPast ? r.gradient : 'rgba(255,255,255,0.05)',
                }}>
                  <span className="font-display text-[10px] font-black text-white">
                    {r.minLevel}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: isCurrentOrPast ? r.color : '#555568' }}>
                    {r.name}
                  </p>
                  <p className="text-[10px] text-text-muted">{r.desc}</p>
                </div>
                {isCurrent && (
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                    style={{ background: `${r.color}22`, color: r.color }}>
                    ACTUAL
                  </span>
                )}
                {isCurrentOrPast && !isCurrent && (
                  <span className="text-[10px] text-text-muted">✓</span>
                )}
                {!isCurrentOrPast && (
                  <span className="font-mono text-[9px] text-text-muted">
                    Lvl {r.minLevel}+
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Raw stats */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
            Estadísticas
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Entrenos', value: rawStats.workoutCount, color: userColor },
            { label: 'PRs', value: rawStats.prCount, color: '#FFD700' },
            { label: 'Ejercicios', value: rawStats.uniqueExercises, color: '#BF00FF' },
            { label: 'Toneladas', value: `${rawStats.tonnageTons.toFixed(1)}t`, color: '#FF3D5A' },
            { label: 'Días perfectos', value: rawStats.allHabitsDays, color: '#00FF88' },
            { label: 'Mediciones', value: rawStats.bodyMetricEntries, color: '#FF8C00' },
          ].map(s => (
            <div key={s.label} className="rounded-xl py-2.5 text-center"
              style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="font-mono text-base font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </PageWrapper>
  )
}
