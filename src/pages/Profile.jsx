import { useAuth } from '../contexts/AuthContext'
import { useWorkouts } from '../hooks/useWorkouts'
import { useHabits } from '../hooks/useHabits'
import { useStats } from '../hooks/useStats'
import { useGamification } from '../hooks/useGamification'
import { useBackground, BACKGROUND_OPTIONS } from '../hooks/useBackground'
import { Calendar, Dumbbell, Flame, ChevronRight, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AvatarWithMood from '../components/avatar/AvatarWithMood'
import BadgeCard from '../components/badges/BadgeCard'
import StreakCounter from '../components/ui/StreakCounter'
import PageWrapper from '../components/layout/PageWrapper'
import { BADGES, BADGE_CATEGORIES, EMOJI_ASSETS } from '../data/constants'

export default function Profile() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const { sessions } = useWorkouts()
  const { streak, completedToday, totalToday } = useHabits()
  const { personalRecords } = useStats()
  const { stats: gamification } = useGamification()
  const { background, changeBackground } = useBackground()

  const userColor = profile?.color || '#00F0FF'
  const totalWorkouts = sessions.filter(s => s.finished_at).length
  const totalSets = sessions.reduce((sum, s) => sum + (s.session_sets?.length || 0), 0)
  const prCount = personalRecords?.length || 0

  const unlockedBadges = gamification?.unlockedBadges || new Set()
  const unlockedCount = unlockedBadges.size
  const totalBadgeCount = BADGES.length

  // Show recently unlocked badges (up to 6, prioritize gold > silver > bronze)
  const tierOrder = { gold: 0, silver: 1, bronze: 2 }
  const recentUnlocked = BADGES
    .filter(b => unlockedBadges.has(b.id))
    .sort((a, b) => (tierOrder[a.tier] ?? 3) - (tierOrder[b.tier] ?? 3))
    .slice(0, 6)

  return (
    <PageWrapper>
      {/* Profile header */}
      <div className="mb-6 text-center">
        <AvatarWithMood
          name={profile?.name}
          color={userColor}
          avatarBase={profile?.name?.toLowerCase()}
          size="xl"
          streak={streak}
          completedToday={completedToday}
          totalToday={totalToday}
        />
        <h1 className="mt-4 text-xl font-bold">{profile?.name}</h1>
        {profile?.nickname && (
          <p className="font-display text-xs uppercase tracking-wider" style={{ color: userColor }}>
            {profile.nickname}
          </p>
        )}
        {streak > 0 && (
          <div className="mt-2 flex items-center justify-center">
            <StreakCounter count={streak} color={userColor} size="sm" />
          </div>
        )}
      </div>

      {/* Level card */}
      {gamification && (
        <motion.button
          onClick={() => navigate('/progresion')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 w-full overflow-hidden rounded-2xl p-4 text-left"
          style={{
            background: gamification.rank.gradient,
            boxShadow: `0 0 30px ${gamification.rank.color}22`,
          }}
        >
          <div className="relative z-10" style={{ background: 'none' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-sm font-black tracking-wider" style={{ color: gamification.rank.color, textShadow: `0 0 10px ${gamification.rank.color}66` }}>
                  {gamification.rank.name}
                </p>
                <p className="text-[10px] text-white/60">Nivel {gamification.level}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-mono text-sm font-bold text-white">{gamification.xp.toLocaleString()} XP</span>
                <ChevronRight size={14} className="text-white/40" />
              </div>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${gamification.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: gamification.rank.color }}
              />
            </div>
            <p className="mt-1 text-right font-mono text-[9px] text-white/40">
              {gamification.nextLevelXP.toLocaleString()} XP para Lvl {gamification.level + 1}
            </p>
          </div>
        </motion.button>
      )}

      {/* Quick stats */}
      <div className="mb-8 grid grid-cols-4 gap-2">
        {[
          { icon: Calendar, value: totalWorkouts, label: 'Entrenos', color: userColor },
          { icon: Dumbbell, value: totalSets, label: 'Sets', color: '#BF00FF' },
          { icon: Flame, value: streak, label: 'Racha', color: '#FF8C00' },
          { value: prCount, label: 'PRs', color: '#FFD700', customIcon: EMOJI_ASSETS.trophy },
        ].map(({ icon: Icon, value, label, color, customIcon }) => (
          <div key={label} className="card py-3 text-center">
            {customIcon ? (
              <span className="mx-auto mb-1 block text-base">{customIcon}</span>
            ) : (
              <Icon size={16} className="mx-auto mb-1" style={{ color }} />
            )}
            <p className="font-mono text-lg font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px] text-text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Badges preview */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{EMOJI_ASSETS.trophy}</span>
            <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Badges</h2>
          </div>
          <button
            onClick={() => navigate('/progresion')}
            className="flex items-center gap-1 text-[10px] font-semibold"
            style={{ color: userColor }}
          >
            {unlockedCount}/{totalBadgeCount} - Ver todo <ChevronRight size={12} />
          </button>
        </div>

        {recentUnlocked.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {recentUnlocked.map((badge, i) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                unlocked={true}
                delay={i * 0.03}
              />
            ))}
          </div>
        ) : (
          <button
            onClick={() => navigate('/progresion')}
            className="w-full rounded-xl border border-dashed py-6 text-center transition"
            style={{ borderColor: `${userColor}33`, background: `${userColor}05` }}
          >
            <p className="text-xs text-text-muted">Completa retos para desbloquear badges</p>
            <p className="mt-1 text-xs font-semibold" style={{ color: userColor }}>Ver todos los badges</p>
          </button>
        )}
      </section>

      {/* Background selector */}
      <section className="mb-8">
        <h2 className="mb-3 font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
          Fondo
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {BACKGROUND_OPTIONS.map(bg => (
            <button
              key={bg.id}
              onClick={() => changeBackground(bg.id)}
              className="relative aspect-square overflow-hidden rounded-lg border transition-all"
              style={{
                borderColor: background === bg.id ? userColor : 'rgba(255,255,255,0.06)',
                boxShadow: background === bg.id ? `0 0 12px ${userColor}33` : 'none',
              }}
            >
              {bg.file ? (
                <img
                  src={`/assets/backgrounds/patterns/${bg.file}`}
                  alt={bg.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-bg-primary">
                  <span className="text-[10px] text-text-muted">Off</span>
                </div>
              )}
              {background === bg.id && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: `${userColor}33` }}
                >
                  <Check size={16} style={{ color: userColor }} />
                </div>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 text-center text-[8px] leading-tight text-white/70">
                {bg.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Logout */}
      <div className="space-y-2">
        <button
          onClick={signOut}
          className="btn-ghost flex w-full items-center justify-center gap-2 py-3 text-sm"
        >
          Cerrar sesión
        </button>
      </div>
    </PageWrapper>
  )
}
