import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { TIER_COLORS } from '../../data/constants'

const confettiColors = ['#FFD700', '#00F0FF', '#BF00FF', '#FF3D5A', '#00FF88']

function GoldParticle({ delay }) {
  const left = Math.random() * 100
  const size = 3 + Math.random() * 5
  const dur = 1.5 + Math.random() * 1
  const color = confettiColors[Math.floor(Math.random() * confettiColors.length)]

  return (
    <motion.div
      initial={{ y: -10, x: 0, opacity: 1, rotate: 0 }}
      animate={{ y: 180, x: (Math.random() - 0.5) * 100, opacity: 0, rotate: 720 }}
      transition={{ duration: dur, delay, ease: 'easeOut' }}
      className="absolute rounded-full"
      style={{ left: `${left}%`, width: size, height: size, backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
    />
  )
}

export default function BadgePopup({ show, onClose, badge }) {
  const [particles, setParticles] = useState([])
  const tier = badge ? TIER_COLORS[badge.tier] : TIER_COLORS.gold

  useEffect(() => {
    if (show) {
      setParticles(Array.from({ length: 40 }, (_, i) => ({ id: i, delay: Math.random() * 0.8 })))
      const timer = setTimeout(onClose, 5000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          onClick={onClose}
          style={{
            backgroundImage: "url('/assets/backgrounds/moments/achievement-unlocked.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'rgba(10,10,18,0.88)',
            backgroundBlendMode: 'overlay',
          }}
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={e => e.stopPropagation()}
            className="card-elevated relative w-full max-w-xs overflow-hidden rounded-2xl p-8 text-center"
            style={{ boxShadow: `0 0 40px ${tier.glow}` }}
          >
            {/* Particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {particles.map(p => <GoldParticle key={p.id} delay={p.delay} />)}
            </div>

            <button onClick={onClose} className="absolute right-3 top-3 rounded-full p-1 text-text-muted hover:text-text-primary">
              <X size={16} />
            </button>

            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-4 font-display text-xs uppercase tracking-[0.3em] text-neon-gold text-glow-gold"
            >
              Achievement Unlocked
            </motion.p>

            {/* Badge icon — image or emoji fallback */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full"
              style={{ background: `radial-gradient(circle, ${tier.bg}44, transparent)`, boxShadow: `0 0 30px ${tier.glow}` }}
            >
              {badge.image ? (
                <motion.img
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  src={badge.image}
                  alt={badge.name}
                  className="h-20 w-20 object-contain drop-shadow-xl"
                />
              ) : (
                <motion.span
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl"
                >
                  {badge.icon}
                </motion.span>
              )}
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-1 font-display text-lg font-bold"
              style={{ color: tier.bg }}
            >
              {badge.name}
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6 text-sm text-text-secondary"
            >
              {badge.desc}
            </motion.p>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="btn-primary w-full py-3 text-sm"
            >
              BRUTAL
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
