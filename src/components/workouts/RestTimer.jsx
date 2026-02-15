import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { formatTime } from '../../utils/calculations'

export default function RestTimer({ duration = 90, onFinish, color = '#00F0FF' }) {
  const [remaining, setRemaining] = useState(duration)
  const endTimeRef = useRef(Date.now() + duration * 1000)
  const rafRef = useRef(null)
  const finishedRef = useRef(false)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  const tick = useCallback(() => {
    const now = Date.now()
    const left = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000))
    setRemaining(left)

    if (left <= 0 && !finishedRef.current) {
      finishedRef.current = true
      onFinishRef.current?.()
      return
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    endTimeRef.current = Date.now() + duration * 1000
    finishedRef.current = false
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [duration, tick])

  const pct = remaining / duration
  const circumference = 2 * Math.PI * 54

  const timerColor = pct > 0.5 ? '#00FF88' : pct > 0.2 ? '#FDCB6E' : '#FF3D5A'

  function handleSkip() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setRemaining(0)
    if (!finishedRef.current) {
      finishedRef.current = true
      onFinishRef.current?.()
    }
  }

  function handleAdjust(delta) {
    endTimeRef.current += delta * 1000
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
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke={timerColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            style={{ filter: `drop-shadow(0 0 6px ${timerColor})`, transition: 'stroke-dashoffset 0.3s ease' }}
          />
        </svg>

        <div className="text-center">
          <p className="font-mono text-3xl font-bold" style={{ color: timerColor, textShadow: `0 0 10px ${timerColor}55` }}>
            {formatTime(remaining)}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-text-muted">Descanso</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button onClick={() => handleAdjust(-15)} className="btn-ghost px-3 py-1.5 text-xs">
          -15s
        </button>
        <button
          onClick={handleSkip}
          className="rounded-full bg-bg-surface px-5 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary transition hover:text-text-primary"
        >
          Saltar
        </button>
        <button onClick={() => handleAdjust(15)} className="btn-ghost px-3 py-1.5 text-xs">
          +15s
        </button>
      </div>
    </motion.div>
  )
}
