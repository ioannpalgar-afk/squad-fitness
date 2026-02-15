import { motion } from 'framer-motion'
import AvatarWithMood from '../avatar/AvatarWithMood'

const positionConfig = {
  1: { badge: '🥇', label: '👑', glow: 'rgba(255,215,0,0.2)' },
  2: { badge: '🥈', label: '', glow: 'rgba(192,192,192,0.15)' },
  3: { badge: '🥉', label: '', glow: 'rgba(205,127,50,0.15)' },
}

export default function LeaderboardRow({
  position,
  name,
  color = '#00F0FF',
  avatarBase,
  stat,
  statLabel,
  progressPct = 0,
  isCurrentUser = false,
  streak = 0,
  delay = 0,
}) {
  const config = positionConfig[position]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      className="card flex items-center gap-3"
      style={{
        borderLeft: `3px solid ${color}`,
        boxShadow: config?.glow ? `0 0 20px ${config.glow}` : undefined,
        background: isCurrentUser ? `linear-gradient(90deg, ${color}08, transparent)` : undefined,
      }}
    >
      {/* Position */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        {config ? (
          <span className="text-xl">{config.badge}</span>
        ) : (
          <span className="font-mono text-sm font-bold text-text-muted">#{position}</span>
        )}
      </div>

      {/* Avatar */}
      <AvatarWithMood name={name} color={color} avatarBase={avatarBase} size="sm" streak={streak} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold truncate" style={isCurrentUser ? { color } : {}}>
            {name}
          </p>
          {position === 1 && <span className="text-sm">👑</span>}
          {isCurrentUser && <span className="text-[10px] text-text-muted">(tú)</span>}
        </div>
        {/* Progress bar */}
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-surface">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, delay: delay + 0.2 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}55` }}
          />
        </div>
      </div>

      {/* Stat */}
      <div className="text-right">
        <p className="font-mono text-sm font-bold" style={{ color }}>{stat}</p>
        {statLabel && <p className="text-[10px] text-text-muted">{statLabel}</p>}
      </div>
    </motion.div>
  )
}
