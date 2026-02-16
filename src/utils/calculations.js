// ============================================
// 1RM ESTIMATIONS
// ============================================

// Epley (best for 2-5 reps)
export function estimated1RM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

// Brzycki (best for 6-10 reps)
export function brzycki1RM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  return Math.round((weight * 36 / (37 - reps)) * 10) / 10
}

// Average of Epley + Brzycki for best accuracy
export function bestEstimate1RM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0
  if (reps === 1) return weight
  if (reps > 12) return estimated1RM(weight, reps)
  return Math.round(((estimated1RM(weight, reps) + brzycki1RM(weight, reps)) / 2) * 10) / 10
}

// Weight for target reps at given 1RM (inverse Epley)
export function weightForReps(oneRM, targetReps) {
  if (targetReps === 1) return oneRM
  return Math.round((oneRM / (1 + targetReps / 30)) * 10) / 10
}

// ============================================
// VOLUME & PROGRESSIVE OVERLOAD
// ============================================

export function workoutVolume(sets) {
  return sets
    .filter(s => s.set_type !== 'warmup' && s.completed)
    .reduce((sum, s) => sum + (s.reps || 0) * (s.weight || 0), 0)
}

// Training density: kg per minute
export function trainingDensity(volumeLoad, durationMinutes) {
  if (!durationMinutes || durationMinutes <= 0) return 0
  return Math.round((volumeLoad / durationMinutes) * 10) / 10
}

// Hard sets count (excluding warmups)
export function hardSets(exerciseSets) {
  return exerciseSets.filter(s => s.set_type !== 'warmup' && s.completed).length
}

// Detect progressive overload between two sessions
export function detectOverload(currentSets, previousSets) {
  const curr = currentSets.filter(s => s.set_type !== 'warmup' && s.completed)
  const prev = previousSets.filter(s => s.set_type !== 'warmup' && s.completed)
  if (!curr.length || !prev.length) return null

  const currMax = Math.max(...curr.map(s => bestEstimate1RM(s.weight, s.reps)))
  const prevMax = Math.max(...prev.map(s => bestEstimate1RM(s.weight, s.reps)))
  const currVol = curr.reduce((sum, s) => sum + (s.reps || 0) * (s.weight || 0), 0)
  const prevVol = prev.reduce((sum, s) => sum + (s.reps || 0) * (s.weight || 0), 0)

  return {
    e1rmIncrease: currMax > prevMax,
    volumeIncrease: currVol > prevVol,
    e1rmDelta: Math.round((currMax - prevMax) * 10) / 10,
    volumeDelta: Math.round(currVol - prevVol),
  }
}

// ============================================
// VOLUME LANDMARKS (Dr. Mike Israetel / RP Strength)
// Sets per week per muscle group
// ============================================

export const VOLUME_LANDMARKS = {
  'Pecho':      { mv: 4,  mev: 6,  mavLow: 12, mavHigh: 20, mrv: 22 },
  'Espalda':    { mv: 8,  mev: 10, mavLow: 14, mavHigh: 22, mrv: 25 },
  'Hombros':    { mv: 0,  mev: 8,  mavLow: 16, mavHigh: 22, mrv: 26 },
  'Bíceps':     { mv: 5,  mev: 8,  mavLow: 14, mavHigh: 20, mrv: 26 },
  'Tríceps':    { mv: 4,  mev: 6,  mavLow: 10, mavHigh: 14, mrv: 18 },
  'Cuádriceps': { mv: 6,  mev: 8,  mavLow: 12, mavHigh: 18, mrv: 20 },
  'Femoral':    { mv: 4,  mev: 6,  mavLow: 10, mavHigh: 16, mrv: 20 },
  'Glúteo':     { mv: 0,  mev: 0,  mavLow: 4,  mavHigh: 12, mrv: 16 },
  'Gemelos':    { mv: 6,  mev: 8,  mavLow: 12, mavHigh: 16, mrv: 20 },
  'Core':       { mv: 0,  mev: 0,  mavLow: 8,  mavHigh: 16, mrv: 25 },
}

