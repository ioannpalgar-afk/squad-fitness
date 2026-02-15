import { NavLink } from 'react-router-dom'
import { Home, ClipboardList, Dumbbell, BarChart3, Users } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/', icon: Home, label: 'Inicio' },
  { to: '/rutinas', icon: ClipboardList, label: 'Rutinas' },
  { to: '/entrenos', icon: Dumbbell, label: 'Entrenos', isMain: true },
  { to: '/analiticas', icon: BarChart3, label: 'Analíticas' },
  { to: '/squad', icon: Users, label: 'Squad' },
]

export default function BottomNav({ userColor = '#00F0FF' }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(20, 20, 32, 0.95)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label, isMain }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="group relative flex flex-col items-center gap-0.5 px-3 py-1"
          >
            {({ isActive }) => (
              <>
                {isActive && !isMain && (
                  <motion.div
                    layoutId="nav-glow"
                    className="absolute -top-[1px] h-[2px] w-8 rounded-full"
                    style={{ backgroundColor: userColor, boxShadow: `0 0 8px ${userColor}` }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {isMain ? (
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, #00F0FF, #BF00FF)`
                        : '#1E1E2E',
                      boxShadow: isActive
                        ? '0 0 20px rgba(0,240,255,0.3), 0 0 20px rgba(191,0,255,0.2)'
                        : '0 0 0 1px rgba(255,255,255,0.06)',
                    }}
                  >
                    <Icon size={22} className="text-white" strokeWidth={isActive ? 2.5 : 1.5} />
                  </motion.div>
                ) : (
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2 : 1.5}
                    style={isActive ? {
                      color: userColor,
                      filter: `drop-shadow(0 0 4px ${userColor}55)`,
                    } : { color: '#555568' }}
                    className={!isActive ? 'transition group-hover:text-text-secondary' : ''}
                  />
                )}

                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? userColor : '#555568' }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
