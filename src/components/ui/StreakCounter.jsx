import { motion } from 'framer-motion'
import { EMOJI_ASSETS } from '../../data/constants'

export default function StreakCounter({ count = 0, color = '#FFD700', size = 'md', showLabel = true }) {
  if (count <= 0) return null

  const sizes = {
    sm: { num: 'text-lg', fire: 'text-lg', label: 'text-[10px]' },
    md: { num: 'text-3xl', fire: 'text-2xl', label: 'text-xs' },
    lg: { num: 'text-5xl', fire: 'text-4xl', label: 'text-sm' },
  }
  const s = sizes[size]

  const isLegendary = count >= 30

  return (
    <div className="inline-flex items-center gap-2">
      <motion.div
        animate={count >= 3 ? {
          scale: [1, 1.15, 1],
          rotate: [0, -5, 5, 0],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span
          className={`${s.fire} flex items-center justify-center`}
          style={isLegendary ? { filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.6))' } : {}}
        >
          {EMOJI_ASSETS.fire}
        </span>
      </motion.div>

      <motion.span
        key={count}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${s.num} font-mono font-bold`}
        style={{
          color: isLegendary ? '#FFD700' : color,
          textShadow: isLegendary
            ? '0 0 15px rgba(255,215,0,0.6)'
            : `0 0 10px ${color}55`,
        }}
      >
        {count}
      </motion.span>

      {showLabel && (
        <span className={`${s.label} font-medium text-text-secondary`}>
          {count === 1 ? 'día' : 'días'}
        </span>
      )}
    </div>
  )
}
