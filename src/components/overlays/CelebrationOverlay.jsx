import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ESCENAS } from '../../data/constants'

const confettiColors = ['#FFD700', '#00F0FF', '#BF00FF', '#FF3D5A', '#00FF88']

function ConfettiPiece({ delay }) {
  const left = Math.random() * 100
  const size = 4 + Math.random() * 6
  const dur = 2 + Math.random() * 2
  const color = confettiColors[Math.floor(Math.random() * confettiColors.length)]
  const rotation = Math.random() * 720

  return (
    <motion.div
      initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
      animate={{
        y: window.innerHeight + 20,
        x: (Math.random() - 0.5) * 200,
        opacity: [1, 1, 0],
        rotate: rotation,
      }}
      transition={{ duration: dur, delay, ease: 'easeIn' }}
      className="absolute rounded-sm"
      style={{
        left: `${left}%`,
        width: size,
        height: size * 1.5,
        backgroundColor: color,
        boxShadow: `0 0 4px ${color}`,
      }}
    />
  )
}

export default function CelebrationOverlay({ show, onClose }) {
  const [confetti, setConfetti] = useState([])

  useEffect(() => {
    if (show) {
      setConfetti(Array.from({ length: 60 }, (_, i) => ({ id: i, delay: Math.random() * 1.5 })))
      const t = setTimeout(onClose, 6000)
      return () => clearTimeout(t)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
          onClick={onClose}
          style={{
            backgroundImage: "url('/assets/backgrounds/moments/squad-complete.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'rgba(10,10,18,0.92)',
            backgroundBlendMode: 'overlay',
          }}
        >
          {/* Confetti */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {confetti.map(c => <ConfettiPiece key={c.id} delay={c.delay} />)}
          </div>

          {/* Scene */}
          <motion.img
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            src={ESCENAS.celebrando}
            alt="Celebración"
            className="mb-6 h-52 w-auto object-contain drop-shadow-2xl"
          />

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-2 font-display text-xl font-bold uppercase tracking-widest text-neon-gold text-glow-gold"
          >
            SQUAD GOALS
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8 text-center text-sm text-text-secondary"
          >
            Los 3 habéis completado todo hoy.
            <br />Sois imparables.
          </motion.p>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="btn-primary px-8 py-3 text-sm"
          >
            BRUTAL
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
