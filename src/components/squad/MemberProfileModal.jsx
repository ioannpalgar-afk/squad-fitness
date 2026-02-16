import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Dumbbell, Flame, Trophy, TrendingUp, ChevronDown, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import AvatarWithMood from '../avatar/AvatarWithMood'
import BadgeCard from '../badges/BadgeCard'
import { computeUnlockedBadges } from '../../hooks/useGamification'
import { calculateXP } from '../../utils/calculations'
import { BADGES, BADGE_CATEGORIES, TIER_COLORS, RANKS, MILESTONES } from '../../data/constants'

export default function MemberProfileModal({ member, stats, gamStats, recentSessions, onClose }) {
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [showActivity, setShowActivity] = useState(false)

  if (!member) return null

  const color = member.color || '#00F0FF'

  // Compute badges & XP breakdown from rawStats
  const unlockedBadges = useMemo(() => {
    if (!gamStats?.rawStats) return new Set()
    return computeUnlockedBadges(gamStats.rawStats)
  }, [gamStats])

  const xpBreakdown = useMemo(() => {
    if (!gamStats?.rawStats) return []
    return calculateXP(gamStats.rawStats).breakdown
  }, [gamStats])

  const completedMilestones = useMemo(() => {
    if (!gamStats?.rawStats) return []
    return MILESTONES.filter(m => m.check(gamStats.rawStats))
  }, [gamStats])

  const unlockedCount = unlockedBadges.size
  const totalBadges = BADGES.length

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
          className="relative z-10 w-full max-w-sm overflow-hidden rounded-t-2xl sm:rounded-2xl"
          style={{ background: '#0A0A12', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh' }}
        >
          {/* Header gradient */}
          <div className="relative px-5 pt-5 pb-4" style={{ background: `linear-gradient(180deg, ${color}15, transparent)` }}>
            <button onClick={onClose} className="absolute top-3 right-3 rounded-lg p-1.5 text-text-muted transition hover:text-white"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X size={16} />
            </button>

            <div className="flex items-center gap-4">
              <AvatarWithMood name={member.name} color={color} avatarBase={member.name?.toLowerCase()} size="xl" />
              <div>
                <h2 className="text-lg font-bold">{member.name}</h2>
                {member.nickname && (
                  <p className="font-display text-[10px] font-semibold uppercase tracking-wider" style={{ color }}>
                    {member.nickname}
                  </p>
                )}
                {gamStats && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider"
                      style={{ background: `${gamStats.rank.color}22`, color: gamStats.rank.color }}>
                      {gamStats.rank.name}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      Lvl {gamStats.level}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: 'calc(90vh - 110px)' }}>

            {/* XP bar */}
            {gamStats && (
              <div className="mb-5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] text-text-muted">{gamStats.xp.toLocaleString()} XP</span>
                  <span className="text-[10px] text-text-muted">Lvl {gamStats.level + 1}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-surface">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${gamStats.progress || 0}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: gamStats.rank.color, boxShadow: `0 0 8px ${gamStats.rank.color}55` }}
                  />
                </div>
              </div>
            )}

            {/* Stats grid */}
            {stats && (
              <div className="mb-5 grid grid-cols-4 gap-2">
                {[
                  { icon: Dumbbell, value: stats.totalWorkouts, label: 'Entrenos', c: color },
                  { icon: Flame, value: `${(stats.totalTonnage / 1000).toFixed(1)}t`, label: 'Tonnage', c: '#FFD700' },
                  { icon: TrendingUp, value: stats.uniqueExercises, label: 'Ejercicios', c: '#BF00FF' },
                  { icon: Trophy, value: stats.prCount, label: 'PRs', c: '#00FF88' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl py-2.5 text-center" style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <s.icon size={14} className="mx-auto mb-1" style={{ color: s.c }} />
                    <p className="font-mono text-sm font-bold" style={{ color: s.c }}>{s.value}</p>
                    <p className="text-[8px] text-text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Body metrics */}
            {stats?.latestMetric && (
              <div className="mb-5">
                <h3 className="mb-2 font-display text-[10px] uppercase tracking-[0.2em] text-text-secondary">Medidas corporales</h3>
                <div className="flex gap-4 rounded-xl px-4 py-3" style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}>
                  {stats.latestMetric.weight && (
                    <div>
                      <p className="font-mono text-sm font-bold" style={{ color }}>{stats.latestMetric.weight}kg</p>
                      <p className="text-[8px] text-text-muted">Peso</p>
                    </div>
                  )}
                  {stats.latestMetric.body_fat_pct && (
                    <div>
                      <p className="font-mono text-sm font-bold text-neon-red">{stats.latestMetric.body_fat_pct}%</p>
                      <p className="text-[8px] text-text-muted">Grasa</p>
                    </div>
                  )}
                  {stats.latestMetric.muscle_mass && (
                    <div>
                      <p className="font-mono text-sm font-bold text-neon-green">{stats.latestMetric.muscle_mass}kg</p>
                      <p className="text-[8px] text-text-muted">Músculo</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Badges by category */}
            {gamStats && (
              <div className="mb-5">
                <div className="mb-2 flex items-center gap-2">
                  <Trophy size={14} style={{ color: '#FFD700' }} />
                  <h3 className="font-display text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                    Badges ({unlockedCount}/{totalBadges})
                  </h3>
                </div>
                <div className="space-y-2">
                  {BADGE_CATEGORIES.map(cat => {
                    const catBadges = BADGES.filter(b => b.category === cat.id)
                    const catUnlocked = catBadges.filter(b => unlockedBadges.has(b.id)).length
                    const isExpanded = expandedCategory === cat.id

                    return (
                      <div key={cat.id}>
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 transition"
                          style={{
                            background: isExpanded ? `${color}08` : '#14141F',
                            border: isExpanded ? `1px solid ${color}22` : '1px solid rgba(255,255,255,0.04)',
                          }}
                        >
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <p className="text-[11px] font-bold">{cat.name}</p>
                              <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold"
                                style={{
                                  background: catUnlocked === catBadges.length ? `${color}22` : '#252538',
                                  color: catUnlocked === catBadges.length ? color : '#8888A0',
                                }}>
                                {catUnlocked}/{catBadges.length}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {catBadges.map(b => (
                              <div key={b.id} className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: unlockedBadges.has(b.id) ? TIER_COLORS[b.tier].bg : 'rgba(255,255,255,0.08)' }}
                              />
                            ))}
                          </div>
                          <ChevronDown size={12} className="text-text-muted transition-transform"
                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-3 gap-1.5 pt-1.5">
                                {catBadges.map((badge, i) => (
                                  <BadgeCard key={badge.id} badge={badge} unlocked={unlockedBadges.has(badge.id)} delay={i * 0.03} />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Rank roadmap */}
            {gamStats && (
              <div className="mb-5">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp size={14} style={{ color: '#BF00FF' }} />
                  <h3 className="font-display text-[10px] uppercase tracking-[0.2em] text-text-secondary">Rangos</h3>
                </div>
                <div className="space-y-1">
                  {RANKS.map(r => {
                    const isCurrentOrPast = gamStats.level >= r.minLevel
                    const isCurrent = gamStats.level >= r.minLevel && gamStats.level <= r.maxLevel
                    return (
                      <div key={r.id} className="flex items-center gap-2 rounded-lg px-3 py-2"
                        style={{
                          background: isCurrent ? `${r.color}10` : '#14141F',
                          border: isCurrent ? `1px solid ${r.color}33` : '1px solid rgba(255,255,255,0.04)',
                          opacity: isCurrentOrPast ? 1 : 0.4,
                        }}
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded" style={{
                          background: isCurrentOrPast ? r.gradient : 'rgba(255,255,255,0.05)',
                        }}>
                          <span className="font-display text-[8px] font-black text-white">{r.minLevel}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold" style={{ color: isCurrentOrPast ? r.color : '#555568' }}>{r.name}</p>
                          <p className="text-[8px] text-text-muted truncate">{r.desc}</p>
                        </div>
                        {isCurrent && (
                          <span className="rounded-full px-1.5 py-0.5 text-[8px] font-bold" style={{ background: `${r.color}22`, color: r.color }}>ACTUAL</span>
                        )}
                        {isCurrentOrPast && !isCurrent && <span className="text-[9px] text-text-muted">✓</span>}
                        {!isCurrentOrPast && <span className="font-mono text-[8px] text-text-muted">Lvl {r.minLevel}+</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* XP breakdown */}
            {xpBreakdown.length > 0 && (
              <div className="mb-5">
                <div className="mb-2 flex items-center gap-2">
                  <Zap size={14} style={{ color: color }} />
                  <h3 className="font-display text-[10px] uppercase tracking-[0.2em] text-text-secondary">Desglose XP</h3>
                </div>
                <div className="space-y-1">
                  {xpBreakdown.map(b => (
                    <div key={b.source} className="flex items-center justify-between rounded-lg px-3 py-1.5"
                      style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-text-secondary">{b.source}</span>
                        <span className="rounded-full bg-bg-surface px-1 py-px text-[8px] text-text-muted">x{b.count}</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold" style={{ color }}>+{b.xp.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones */}
            {completedMilestones.length > 0 && (
              <div className="mb-5">
                <div className="mb-2 flex items-center gap-2">
                  <Trophy size={14} style={{ color: '#00FF88' }} />
                  <h3 className="font-display text-[10px] uppercase tracking-[0.2em] text-text-secondary">
                    Hitos ({completedMilestones.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1">
                  {completedMilestones.map(m => (
                    <span key={m.id} className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                      style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.2)' }}>
                      {m.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recent activity (collapsible) */}
            {recentSessions.length > 0 && (
              <div className="mb-5">
                <button onClick={() => setShowActivity(a => !a)} className="mb-2 flex w-full items-center gap-2">
                  <Flame size={14} style={{ color }} />
                  <h3 className="font-display text-[10px] uppercase tracking-[0.2em] text-text-secondary">Actividad reciente</h3>
                  <motion.div className="ml-auto" animate={{ rotate: showActivity ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={12} className="text-text-muted" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {showActivity && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1">
                        {recentSessions.map(a => (
                          <div key={a.id} className="flex items-center justify-between rounded-lg px-3 py-2"
                            style={{ background: '#14141F', borderLeft: `2px solid ${color}` }}>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold" style={{ color }}>{a.routine?.name || 'Libre'}</p>
                              <p className="text-[10px] text-text-muted">
                                {a.finished_at && formatDistanceToNow(new Date(a.finished_at), { addSuffix: true, locale: es })}
                              </p>
                            </div>
                            {a.duration_minutes && (
                              <span className="shrink-0 font-mono text-[10px] text-text-muted">{a.duration_minutes} min</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Weekly count footer */}
            <div className="flex items-center justify-center gap-2 rounded-xl py-3"
              style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
              <Flame size={14} style={{ color }} />
              <span className="font-mono text-sm font-bold" style={{ color }}>{member.weekCount}</span>
              <span className="text-[10px] text-text-muted">entrenos esta semana</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
