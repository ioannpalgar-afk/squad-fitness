import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const eventIcons = {
  routine_complete: '✅',
  workout_logged: '🏋️',
  new_pr: '🏆',
  streak_milestone: '🔥',
  badge_unlocked: '⭐',
  body_metrics: '📊',
  all_routines_done: '💯',
  taunt: '👀',
}

function EventMessage({ event }) {
  const name = event.profile?.name || 'Alguien'
  const data = event.data || {}

  switch (event.type) {
    case 'routine_complete':
      return <><span className="font-semibold">{name}</span> completó <span className="text-neon-green">{data.routine || 'una rutina'}</span></>
    case 'workout_logged':
      return <><span className="font-semibold">{name}</span> registró entreno: <span className="text-neon-cyan">{data.name || 'Entrenamiento'}</span></>
    case 'new_pr':
      return <><span className="font-semibold">{name}</span> <span className="text-neon-gold">¡¡NUEVO PR!!</span> {data.exercise} — {data.weight}kg</>
    case 'streak_milestone':
      return <><span className="font-semibold">{name}</span> lleva <span className="text-neon-orange">{data.days} días de racha</span> 🔥</>
    case 'badge_unlocked':
      return <><span className="font-semibold">{name}</span> desbloqueó <span className="text-neon-gold">{data.badge}</span></>
    case 'all_routines_done':
      return <><span className="font-semibold">{name}</span> <span className="text-neon-green">completó TODAS las rutinas del día</span></>
    case 'taunt':
      return <span className="text-text-secondary italic">{data.message}</span>
    default:
      return <span className="font-semibold">{name}</span>
  }
}

export default function ActivityFeed({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="card py-8 text-center">
        <p className="text-sm text-text-muted">Sin actividad reciente... 👀</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {events.map((event, i) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-bg-secondary"
          style={{ borderLeft: `2px solid ${event.color || '#555568'}` }}
        >
          <span className="mt-0.5 text-base">{eventIcons[event.type] || '📌'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-snug">
              <EventMessage event={event} />
            </p>
            <p className="mt-0.5 text-[10px] text-text-muted">
              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: es })}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
