import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Scale, Ruler, Activity } from 'lucide-react'

const METRIC_GROUPS = [
  {
    id: 'basico',
    label: 'Básico',
    icon: Scale,
    fields: [
      { key: 'weight', label: 'Peso', unit: 'kg', step: 0.1 },
      { key: 'body_fat_pct', label: 'Grasa corporal', unit: '%', step: 0.1 },
      { key: 'muscle_mass', label: 'Masa muscular', unit: 'kg', step: 0.1 },
    ],
  },
  {
    id: 'medidas',
    label: 'Medidas',
    icon: Ruler,
    fields: [
      { key: 'chest', label: 'Pecho', unit: 'cm', step: 0.5 },
      { key: 'waist', label: 'Cintura', unit: 'cm', step: 0.5 },
      { key: 'hip', label: 'Cadera', unit: 'cm', step: 0.5 },
      { key: 'bicep_right', label: 'Bícep D', unit: 'cm', step: 0.5 },
      { key: 'bicep_left', label: 'Bícep I', unit: 'cm', step: 0.5 },
      { key: 'thigh_right', label: 'Muslo D', unit: 'cm', step: 0.5 },
      { key: 'thigh_left', label: 'Muslo I', unit: 'cm', step: 0.5 },
      { key: 'calf', label: 'Gemelo', unit: 'cm', step: 0.5 },
    ],
  },
  {
    id: 'avanzado',
    label: 'Avanzado',
    icon: Activity,
    fields: [
      { key: 'body_water_pct', label: 'Agua corporal', unit: '%', step: 0.1 },
      { key: 'visceral_fat', label: 'Grasa visceral', unit: '', step: 1 },
      { key: 'basal_metabolism', label: 'Metabolismo basal', unit: 'kcal', step: 1 },
      { key: 'bmi', label: 'IMC', unit: '', step: 0.1 },
    ],
  },
]

export default function BodyMetricForm({ show, onClose, onSave, color = '#00F0FF', latestMetric }) {
  const [activeGroup, setActiveGroup] = useState('basico')
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(false)

  function handleChange(key, val) {
    setValues(prev => ({ ...prev, [key]: val === '' ? null : Number(val) }))
  }

  async function handleSave() {
    const cleaned = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v != null && v !== '')
    )
    if (Object.keys(cleaned).length === 0) return
    setSaving(true)
    await onSave(cleaned)
    setSaving(false)
    setValues({})
    onClose()
  }

  const group = METRIC_GROUPS.find(g => g.id === activeGroup)

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
            style={{ maxHeight: '85vh', background: '#1E1E2E', overflow: 'auto' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider">Nueva medición</h3>
              <button onClick={onClose} className="rounded-full p-1 text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            {/* Group tabs */}
            <div className="mb-4 flex gap-2">
              {METRIC_GROUPS.map(g => {
                const Icon = g.icon
                return (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroup(g.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-wider transition"
                    style={activeGroup === g.id
                      ? { background: `${color}15`, color, border: `1px solid ${color}33` }
                      : { background: '#14141F', color: '#8888A0', border: '1px solid rgba(255,255,255,0.04)' }
                    }
                  >
                    <Icon size={14} />
                    {g.label}
                  </button>
                )
              })}
            </div>

            {/* Fields */}
            <div className="mb-4 space-y-3">
              {group?.fields.map(field => {
                const prevValue = latestMetric?.[field.key]
                return (
                  <div key={field.key} className="flex items-center gap-3">
                    <label className="w-20 shrink-0 text-xs text-text-secondary">{field.label}</label>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        step={field.step}
                        value={values[field.key] ?? ''}
                        onChange={e => handleChange(field.key, e.target.value)}
                        placeholder={prevValue ? String(prevValue) : '—'}
                        className="input-cyber w-full py-2 pl-3 pr-12 text-sm font-mono"
                      />
                      {field.unit && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">
                          {field.unit}
                        </span>
                      )}
                    </div>
                    {prevValue && (
                      <span className="shrink-0 text-[10px] text-text-muted">
                        ant: {prevValue}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving || Object.values(values).every(v => v == null)}
              className="btn-primary w-full py-3 text-sm disabled:opacity-30"
            >
              {saving ? 'GUARDANDO...' : 'GUARDAR MEDICIÓN'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
