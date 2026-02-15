import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoutines } from '../hooks/useRoutines'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ExercisePicker from '../components/ExercisePicker'
import PageWrapper from '../components/layout/PageWrapper'

export default function RoutineDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { routines, loading, updateRoutine, addExerciseToRoutine, updateRoutineExercise, removeExerciseFromRoutine } = useRoutines()
  const [showPicker, setShowPicker] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState('')

  const userColor = profile?.color || '#00F0FF'
  const routine = routines.find(r => r.id === id)

  useEffect(() => {
    if (routine) setName(routine.name)
  }, [routine])

  if (loading) return <PageWrapper><div className="card animate-pulse py-12 text-center text-sm text-text-muted">Cargando...</div></PageWrapper>
  if (!routine) return (
    <PageWrapper>
      <p className="text-text-muted">Rutina no encontrada 💀</p>
      <button onClick={() => navigate('/rutinas')} className="mt-2 text-sm" style={{ color: userColor }}>Volver</button>
    </PageWrapper>
  )

  const exercises = routine.routine_exercises?.sort((a, b) => a.sort_order - b.sort_order) || []

  async function handleSaveName() {
    if (name.trim() && name !== routine.name) await updateRoutine(id, { name: name.trim() })
    setEditingName(false)
  }

  return (
    <PageWrapper>
      <button
        onClick={() => navigate('/rutinas')}
        className="mb-4 flex items-center gap-1 text-sm text-text-muted hover:text-text-primary"
      >
        <ArrowLeft size={16} /> Rutinas
      </button>

      <div className="mb-6">
        {editingName ? (
          <div className="flex gap-2">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              className="input-cyber flex-1 px-4 py-2 font-display text-lg font-bold"
            />
            <button onClick={handleSaveName} className="rounded-xl p-2" style={{ background: `${userColor}22`, color: userColor }}>
              <Save size={18} />
            </button>
          </div>
        ) : (
          <h1
            onClick={() => setEditingName(true)}
            className="cursor-pointer font-display text-xl font-bold uppercase tracking-wider transition"
            style={{ color: userColor }}
          >
            {routine.name}
          </h1>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
          Ejercicios ({exercises.length})
        </h2>
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: `${userColor}15`, color: userColor }}
        >
          <Plus size={14} /> Agregar
        </button>
      </div>

      {exercises.length === 0 ? (
        <div className="card py-10 text-center">
          <p className="text-sm text-text-muted">Agrega ejercicios a esta rutina 💪</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exercises.map((re, i) => (
            <motion.div
              key={re.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{re.exercise?.name}</p>
                  <p className="text-xs text-text-muted">{re.exercise?.muscle_group}</p>
                </div>
                <button
                  onClick={() => removeExerciseFromRoutine(re.id)}
                  className="rounded-lg p-1.5 text-text-muted hover:bg-bg-tertiary hover:text-neon-red"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Series</label>
                  <input
                    type="number"
                    value={re.sets_target}
                    onChange={e => updateRoutineExercise(re.id, { sets_target: parseInt(e.target.value) || 0 })}
                    className="input-gym w-full px-3 py-2 !text-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Reps</label>
                  <input
                    type="number"
                    value={re.reps_target}
                    onChange={e => updateRoutineExercise(re.id, { reps_target: parseInt(e.target.value) || 0 })}
                    className="input-gym w-full px-3 py-2 !text-base"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Peso</label>
                  <input
                    type="number"
                    step="0.5"
                    value={re.weight_target || ''}
                    onChange={e => updateRoutineExercise(re.id, { weight_target: parseFloat(e.target.value) || null })}
                    placeholder="—"
                    className="input-gym w-full px-3 py-2 !text-base"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showPicker && (
          <ExercisePicker onSelect={ex => addExerciseToRoutine(id, ex.id, { sortOrder: exercises.length })} onClose={() => setShowPicker(false)} />
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
