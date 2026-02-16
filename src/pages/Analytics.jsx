import { useState, useMemo } from 'react'
import { useStats } from '../hooks/useStats'
import { useBodyMetrics } from '../hooks/useBodyMetrics'
import { useAuth } from '../contexts/AuthContext'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ComposedChart,
} from 'recharts'
import { TrendingUp, BarChart3, Scale, Target, Zap, Plus, Calendar, Trash2, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { subWeeks, subMonths, subYears } from 'date-fns'
import PageWrapper from '../components/layout/PageWrapper'
import BodyMetricForm from '../components/metrics/BodyMetricForm'
import TimeRangeSelector from '../components/analytics/TimeRangeSelector'
import StrengthLevelModal from '../components/analytics/StrengthLevelModal'
import { ESCENAS, EMOJI_ASSETS } from '../data/constants'
import { evaluateVolume, evaluateExerciseVolume, classifyStrength, calculateFFMI, detectRecomposition } from '../utils/calculations'

// ====== CONSTANTS ======
const CHART_COLORS = ['#00F0FF', '#BF00FF', '#FFD700', '#00FF88', '#FF3D5A', '#FF8C00']

const TABS = [
  { id: 'fuerza', label: 'Fuerza', icon: Zap },
  { id: 'volumen', label: 'Volumen', icon: BarChart3 },
  { id: 'cuerpo', label: 'Cuerpo', icon: Scale },
]

// ====== HELPERS ======

function filterByTimeRange(data, range, dateField = 'rawDate') {
  if (range === 'all' || !data?.length) return data
  const now = new Date()
  let cutoff
  if (range === 'week') cutoff = subWeeks(now, 1)
  else if (range === 'month') cutoff = subMonths(now, 1)
  else if (range === 'year') cutoff = subYears(now, 1)
  else return data
  return data.filter(d => d[dateField] && new Date(d[dateField]) >= cutoff)
}

function getMergedChartData(exercises, e1rmProgress, timeRange) {
  // Collect all dates across selected exercises
  const dateMap = {}
  exercises.forEach(name => {
    const prog = e1rmProgress.find(p => p.exercise === name)
    if (!prog) return
    const filtered = filterByTimeRange(prog.data, timeRange)
    filtered.forEach(d => {
      if (!dateMap[d.date]) dateMap[d.date] = { date: d.date, rawDate: d.rawDate }
      dateMap[d.date][name] = d.e1rm
    })
  })
  return Object.values(dateMap).sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate))
}

function getMergedWeightData(exercises, exerciseProgress, timeRange) {
  const dateMap = {}
  exercises.forEach(name => {
    const prog = exerciseProgress.find(p => p.exercise === name)
    if (!prog) return
    const filtered = filterByTimeRange(prog.data, timeRange)
    filtered.forEach(d => {
      if (!dateMap[d.date]) dateMap[d.date] = { date: d.date, rawDate: d.rawDate }
      dateMap[d.date][name] = d.weight
    })
  })
  return Object.values(dateMap).sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate))
}

