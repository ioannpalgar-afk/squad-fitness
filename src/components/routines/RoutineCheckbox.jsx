import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const particles = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  angle: (i * 360) / 8,
}))

export default function RoutineCheckbox({ checked = false, color = '#00F0FF', onChange, size = 40 }) {
  const [justChecked, setJustChecked] = useState(false)

  function handleClick() {
    if (!checked) setJustChecked(true)
    onChange?.(!checked)
    if (!checked) {
      setTimeout(() => setJustChecked(false), 600)
    }
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Particles on check */}
      <AnimatePresence>
        {justChecked && particles.map(p => {
          const rad = (p.angle * Math.PI) / 180
          const dist = size * 0.8
          return (
            <motion.div
              key={p.id}
              initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: 0,
                x: Math.cos(rad) * dist,
                y: Math.sin(rad) * dist,
                opacity: 0,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute rounded-full"
              style={{
                width: 4,
                height: 4,
                backgroundColor: color,
                boxShadow: `0 0 6px ${color}`,
              }}
            />
          )
        })}
      </AnimatePresence>

      {/* Checkbox */}
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.85 }}
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          border: `2px solid ${checked ? color : 'rgba(255,255,255,0.15)'}`,
          background: checked ? `${color}22` : 'transparent',
          boxShadow: checked ? `0 0 15px ${color}33` : 'none',
        }}
      >
        {/* Pulsing border when unchecked */}
        {!checked && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${color}44` }}
          />
        )}

        {/* Check mark */}
        <AnimatePresence>
          {checked && (
            <motion.svg
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              width={size * 0.45}
              height={size * 0.45}
              viewBox="0 0 14 14"
              fill="none"
            >
              <motion.path
                d="M2 7.5L5.5 11L12 3"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
