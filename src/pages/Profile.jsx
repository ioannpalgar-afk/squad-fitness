import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWorkouts } from '../hooks/useWorkouts'
import { useHabits } from '../hooks/useHabits'
import { useStats } from '../hooks/useStats'
import { Calendar, Dumbbell, Flame } from 'lucide-react'
import { motion } from 'framer-motion'
import AvatarWithMood from '../components/avatar/AvatarWithMood'
import BadgeCard from '../components/badges/BadgeCard'
import StreakCounter from '../components/ui/StreakCounter'
import PageWrapper from '../components/layout/PageWrapper'
import { BADGES, EMOJI_ASSETS } from '../data/constants'

export default function Profile() {
  const { profile, signOut } = useAuth()
  const { sessions } = useWorkouts()
  const { streak, completedToday, totalToday } = useHabits()
  const { personalRecords } = useStats()

  const userColor = profile?.color || '#00F0FF'
  const totalWorkouts = sessions.filter(s => s.finished_at).length
  const totalSets = sessions.reduce((sum, s) => sum + (s.session_sets?.length || 0), 0)
  const prCount = personalRecords?.length || 0

  // Determine which badges are unlocked based on actual data
  const unlockedBadges = useMemo(() => {
    const unlocked = new Set()
    if (totalWorkouts >= 1) unlocked.add('first-spark')
    if (streak >= 7) unlocked.add('streak-7')
    if (streak >= 30) unlocked.add('streak-30')
    if (streak >= 100) unlocked.add('streak-100')
    if (totalWorkouts >= 100) unlocked.add('centurion')
    if (prCount > 0) unlocked.add('new-pr')
    return unlocked
  }, [totalWorkouts, streak, prCount])

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
              <img src={customIcon} alt="" className="mx-auto mb-1 h-5 w-5 object-contain" />
            ) : (
              <Icon size={16} className="mx-auto mb-1" style={{ color }} />
            )}
            <p className="font-mono text-lg font-bold" style={{ color }}>{value}</p>
            <p className="text-[10px] text-text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={EMOJI_ASSETS.trophy} alt="" className="h-5 w-5 object-contain" />
            <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Badges</h2>
          </div>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{
            background: `${userColor}22`,
            color: userColor,
          }}>
            {unlockedBadges.size}/{BADGES.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {BADGES.map((badge, i) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              unlocked={unlockedBadges.has(badge.id)}
              delay={i * 0.03}
            />
          ))}
        </div>
      </section>

      {/* Settings / Logout */}
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
