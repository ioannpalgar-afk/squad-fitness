import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { TIER_COLORS } from '../../data/constants'

export default function BadgeCard({ badge, unlocked = false, unlockedAt, delay = 0 }) {
  const tier = TIER_COLORS[badge.tier]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`relative flex flex-col items-center rounded-xl p-4 text-center transition ${
        unlocked ? 'bg-bg-secondary' : 'bg-bg-secondary/40 opacity-50'
      }`}
      style={unlocked ? { boxShadow: `0 0 15px ${tier.glow}` } : {}}
    >
      <div
        className={`mb-2 flex h-14 w-14 items-center justify-center rounded-full ${unlocked ? '' : 'grayscale'}`}
        style={unlocked ? { background: `radial-gradient(circle, ${tier.bg}33, transparent)` } : {}}
      >
        {unlocked ? (
          badge.image ? (
            <img src={badge.image} alt={badge.name} className="h-12 w-12 object-contain drop-shadow-lg" />
          ) : (
            <span className="text-3xl">{badge.icon}</span>
          )
        ) : (
          badge.image ? (
            <img src={badge.image} alt={badge.name} className="h-12 w-12 object-contain opacity-30 grayscale" />
          ) : (
            <Lock size={20} className="text-text-muted" />
          )
        )}
      </div>

      <p className="text-xs font-semibold" style={unlocked ? { color: tier.bg } : { color: '#555568' }}>
        {badge.name}
      </p>
      <p className="mt-0.5 text-[10px] text-text-muted">{badge.desc}</p>

      {/* Tier indicator */}
      <div
        className="mt-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
        style={{
          backgroundColor: unlocked ? `${tier.bg}22` : '#252538',
          color: unlocked ? tier.bg : '#555568',
        }}
      >
        {badge.tier}
      </div>
    </motion.div>
  )
}
