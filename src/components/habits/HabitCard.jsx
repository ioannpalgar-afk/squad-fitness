import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { CATEGORY_ICONS } from '../../data/constants'

function Particle({ color }) {
  const angle = Math.random() * Math.PI * 2
  const dist = 20 + Math.random() * 30
  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0,
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

export default function HabitCard({ config, completed, onToggle, onDelete, color = '#00F0FF', delay = 0 }) {
  const [particles, setParticles] = useState([])
  const iconSrc = CATEGORY_ICONS[config.icon]

  function handleToggle() {
    if (!completed) {
      setParticles(Array.from({ length: 8 }, (_, i) => i))
      setTimeout(() => setParticles([]), 700)
    }
    onToggle(config.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 rounded-xl px-3 py-3 transition"
      style={{
        background: completed ? `${color}08` : '#14141F',
        border: `1px solid ${completed ? `${color}33` : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      {/* Checkbox */}
      <button onClick={handleToggle} className="relative shrink-0">
        <motion.div
          animate={completed ? {
            scale: [1, 1.2, 1],
            borderColor: color,
            backgroundColor: `${color}22`,
          } : {
            scale: 1,
            borderColor: 'rgba(255,255,255,0.15)',
            backgroundColor: 'transparent',
          }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 400 }}
          className="flex h-7 w-7 items-center justify-center rounded-lg border-2"
        >
          <AnimatePresence>
            {completed && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                width="14" height="14" viewBox="0 0 14 14"
              >
                <motion.path
                  d="M2 7L5.5 10.5L12 3.5"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Particles */}
        <AnimatePresence>
          {particles.map(i => <Particle key={i} color={color} />)}
        </AnimatePresence>
      </button>

      {/* Icon */}
      {iconSrc ? (
        <img src={iconSrc} alt="" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}15` }}>
          <span className="text-sm">📋</span>
        </div>
      )}

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium transition ${completed ? 'text-text-secondary line-through' : ''}`}>
          {config.name}
        </p>
        {config.target && (
          <p className="text-[10px] text-text-muted">
            Meta: {config.target} {config.unit || ''}
          </p>
        )}
      </div>

      {/* Delete */}
      {onDelete && (
        <button
          onClick={() => onDelete(config.id)}
          className="shrink-0 rounded-lg p-1.5 text-text-muted/30 transition hover:bg-neon-red/10 hover:text-neon-red"
        >
          <Trash2 size={14} />
        </button>
      )}
    </motion.div>
  )
}