// Per-exercise weekly set targets (recommended sets/week)
export const EXERCISE_VOLUME_LANDMARKS = {
  // === PECHO ===
  'Press Banca':                { low: 2, good: 4, optimal: 6, high: 8, excessive: 10 },
  'Press Inclinado Mancuernas': { low: 2, good: 3, optimal: 5, high: 7, excessive: 9 },
  'Aperturas con Poleas':       { low: 2, good: 3, optimal: 4, high: 6, excessive: 8 },
  'Fondos en Paralelas':        { low: 2, good: 3, optimal: 5, high: 7, excessive: 9 },
  // === HOMBROS ===
  'Press Militar':              { low: 2, good: 4, optimal: 6, high: 8, excessive: 10 },
  'Elevaciones Laterales':      { low: 3, good: 5, optimal: 8, high: 10, excessive: 14 },
  'Face Pull':                  { low: 2, good: 4, optimal: 6, high: 8, excessive: 10 },
  'Pájaros (Reverse Fly)':     { low: 2, good: 3, optimal: 5, high: 7, excessive: 9 },
  // === TRÍCEPS ===
  'Extensión de Tríceps en Polea': { low: 2, good: 3, optimal: 5, high: 7, excessive: 9 },
  'Press Francés':              { low: 2, good: 3, optimal: 4, high: 6, excessive: 8 },
  'Fondos en Banco':            { low: 2, good: 3, optimal: 4, high: 6, excessive: 8 },
  // === ESPALDA ===
  'Dominadas':                  { low: 2, good: 4, optimal: 6, high: 8, excessive: 10 },
  'Jalón al Pecho':             { low: 2, good: 4, optimal: 6, high: 8, excessive: 10 },
  'Remo con Barra':             { low: 2, good: 4, optimal: 6, high: 8, excessive: 10 },
  'Remo en Polea Baja':         { low: 2, good: 3, optimal: 5, high: 7, excessive: 9 },
  'Remo con Mancuerna':         { low: 2, good: 3, optimal: 5, high: 7, excessive: 9 },
  // === BÍCEPS ===
  'Curl con Barra':             { low: 2, good: 4, optimal: 6, high: 8, excessive: 10 },
  'Curl Martillo':              { low: 2, good: 3, optimal: 5, high: 7, excessive: 9 },
  'Curl en Polea':              { low: 2, good: 3, optimal: 5, high: 7, excessive: 9 },
  'Curl Concentrado':           { low: 2, good: 3, optimal: 4, high: 6, excessive: 8 },
  // === CUÁDRICEPS ===
  'Sentadilla':                 { low: 2, good: 4, optimal: 6, high: 8, excessive: 10 },
  'Prensa de Piernas':          { low: 2, good: 4, optimal: 6, high: 8, excessive: 10 },
  'Extensión de Cuádriceps':    { low: 2, good: 3, optimal: 5, high: 7, excessive: 9 },
  'Sentadilla Búlgara':         { low: 2, good: 3, optimal: 5, high: 7, excessive: 9 },
  'Zancadas':                   { low: 2, good: 3, optimal: 4, high: 6, excessive: 8 },
  // === FEMORAL ===
  'Curl Femoral Tumbado':       { low: 2, good: 3, optimal: 5, high: 7, excessive: 9 },
  'Peso Muerto Rumano':         { low: 2, good: 4, optimal: 6, high: 8, excessive: 10 },
  'Curl Femoral Sentado':       { low: 2, good: 3, optimal: 5, high: 7, excessive: 9 },
  // === GLÚTEO ===
  'Hip Thrust':                 { low: 2, good: 4, optimal: 6, high: 8, excessive: 10 },
  'Patada de Glúteo en Polea':  { low: 2, good: 3, optimal: 4, high: 6, excessive: 8 },
  // === GEMELOS ===
  'Elevación de Gemelos de Pie':   { low: 3, good: 4, optimal: 6, high: 8, excessive: 12 },
  'Elevación de Gemelos Sentado':  { low: 3, good: 4, optimal: 6, high: 8, excessive: 12 },
  // === CORE ===
  'Plancha':                    { low: 2, good: 3, optimal: 4, high: 6, excessive: 8 },
  'Crunch en Polea':            { low: 2, good: 3, optimal: 5, high: 7, excessive: 10 },
  'Elevación de Piernas':       { low: 2, good: 3, optimal: 5, high: 7, excessive: 10 },
  'Russian Twist':              { low: 2, good: 3, optimal: 4, high: 6, excessive: 8 },
  'Ab Wheel':                   { low: 2, good: 3, optimal: 4, high: 6, excessive: 8 },
}

