import { useState } from 'react'
import { motion } from 'framer-motion'
import { AVATAR_MOODS, getAvatarMood } from '../../data/constants'

export default function AvatarWithMood({
  name,
  color = '#00F0FF',
  avatarBase,
  mood,
  streak = 0,
  completedToday = 0,
  totalToday = 0,
  size = 'md',
}) {
  const currentMood = mood || getAvatarMood(streak, completedToday, totalToday)
  const isOnFire = currentMood === 'onfire' || currentMood === 'flexing'
  const [imgError, setImgError] = useState(false)
  const [triedBase, setTriedBase] = useState(false)

  const sizes = {
    sm: { container: 'h-10 w-10', text: 'text-lg', moodBadge: 'h-4 w-4 text-[8px]', moodPos: '-bottom-0.5 -right-0.5' },
    md: { container: 'h-14 w-14', text: 'text-2xl', moodBadge: 'h-5 w-5 text-[10px]', moodPos: '-bottom-0.5 -right-0.5' },
    lg: { container: 'h-24 w-24', text: 'text-4xl', moodBadge: 'h-6 w-6 text-xs', moodPos: '-bottom-0.5 -right-0.5' },
    xl: { container: 'h-32 w-32', text: 'text-5xl', moodBadge: 'h-8 w-8 text-sm', moodPos: '-bottom-1 -right-1' },
  }
  const s = sizes[size]
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  // All avatars are in /assets/avatars/{name}-{mood}.png
  // Normalize: remove accents (Cristóbal -> cristobal)
  const userId = avatarBase?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const moodSrc = userId ? `/assets/avatars/${userId}-${currentMood}.png` : null
  const baseSrc = userId ? `/assets/avatars/${userId}-base.png` : null

  const moodEmojis = {
    base: '', happy: '😄', sleeping: '😴',
    flexing: '💪', sad: '😢', onfire: '🔥',
  }

  // Determine which image src to use
  let imgSrc = moodSrc
  if (triedBase) imgSrc = baseSrc

  return (
    <div className="relative inline-flex">
      <motion.div
        animate={isOnFire ? { boxShadow: [
          `0 0 10px ${color}33`,
          `0 0 25px ${color}55`,
          `0 0 10px ${color}33`,
        ] } : {}}
        transition={isOnFire ? { duration: 2, repeat: Infinity } : {}}
        className={`${s.container} relative overflow-hidden rounded-full`}
        style={{
          border: `2px solid ${color}`,
          boxShadow: isOnFire
            ? `0 0 20px ${color}55, 0 0 40px ${color}22`
            : `0 0 10px ${color}33`,
        }}
      >
        {!imgError && imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => {
              if (!triedBase) {
                setTriedBase(true)
              } else {
                setImgError(true)
              }
            }}
          />
        ) : (
          <div
            className={`${s.container} flex items-center justify-center`}
            style={{
              background: `linear-gradient(135deg, ${color}33, ${color}11)`,
            }}
          >
            <span className={`${s.text} font-bold`} style={{ color }}>{initials}</span>
          </div>
        )}
      </motion.div>

      {/* Mood indicator */}
      {moodEmojis[currentMood] && (
        <div
          className={`absolute ${s.moodPos} ${s.moodBadge} flex items-center justify-center rounded-full bg-bg-primary`}
          style={{ border: `1.5px solid ${color}44` }}
        >
          <span>{moodEmojis[currentMood]}</span>
        </div>
      )}
    </div>
  )
}
