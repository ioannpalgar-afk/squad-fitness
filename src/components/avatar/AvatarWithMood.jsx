import { useState } from 'react'
import { motion } from 'framer-motion'
import { AVATAR_MOODS, getAvatarMood, EMOJI_ASSETS } from '../../data/constants'

// Mapa de mood → emoji asset
const MOOD_EMOJI_MAP = {
  sleeping: EMOJI_ASSETS.sleep,
  base: EMOJI_ASSETS.bicep,
  happy: EMOJI_ASSETS.fire,
  flexing: EMOJI_ASSETS.lightning,
  sad: EMOJI_ASSETS.skull,
  onfire: EMOJI_ASSETS.fire,
}

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
  const [usedFallback, setUsedFallback] = useState(false)

  const sizes = {
    sm: { container: 'h-10 w-10', text: 'text-lg', emoji: 'h-4 w-4', emojiWrap: 'h-5 w-5' },
    md: { container: 'h-14 w-14', text: 'text-2xl', emoji: 'h-5 w-5', emojiWrap: 'h-6 w-6' },
    lg: { container: 'h-24 w-24', text: 'text-4xl', emoji: 'h-6 w-6', emojiWrap: 'h-7 w-7' },
    xl: { container: 'h-32 w-32', text: 'text-5xl', emoji: 'h-8 w-8', emojiWrap: 'h-9 w-9' },
  }
  const s = sizes[size]
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  // Mood images are in /assets/moods/{name}-{mood}.png
  // Base avatars are in /assets/avatars/{name}-base.png
  const moodSrc = avatarBase ? `/assets/moods/${avatarBase}-${currentMood}.png` : null
  const baseSrc = avatarBase ? `/assets/avatars/${avatarBase}-base.png` : null
  const moodEmojiSrc = MOOD_EMOJI_MAP[currentMood]

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
        style={{ border: `2px solid ${color}`, boxShadow: `0 0 10px ${color}33` }}
      >
        {!imgError ? (
          <img
            src={moodSrc}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => {
              if (!usedFallback && baseSrc) {
                setUsedFallback(true)
              } else {
                setImgError(true)
              }
            }}
            {...(usedFallback && !imgError ? { src: baseSrc } : {})}
          />
        ) : (
          <div
            className={`${s.container} flex items-center justify-center`}
            style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)` }}
          >
            <span className={`${s.text} font-bold`} style={{ color }}>{initials}</span>
          </div>
        )}
      </motion.div>

      {/* Mood indicator — custom emoji image */}
      <div
        className={`absolute -bottom-0.5 -right-0.5 ${s.emojiWrap} flex items-center justify-center rounded-full bg-bg-primary`}
      >
        {moodEmojiSrc ? (
          <img src={moodEmojiSrc} alt={currentMood} className={`${s.emoji} object-contain`} />
        ) : (
          <span className="text-[10px]">{AVATAR_MOODS[currentMood]?.emoji}</span>
        )}
      </div>
    </div>
  )
}