export function evaluateExerciseVolume(exercise, weeklySets) {
  const l = EXERCISE_VOLUME_LANDMARKS[exercise]
  if (!l) return { zone: 'unknown', color: '#555568', label: 'Sin referencia' }
  if (weeklySets < l.low) return { zone: 'low', color: '#FF3D5A', label: 'Bajo' }
  if (weeklySets < l.good) return { zone: 'minimum', color: '#FF8C00', label: 'Mínimo' }
  if (weeklySets < l.optimal) return { zone: 'good', color: '#FFD700', label: 'Bueno' }
  if (weeklySets <= l.high) return { zone: 'optimal', color: '#00FF88', label: 'Óptimo' }
  if (weeklySets <= l.excessive) return { zone: 'high', color: '#FF8C00', label: 'Alto' }
  return { zone: 'excessive', color: '#FF3D5A', label: 'Excesivo' }
}

export function evaluateVolume(muscleGroup, weeklySets) {
  const l = VOLUME_LANDMARKS[muscleGroup]
  if (!l) return { zone: 'unknown', color: '#555568', label: 'Desconocido' }
  if (weeklySets < l.mv) return { zone: 'below_maintenance', color: '#FF3D5A', label: 'Bajo mantenimiento' }
  if (weeklySets < l.mev) return { zone: 'maintenance', color: '#FF8C00', label: 'Mantenimiento' }
  if (weeklySets < l.mavLow) return { zone: 'below_optimal', color: '#FFD700', label: 'Sub-óptimo' }
  if (weeklySets <= l.mavHigh) return { zone: 'optimal', color: '#00FF88', label: 'Óptimo (MAV)' }
  if (weeklySets <= l.mrv) return { zone: 'near_mrv', color: '#FF8C00', label: 'Cerca de MRV' }
  return { zone: 'exceeds_mrv', color: '#FF3D5A', label: 'Excede MRV' }
}

// ============================================
// STRENGTH STANDARDS (bodyweight ratios, men)
// ============================================

