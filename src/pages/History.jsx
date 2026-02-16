import { useWorkouts } from '../hooks/useWorkouts'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import PageWrapper from '../components/layout/PageWrapper'

export default function History() {
  const { profile } = useAuth()
  const { sessions, loading, deleteSession } = useWorkouts()
  const [expanded, setExpanded] = useState(null)

  const userColor = profile?.color || '#00F0FF'
  const completedSessions = sessions.filter(s => s.finished_at)

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (confirm('¿Eliminar este entrenamiento? 💀')) await deleteSession(id)
  }

  return (
    <PageWrapper>
      <h1 className="mb-6 font-display text-lg font-bold uppercase tracking-wider">Historial</h1>

      {loading ? (
        <div className="card animate-pulse py-12 text-center text-sm text-text-muted">Cargando...</div>
      ) : completedSessions.length === 0 ? (
        <div className="card py-8 text-center">
          <img src="/assets/illustrations/escena-emptyState.png" alt="" className="mx-auto mb-3 h-28 w-auto object-contain opacity-80" />
          <p className="text-sm text-text-muted">Sin entrenamientos registrados</p>
          <p className="text-xs text-text-muted">Empieza a entrenar para ver tu historial</p>
        </div>
      ) : (
        <div className="space-y-2">
          {completedSessions.map((session, i) => {
            const isExpanded = expanded === session.id
            const sets = session.session_sets || []
            const exerciseMap = {}
            sets.forEach(s => {
              const name = s.exercise?.name || 'Ejercicio'
              if (!exerciseMap[name]) exerciseMap[name] = []
              exerciseMap[name].push(s)
            })

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card overflow-hidden"
                style={{ borderLeft: `3px solid ${userColor}` }}
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : session.id)}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${userColor}15` }}>
                    <Calendar size={18} style={{ color: userColor }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{session.routine?.name || 'Entrenamiento libre'}</p>
                    <p className="text-xs text-text-muted">
                      {format(new Date(session.started_at), "d 'de' MMMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      {session.duration_minutes && <p className="font-mono text-xs" style={{ color: userColor }}>{session.duration_minutes} min</p>}
                      <p className="text-[10px] text-text-muted">{sets.length} sets</p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 border-t border-white/5 pt-3">
                        {Object.entries(exerciseMap).map(([name, sets]) => (
                          <div key={name} className="mb-3 last:mb-0">
                            <p className="mb-1 text-sm font-medium">{name}</p>
                            {sets.map((set, j) => (
                              <p key={set.id} className="font-mono text-xs text-text-secondary">
                                Set {j + 1}: {set.reps} reps × {set.weight}kg
                              </p>
                            ))}
                          </div>
                        ))}
                        <button
                          onClick={e => handleDelete(e, session.id)}
                          className="mt-2 flex items-center gap-1 text-xs text-neon-red/50 hover:text-neon-red"
                        >
                          <Trash2 size={12} /> Eliminar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}
