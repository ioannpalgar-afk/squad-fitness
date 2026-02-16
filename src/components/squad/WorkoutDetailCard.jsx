import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, Clock, Dumbbell, Flame } from 'lucide-react'
import AvatarWithMood from '../avatar/AvatarWithMood'
import { calculateRigorScore } from '../../utils/calculations'

function RigorBar({ score, exerciseCompletion, setCompletion, weightAdherence, extraBonus }) {
  const color = score >= 100 ? '#00F0FF' : score >= 80 ? '#00FF88' : score >= 50 ? '#FFD700' : '#FF3D5A'
  const isPerfect = score >= 100
  const pct = Math.min(score, 110)

  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-display text-xs uppercase tracking-wider text-text-secondary">Rigor</span>
        <span className="font-mono text-sm font-bold" style={{ color, textShadow: isPerfect ? `0 0 8px ${color}` : undefined }}>
          {score}/100{extraBonus > 0 && <span className="text-[10px] text-text-muted"> +{extraBonus}</span>}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg-surface">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: isPerfect ? `0 0 12px ${color}88` : `0 0 6px ${color}44` }}
        />
      </div>
      <div className="mt-1.5 flex gap-3 text-[9px] text-text-muted">
        <span>Ejercicios: {exerciseCompletion}/30</span>
        <span>Sets: {setCompletion}/40</span>
        <span>Peso: {weightAdherence}/30</span>
      </div>
    </div>
  )
}

function ExerciseDetail({ detail, hasRoutine }) {
  const statusConfig = {
    complete:   { icon: '✓', color: '#00FF88', label: 'Completado' },
    exceeded:   { icon: '⭐', color: '#FFD700', label: 'Superado' },
    incomplete: { icon: '✗', color: '#FF3D5A', label: 'Incompleto' },
    skipped:    { icon: '✗', color: '#FF3D5A', label: 'Omitido' },
    extra:      { icon: '+', color: '#BF00FF', label: 'Extra' },
  }
  const st = statusConfig[detail.status] || {}

  return (
    <div className="rounded-xl bg-bg-surface/40 p-3" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">{detail.exerciseName}</p>
          {detail.muscleGroup && (
            <p className="text-[10px] text-text-muted">{detail.muscleGroup}</p>
          )}
        </div>
        {hasRoutine && (
          <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
            style={{ background: `${st.color}18`, color: st.color }}>
            {st.icon} {detail.status === 'extra' ? 'Extra' : ''}
          </span>
        )}
      </div>

      {/* Target line */}
      {detail.setsTarget > 0 && (
        <p className="mb-1 text-[10px] text-text-muted">
          Objetivo: {detail.setsTarget}x{detail.repsTarget}
          {detail.weightTarget > 0 && ` @ ${detail.weightTarget}kg`}
          {detail.restSeconds > 0 && (
            <span className="ml-1 inline-flex items-center gap-0.5">
              <Clock size={8} className="inline" /> {detail.restSeconds}s
            </span>
          )}
        </p>
      )}

      {/* Logged sets */}
      {detail.sets.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {detail.sets.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              <span className="w-10 text-text-muted">Set {i + 1}</span>
              <span className="font-mono font-medium">{s.reps}x{s.weight}kg</span>
              {detail.setsTarget > 0 && i >= detail.setsTarget && (
                <span className="rounded px-1 py-px text-[8px] font-bold" style={{ background: '#BF00FF18', color: '#BF00FF' }}>extra</span>
              )}
            </div>
          ))}
        </div>
      )}

      {detail.sets.length === 0 && (
        <p className="text-[10px] italic text-text-muted">Sin sets registrados</p>
      )}
    </div>
  )
}