export const STRENGTH_STANDARDS = {
  // === PECHO ===
  'Press Banca':                { beginner: 0.50, novice: 0.75, intermediate: 1.00, advanced: 1.25, elite: 1.50 },
  'Press Inclinado Mancuernas': { beginner: 0.15, novice: 0.25, intermediate: 0.35, advanced: 0.50, elite: 0.65 },
  'Aperturas con Poleas':       { beginner: 0.08, novice: 0.13, intermediate: 0.20, advanced: 0.28, elite: 0.38 },
  'Fondos en Paralelas':        { beginner: 0.50, novice: 0.75, intermediate: 1.00, advanced: 1.30, elite: 1.60 },
  // === HOMBROS ===
  'Press Militar':              { beginner: 0.30, novice: 0.45, intermediate: 0.65, advanced: 0.85, elite: 1.10 },
  'Elevaciones Laterales':      { beginner: 0.05, novice: 0.08, intermediate: 0.13, advanced: 0.18, elite: 0.25 },
  'Face Pull':                  { beginner: 0.10, novice: 0.18, intermediate: 0.25, advanced: 0.35, elite: 0.45 },
  'Pájaros (Reverse Fly)':     { beginner: 0.05, novice: 0.08, intermediate: 0.12, advanced: 0.18, elite: 0.25 },
  // === TRÍCEPS ===
  'Extensión de Tríceps en Polea': { beginner: 0.12, novice: 0.20, intermediate: 0.30, advanced: 0.42, elite: 0.55 },
  'Press Francés':              { beginner: 0.15, novice: 0.25, intermediate: 0.38, advanced: 0.50, elite: 0.65 },
  'Fondos en Banco':            { beginner: 0.40, novice: 0.60, intermediate: 0.80, advanced: 1.00, elite: 1.25 },
  // === ESPALDA ===
  'Dominadas':                  { beginner: 0.50, novice: 0.75, intermediate: 1.00, advanced: 1.30, elite: 1.60 },
  'Jalón al Pecho':             { beginner: 0.35, novice: 0.55, intermediate: 0.75, advanced: 1.00, elite: 1.25 },
  'Remo con Barra':             { beginner: 0.40, novice: 0.60, intermediate: 0.80, advanced: 1.05, elite: 1.30 },
  'Remo en Polea Baja':         { beginner: 0.35, novice: 0.50, intermediate: 0.70, advanced: 0.90, elite: 1.15 },
  'Remo con Mancuerna':         { beginner: 0.15, novice: 0.25, intermediate: 0.38, advanced: 0.50, elite: 0.65 },
  // === BÍCEPS ===
  'Curl con Barra':             { beginner: 0.15, novice: 0.28, intermediate: 0.40, advanced: 0.55, elite: 0.70 },
  'Curl Martillo':              { beginner: 0.10, novice: 0.18, intermediate: 0.28, advanced: 0.38, elite: 0.50 },
  'Curl en Polea':              { beginner: 0.10, novice: 0.18, intermediate: 0.25, advanced: 0.35, elite: 0.48 },
  'Curl Concentrado':           { beginner: 0.06, novice: 0.10, intermediate: 0.16, advanced: 0.22, elite: 0.30 },
  // === CUÁDRICEPS ===
  'Sentadilla':                 { beginner: 0.60, novice: 0.85, intermediate: 1.15, advanced: 1.50, elite: 1.85 },
  'Prensa de Piernas':          { beginner: 1.00, novice: 1.60, intermediate: 2.25, advanced: 3.00, elite: 3.80 },
  'Extensión de Cuádriceps':    { beginner: 0.20, novice: 0.35, intermediate: 0.50, advanced: 0.70, elite: 0.90 },
  'Sentadilla Búlgara':         { beginner: 0.15, novice: 0.25, intermediate: 0.40, advanced: 0.55, elite: 0.70 },
  'Zancadas':                   { beginner: 0.15, novice: 0.25, intermediate: 0.38, advanced: 0.50, elite: 0.65 },
  // === FEMORAL ===
  'Curl Femoral Tumbado':       { beginner: 0.15, novice: 0.25, intermediate: 0.38, advanced: 0.50, elite: 0.65 },
  'Peso Muerto Rumano':         { beginner: 0.50, novice: 0.75, intermediate: 1.00, advanced: 1.35, elite: 1.70 },
  'Curl Femoral Sentado':       { beginner: 0.15, novice: 0.25, intermediate: 0.38, advanced: 0.50, elite: 0.65 },
  // === GLÚTEO ===
  'Hip Thrust':                 { beginner: 0.50, novice: 0.85, intermediate: 1.25, advanced: 1.70, elite: 2.20 },
  'Patada de Glúteo en Polea':  { beginner: 0.10, novice: 0.18, intermediate: 0.28, advanced: 0.38, elite: 0.50 },
  // === GEMELOS ===
  'Elevación de Gemelos de Pie':    { beginner: 0.40, novice: 0.65, intermediate: 0.90, advanced: 1.20, elite: 1.50 },
  'Elevación de Gemelos Sentado':   { beginner: 0.25, novice: 0.40, intermediate: 0.60, advanced: 0.80, elite: 1.05 },
  // === CORE ===
  'Plancha':                    { beginner: 0.00, novice: 0.05, intermediate: 0.13, advanced: 0.20, elite: 0.30 },
  'Crunch en Polea':            { beginner: 0.15, novice: 0.25, intermediate: 0.40, advanced: 0.55, elite: 0.70 },
  'Elevación de Piernas':       { beginner: 0.00, novice: 0.05, intermediate: 0.10, advanced: 0.18, elite: 0.25 },
  'Russian Twist':              { beginner: 0.06, novice: 0.10, intermediate: 0.18, advanced: 0.25, elite: 0.35 },
  'Ab Wheel':                   { beginner: 0.30, novice: 0.50, intermediate: 0.70, advanced: 0.90, elite: 1.10 },
}

export function classifyStrength(exercise, e1rm, bodyweight) {
  const standards = STRENGTH_STANDARDS[exercise]
  if (!standards || !bodyweight || bodyweight <= 0) return null

  const ratio = Math.round((e1rm / bodyweight) * 100) / 100
  const levels = Object.entries(standards)

  let level = 'Sin clasificar'
  let nextLevel = levels[0][0]
  let progress = 0

  for (let i = 0; i < levels.length; i++) {
    const [name, threshold] = levels[i]
    if (ratio >= threshold) {
      level = name
      if (i < levels.length - 1) {
        nextLevel = levels[i + 1][0]
        progress = Math.round(((ratio - threshold) / (levels[i + 1][1] - threshold)) * 100)
      } else {
        nextLevel = null
        progress = 100
      }
    }
  }
  return { level, ratio, nextLevel, progress: Math.min(progress, 100) }
}

// ============================================
// BODY COMPOSITION
// ============================================

