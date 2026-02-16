import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { STRENGTH_STANDARDS } from '../../utils/calculations'

const LEVEL_CONFIG = [
  { key: 'beginner', label: 'Principiante', color: '#555568' },
  { key: 'novice', label: 'Novato', color: '#A0A0B0' },
  { key: 'intermediate', label: 'Intermedio', color: '#00F0FF' },
  { key: 'advanced', label: 'Avanzado', color: '#BF00FF' },
  { key: 'elite', label: 'Élite', color: '#FFD700' },
]

export default function StrengthLevelModal({ exercise, e1rm, bodyweight, onClose }) {
  if (!exercise) return null

  const standards = STRENGTH_STANDARDS[exercise]
  const ratio = bodyweight > 0 ? Math.round((e1rm / bodyweight) * 100) / 100 : 0

  // Find current level
  let currentLevelIdx = -1
  if (standards) {
    LEVEL_CONFIG.forEach((lv, i) => {
      if (ratio >= standards[lv.key]) currentLevelIdx = i
    })
  }

  // Max ratio for bar scaling (elite threshold + 20%)
  const maxRatio = standards ? standards.elite * 1.2 : 3

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="relative z-10 w-full max-w-sm rounded-2xl p-5"
          style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Header */}
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider">{exercise}</h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-lg font-bold text-white">{e1rm}kg</span>
                <span className="font-mono text-xs text-text-muted">e1rm</span>
                {bodyweight > 0 && (
                  <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700' }}>
                    {ratio}x BW
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted transition hover:text-white"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Level bars */}
          {standards ? (
            <div className="space-y-3">
              {LEVEL_CONFIG.map((lv, i) => {
                const threshold = standards[lv.key]
                const isCurrent = i === currentLevelIdx
                const isReached = i <= currentLevelIdx
                const barWidth = Math.min((threshold / maxRatio) * 100, 100)

                return (
                  <div key={lv.key} className="relative">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold" style={{ color: isReached ? lv.color : '#444' }}>
                          {lv.label}
                        </span>
                        {isCurrent && (
                          <span className="animate-pulse rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider"
                            style={{ background: `${lv.color}22`, color: lv.color }}>
                            Tu nivel
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-text-muted">{threshold.toFixed(2)}x BW</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: isReached ? lv.color : '#333',
                          ...(isCurrent ? { boxShadow: `0 0 10px ${lv.color}66` } : {}),
                        }}
                      />
                    </div>
                    {/* User position indicator on current level */}
                    {isCurrent && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -top-0.5 h-3 w-0.5 rounded-full"
                        style={{
                          left: `${Math.min((ratio / maxRatio) * 100, 99)}%`,
                          backgroundColor: lv.color,
                          boxShadow: `0 0 6px ${lv.color}`,
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-xl py-6 text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs text-text-muted">No hay estándares de fuerza para este ejercicio</p>
              {bodyweight > 0 && (
                <p className="mt-2 font-mono text-sm font-bold text-white">{ratio}x BW</p>
              )}
            </div>
          )}

          {/* Footer */}
          <p className="mt-4 text-center text-[9px] text-text-muted">
            Basado en ratios de peso corporal estándar
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