export default function WorkoutDetailCard({ session, userColor, isCurrentUser, delay = 0 }) {
  const [expanded, setExpanded] = useState(false)

  const profileColor = session.profile?.color || '#555568'
  const routineExercises = session.routine?.routine_exercises || []
  const sessionSets = session.session_sets || []
  const hasRoutine = routineExercises.length > 0

  const rigor = hasRoutine ? calculateRigorScore(sessionSets, routineExercises) : null

  // Stats
  const totalSets = sessionSets.length
  const totalVolume = sessionSets.reduce((sum, s) => sum + (s.reps || 0) * (Number(s.weight) || 0), 0)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay * 0.03 }}
    >
      {/* Collapsed row */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-bg-secondary"
        style={{ borderLeft: `2px solid ${profileColor}` }}
      >
        <AvatarWithMood name={session.profile?.name} color={profileColor} avatarBase={session.profile?.name?.toLowerCase()} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-semibold">{session.profile?.name}</span>
            {' entrenó '}
            <span style={{ color: profileColor }}>{session.routine?.name || 'libre'}</span>
          </p>
          <p className="text-[10px] text-text-muted">
            {session.finished_at && formatDistanceToNow(new Date(session.finished_at), { addSuffix: true, locale: es })}
            {session.duration_minutes && ` · ${session.duration_minutes} min`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rigor && (
            <span className="rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold"
              style={{
                background: `${rigor.score >= 100 ? '#00F0FF' : rigor.score >= 80 ? '#00FF88' : rigor.score >= 50 ? '#FFD700' : '#FF3D5A'}18`,
                color: rigor.score >= 100 ? '#00F0FF' : rigor.score >= 80 ? '#00FF88' : rigor.score >= 50 ? '#FFD700' : '#FF3D5A',
              }}>
              {rigor.score}%
            </span>
          )}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} className="text-text-muted" />
          </motion.div>
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="rounded-b-xl px-3 pb-3 pt-2 ml-[2px]"
              style={{ borderLeft: `2px solid ${profileColor}`, background: '#14141F' }}>

              {/* Rigor bar */}
              {rigor && (
                <RigorBar
                  score={rigor.score}
                  exerciseCompletion={rigor.exerciseCompletion}
                  setCompletion={rigor.setCompletion}
                  weightAdherence={rigor.weightAdherence}
                  extraBonus={rigor.extraBonus}
                />
              )}

              {/* Exercise breakdown */}
              {rigor ? (
                <div className="mb-3 space-y-2">
                  {rigor.details.map((d, i) => (
                    <ExerciseDetail key={d.exerciseId || i} detail={d} hasRoutine={true} />
                  ))}
                </div>
              ) : (
                /* Free workout - group by exercise */
                sessionSets.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {Object.values(
                      sessionSets.reduce((acc, s) => {
                        const name = s.exercise?.name || 'Ejercicio'
                        if (!acc[name]) acc[name] = { exerciseName: name, muscleGroup: s.exercise?.muscle_group || '', sets: [] }
                        acc[name].sets.push({ reps: s.reps, weight: Number(s.weight) || 0, setNumber: s.set_number })
                        return acc
                      }, {})
                    ).map((d, i) => (
                      <ExerciseDetail key={i} detail={{ ...d, setsTarget: 0, setsDone: d.sets.length, repsTarget: 0, weightTarget: 0, avgWeight: 0, restSeconds: 0, status: 'complete' }} hasRoutine={false} />
                    ))}
                  </div>
                )
              )}

              {/* Summary stats */}
              <div className="flex gap-3 rounded-lg bg-bg-surface/30 px-3 py-2">
                {[
                  { icon: Dumbbell, value: totalSets, label: 'Sets' },
                  { icon: Flame, value: `${Math.round(totalVolume).toLocaleString()}kg`, label: 'Volumen' },
                  { icon: Clock, value: session.duration_minutes ? `${session.duration_minutes}min` : '—', label: 'Duración' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 text-[10px]">
                    <s.icon size={10} className="text-text-muted" />
                    <span className="font-mono font-bold">{s.value}</span>
                    <span className="text-text-muted">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