// Exponential Moving Average (MacroFactor-style)
export function exponentialMovingAverage(values, window = 10) {
  if (!values || values.length === 0) return []
  const alpha = 2 / (window + 1)
  const result = [values[0]]
  for (let i = 1; i < values.length; i++) {
    result.push(Math.round(((values[i] - result[i - 1]) * alpha + result[i - 1]) * 100) / 100)
  }
  return result
}

// Simple Moving Average
export function weightMovingAverage(metrics, windowSize = 7) {
  if (metrics.length < windowSize) return metrics.map(m => m.weight)
  const result = []
  for (let i = 0; i < metrics.length; i++) {
    const start = Math.max(0, i - windowSize + 1)
    const win = metrics.slice(start, i + 1)
    const avg = win.reduce((s, m) => s + (m.weight || 0), 0) / win.length
    result.push(Math.round(avg * 10) / 10)
  }
  return result
}

// FFMI (Fat-Free Mass Index) - better than BMI for lifters
export function calculateFFMI(weightKg, heightCm, bodyFatPct) {
  if (!weightKg || !heightCm || bodyFatPct == null) return null
  const heightM = heightCm / 100
  const fatFreeMass = weightKg * (1 - bodyFatPct / 100)
  const ffmi = fatFreeMass / (heightM * heightM)
  const normalized = ffmi + 6.1 * (1.80 - heightM)

  let classification = 'Por debajo de la media'
  if (normalized >= 26) classification = 'Élite'
  else if (normalized >= 23) classification = 'Superior'
  else if (normalized >= 22) classification = 'Excelente'
  else if (normalized >= 20) classification = 'Por encima de la media'
  else if (normalized >= 18) classification = 'Media'

  return {
    ffmi: Math.round(ffmi * 10) / 10,
    normalized: Math.round(normalized * 10) / 10,
    classification,
  }
}

// Body recomposition detection
export function detectRecomposition(metrics) {
  if (!metrics || metrics.length < 4) return null
  const first = metrics[0]
  const last = metrics[metrics.length - 1]
  if (!first.weight || !last.weight || !first.body_fat_pct || !last.body_fat_pct) return null

  const weightDelta = last.weight - first.weight
  const bfDelta = last.body_fat_pct - first.body_fat_pct
  const leanFirst = first.weight * (1 - first.body_fat_pct / 100)
  const leanLast = last.weight * (1 - last.body_fat_pct / 100)
  const leanDelta = leanLast - leanFirst
  const fatFirst = first.weight * (first.body_fat_pct / 100)
  const fatLast = last.weight * (last.body_fat_pct / 100)
  const fatDelta = fatLast - fatFirst

  const weightChangePct = Math.abs((weightDelta / first.weight) * 100)
  const isRecomp = weightChangePct < 3 && bfDelta < -1

  return {
    detected: isRecomp,
    weightDelta: Math.round(weightDelta * 10) / 10,
    bodyFatDelta: Math.round(bfDelta * 10) / 10,
    leanMassDelta: Math.round(leanDelta * 10) / 10,
    fatMassDelta: Math.round(fatDelta * 10) / 10,
    phase: bfDelta < -1 ? (weightDelta > 1 ? 'Volumen limpio' : isRecomp ? 'Recomposición' : 'Definición')
      : weightDelta > 1 ? 'Volumen' : 'Mantenimiento',
  }
}

// DOTS score (normalized strength comparison)
const DOTS_COEFF = {
  a: -0.0000010930, b: 0.0007391293, c: -0.1918759221,
  d: 24.0900756, e: -307.75076,
}
export function dotsScore(liftKg, bodyweightKg) {
  if (!liftKg || !bodyweightKg) return 0
  const bw = bodyweightKg
  const denom = DOTS_COEFF.a * bw ** 4 + DOTS_COEFF.b * bw ** 3 +
    DOTS_COEFF.c * bw ** 2 + DOTS_COEFF.d * bw + DOTS_COEFF.e
  return Math.round((liftKg * 500 / denom) * 100) / 100
}

// ============================================
// STREAKS & CONSISTENCY
// ============================================

