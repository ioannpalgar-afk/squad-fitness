import { useState } from 'react'
import { useStats } from '../hooks/useStats'
import { useBodyMetrics } from '../hooks/useBodyMetrics'
import { useAuth } from '../contexts/AuthContext'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ComposedChart,
} from 'recharts'
import { TrendingUp, BarChart3, Scale, Target, Zap, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import PageWrapper from '../components/layout/PageWrapper'
import BodyMetricForm from '../components/metrics/BodyMetricForm'
import { ESCENAS, EMOJI_ASSETS } from '../data/constants'
import { evaluateVolume, classifyStrength, bestEstimate1RM, calculateFFMI, detectRecomposition } from '../utils/calculations'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg bg-bg-tertiary px-3 py-2 text-xs" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-text-secondary">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-mono font-bold" style={{ color: p.color || '#00F0FF' }}>
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
            {p.dataKey === 'volume' ? ' kg' : p.dataKey === 'e1rm' ? ' kg' : p.unit || ''}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const TABS = [
  { id: 'fuerza', label: 'Fuerza', icon: Zap },
  { id: 'volumen', label: 'Volumen', icon: BarChart3 },
  { id: 'cuerpo', label: 'Cuerpo', icon: Scale },
]

export default function Analytics() {
  const { profile } = useAuth()
  const {
    exerciseProgress, weeklyVolume, personalRecords,
    muscleGroupVolume, e1rmProgress, totalStats, loading,
  } = useStats()
  const {
    weightChartData, bodyFatData, measurementData,
    latest, deltas, fullEntries,
    saveMetric, loading: metricsLoading,
  } = useBodyMetrics()

  const [activeTab, setActiveTab] = useState('fuerza')
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showMetricForm, setShowMetricForm] = useState(false)

  const userColor = profile?.color || '#00F0FF'
  const hasWorkoutData = exerciseProgress.length > 0 || weeklyVolume.some(w => w.volume > 0)
  const hasBodyData = weightChartData.length > 0

  // E1RM progress for selected exercise
  const currentE1rm = selectedExercise
    ? e1rmProgress.find(p => p.exercise === selectedExercise)
    : e1rmProgress[0]

  // Current exercise progress (weight)
  const currentProgress = selectedExercise
    ? exerciseProgress.find(p => p.exercise === selectedExercise)
    : exerciseProgress[0]

  // Radar chart data for muscle volume
  const radarData = muscleGroupVolume.map(mg => ({
    muscle: mg.muscle.substring(0, 6),
    fullName: mg.muscle,
    sets: mg.sets,
    ...evaluateVolume(mg.muscle, mg.sets),
  }))

  // Strength classification for top PRs
  const bodyweight = latest?.weight ? Number(latest.weight) : null

  // Body recomp detection
  const recomp = detectRecomposition(fullEntries)

  // FFMI
  const ffmi = latest?.weight && latest?.body_fat_pct
    ? calculateFFMI(Number(latest.weight), 178, Number(latest.body_fat_pct))
    : null

  const isLoading = loading || metricsLoading

  return (
    <PageWrapper>
      <BodyMetricForm
        show={showMetricForm}
        onClose={() => setShowMetricForm(false)}
        onSave={saveMetric}
        color={userColor}
        latestMetric={latest}
      />

      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-lg font-bold uppercase tracking-wider">Analíticas</h1>
        <button
          onClick={() => setShowMetricForm(true)}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition"
          style={{ color: userColor, background: `${userColor}15` }}
        >
          <Plus size={12} /> Medición
        </button>
      </div>

      {isLoading ? (
        <div className="card animate-pulse py-12 text-center text-sm text-text-muted">Cargando...</div>
      ) : !hasWorkoutData && !hasBodyData ? (
        <div className="card py-8 text-center">
          <img src={ESCENAS.progreso} alt="" className="mx-auto mb-4 h-36 w-auto object-contain opacity-80" />
          <p className="text-sm text-text-muted">Aun no hay datos</p>
          <p className="mt-1 text-xs text-text-muted">Completa entrenamientos para ver tu progreso</p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          {totalStats.sessions > 0 && (
            <div className="mb-6 grid grid-cols-4 gap-2">
              {[
                { value: totalStats.sessions, label: 'Sesiones', color: userColor },
                { value: totalStats.sets, label: 'Sets', color: '#BF00FF' },
                { value: `${(totalStats.tonnage / 1000).toFixed(1)}t`, label: 'Tonnage', color: '#FFD700' },
                { value: `${totalStats.avgDuration}\'`, label: 'Avg min', color: '#00FF88' },
              ].map(s => (
                <div key={s.label} className="rounded-xl py-2.5 text-center" style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p className="font-mono text-base font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[9px] text-text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="mb-5 flex gap-1.5 rounded-xl bg-bg-secondary p-1">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-wider transition"
                  style={activeTab === tab.id
                    ? { background: `${userColor}15`, color: userColor }
                    : { color: '#555568' }
                  }
                >
                  <Icon size={13} /> {tab.label}
                </button>
              )
            })}
          </div>

          {/* ====== TAB: FUERZA ====== */}
          {activeTab === 'fuerza' && (
            <>
              {/* E1RM Progress */}
              {e1rmProgress.length > 0 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp size={16} style={{ color: userColor }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                      E1RM Estimado
                    </h2>
                  </div>
                  <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                    {e1rmProgress.map(({ exercise }) => (
                      <button
                        key={exercise}
                        onClick={() => setSelectedExercise(exercise)}
                        className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition"
                        style={(selectedExercise || e1rmProgress[0]?.exercise) === exercise
                          ? { background: `${userColor}22`, color: userColor, border: `1px solid ${userColor}44` }
                          : { background: '#1E1E2E', color: '#8888A0', border: '1px solid rgba(255,255,255,0.06)' }
                        }
                      >
                        {exercise}
                      </button>
                    ))}
                  </div>
                  {currentE1rm && (
                    <div className="card">
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={currentE1rm.data}>
                          <defs>
                            <linearGradient id="e1rmGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={userColor} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={userColor} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="date" stroke="#555568" fontSize={10} />
                          <YAxis stroke="#555568" fontSize={10} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="e1rm" stroke={userColor} strokeWidth={2}
                            fill="url(#e1rmGrad)" dot={{ fill: userColor, r: 3 }}
                            style={{ filter: `drop-shadow(0 0 6px ${userColor}55)` }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </section>
              )}

              {/* Strength Standards for top PRs */}
              {personalRecords.length > 0 && bodyweight && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <Target size={16} style={{ color: '#FFD700' }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                      Nivel de Fuerza
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {personalRecords.slice(0, 6).map((pr, i) => {
                      const cls = classifyStrength(pr.exercise, pr.e1rm, bodyweight)
                      return (
                        <motion.div key={pr.exercise} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="card flex items-center gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{pr.exercise}</p>
                            <p className="text-[10px] text-text-muted">
                              {pr.weight}kg x {pr.reps} = <span className="font-mono font-bold" style={{ color: userColor }}>{pr.e1rm}kg</span> e1rm
                            </p>
                          </div>
                          {cls ? (
                            <div className="shrink-0 text-right">
                              <p className="text-[10px] font-bold capitalize" style={{ color: '#FFD700' }}>{cls.level}</p>
                              <div className="mt-0.5 h-1 w-16 overflow-hidden rounded-full bg-bg-surface">
                                <div className="h-full rounded-full" style={{
                                  width: `${cls.progress}%`,
                                  backgroundColor: '#FFD700',
                                }} />
                              </div>
                            </div>
                          ) : (
                            <div className="shrink-0 text-right">
                              <p className="font-mono text-xs font-bold" style={{ color: '#FFD700' }}>
                                {(pr.e1rm / bodyweight).toFixed(2)}x
                              </p>
                              <p className="text-[9px] text-text-muted">BW ratio</p>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* PRs list (if no bodyweight data) */}
              {personalRecords.length > 0 && !bodyweight && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <img src={EMOJI_ASSETS.trophy} alt="" className="h-5 w-5 object-contain" />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Récords personales</h2>
                  </div>
                  <div className="space-y-2">
                    {personalRecords.slice(0, 8).map((pr, i) => (
                      <motion.div key={pr.exercise} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="card flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold">{pr.exercise}</p>
                          <p className="text-xs text-text-muted">{pr.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-neon-gold text-glow-gold">{pr.e1rm} kg</p>
                          <p className="text-[10px] text-text-muted">{pr.weight}x{pr.reps}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ====== TAB: VOLUMEN ====== */}
          {activeTab === 'volumen' && (
            <>
              {/* Weekly volume chart */}
              {weeklyVolume.some(w => w.volume > 0) && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <BarChart3 size={16} className="text-neon-violet" />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Volumen semanal</h2>
                  </div>
                  <div className="card">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={weeklyVolume}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="week" stroke="#555568" fontSize={10} />
                        <YAxis stroke="#555568" fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="volume" fill="#BF00FF" radius={[4, 4, 0, 0]}
                          style={{ filter: 'drop-shadow(0 0 6px rgba(191,0,255,0.3))' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Muscle group volume (radar chart) */}
              {radarData.length >= 3 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <img src={EMOJI_ASSETS.bicep} alt="" className="h-5 w-5 object-contain" />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                      Volumen por músculo (semana)
                    </h2>
                  </div>
                  <div className="card">
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="muscle" tick={{ fill: '#8888A0', fontSize: 10 }} />
                        <Radar dataKey="sets" stroke={userColor} fill={userColor} fillOpacity={0.2}
                          strokeWidth={2} style={{ filter: `drop-shadow(0 0 4px ${userColor}55)` }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Muscle group list with volume landmarks */}
              {muscleGroupVolume.length > 0 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <Target size={16} style={{ color: '#00FF88' }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                      Sets semanales vs Landmarks
                    </h2>
                  </div>
                  <div className="space-y-1.5">
                    {muscleGroupVolume.map((mg, i) => {
                      const ev = evaluateVolume(mg.muscle, mg.sets)
                      return (
                        <motion.div key={mg.muscle} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                          style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold">{mg.muscle}</p>
                              <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                                style={{ background: `${ev.color}22`, color: ev.color }}>
                                {ev.label}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[10px] text-text-muted">
                              <span className="font-mono font-bold" style={{ color: ev.color }}>{mg.sets}</span> sets esta semana
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Weight progression per exercise */}
              {currentProgress && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp size={16} style={{ color: userColor }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Peso por ejercicio</h2>
                  </div>
                  <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                    {exerciseProgress.map(({ exercise }) => (
                      <button
                        key={exercise}
                        onClick={() => setSelectedExercise(exercise)}
                        className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition"
                        style={(selectedExercise || exerciseProgress[0]?.exercise) === exercise
                          ? { background: `${userColor}22`, color: userColor, border: `1px solid ${userColor}44` }
                          : { background: '#1E1E2E', color: '#8888A0', border: '1px solid rgba(255,255,255,0.06)' }
                        }
                      >
                        {exercise}
                      </button>
                    ))}
                  </div>
                  <div className="card">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={currentProgress.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="#555568" fontSize={10} />
                        <YAxis stroke="#555568" fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="weight" stroke={userColor} strokeWidth={2}
                          dot={{ fill: userColor, r: 3 }} activeDot={{ r: 5 }}
                          style={{ filter: `drop-shadow(0 0 6px ${userColor}55)` }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ====== TAB: CUERPO ====== */}
          {activeTab === 'cuerpo' && (
            <>
              {/* Latest metrics summary */}
              {latest && (
                <section className="mb-6">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: latest.weight ? `${latest.weight}` : '—', unit: 'kg', label: 'Peso', delta: deltas?.weight, color: userColor },
                      { value: latest.body_fat_pct ? `${latest.body_fat_pct}` : '—', unit: '%', label: 'Grasa', delta: deltas?.bodyFat, color: '#FF3D5A', invertDelta: true },
                      { value: latest.muscle_mass ? `${latest.muscle_mass}` : '—', unit: 'kg', label: 'Músculo', delta: deltas?.muscleMass, color: '#00FF88' },
                    ].map(m => (
                      <div key={m.label} className="rounded-xl py-3 text-center" style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <p className="font-mono text-lg font-bold" style={{ color: m.color }}>
                          {m.value}<span className="text-[10px] text-text-muted">{m.unit}</span>
                        </p>
                        <p className="text-[10px] text-text-muted">{m.label}</p>
                        {m.delta != null && (
                          <p className={`mt-0.5 text-[10px] font-bold ${
                            (m.invertDelta ? m.delta < 0 : m.delta > 0) ? 'text-neon-green' : m.delta === 0 ? 'text-text-muted' : 'text-neon-red'
                          }`}>
                            {m.delta > 0 ? '+' : ''}{m.delta}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recomp / phase detection */}
              {recomp && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: recomp.detected ? 'rgba(0,255,136,0.06)' : `${userColor}08`, border: `1px solid ${recomp.detected ? 'rgba(0,255,136,0.18)' : `${userColor}18`}` }}
                >
                  <img src={recomp.detected ? EMOJI_ASSETS.fire : EMOJI_ASSETS.bicep} alt="" className="h-7 w-7 object-contain" />
                  <div>
                    <p className="text-xs font-bold" style={{ color: recomp.detected ? '#00FF88' : userColor }}>
                      Fase: {recomp.phase}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {recomp.leanMassDelta > 0 ? '+' : ''}{recomp.leanMassDelta}kg músculo,{' '}
                      {recomp.fatMassDelta > 0 ? '+' : ''}{recomp.fatMassDelta}kg grasa
                    </p>
                  </div>
                </motion.div>
              )}

              {/* FFMI */}
              {ffmi && (
                <div className="mb-6 flex items-center gap-3 rounded-xl px-4 py-2.5"
                  style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div className="flex-1">
                    <p className="text-[10px] text-text-muted">FFMI (Índice Masa Libre de Grasa)</p>
                    <p className="font-mono text-sm font-bold" style={{ color: userColor }}>{ffmi.normalized}</p>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                    style={{ background: `${userColor}22`, color: userColor }}>
                    {ffmi.classification}
                  </span>
                </div>
              )}

              {/* Weight trend chart */}
              {weightChartData.length > 2 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <Scale size={16} style={{ color: userColor }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                      Tendencia de peso
                    </h2>
                  </div>
                  <div className="card">
                    <ResponsiveContainer width="100%" height={200}>
                      <ComposedChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="#555568" fontSize={10} />
                        <YAxis stroke="#555568" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="weight" fill={`${userColor}10`} stroke="transparent" />
                        <Line type="monotone" dataKey="weight" stroke={`${userColor}44`} strokeWidth={1}
                          dot={{ fill: `${userColor}88`, r: 2 }} />
                        <Line type="monotone" dataKey="trend" stroke={userColor} strokeWidth={2.5}
                          dot={false} style={{ filter: `drop-shadow(0 0 6px ${userColor}55)` }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                    <p className="mt-1 text-center text-[9px] text-text-muted">
                      Puntos = pesadas reales | Línea = tendencia EMA
                    </p>
                  </div>
                </section>
              )}

              {/* Body fat + muscle mass chart */}
              {bodyFatData.length > 2 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <Target size={16} style={{ color: '#FF3D5A' }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                      Composición corporal
                    </h2>
                  </div>
                  <div className="card">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={bodyFatData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="#555568" fontSize={10} />
                        <YAxis stroke="#555568" fontSize={10} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="bodyFat" name="Grasa %" stroke="#FF3D5A" strokeWidth={2}
                          dot={{ fill: '#FF3D5A', r: 3 }} style={{ filter: 'drop-shadow(0 0 4px rgba(255,61,90,0.4))' }} />
                        {bodyFatData.some(d => d.muscleMass) && (
                          <Line type="monotone" dataKey="muscleMass" name="Músculo kg" stroke="#00FF88" strokeWidth={2}
                            dot={{ fill: '#00FF88', r: 3 }} style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.4))' }} />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-2 flex justify-center gap-4">
                      <span className="flex items-center gap-1 text-[10px]">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#FF3D5A' }} /> Grasa %
                      </span>
                      <span className="flex items-center gap-1 text-[10px]">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#00FF88' }} /> Músculo kg
                      </span>
                    </div>
                  </div>
                </section>
              )}

              {/* Measurements chart */}
              {measurementData.length > 2 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <img src={EMOJI_ASSETS.bicep} alt="" className="h-5 w-5 object-contain" />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                      Medidas corporales
                    </h2>
                  </div>
                  <div className="card">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={measurementData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="#555568" fontSize={10} />
                        <YAxis stroke="#555568" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="chest" name="Pecho" stroke="#00F0FF" strokeWidth={1.5} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="waist" name="Cintura" stroke="#FF8C00" strokeWidth={1.5} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="bicep" name="Bícep" stroke="#BF00FF" strokeWidth={1.5} dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="thigh" name="Muslo" stroke="#00FF88" strokeWidth={1.5} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-2 flex flex-wrap justify-center gap-3">
                      {[
                        { label: 'Pecho', color: '#00F0FF' },
                        { label: 'Cintura', color: '#FF8C00' },
                        { label: 'Bícep', color: '#BF00FF' },
                        { label: 'Muslo', color: '#00FF88' },
                      ].map(l => (
                        <span key={l.label} className="flex items-center gap-1 text-[10px]">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} /> {l.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Empty body data state */}
              {!hasBodyData && (
                <div className="card py-8 text-center">
                  <img src={ESCENAS.progreso} alt="" className="mx-auto mb-4 h-28 w-auto object-contain opacity-60" />
                  <p className="text-sm text-text-muted">Sin datos corporales</p>
                  <button
                    onClick={() => setShowMetricForm(true)}
                    className="mt-3 text-xs font-semibold" style={{ color: userColor }}
                  >
                    + Añadir primera medición
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </PageWrapper>
  )
}
