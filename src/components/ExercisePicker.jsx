import { useState } from 'react'
import { Search, X, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExercises } from '../hooks/useExercises'

export default function ExercisePicker({ onSelect, onClose }) {
  const { exercises, muscleGroups, loading } = useExercises()
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)

  const filtered = exercises.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase())
    const matchesGroup = !selectedGroup || e.muscle_group === selectedGroup
    return matchesSearch && matchesGroup
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={e => e.stopPropagation()}
        className="card-elevated w-full max-w-lg rounded-t-2xl p-4 sm:rounded-2xl"
        style={{ maxHeight: '80vh', background: '#1E1E2E' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider">Elegir ejercicio</h3>
          <button onClick={onClose} className="rounded-full p-1 text-text-muted hover:bg-bg-surface hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        <div className="relative mb-3">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar ejercicio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-cyber w-full py-2.5 pl-10 pr-4 text-sm"
          />
        </div>

        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedGroup(null)}
            className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition"
            style={!selectedGroup
              ? { background: '#00F0FF22', color: '#00F0FF', border: '1px solid #00F0FF44' }
              : { background: '#1E1E2E', color: '#8888A0', border: '1px solid rgba(255,255,255,0.06)' }
            }
          >
            Todos
          </button>
          {muscleGroups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group === selectedGroup ? null : group)}
              className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition"
              style={selectedGroup === group
                ? { background: '#00F0FF22', color: '#00F0FF', border: '1px solid #00F0FF44' }
                : { background: '#1E1E2E', color: '#8888A0', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              {group}
            </button>
          ))}
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-text-muted">Cargando...</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">No se encontraron ejercicios 💀</p>
          ) : (
            filtered.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => { onSelect(exercise); onClose() }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition hover:bg-bg-surface"
              >
                <div>
                  <p className="text-sm font-medium">{exercise.name}</p>
                  <p className="text-xs text-text-muted">{exercise.muscle_group}</p>
                </div>
                <Plus size={18} className="text-text-muted" />
              </button>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
