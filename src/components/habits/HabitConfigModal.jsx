import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { CATEGORY_ICONS } from '../../data/constants'

const HABIT_PRESETS = [
  { name: 'Gym', icon: 'gym' },
  { name: 'Cardio', icon: 'cardio' },
  { name: 'Meditación', icon: 'meditacion' },
  { name: 'Lectura', icon: 'lectura' },
  { name: 'Sueño 8h', icon: 'sueno' },
  { name: 'Hidratación', icon: 'hidratacion' },
  { name: 'Nutrición', icon: 'nutricion' },
  { name: 'Código', icon: 'codigo' },
  { name: 'Ducha fría', icon: 'duchaFria' },
  { name: 'Journaling', icon: 'journaling' },
  { name: 'Madrugar', icon: 'madrugar' },
  { name: 'Digital Detox', icon: 'digitalDetox' },
]

export default function HabitConfigModal({ show, onClose, onSave, color = '#00F0FF' }) {
  const [selected, setSelected] = useState(null)
  const [customName, setCustomName] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const preset = selected !== null ? HABIT_PRESETS[selected] : null
    const name = preset?.name || customName.trim()
    if (!name) return

    setSaving(true)
    await onSave({
      name,
      icon: preset?.icon || null,
    })
    setSaving(false)
    setSelected(null)
    setCustomName('')
    onClose()
  }

  return (
    <AnimatePresence>
      {show && (
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
              <h3 className="font-display text-sm font-bold uppercase tracking-wider">Nuevo hábito</h3>
              <button onClick={onClose} className="rounded-full p-1 text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            {/* Presets grid */}
            <div className="mb-4 grid grid-cols-3 gap-2">
              {HABIT_PRESETS.map((preset, i) => (
                <button
                  key={preset.name}
                  onClick={() => { setSelected(i === selected ? null : i); setCustomName('') }}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 transition"
                  style={selected === i
                    ? { background: `${color}15`, border: `1px solid ${color}44` }
                    : { background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }
                  }
                >
                  <img
                    src={CATEGORY_ICONS[preset.icon]}
                    alt=""
                    className="h-10 w-10 rounded-lg object-contain"
                  />
                  <span className="text-[10px] font-medium text-text-secondary">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* Custom name */}
            <div className="mb-4">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                O escribe uno personalizado
              </label>
              <input
                type="text"
                value={customName}
                onChange={e => { setCustomName(e.target.value); setSelected(null) }}
                placeholder="Nombre del hábito..."
                className="input-cyber w-full px-3 py-2.5 text-sm"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving || (!customName.trim() && selected === null)}
              className="btn-primary w-full py-3 text-sm disabled:opacity-30"
            >
              {saving ? 'GUARDANDO...' : 'AÑADIR HÁBITO'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
