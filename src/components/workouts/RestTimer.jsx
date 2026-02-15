import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { formatTime } from '../../utils/calculations'

export default function RestTimer({ duration = 90, onFinish, autoStart = true, color = '#00F0FF' }) {
  const [remaining, setRemaining] = useState(duration)
  const [running, setRunning] = useState(autoStart)
  const intervalRef = useRef(null)

  const pct = remaining / duration
  const circumference = 2 * Math.PI * 54 // radius = 54

  // Color transitions: green > yellow > red
  const timerColor = pct > 0.5 ? '#00FF88' : pct > 0.2 ? '#FDCB6E' : '#FF3D5A'

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            setRunning(false)
            onFinish?.()
            return 0
          }
          return r - 1
        })
      }, 1000)
      return () => clearInterval(intervalRef.current)
    }
  }, [running, remaining, onFinish])

  function handleSkip() {
    setRemaining(0)
    setRunning(false)
    onFinish?.()
  }

  function handleAdjust(delta) {
    setRemaining(r => Math.max(0, r + delta))
  }

  if (remaining <= 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center gap-3 rounded-xl bg-bg-secondary p-6"
      style={{ boxShadow: `0 0 20px ${timerColor}15` }}
    >
      {/* Circular timer */}
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg className="absolute" width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          {/* Progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={timerColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference * (1 - pct) }}
            transition={{ duration: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${timerColor})` }}
          />
        </svg>

        {/* Time display */}
        <div className="text-center">
          <p className="font-mono text-3xl font-bold" style={{ color: timerColor, textShadow: `0 0 10px ${timerColor}55` }}>
            {formatTime(remaining)}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Descanso</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleAdjust(-15)}
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          -15s
        </button>
        <button
          onClick={handleSkip}
          className="rounded-full bg-bg-surface px-5 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary transition hover:text-text-primary"
        >
          Saltar
        </button>
        <button
          onClick={() => handleAdjust(15)}
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          +15s
        </button>
      </div>
    </motion.div>
  )
}
