import { motion, AnimatePresence } from 'framer-motion'
import { ESCENAS, STREAK_BROKEN_MESSAGES } from '../../data/constants'

export default function StreakBrokenModal({ show, onClose, previousStreak = 0 }) {
  const message = STREAK_BROKEN_MESSAGES[Math.floor(Math.random() * STREAK_BROKEN_MESSAGES.length)]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          onClick={onClose}
          style={{
            backgroundImage: "url('/assets/backgrounds/moments/streak-broken.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: 'rgba(10,10,18,0.9)',
            backgroundBlendMode: 'overlay',
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="card-elevated w-full max-w-xs overflow-hidden rounded-2xl p-6 text-center"
          >
            <motion.img
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              src={ESCENAS.rachaRota}
              alt="Racha rota"
              className="mx-auto mb-4 h-36 w-auto object-contain"
            />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {previousStreak > 0 && (
                <p className="mb-2 font-mono text-3xl font-bold text-neon-red">
                  {previousStreak} días
                </p>
              )}
              <p className="mb-4 text-sm text-text-secondary">{message}</p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="btn-primary w-full py-3 text-sm"
              >
                VOLVER MÁS FUERTE
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