export function calculateStreak(entries) {
  if (!entries.length) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dateSet = new Set(
    entries.filter(e => e.completed).map(e => {
      const d = new Date(e.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )

  let streak = 0
  const day = new Date(today)

  while (true) {
    if (dateSet.has(day.getTime())) {
      streak++
      day.setDate(day.getDate() - 1)
    } else if (streak === 0) {
      day.setDate(day.getDate() - 1)
      if (dateSet.has(day.getTime())) {
        streak++
        day.setDate(day.getDate() - 1)
      } else break
    } else break
  }
  return streak
}

// Consistency score (0-100)
export function consistencyScore({ completedWorkouts, plannedWorkouts, habitsCompleted, habitsExpected, longestStreak, periodDays }) {
  const workoutAdh = plannedWorkouts > 0 ? (completedWorkouts / plannedWorkouts) * 100 : 0
  const habitAdh = habitsExpected > 0 ? (habitsCompleted / habitsExpected) * 100 : 0
  const streakScore = Math.min((longestStreak / periodDays) * 100, 100)
  return Math.min(Math.round(workoutAdh * 0.45 + habitAdh * 0.35 + streakScore * 0.20), 100)
}

// ============================================
// HELPERS
// ============================================

export function todayCompletion(entries, configs, dateStr) {
  const todayEntries = entries.filter(e => e.date === dateStr && e.completed)
  const activeConfigs = configs.filter(c => c.active)
  if (activeConfigs.length === 0) return 0
  return Math.round((todayEntries.length / activeConfigs.length) * 100)
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function formatWeight(kg) {
  if (!kg) return '—'
  return kg % 1 === 0 ? `${kg}kg` : `${kg.toFixed(1)}kg`
}

// ============================================
// GAMIFICATION - XP & LEVELS
// ============================================

// XP required to reach a given level (cumulative)
export function xpForLevel(level) {
  if (level <= 1) return 0
  return Math.floor(75 * Math.pow(level - 1, 1.8))
}

// Get current level from total XP
export function levelFromXP(totalXP) {
  let level = 1
  while (xpForLevel(level + 1) <= totalXP) level++
  return level
}

// Progress percentage within current level
export function levelProgress(totalXP) {
  const level = levelFromXP(totalXP)
  const currentThreshold = xpForLevel(level)
  const nextThreshold = xpForLevel(level + 1)
  if (nextThreshold <= currentThreshold) return 100
  return Math.round(((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100)
}

// Calculate XP breakdown from user stats
export function calculateXP({
  workoutCount = 0,
  habitCompletions = 0,
  allHabitsDays = 0,
  prCount = 0,
  uniqueExercises = 0,
  bodyMetricEntries = 0,
  streak = 0,
  weightIncreases = 0,
  tonnageTons = 0,
}) {
  const breakdown = []

  const workoutXP = workoutCount * 100
  if (workoutXP > 0) breakdown.push({ source: 'Entrenos completados', xp: workoutXP, count: workoutCount })

  const habitXP = habitCompletions * 20
  if (habitXP > 0) breakdown.push({ source: 'Hábitos completados', xp: habitXP, count: habitCompletions })

  const allHabitsXP = allHabitsDays * 50
  if (allHabitsXP > 0) breakdown.push({ source: 'Días perfectos (todos los hábitos)', xp: allHabitsXP, count: allHabitsDays })

  const prXP = prCount * 200
  if (prXP > 0) breakdown.push({ source: 'Records personales', xp: prXP, count: prCount })

  const exerciseXP = uniqueExercises * 75
  if (exerciseXP > 0) breakdown.push({ source: 'Ejercicios desbloqueados', xp: exerciseXP, count: uniqueExercises })

  const metricsXP = bodyMetricEntries * 30
  if (metricsXP > 0) breakdown.push({ source: 'Mediciones corporales', xp: metricsXP, count: bodyMetricEntries })

  const weightXP = weightIncreases * 50
  if (weightXP > 0) breakdown.push({ source: 'Incrementos de peso', xp: weightXP, count: weightIncreases })

  // Tonnage milestones (every 5 tons = 100 XP)
  const tonnageMilestones = Math.floor(tonnageTons / 5)
  const tonnageXP = tonnageMilestones * 100
  if (tonnageXP > 0) breakdown.push({ source: 'Hitos de tonelaje (cada 5t)', xp: tonnageXP, count: tonnageMilestones })

  // Streak milestones
  let streakXP = 0
  if (streak >= 100) streakXP += 3000
  if (streak >= 30) streakXP += 1000
  if (streak >= 7) streakXP += 300
  if (streakXP > 0) breakdown.push({ source: 'Hitos de racha', xp: streakXP, count: streak })

  const total = breakdown.reduce((sum, b) => sum + b.xp, 0)
  return { total, breakdown: breakdown.sort((a, b) => b.xp - a.xp) }
}

// ============================================
// RIGOR SCORE — adherence to planned routine
// ============================================

export function calculateRigorScore(sessionSets, routineExercises) {
  if (!routineExercises || routineExercises.length === 0) return null

  const planned = routineExercises
  const exerciseMap = {}

  // Group session sets by exercise_id
  sessionSets.forEach(s => {
    const id = s.exercise_id
    if (!exerciseMap[id]) exerciseMap[id] = []
    exerciseMap[id].push(s)
  })

  const details = []
  let totalSetRatio = 0
  let totalWeightRatio = 0
  let exercisesWithWeight = 0
  let exercisesTrained = 0
  let totalExtraSets = 0

  planned.forEach(re => {
    const id = re.exercise_id
    const sets = exerciseMap[id] || []
    const setsDone = sets.length
    const setsTarget = re.sets_target || 1
    const repsTarget = re.reps_target || 0
    const weightTarget = re.weight_target || 0
    const restSeconds = re.rest_seconds || 0

    const exerciseName = re.exercise?.name || 'Ejercicio'
    const muscleGroup = re.exercise?.muscle_group || ''

    const wasTrained = setsDone > 0
    if (wasTrained) exercisesTrained++

    // Set completion ratio (capped at 1 for scoring)
    totalSetRatio += Math.min(setsDone / setsTarget, 1)

    // Extra sets beyond target
    const extras = Math.max(0, setsDone - setsTarget)
    totalExtraSets += extras

    // Weight adherence
    if (weightTarget > 0 && wasTrained) {
      const avgWeight = sets.reduce((sum, s) => sum + (Number(s.weight) || 0), 0) / setsDone
      totalWeightRatio += Math.min(avgWeight / weightTarget, 1)
      exercisesWithWeight++
    }

    const avgWeight = setsDone > 0
      ? Math.round((sets.reduce((sum, s) => sum + (Number(s.weight) || 0), 0) / setsDone) * 10) / 10
      : 0

    const status = !wasTrained ? 'skipped'
      : setsDone > setsTarget ? 'exceeded'
      : setsDone === setsTarget ? 'complete'
      : 'incomplete'

    details.push({
      exerciseId: id,
      exerciseName,
      muscleGroup,
      setsTarget,
      setsDone,
      repsTarget,
      weightTarget,
      avgWeight,
      restSeconds,
      status,
      sets: sets.map(s => ({ reps: s.reps, weight: Number(s.weight) || 0, setNumber: s.set_number })),
    })
  })

  // Collect extra exercises (not in routine)
  const plannedIds = new Set(planned.map(re => re.exercise_id))
  Object.entries(exerciseMap).forEach(([id, sets]) => {
    if (!plannedIds.has(id)) {
      const first = sets[0]
      const avgWeight = Math.round((sets.reduce((sum, s) => sum + (Number(s.weight) || 0), 0) / sets.length) * 10) / 10
      details.push({
        exerciseId: id,
        exerciseName: first.exercise?.name || 'Ejercicio extra',
        muscleGroup: first.exercise?.muscle_group || '',
        setsTarget: 0,
        setsDone: sets.length,
        repsTarget: 0,
        weightTarget: 0,
        avgWeight,
        restSeconds: 0,
        status: 'extra',
        sets: sets.map(s => ({ reps: s.reps, weight: Number(s.weight) || 0, setNumber: s.set_number })),
      })
    }
  })

  const plannedCount = planned.length
  const exerciseCompletion = Math.round((exercisesTrained / plannedCount) * 30)
  const setCompletion = Math.round((totalSetRatio / plannedCount) * 40)
  const weightAdherence = exercisesWithWeight > 0
    ? Math.round((totalWeightRatio / exercisesWithWeight) * 30)
    : 30 // full marks if no weight targets set

  const extraBonus = Math.min(totalExtraSets * 2, 10)
  const score = exerciseCompletion + setCompletion + weightAdherence + extraBonus

  return {
    score,
    exerciseCompletion,
    setCompletion,
    weightAdherence,
    extraSets: totalExtraSets,
    extraBonus,
    details,
  }
}

// Slope of linear regression (for trend detection)
export function linearSlope(values) {
  const n = values.length
  if (n < 2) return 0
  const xMean = (n - 1) / 2
  const yMean = values.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean)
    den += (i - xMean) ** 2
  }
  return den === 0 ? 0 : num / den
}
