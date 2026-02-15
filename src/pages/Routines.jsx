import { useState } from 'react'
import { useRoutines } from '../hooks/useRoutines'
import { useNavigate } from 'react-router-dom'
import { Plus, Dumbbell, ChevronRight, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import PageWrapper from '../components/layout/PageWrapper'

export default function Routines() {
  const { profile } = useAuth()
  const { routines, loading, createRoutine, deleteRoutine } = useRoutines()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

  const userColor = profile?.color || '#00F0FF'

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const { data } = await createRoutine(newName.trim(), newDesc.trim())
    setCreating(false)
    setNewName('')
    setNewDesc('')
    setShowCreate(false)
    if (data) navigate(`/rutinas/${data.id}`)
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (confirm('¿Eliminar esta rutina? 💀')) {
      await deleteRoutine(id)
    }
  }

  return (
    <PageWrapper>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-lg font-bold uppercase tracking-wider">Mis Rutinas</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider"
          style={{ background: `${userColor}22`, color: userColor, border: `1px solid ${userColor}44` }}
        >
          <Plus size={14} /> Nueva
        </motion.button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="mb-6 overflow-hidden card"
          >
            <input
              type="text"
              placeholder="Nombre de la rutina (ej: Push Day)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
              className="input-cyber mb-2 w-full px-4 py-2.5 text-sm"
            />
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="input-cyber mb-3 w-full px-4 py-2.5 text-sm"
            />
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={creating || !newName.trim()}
                className="btn-primary flex-1 py-2.5 text-xs disabled:opacity-50"
              >
                {creating ? 'CREANDO...' : 'CREAR RUTINA'}
              </motion.button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="btn-ghost px-4 py-2.5 text-xs"
              >
                Cancelar
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="card animate-pulse py-12 text-center text-sm text-text-muted">Cargando...</div>
      ) : routines.length === 0 ? (
        <div className="card py-12 text-center">
          <Dumbbell size={40} className="mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-muted">No tienes rutinas aún</p>
          <p className="mt-1 text-xs text-text-muted">El viaje de mil kilos empieza con una serie 🚀</p>
        </div>
      ) : (
        <div className="space-y-2">
          {routines.map((routine, i) => (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/rutinas/${routine.id}`)}
              className="card flex cursor-pointer items-center gap-3"
              style={{ borderLeft: `3px solid ${userColor}` }}
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `${userColor}15` }}
              >
                <Dumbbell size={20} style={{ color: userColor }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{routine.name}</p>
                {routine.description && (
                  <p className="text-xs text-text-muted">{routine.description}</p>
                )}
                <p className="mt-0.5 text-xs text-text-muted">
                  {routine.routine_exercises?.length || 0} ejercicios
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => handleDelete(e, routine.id)}
                  className="rounded-lg p-1.5 text-text-muted transition hover:bg-bg-tertiary hover:text-neon-red"
                >
                  <Trash2 size={16} />
                </button>
                <ChevronRight size={18} className="text-text-muted" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
