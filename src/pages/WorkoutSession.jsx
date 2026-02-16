import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoutines } from '../hooks/useRoutines'
import { useWorkouts } from '../hooks/useWorkouts'
import { useAuth } from '../contexts/AuthContext'
import { Play, Square, Check, Timer, Trophy, Zap, Minus, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import RestTimer from '../components/workouts/RestTimer'
import PageWrapper from '../components/layout/PageWrapper'
import { formatTime, calculateRigorScore } from '../utils/calculations'

export default function WorkoutSession() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { routines } = useRoutines()
  const { startSession, finishSession, logSet } = useWorkouts()

  const userColor = profile?.color || '#00F0FF'
  const [phase, setPhase] = useState('select')
  const [selectedRoutine, setSelectedRoutine] = useState(null)
  const [session, setSession] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [currentExIdx, setCurrentExIdx] = useState(0)
  const [loggedSets, setLoggedSets] = useState([])
  const [currentReps, setCurrentReps] = useState('')
  const [currentWeight, setCurrentWeight] = useState('')
  const [showRest, setShowRest] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (phase === 'active') {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
      return () => clearInterval(intervalRef.current)
    }
  }, [phase])

  const exercises = selectedRoutine?.routine_exercises?.sort((a, b) => a.sort_order - b.sort_order) || []
  const currentExercise = exercises[currentExIdx]
  const setsForCurrent = loggedSets.filter(s => s.exercise_id === currentExercise?.exercise_id)

  async function handleStart(routine) {
    setSelectedRoutine(routine)
    const { data } = await startSession(routine.id)
    if (data) {
      setSession(data)
      setPhase('active')
      const firstEx = routine.routine_exercises?.sort((a, b) => a.sort_order - b.sort_order)[0]
      if (firstEx) {
        setCurrentWeight(firstEx.weight_target?.toString() || '')
        setCurrentReps(firstEx.reps_target?.toString() || '10')
      }
    }
  }

  async function handleLogSet() {
    if (!currentReps) return
    const reps = parseInt(currentReps)
    const weight = parseFloat(currentWeight) || 0
    const setNum = setsForCurrent.length + 1
    const { data } = await logSet(session.id, currentExercise.exercise_id, setNum, reps, weight)
    if (data) {
      setLoggedSets(prev => [...prev, data])
      setShowRest(true)
    }
  }

  function switchExercise(idx) {
    setCurrentExIdx(idx)
    setShowRest(false)
    const ex = exercises[idx]
    setCurrentWeight(ex.weight_target?.toString() || '')
    setCurrentReps(ex.reps_target?.toString() || '10')
  }

  async function handleFinish() {
    const durationMinutes = Math.round(elapsed / 60)
    await finishSession(session.id, durationMinutes, null)
    setPhase('summary')
  }

  function adjustValue(setter, value, delta, min = 0) {
    const num = parseFloat(value) || 0
    setter(String(Math.max(min, num + delta)))
  }

  // SELECT
  if (phase === 'select') {
    return (
      <PageWrapper>
        <h1 className="mb-6 font-display text-lg font-bold uppercase tracking-wider">Elegir entreno</h1>
        {routines.length === 0 ? (
          <div className="card py-12 text-center">
            <p className="text-sm text-text-muted">Crea una rutina primero 💪</p>
            <button onClick={() => navigate('/rutinas')} className="mt-2 text-sm" style={{ color: userColor }}>Ir a rutinas</button>
          </div>
        ) : (
          <div className="space-y-2">
            {routines.map(r => (
              <motion.button
                key={r.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStart(r)}
                className="card flex w-full items-center gap-3 text-left"
                style={{ borderLeft: `3px solid ${userColor}` }}
              >
                <Play size={20} style={{ color: userColor }} />
                <div className="flex-1">
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-text-muted">{r.routine_exercises?.length || 0} ejercicios</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </PageWrapper>
    )
  }

  // SUMMARY
  if (phase === 'summary') {
    const totalVolume = loggedSets.reduce((sum, s) => sum + (s.reps || 0) * (s.weight || 0), 0)
    const routineExercises = selectedRoutine?.routine_exercises || []
    const rigor = routineExercises.length > 0 ? calculateRigorScore(loggedSets, routineExercises) : null
    const rigorColor = rigor ? (rigor.score >= 100 ? '#00F0FF' : rigor.score >= 80 ? '#00FF88' : rigor.score >= 50 ? '#FFD700' : '#FF3D5A') : null
    const isPerfect = rigor && rigor.score >= 100

    const statusConfig = {
      complete:   { icon: '✓', color: '#00FF88' },
      exceeded:   { icon: '⭐', color: '#FFD700' },
      incomplete: { icon: '✗', color: '#FF3D5A' },
      skipped:    { icon: '✗', color: '#FF3D5A' },
      extra:      { icon: '+', color: '#BF00FF' },
    }

    return (
      <PageWrapper>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: `${userColor}22`, boxShadow: `0 0 30px ${userColor}33` }}>
            <Trophy size={40} style={{ color: userColor }} />
          </div>
          <h1 className="font-display mb-1 text-xl font-bold uppercase tracking-wider text-glow-cyan">Entreno completado</h1>
          <p className="mb-6 text-text-secondary">{selectedRoutine?.name}</p>

          {/* Rigor score */}
          {rigor && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card mb-6 text-left"
              style={isPerfect ? { border: `1px solid ${rigorColor}33`, boxShadow: `0 0 20px ${rigorColor}22` } : undefined}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-xs uppercase tracking-wider text-text-secondary">Puntuación de rigor</span>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="font-mono text-2xl font-bold"
                  style={{ color: rigorColor, textShadow: isPerfect ? `0 0 12px ${rigorColor}88` : undefined }}
                >
                  {rigor.score}
                </motion.span>
              </div>
              <div className="mb-2 h-2.5 overflow-hidden rounded-full bg-bg-surface">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(rigor.score, 100)}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: rigorColor, boxShadow: isPerfect ? `0 0 12px ${rigorColor}88` : `0 0 6px ${rigorColor}44` }}
                />
              </div>
              <div className="flex gap-3 text-[9px] text-text-muted">
                <span>Ejercicios: {rigor.exerciseCompletion}/30</span>
                <span>Sets: {rigor.setCompletion}/40</span>
                <span>Peso: {rigor.weightAdherence}/30</span>
                {rigor.extraBonus > 0 && <span style={{ color: '#BF00FF' }}>+{rigor.extraBonus} extra</span>}
              </div>
            </motion.div>
          )}

          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              { val: formatTime(elapsed), label: 'Duración' },
              { val: loggedSets.length, label: 'Sets' },
              { val: `${Math.round(totalVolume)}`, label: 'Kg totales' },
            ].map(({ val, label }) => (
              <div key={label} className="card py-4">
                <p className="font-mono text-xl font-bold" style={{ color: userColor }}>{val}</p>
                <p className="text-[10px] text-text-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* Exercise breakdown with rigor */}
          <div className="mb-8 text-left">
            <h3 className="font-display mb-2 text-xs uppercase tracking-[0.2em] text-text-secondary">Ejercicios</h3>
            {rigor ? (
              <div className="space-y-1.5">
                {rigor.details.map((d, i) => {
                  const st = statusConfig[d.status] || {}
                  return (
                    <div key={d.exerciseId || i} className="rounded-lg bg-bg-secondary px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <span className="text-sm">{d.exerciseName}</span>
                          {d.muscleGroup && <span className="ml-1.5 text-[10px] text-text-muted">{d.muscleGroup}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-text-muted">{d.setsDone}/{d.setsTarget || '—'} sets</span>
                          <span style={{ color: st.color }} className="text-sm">{st.icon}</span>
                        </div>
                      </div>
                      {d.sets.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-text-muted">
                          {d.sets.map((s, j) => (
                            <span key={j} className="font-mono">
                              {s.reps}x{s.weight}kg
                              {d.setsTarget > 0 && j >= d.setsTarget && <span className="ml-0.5 text-[8px]" style={{ color: '#BF00FF' }}>+</span>}
                            </span>
                          ))}
                        </div>
                      )}
                      {d.setsTarget > 0 && d.restSeconds > 0 && (
                        <p className="mt-0.5 text-[9px] text-text-muted">Descanso: {d.restSeconds}s</p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              [...new Set(loggedSets.map(s => s.exercise?.name))].map(name => {
                const sets = loggedSets.filter(s => s.exercise?.name === name)
                return (
                  <div key={name} className="mb-1 flex items-center justify-between rounded-lg bg-bg-secondary px-3 py-2">
                    <span className="text-sm">{name}</span>
                    <span className="text-xs text-text-muted">{sets.length} sets</span>
                  </div>
                )
              })
            )}
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/')} className="btn-primary w-full py-3 text-sm">
            VOLVER AL INICIO
          </motion.button>
        </motion.div>
      </PageWrapper>
    )
  }

  // ACTIVE
  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-text-muted">{selectedRoutine?.name}</p>
          <div className="flex items-center gap-2">
            <Timer size={16} style={{ color: userColor }} />
            <span className="font-mono text-lg font-bold" style={{ color: userColor, textShadow: `0 0 8px ${userColor}55` }}>
              {formatTime(elapsed)}
            </span>
          </div>
        </div>
        <button
          onClick={handleFinish}
          className="flex items-center gap-1.5 rounded-full bg-neon-red/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neon-red"
        >
          <Square size={12} /> Terminar
        </button>
      </div>

      {/* Exercise tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {exercises.map((ex, i) => {
          const done = loggedSets.filter(s => s.exercise_id === ex.exercise_id).length
          return (
            <button
              key={ex.id}
              onClick={() => switchExercise(i)}
              className="shrink-0 rounded-full px-3 py-1 text-xs font-medium transition"
              style={i === currentExIdx ? {
                background: `${userColor}22`, color: userColor, border: `1px solid ${userColor}44`,
              } : {
                background: '#1E1E2E', color: '#8888A0', border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {ex.exercise?.name?.split(' ').slice(0, 2).join(' ')} {done > 0 && `(${done})`}
            </button>
          )
        })}
      </div>

      {currentExercise && (
        <motion.div key={currentExercise.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {/* Exercise info */}
          <div className="card mb-4" style={{ borderLeft: `3px solid ${userColor}` }}>
            <h2 className="text-lg font-bold">{currentExercise.exercise?.name}</h2>
            <p className="text-xs text-text-muted">
              {currentExercise.exercise?.muscle_group} · Objetivo: {currentExercise.sets_target}×{currentExercise.reps_target}
              {currentExercise.weight_target && ` @ ${currentExercise.weight_target}kg`}
            </p>
          </div>

          {/* Logged sets */}
          {setsForCurrent.length > 0 && (
            <div className="mb-4 space-y-1">
              {setsForCurrent.map((set, i) => (
                <div key={set.id} className="flex items-center gap-3 rounded-lg bg-bg-secondary px-3 py-2">
                  <Check size={14} className="text-neon-green" />
                  <span className="text-xs text-text-muted">Set {i + 1}</span>
                  <span className="ml-auto font-mono text-sm font-medium">{set.reps} × {set.weight}kg</span>
                </div>
              ))}
            </div>
          )}

          {/* Rest timer */}
          <AnimatePresence>
            {showRest && (
              <div className="mb-4">
                <RestTimer
                  duration={currentExercise.rest_seconds || 90}
                  color={userColor}
                  onFinish={() => setShowRest(false)}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="card">
            <p className="mb-3 font-display text-xs uppercase tracking-wider text-text-secondary">
              Set {setsForCurrent.length + 1} de {currentExercise.sets_target}
            </p>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Reps</label>
                <div className="flex items-center gap-1">
                  <button onClick={() => adjustValue(setCurrentReps, currentReps, -1, 1)} className="btn-ghost shrink-0 rounded-lg p-2"><Minus size={14} /></button>
                  <input type="number" value={currentReps} onChange={e => setCurrentReps(e.target.value)} className="input-gym flex-1 px-1 py-2.5" />
                  <button onClick={() => adjustValue(setCurrentReps, currentReps, 1)} className="btn-ghost shrink-0 rounded-lg p-2"><Plus size={14} /></button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Peso (kg)</label>
                <div className="flex items-center gap-1">
                  <button onClick={() => adjustValue(setCurrentWeight, currentWeight, -2.5)} className="btn-ghost shrink-0 rounded-lg p-2"><Minus size={14} /></button>
                  <input type="number" step="0.5" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} className="input-gym flex-1 px-1 py-2.5" />
                  <button onClick={() => adjustValue(setCurrentWeight, currentWeight, 2.5)} className="btn-ghost shrink-0 rounded-lg p-2"><Plus size={14} /></button>
                </div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLogSet}
              disabled={!currentReps}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-50"
            >
              <Zap size={16} /> REGISTRAR SET
            </motion.button>
          </div>
        </motion.div>
      )}
    </PageWrapper>
  )
}