// ====== CUSTOM TOOLTIP ======
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg bg-bg-tertiary px-3 py-2 text-xs" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-text-secondary">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-mono font-bold" style={{ color: p.color || '#00F0FF' }}>
            {p.name && payload.length > 1 && <span className="mr-1 font-sans text-[9px] font-normal text-text-muted">{p.name}:</span>}
            {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
            {p.dataKey === 'volume' ? ' kg' : ' kg'}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// ====== MAIN COMPONENT ======
export default function Analytics() {
  const { profile } = useAuth()
  const {
    exerciseProgress, weeklyVolume, personalRecords,
    muscleGroupVolume, exerciseWeeklyVolume, e1rmProgress, totalStats, loading,
  } = useStats()
  const {
    metrics, weightChartData, bodyFatData, measurementData,
    latest, deltas, fullEntries,
    saveMetric, deleteMetric, loading: metricsLoading,
  } = useBodyMetrics()

  // Tab state
  const [activeTab, setActiveTab] = useState('fuerza')
  const [showMetricForm, setShowMetricForm] = useState(false)

  // Multi-select exercises (for Fuerza)
  const [selectedE1rmExercises, setSelectedE1rmExercises] = useState([])
  const [fuerzaTimeRange, setFuerzaTimeRange] = useState('all')
  const [strengthModalPR, setStrengthModalPR] = useState(null)

  // Multi-select exercises (for Volumen - weight per exercise)
  const [selectedWeightExercises, setSelectedWeightExercises] = useState([])
  const [volumenTimeRange, setVolumenTimeRange] = useState('all')

  // Body time ranges
  const [bodyWeightTimeRange, setBodyWeightTimeRange] = useState('all')
  const [bodyCompTimeRange, setBodyCompTimeRange] = useState('all')
  const [bodyMeasTimeRange, setBodyMeasTimeRange] = useState('all')

  // Clickable dot detail (Body tab)
  const [dotDetail, setDotDetail] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const userColor = profile?.color || '#00F0FF'
  const hasWorkoutData = exerciseProgress.length > 0 || weeklyVolume.some(w => w.volume > 0)
  const hasBodyData = weightChartData.length > 0

  // Toggle exercise in multi-select
  const toggleE1rmExercise = (name) => {
    setSelectedE1rmExercises(prev =>
      prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
    )
  }
  const toggleWeightExercise = (name) => {
    setSelectedWeightExercises(prev =>
      prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
    )
  }

  // Merged chart data for E1RM multi-select
  const mergedE1rmData = useMemo(
    () => getMergedChartData(selectedE1rmExercises, e1rmProgress, fuerzaTimeRange),
    [selectedE1rmExercises, e1rmProgress, fuerzaTimeRange]
  )

  // Merged chart data for weight multi-select (Volumen tab)
  const mergedWeightData = useMemo(
    () => getMergedWeightData(selectedWeightExercises, exerciseProgress, volumenTimeRange),
    [selectedWeightExercises, exerciseProgress, volumenTimeRange]
  )

  // Filtered weekly volume
  const filteredWeeklyVolume = useMemo(
    () => filterByTimeRange(weeklyVolume, volumenTimeRange),
    [weeklyVolume, volumenTimeRange]
  )

  // Filtered body data
  const filteredWeightChart = useMemo(
    () => filterByTimeRange(weightChartData, bodyWeightTimeRange),
    [weightChartData, bodyWeightTimeRange]
  )
  const filteredBodyFat = useMemo(
    () => filterByTimeRange(bodyFatData, bodyCompTimeRange),
    [bodyFatData, bodyCompTimeRange]
  )
  const filteredMeasurements = useMemo(
    () => filterByTimeRange(measurementData, bodyMeasTimeRange),
    [measurementData, bodyMeasTimeRange]
  )

  // Radar chart data for muscle volume
  const radarData = muscleGroupVolume.map(mg => ({
    muscle: mg.muscle.substring(0, 6),
    fullName: mg.muscle,
    sets: mg.sets,
    ...evaluateVolume(mg.muscle, mg.sets),
  }))

  // Strength classification
  const bodyweight = latest?.weight ? Number(latest.weight) : null

  // Body recomp detection
  const recomp = detectRecomposition(fullEntries)

  // FFMI
  const ffmi = latest?.weight && latest?.body_fat_pct
    ? calculateFFMI(Number(latest.weight), 178, Number(latest.body_fat_pct))
    : null

  const isLoading = loading || metricsLoading

  // Handle dot click on body charts
  const handleDotClick = (chartType) => (data, _index) => {
    if (!data?.payload) return
    const point = data.payload
    setDotDetail({ type: chartType, ...point })
  }

  return (
    <PageWrapper>
      <BodyMetricForm
        show={showMetricForm}
        onClose={() => setShowMetricForm(false)}
        onSave={saveMetric}
        color={userColor}
        latestMetric={latest}
      />

      {/* Strength Level Modal */}
      {strengthModalPR && (
        <StrengthLevelModal
          exercise={strengthModalPR.exercise}
          e1rm={strengthModalPR.e1rm}
          bodyweight={bodyweight || 0}
          onClose={() => setStrengthModalPR(null)}
        />
      )}

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
                { value: `${totalStats.avgDuration}'`, label: 'Avg min', color: '#00FF88' },
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
                  onClick={() => { setActiveTab(tab.id); setDotDetail(null) }}
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
              {/* E1RM Progress - Multi-select */}
              {e1rmProgress.length > 0 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} style={{ color: userColor }} />
                      <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                        E1RM Estimado
                      </h2>
                    </div>
                    <TimeRangeSelector selected={fuerzaTimeRange} onChange={setFuerzaTimeRange} color={userColor} />
                  </div>

                  {/* Exercise pills - toggle multi-select */}
                  <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                    {e1rmProgress.map(({ exercise }, i) => {
                      const isSelected = selectedE1rmExercises.includes(exercise)
                      const colorIdx = selectedE1rmExercises.indexOf(exercise)
                      const pillColor = isSelected ? CHART_COLORS[colorIdx % CHART_COLORS.length] : null
                      return (
                        <button
                          key={exercise}
                          onClick={() => toggleE1rmExercise(exercise)}
                          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition"
                          style={isSelected
                            ? { background: `${pillColor}22`, color: pillColor, border: `1px solid ${pillColor}44` }
                            : { background: '#1E1E2E', color: '#8888A0', border: '1px solid rgba(255,255,255,0.06)' }
                          }
                        >
                          {exercise}
                        </button>
                      )
                    })}
                  </div>

                  {/* Chart */}
                  {selectedE1rmExercises.length === 0 ? (
                    <div className="card py-8 text-center text-xs text-text-muted">
                      Selecciona uno o más ejercicios
                    </div>
                  ) : mergedE1rmData.length === 0 ? (
                    <div className="card py-8 text-center text-xs text-text-muted">
                      Sin datos en este rango temporal
                    </div>
                  ) : (
                    <div className="card">
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={mergedE1rmData}>
                          <defs>
                            {selectedE1rmExercises.map((name, i) => (
                              <linearGradient key={name} id={`e1rmGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="date" stroke="#555568" fontSize={10} />
                          <YAxis stroke="#555568" fontSize={10} />
                          <Tooltip content={<CustomTooltip />} />
                          {selectedE1rmExercises.map((name, i) => (
                            <Area
                              key={name}
                              type="monotone"
                              dataKey={name}
                              name={name}
                              stroke={CHART_COLORS[i % CHART_COLORS.length]}
                              strokeWidth={2}
                              fill={`url(#e1rmGrad-${i})`}
                              dot={{ fill: CHART_COLORS[i % CHART_COLORS.length], r: 3 }}
                              connectNulls
                              style={{ filter: `drop-shadow(0 0 6px ${CHART_COLORS[i % CHART_COLORS.length]}55)` }}
                            />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                      {/* Legend */}
                      <div className="mt-2 flex flex-wrap justify-center gap-3">
                        {selectedE1rmExercises.map((name, i) => (
                          <span key={name} className="flex items-center gap-1 text-[10px]">
                            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            {name}
                          </span>
                        ))}
                      </div>
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
                    {personalRecords.map((pr, i) => {
                      const cls = classifyStrength(pr.exercise, pr.e1rm, bodyweight)
                      return (
                        <motion.button
                          key={pr.exercise}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="card flex w-full items-center gap-3 text-left"
                          onClick={() => setStrengthModalPR(pr)}
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
                        </motion.button>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* PRs list (if no bodyweight data) */}
              {personalRecords.length > 0 && !bodyweight && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-base">{EMOJI_ASSETS.trophy}</span>
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Récords personales</h2>
                  </div>
                  <div className="space-y-2">
                    {personalRecords.map((pr, i) => (
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
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={16} className="text-neon-violet" />
                      <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Volumen semanal</h2>
                    </div>
                    <TimeRangeSelector selected={volumenTimeRange} onChange={setVolumenTimeRange} color="#BF00FF" />
                  </div>
                  {filteredWeeklyVolume.length === 0 ? (
                    <div className="card py-8 text-center text-xs text-text-muted">
                      Sin datos en este rango temporal
                    </div>
                  ) : (
                    <div className="card">
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={filteredWeeklyVolume}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="week" stroke="#555568" fontSize={10} />
                          <YAxis stroke="#555568" fontSize={10} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="volume" fill="#BF00FF" radius={[4, 4, 0, 0]}
                            style={{ filter: 'drop-shadow(0 0 6px rgba(191,0,255,0.3))' }} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </section>
              )}

              {/* Muscle group volume (radar chart) */}
              {radarData.length >= 3 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-base">{EMOJI_ASSETS.bicep}</span>
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

              {/* Per-exercise volume levels */}
              {exerciseWeeklyVolume.length > 0 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <Zap size={16} style={{ color: '#BF00FF' }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                      Nivel de volumen por ejercicio
                    </h2>
                  </div>
                  <div className="space-y-1.5">
                    {exerciseWeeklyVolume.map((ex, i) => {
                      const ev = evaluateExerciseVolume(ex.exercise, ex.sets)
                      return (
                        <motion.div key={ex.exercise} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                          style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold truncate">{ex.exercise}</p>
                              <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                                style={{ background: `${ev.color}22`, color: ev.color }}>
                                {ev.label}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[10px] text-text-muted">
                              <span className="font-mono font-bold" style={{ color: ev.color }}>{ex.sets}</span> sets esta semana
                              <span className="ml-1.5 text-text-muted">· {ex.muscleGroup}</span>
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Weight progression per exercise - Multi-select */}
              {exerciseProgress.length > 0 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp size={16} style={{ color: userColor }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">Peso por ejercicio</h2>
                  </div>
                  <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                    {exerciseProgress.map(({ exercise }, i) => {
                      const isSelected = selectedWeightExercises.includes(exercise)
                      const colorIdx = selectedWeightExercises.indexOf(exercise)
                      const pillColor = isSelected ? CHART_COLORS[colorIdx % CHART_COLORS.length] : null
                      return (
                        <button
                          key={exercise}
                          onClick={() => toggleWeightExercise(exercise)}
                          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition"
                          style={isSelected
                            ? { background: `${pillColor}22`, color: pillColor, border: `1px solid ${pillColor}44` }
                            : { background: '#1E1E2E', color: '#8888A0', border: '1px solid rgba(255,255,255,0.06)' }
                          }
                        >
                          {exercise}
                        </button>
                      )
                    })}
                  </div>
                  {selectedWeightExercises.length === 0 ? (
                    <div className="card py-8 text-center text-xs text-text-muted">
                      Selecciona uno o más ejercicios
                    </div>
                  ) : mergedWeightData.length === 0 ? (
                    <div className="card py-8 text-center text-xs text-text-muted">
                      Sin datos en este rango temporal
                    </div>
                  ) : (
                    <div className="card">
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={mergedWeightData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="date" stroke="#555568" fontSize={10} />
                          <YAxis stroke="#555568" fontSize={10} />
                          <Tooltip content={<CustomTooltip />} />
                          {selectedWeightExercises.map((name, i) => (
                            <Line
                              key={name}
                              type="monotone"
                              dataKey={name}
                              name={name}
                              stroke={CHART_COLORS[i % CHART_COLORS.length]}
                              strokeWidth={2}
                              dot={{ fill: CHART_COLORS[i % CHART_COLORS.length], r: 3 }}
                              activeDot={{ r: 5 }}
                              connectNulls
                              style={{ filter: `drop-shadow(0 0 6px ${CHART_COLORS[i % CHART_COLORS.length]}55)` }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                      {/* Legend */}
                      <div className="mt-2 flex flex-wrap justify-center gap-3">
                        {selectedWeightExercises.map((name, i) => (
                          <span key={name} className="flex items-center gap-1 text-[10px]">
                            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <span className="text-xl">{recomp.detected ? EMOJI_ASSETS.fire : EMOJI_ASSETS.bicep}</span>
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
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale size={16} style={{ color: userColor }} />
                      <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                        Tendencia de peso
                      </h2>
                    </div>
                    <TimeRangeSelector selected={bodyWeightTimeRange} onChange={(r) => { setBodyWeightTimeRange(r); setDotDetail(null) }} color={userColor} />
                  </div>
                  {filteredWeightChart.length < 2 ? (
                    <div className="card py-8 text-center text-xs text-text-muted">
                      Sin datos en este rango temporal
                    </div>
                  ) : (
                    <>
                      <div className="card">
                        <ResponsiveContainer width="100%" height={200}>
                          <ComposedChart data={filteredWeightChart}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="#555568" fontSize={10} />
                            <YAxis stroke="#555568" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="weight" fill={`${userColor}10`} stroke="transparent" />
                            <Line type="monotone" dataKey="weight" stroke={`${userColor}44`} strokeWidth={1}
                              dot={{ fill: `${userColor}88`, r: 2 }}
                              activeDot={{ r: 6, cursor: 'pointer', onClick: handleDotClick('weight') }}
                            />
                            <Line type="monotone" dataKey="trend" stroke={userColor} strokeWidth={2.5}
                              dot={false} style={{ filter: `drop-shadow(0 0 6px ${userColor}55)` }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                        <p className="mt-1 text-center text-[9px] text-text-muted">
                          Puntos = pesadas reales | Línea = tendencia EMA
                        </p>
                      </div>
                      {/* Dot detail panel */}
                      {dotDetail?.type === 'weight' && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 rounded-xl px-4 py-3"
                          style={{ background: '#14141F', border: `1px solid ${userColor}22` }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-text-muted">{dotDetail.rawDate ? new Date(dotDetail.rawDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : dotDetail.date}</p>
                              <p className="font-mono text-sm font-bold" style={{ color: userColor }}>{dotDetail.weight} kg</p>
                            </div>
                            {dotDetail.trend && (
                              <div className="text-right">
                                <p className="text-[9px] text-text-muted">Tendencia</p>
                                <p className="font-mono text-xs font-bold text-text-secondary">{dotDetail.trend} kg</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </section>
              )}

              {/* Body fat + muscle mass chart */}
              {bodyFatData.length > 2 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target size={16} style={{ color: '#FF3D5A' }} />
                      <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                        Composición corporal
                      </h2>
                    </div>
                    <TimeRangeSelector selected={bodyCompTimeRange} onChange={(r) => { setBodyCompTimeRange(r); setDotDetail(null) }} color="#FF3D5A" />
                  </div>
                  {filteredBodyFat.length < 2 ? (
                    <div className="card py-8 text-center text-xs text-text-muted">
                      Sin datos en este rango temporal
                    </div>
                  ) : (
                    <>
                      <div className="card">
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={filteredBodyFat}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="#555568" fontSize={10} />
                            <YAxis stroke="#555568" fontSize={10} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="bodyFat" name="Grasa %" stroke="#FF3D5A" strokeWidth={2}
                              dot={{ fill: '#FF3D5A', r: 3 }}
                              activeDot={{ r: 6, cursor: 'pointer', onClick: handleDotClick('bodyComp') }}
                              style={{ filter: 'drop-shadow(0 0 4px rgba(255,61,90,0.4))' }} />
                            {filteredBodyFat.some(d => d.muscleMass) && (
                              <Line type="monotone" dataKey="muscleMass" name="Músculo kg" stroke="#00FF88" strokeWidth={2}
                                dot={{ fill: '#00FF88', r: 3 }}
                                activeDot={{ r: 6, cursor: 'pointer', onClick: handleDotClick('bodyComp') }}
                                style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.4))' }} />
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
                      {/* Dot detail panel */}
                      {dotDetail?.type === 'bodyComp' && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 rounded-xl px-4 py-3"
                          style={{ background: '#14141F', border: '1px solid rgba(255,61,90,0.22)' }}
                        >
                          <p className="text-[10px] text-text-muted">{dotDetail.rawDate ? new Date(dotDetail.rawDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : dotDetail.date}</p>
                          <div className="mt-1 flex gap-4">
                            {dotDetail.bodyFat != null && (
                              <p className="font-mono text-sm font-bold" style={{ color: '#FF3D5A' }}>{dotDetail.bodyFat}%</p>
                            )}
                            {dotDetail.muscleMass != null && (
                              <p className="font-mono text-sm font-bold" style={{ color: '#00FF88' }}>{dotDetail.muscleMass} kg</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </section>
              )}

              {/* Measurements chart */}
              {measurementData.length > 2 && (
                <section className="mb-8">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{EMOJI_ASSETS.bicep}</span>
                      <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                        Medidas corporales
                      </h2>
                    </div>
                    <TimeRangeSelector selected={bodyMeasTimeRange} onChange={(r) => { setBodyMeasTimeRange(r); setDotDetail(null) }} color="#BF00FF" />
                  </div>
                  {filteredMeasurements.length < 2 ? (
                    <div className="card py-8 text-center text-xs text-text-muted">
                      Sin datos en este rango temporal
                    </div>
                  ) : (
                    <>
                      <div className="card">
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={filteredMeasurements}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="date" stroke="#555568" fontSize={10} />
                            <YAxis stroke="#555568" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="chest" name="Pecho" stroke="#00F0FF" strokeWidth={1.5}
                              dot={{ r: 2 }} activeDot={{ r: 6, cursor: 'pointer', onClick: handleDotClick('measurements') }} />
                            <Line type="monotone" dataKey="waist" name="Cintura" stroke="#FF8C00" strokeWidth={1.5}
                              dot={{ r: 2 }} activeDot={{ r: 6, cursor: 'pointer', onClick: handleDotClick('measurements') }} />
                            <Line type="monotone" dataKey="bicep" name="Bícep" stroke="#BF00FF" strokeWidth={1.5}
                              dot={{ r: 2 }} activeDot={{ r: 6, cursor: 'pointer', onClick: handleDotClick('measurements') }} />
                            <Line type="monotone" dataKey="thigh" name="Muslo" stroke="#00FF88" strokeWidth={1.5}
                              dot={{ r: 2 }} activeDot={{ r: 6, cursor: 'pointer', onClick: handleDotClick('measurements') }} />
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
                      {/* Dot detail panel */}
                      {dotDetail?.type === 'measurements' && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 rounded-xl px-4 py-3"
                          style={{ background: '#14141F', border: '1px solid rgba(191,0,255,0.22)' }}
                        >
                          <p className="text-[10px] text-text-muted">{dotDetail.rawDate ? new Date(dotDetail.rawDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : dotDetail.date}</p>
                          <div className="mt-1 flex flex-wrap gap-3">
                            {dotDetail.chest != null && <p className="text-xs"><span className="font-mono font-bold" style={{ color: '#00F0FF' }}>{dotDetail.chest}</span> <span className="text-text-muted">pecho</span></p>}
                            {dotDetail.waist != null && <p className="text-xs"><span className="font-mono font-bold" style={{ color: '#FF8C00' }}>{dotDetail.waist}</span> <span className="text-text-muted">cintura</span></p>}
                            {dotDetail.bicep != null && <p className="text-xs"><span className="font-mono font-bold" style={{ color: '#BF00FF' }}>{dotDetail.bicep}</span> <span className="text-text-muted">bícep</span></p>}
                            {dotDetail.thigh != null && <p className="text-xs"><span className="font-mono font-bold" style={{ color: '#00FF88' }}>{dotDetail.thigh}</span> <span className="text-text-muted">muslo</span></p>}
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </section>
              )}

              {/* Body metrics history list (collapsible) */}
              {metrics.length > 0 && (
                <section className="mb-8">
                  <button
                    onClick={() => setShowHistory(h => !h)}
                    className="mb-3 flex w-full items-center gap-2 text-left"
                  >
                    <Calendar size={16} style={{ color: userColor }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.2em] text-text-secondary">
                      Historial de mediciones
                    </h2>
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-text-muted"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {metrics.length}
                    </span>
                    <motion.div className="ml-auto" animate={{ rotate: showHistory ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={14} className="text-text-muted" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {showHistory && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1.5">
                          {[...metrics].reverse().map((m, i) => {
                            const date = new Date(m.date)
                            const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                            const fields = []
                            if (m.weight) fields.push({ label: 'Peso', value: `${m.weight}kg`, color: userColor })
                            if (m.body_fat_pct) fields.push({ label: 'Grasa', value: `${m.body_fat_pct}%`, color: '#FF3D5A' })
                            if (m.muscle_mass) fields.push({ label: 'Músculo', value: `${m.muscle_mass}kg`, color: '#00FF88' })
                            if (m.chest) fields.push({ label: 'Pecho', value: `${m.chest}cm`, color: '#00F0FF' })
                            if (m.waist) fields.push({ label: 'Cintura', value: `${m.waist}cm`, color: '#FF8C00' })
                            if (m.hip) fields.push({ label: 'Cadera', value: `${m.hip}cm`, color: '#FFD700' })
                            if (m.bicep_right) fields.push({ label: 'Bícep D', value: `${m.bicep_right}cm`, color: '#BF00FF' })
                            if (m.bicep_left) fields.push({ label: 'Bícep I', value: `${m.bicep_left}cm`, color: '#BF00FF' })
                            if (m.thigh_right) fields.push({ label: 'Muslo D', value: `${m.thigh_right}cm`, color: '#00FF88' })
                            if (m.thigh_left) fields.push({ label: 'Muslo I', value: `${m.thigh_left}cm`, color: '#00FF88' })
                            if (m.calf) fields.push({ label: 'Gemelo', value: `${m.calf}cm`, color: '#555568' })
                            if (m.body_water_pct) fields.push({ label: 'Agua', value: `${m.body_water_pct}%`, color: '#00F0FF' })
                            if (m.visceral_fat) fields.push({ label: 'Grasa visc.', value: `${m.visceral_fat}`, color: '#FF3D5A' })
                            if (m.bmr) fields.push({ label: 'Metab.', value: `${m.bmr}kcal`, color: '#FFD700' })
                            if (m.bmi) fields.push({ label: 'IMC', value: `${m.bmi}`, color: '#555568' })

                            return (
                              <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className="rounded-xl px-3 py-2.5"
                                style={{ background: '#14141F', border: '1px solid rgba(255,255,255,0.04)' }}
                              >
                                <div className="mb-1.5 flex items-center justify-between">
                                  <p className="text-[11px] font-semibold text-text-secondary">{dateStr}</p>
                                  <button
                                    onClick={() => {
                                      if (window.confirm('¿Eliminar esta medición?')) deleteMetric(m.id)
                                    }}
                                    className="rounded p-1 text-text-muted transition hover:text-neon-red"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                  {fields.map(f => (
                                    <div key={f.label} className="flex items-baseline gap-1 text-[10px]">
                                      <span className="text-text-muted">{f.label}</span>
                                      <span className="font-mono font-bold" style={{ color: f.color }}>{f.value}</span>
                                    </div>
                                  ))}
                                </div>
                                {fields.length === 0 && (
                                  <p className="text-[10px] italic text-text-muted">Sin datos registrados</p>
                                )}
                              </motion.div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
