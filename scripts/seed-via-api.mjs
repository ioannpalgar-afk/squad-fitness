#!/usr/bin/env node
// =============================================
// SQUAD FITNESS — Seed 6 Meses via Supabase REST API
// Exercises + PPL Routines + 180 days of sessions
// + Body Metrics + Habits for 3 users
// =============================================
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://nsdnlqwmeaiunfiqsrdl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZG5scXdtZWFpdW5maXFzcmRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE2NDMwMiwiZXhwIjoyMDg2NzQwMzAyfQ.0ninTM871kseD0S0F6A8wt5V6G3nhcFIoZeK8HwuzGw'
)

// =============================================
// EXERCISES CATALOG
// =============================================
const EXERCISES = [
  // PUSH (Pecho)
  { id: 'a0000001-0000-0000-0000-000000000001', name: 'Press Banca', muscle_group: 'Pecho' },
  { id: 'a0000001-0000-0000-0000-000000000002', name: 'Press Inclinado Mancuernas', muscle_group: 'Pecho' },
  { id: 'a0000001-0000-0000-0000-000000000003', name: 'Aperturas con Poleas', muscle_group: 'Pecho' },
  { id: 'a0000001-0000-0000-0000-000000000004', name: 'Fondos en Paralelas', muscle_group: 'Pecho' },
  // PUSH (Hombros)
  { id: 'a0000002-0000-0000-0000-000000000001', name: 'Press Militar', muscle_group: 'Hombros' },
  { id: 'a0000002-0000-0000-0000-000000000002', name: 'Elevaciones Laterales', muscle_group: 'Hombros' },
  { id: 'a0000002-0000-0000-0000-000000000003', name: 'Face Pull', muscle_group: 'Hombros' },
  { id: 'a0000002-0000-0000-0000-000000000004', name: 'Pájaros (Reverse Fly)', muscle_group: 'Hombros' },
  // PUSH (Tríceps)
  { id: 'a0000003-0000-0000-0000-000000000001', name: 'Extensión de Tríceps en Polea', muscle_group: 'Tríceps' },
  { id: 'a0000003-0000-0000-0000-000000000002', name: 'Press Francés', muscle_group: 'Tríceps' },
  { id: 'a0000003-0000-0000-0000-000000000003', name: 'Fondos en Banco', muscle_group: 'Tríceps' },
  // PULL (Espalda)
  { id: 'a0000004-0000-0000-0000-000000000001', name: 'Dominadas', muscle_group: 'Espalda' },
  { id: 'a0000004-0000-0000-0000-000000000002', name: 'Jalón al Pecho', muscle_group: 'Espalda' },
  { id: 'a0000004-0000-0000-0000-000000000003', name: 'Remo con Barra', muscle_group: 'Espalda' },
  { id: 'a0000004-0000-0000-0000-000000000004', name: 'Remo en Polea Baja', muscle_group: 'Espalda' },
  { id: 'a0000004-0000-0000-0000-000000000005', name: 'Remo con Mancuerna', muscle_group: 'Espalda' },
  // PULL (Bíceps)
  { id: 'a0000005-0000-0000-0000-000000000001', name: 'Curl con Barra', muscle_group: 'Bíceps' },
  { id: 'a0000005-0000-0000-0000-000000000002', name: 'Curl Martillo', muscle_group: 'Bíceps' },
  { id: 'a0000005-0000-0000-0000-000000000003', name: 'Curl en Polea', muscle_group: 'Bíceps' },
  { id: 'a0000005-0000-0000-0000-000000000004', name: 'Curl Concentrado', muscle_group: 'Bíceps' },
  // LEGS (Cuádriceps)
  { id: 'a0000006-0000-0000-0000-000000000001', name: 'Sentadilla', muscle_group: 'Cuádriceps' },
  { id: 'a0000006-0000-0000-0000-000000000002', name: 'Prensa de Piernas', muscle_group: 'Cuádriceps' },
  { id: 'a0000006-0000-0000-0000-000000000003', name: 'Extensión de Cuádriceps', muscle_group: 'Cuádriceps' },
  { id: 'a0000006-0000-0000-0000-000000000004', name: 'Sentadilla Búlgara', muscle_group: 'Cuádriceps' },
  { id: 'a0000006-0000-0000-0000-000000000005', name: 'Zancadas', muscle_group: 'Cuádriceps' },
  // LEGS (Femoral)
  { id: 'a0000007-0000-0000-0000-000000000001', name: 'Curl Femoral Tumbado', muscle_group: 'Femoral' },
  { id: 'a0000007-0000-0000-0000-000000000002', name: 'Peso Muerto Rumano', muscle_group: 'Femoral' },
  { id: 'a0000007-0000-0000-0000-000000000003', name: 'Curl Femoral Sentado', muscle_group: 'Femoral' },
  // LEGS (Glúteo)
  { id: 'a0000008-0000-0000-0000-000000000001', name: 'Hip Thrust', muscle_group: 'Glúteo' },
  { id: 'a0000008-0000-0000-0000-000000000002', name: 'Patada de Gluteo en Polea', muscle_group: 'Glúteo' },
  // LEGS (Gemelos)
  { id: 'a0000009-0000-0000-0000-000000000001', name: 'Elevación de Gemelos de Pie', muscle_group: 'Gemelos' },
  { id: 'a0000009-0000-0000-0000-000000000002', name: 'Elevación de Gemelos Sentado', muscle_group: 'Gemelos' },
  // CORE
  { id: 'a000000a-0000-0000-0000-000000000001', name: 'Plancha', muscle_group: 'Core' },
  { id: 'a000000a-0000-0000-0000-000000000002', name: 'Crunch en Polea', muscle_group: 'Core' },
  { id: 'a000000a-0000-0000-0000-000000000003', name: 'Elevación de Piernas', muscle_group: 'Core' },
  { id: 'a000000a-0000-0000-0000-000000000004', name: 'Russian Twist', muscle_group: 'Core' },
  { id: 'a000000a-0000-0000-0000-000000000005', name: 'Ab Wheel', muscle_group: 'Core' },
]

// =============================================
// ROUTINE DEFINITIONS (exercises + targets per routine)
// =============================================
// Starting weights: [Juan, Cristóbal, Antonio]
const PUSH_EXERCISES = [
  { eid: 'a0000001-0000-0000-0000-000000000001', sets: 4, reps: 8,  weights: [60, 70, 40] },  // Press Banca
  { eid: 'a0000001-0000-0000-0000-000000000002', sets: 4, reps: 10, weights: [22, 26, 16] },  // Press Inclinado
  { eid: 'a0000001-0000-0000-0000-000000000003', sets: 3, reps: 12, weights: [15, 18, 10] },  // Aperturas
  { eid: 'a0000002-0000-0000-0000-000000000001', sets: 4, reps: 8,  weights: [40, 45, 30] },  // Press Militar
  { eid: 'a0000002-0000-0000-0000-000000000002', sets: 4, reps: 15, weights: [10, 12, 8] },   // Elev Laterales
  { eid: 'a0000002-0000-0000-0000-000000000003', sets: 3, reps: 15, weights: [15, 18, 12] },  // Face Pull
  { eid: 'a0000003-0000-0000-0000-000000000001', sets: 3, reps: 12, weights: [25, 30, 18] },  // Triceps Polea
  { eid: 'a0000003-0000-0000-0000-000000000002', sets: 3, reps: 10, weights: [20, 25, 15] },  // Press Frances
]

const PULL_EXERCISES = [
  { eid: 'a0000004-0000-0000-0000-000000000001', sets: 4, reps: 8,  weights: [0, 0, 0] },     // Dominadas
  { eid: 'a0000004-0000-0000-0000-000000000002', sets: 4, reps: 10, weights: [55, 60, 40] },  // Jalón
  { eid: 'a0000004-0000-0000-0000-000000000003', sets: 4, reps: 8,  weights: [60, 70, 45] },  // Remo Barra
  { eid: 'a0000004-0000-0000-0000-000000000004', sets: 3, reps: 12, weights: [45, 50, 35] },  // Remo Polea
  { eid: 'a0000005-0000-0000-0000-000000000001', sets: 3, reps: 10, weights: [30, 35, 20] },  // Curl Barra
  { eid: 'a0000005-0000-0000-0000-000000000002', sets: 3, reps: 12, weights: [14, 16, 10] },  // Curl Martillo
  { eid: 'a0000005-0000-0000-0000-000000000003', sets: 3, reps: 12, weights: [20, 22, 15] },  // Curl Polea
]

const LEGS_EXERCISES = [
  { eid: 'a0000006-0000-0000-0000-000000000001', sets: 4, reps: 8,  weights: [80, 90, 60] },   // Sentadilla
  { eid: 'a0000006-0000-0000-0000-000000000002', sets: 4, reps: 10, weights: [120, 140, 90] }, // Prensa
  { eid: 'a0000006-0000-0000-0000-000000000003', sets: 3, reps: 12, weights: [40, 45, 30] },   // Ext Cuad
  { eid: 'a0000007-0000-0000-0000-000000000001', sets: 4, reps: 10, weights: [30, 35, 25] },   // Curl Fem
  { eid: 'a0000007-0000-0000-0000-000000000002', sets: 4, reps: 8,  weights: [60, 70, 50] },   // Peso Muerto Rum
  { eid: 'a0000008-0000-0000-0000-000000000001', sets: 4, reps: 10, weights: [80, 90, 60] },   // Hip Thrust
  { eid: 'a0000009-0000-0000-0000-000000000001', sets: 4, reps: 15, weights: [60, 70, 45] },   // Gemelos
  { eid: 'a000000a-0000-0000-0000-000000000001', sets: 3, reps: 1,  weights: [0, 0, 0] },      // Plancha
]

// =============================================
// HABITS CONFIG
// =============================================
const HABITS = {
  juan: {
    configs: [
      { name: 'Gym', icon: 'gym', frequency: 'daily', sort_order: 0 },
      { name: 'Hidratacion', icon: 'hidratacion', frequency: 'daily', sort_order: 1 },
      { name: 'Sueno 8h', icon: 'sueno', frequency: 'daily', sort_order: 2 },
      { name: 'Nutricion', icon: 'nutricion', frequency: 'daily', sort_order: 3 },
      { name: 'Codigo', icon: 'codigo', frequency: 'daily', sort_order: 4 },
    ],
    completionRate: 0.93,
    partialRate: 0.97,
  },
  cristobal: {
    configs: [
      { name: 'Meditacion', icon: 'meditacion', frequency: 'daily', sort_order: 0 },
      { name: 'Gym', icon: 'gym', frequency: 'daily', sort_order: 1 },
      { name: 'Lectura', icon: 'lectura', frequency: 'daily', sort_order: 2 },
      { name: 'Journaling', icon: 'journaling', frequency: 'daily', sort_order: 3 },
      { name: 'Madrugar', icon: 'madrugar', frequency: 'daily', sort_order: 4 },
    ],
    completionRate: 0.85,
    partialRate: 0.93,
  },
  antonio: {
    configs: [
      { name: 'Cardio', icon: 'cardio', frequency: 'daily', sort_order: 0 },
      { name: 'Gym', icon: 'gym', frequency: 'daily', sort_order: 1 },
      { name: 'Ducha fria', icon: 'duchaFria', frequency: 'daily', sort_order: 2 },
      { name: 'Digital Detox', icon: 'digitalDetox', frequency: 'daily', sort_order: 3 },
    ],
    completionRate: 0.75,
    partialRate: 0.88,
  },
}

// =============================================
// BODY METRICS CONFIG per user
// =============================================
function getBodyMetrics(userIdx, frac) {
  const r = () => Math.random() - 0.5
  if (userIdx === 0) {
    // JUAN: 82->76kg, 20->13%BF
    const w = 82 + (76 - 82) * frac + r() * 0.8
    return {
      weight: +w.toFixed(2), body_fat_pct: +(20 + (13 - 20) * frac + r() * 0.6).toFixed(1),
      muscle_mass: +(35 + 3 * frac + r() * 0.4).toFixed(2),
      chest: +(100 + 6 * frac + r() * 0.4).toFixed(1), waist: +(86 + (78 - 86) * frac + r() * 0.4).toFixed(1),
      hip: +(96 + (93 - 96) * frac).toFixed(1), bicep: +(34 + 4 * frac + r() * 0.3).toFixed(1),
      thigh: +(56 + 3 * frac).toFixed(1), calf: +(37 + frac).toFixed(1),
      body_water_pct: +Math.max(58 + 5 * frac + r() * 0.4, 50).toFixed(1),
      visceral_fat: Math.round(Math.max(8 - 3 * frac, 5)),
      basal_metabolism: Math.round(1750 + 80 * frac),
      bmi: +(w / (1.78 * 1.78)).toFixed(1),
    }
  } else if (userIdx === 1) {
    // CRISTÓBAL: 88->83kg, 22->16%BF
    const w = 88 + (83 - 88) * frac + r() * 1.0
    return {
      weight: +w.toFixed(2), body_fat_pct: +(22 + (16 - 22) * frac + r() * 0.6).toFixed(1),
      muscle_mass: +(38 + 3.5 * frac + r() * 0.4).toFixed(2),
      chest: +(104 + 6 * frac + r() * 0.4).toFixed(1), waist: +(90 + (84 - 90) * frac + r() * 0.5).toFixed(1),
      hip: +(100 + (97 - 100) * frac).toFixed(1), bicep: +(36 + 4 * frac + r() * 0.3).toFixed(1),
      thigh: +(59 + 3 * frac).toFixed(1), calf: +(39 + frac).toFixed(1),
      body_water_pct: +Math.max(56 + 5 * frac + r() * 0.5, 50).toFixed(1),
      visceral_fat: Math.round(Math.max(10 - 3.5 * frac, 6)),
      basal_metabolism: Math.round(1830 + 70 * frac),
      bmi: +(w / (1.82 * 1.82)).toFixed(1),
    }
  } else {
    // ANTONIO: 68->74kg, 16->12%BF
    const w = 68 + (74 - 68) * frac + r() * 0.6
    return {
      weight: +w.toFixed(2), body_fat_pct: +(16 + (12 - 16) * frac + r() * 0.5).toFixed(1),
      muscle_mass: +(32 + 4 * frac + r() * 0.3).toFixed(2),
      chest: +(92 + 8 * frac + r() * 0.4).toFixed(1), waist: +(74 + 2 * frac + r() * 0.3).toFixed(1),
      hip: +(90 + 3 * frac).toFixed(1), bicep: +(30 + 5 * frac + r() * 0.3).toFixed(1),
      thigh: +(52 + 4 * frac).toFixed(1), calf: +(35 + 1.5 * frac).toFixed(1),
      body_water_pct: +Math.max(62 + 3 * frac + r() * 0.3, 50).toFixed(1),
      visceral_fat: Math.round(Math.max(6 - 2 * frac, 4)),
      basal_metabolism: Math.round(1650 + 100 * frac),
      bmi: +(w / (1.73 * 1.73)).toFixed(1),
    }
  }
}

// =============================================
// TRAINING DAY PATTERNS
// =============================================
function isTrainDay(userIdx, dayOffset) {
  const patternDay = ((dayOffset - 1) % 7) + 1  // 1-7
  if (userIdx === 0) return [1, 2, 3, 5, 6].includes(patternDay)         // Juan 5x/week
  if (userIdx === 1) return [1, 2, 4, 5].includes(patternDay)             // Cristóbal 4x/week
  // Antonio: phase1 (180..91) 3x/week, phase2 (90..1) 4x/week
  if (dayOffset > 90) return [2, 4, 6].includes(patternDay)
  return [1, 3, 5, 6].includes(patternDay)
}

// =============================================
// HELPERS
// =============================================
function roundTo25(v) { return Math.round(v / 2.5) * 2.5 }

async function bulkInsert(table, rows, label) {
  // Insert in chunks of 500
  const CHUNK = 500
  let inserted = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { error } = await sb.from(table).insert(chunk)
    if (error) {
      console.error(`  ERROR inserting ${label} chunk ${i}:`, error.message)
      throw error
    }
    inserted += chunk.length
  }
  console.log(`  ✓ ${label}: ${inserted} rows`)
  return inserted
}

// =============================================
// MAIN
// =============================================
async function main() {
  console.log('========================================')
  console.log('SQUAD FITNESS — Seed 6 Meses via API')
  console.log('========================================\n')

  // 1. Get profiles
  const { data: profiles } = await sb.from('profiles').select('id, name')
  const juan = profiles.find(p => /juan/i.test(p.name))
  const cris = profiles.find(p => /crist/i.test(p.name))
  const anto = profiles.find(p => /anto/i.test(p.name))
  if (!juan || !cris || !anto) {
    console.error('No se encontraron los 3 perfiles:', profiles)
    process.exit(1)
  }
  const users = [
    { ...juan, key: 'juan' },
    { ...cris, key: 'cristobal' },
    { ...anto, key: 'antonio' },
  ]
  console.log('Usuarios:', users.map(u => `${u.name}=${u.id.slice(0, 8)}`).join(', '))

  // 2. Clean existing data
  console.log('\nLimpiando datos existentes...')
  for (const table of ['session_sets', 'workout_sessions', 'routine_exercises', 'routines', 'body_metrics', 'routine_entries', 'routine_configs', 'exercises']) {
    const { error } = await sb.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) console.warn(`  warn ${table}:`, error.message)
    else console.log(`  ✓ ${table} limpiada`)
  }

  // 3. Insert exercises
  console.log('\nInsertando ejercicios...')
  await bulkInsert('exercises', EXERCISES, 'Ejercicios')

  // 4. Create routines + routine_exercises for each user
  console.log('\nCreando rutinas PPL...')
  const routineIds = {} // { 'userId': { push, pull, legs } }
  const allRoutineExercises = []

  for (let ui = 0; ui < users.length; ui++) {
    const u = users[ui]
    const routines = [
      { name: 'Push (Pecho + Hombros + Triceps)', desc: 'Dia de empuje: pectorales, deltoides y triceps', exercises: PUSH_EXERCISES },
      { name: 'Pull (Espalda + Biceps)', desc: 'Dia de tiron: dorsales, trapecios y biceps', exercises: PULL_EXERCISES },
      { name: 'Legs (Piernas + Core)', desc: 'Dia de piernas: cuadriceps, femorales, gluteos y core', exercises: LEGS_EXERCISES },
    ]

    routineIds[u.id] = {}
    for (let ri = 0; ri < routines.length; ri++) {
      const r = routines[ri]
      const { data, error } = await sb.from('routines').insert({
        user_id: u.id,
        name: r.name,
        description: r.desc,
      }).select('id').single()
      if (error) { console.error('Error creating routine:', error); process.exit(1) }

      const rid = data.id
      const key = ['push', 'pull', 'legs'][ri]
      routineIds[u.id][key] = rid

      for (let ei = 0; ei < r.exercises.length; ei++) {
        const ex = r.exercises[ei]
        allRoutineExercises.push({
          routine_id: rid,
          exercise_id: ex.eid,
          sets_target: ex.sets,
          reps_target: ex.reps,
          weight_target: ex.weights[ui],
          sort_order: ei + 1,
        })
      }
    }
    console.log(`  ✓ Rutinas PPL para ${u.name}`)
  }

  await bulkInsert('routine_exercises', allRoutineExercises, 'Ejercicios de rutinas')

  // 5. Generate 180 days of workout sessions + sets
  console.log('\nGenerando 180 días de entrenamientos...')
  const allSessions = []
  const allSets = []
  const now = new Date()

  for (let ui = 0; ui < users.length; ui++) {
    const u = users[ui]
    const rids = routineIds[u.id]
    const routineOrder = [rids.push, rids.pull, rids.legs]
    // Keep a mapping of routine_id -> exercises for generating sets
    const routineExMap = {
      [rids.push]: PUSH_EXERCISES,
      [rids.pull]: PULL_EXERCISES,
      [rids.legs]: LEGS_EXERCISES,
    }

    let routineCycle = 0
    let sessionCount = 0

    for (let dayOff = 180; dayOff >= 1; dayOff--) {
      if (!isTrainDay(ui, dayOff)) continue

      routineCycle++
      const currentRoutineId = routineOrder[(routineCycle - 1) % 3]
      const exercises = routineExMap[currentRoutineId]

      const weekNum = Math.floor((180 - dayOff) / 7)
      const progression = Math.pow(1.02, weekNum)

      // Random session time between 7:00 and 20:00
      const sessDate = new Date(now)
      sessDate.setDate(sessDate.getDate() - dayOff)
      sessDate.setHours(7 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 60), 0, 0)

      const durationMin = 45 + Math.floor(Math.random() * 30)
      const finishDate = new Date(sessDate.getTime() + durationMin * 60000)

      const sessId = crypto.randomUUID()

      allSessions.push({
        id: sessId,
        user_id: u.id,
        routine_id: currentRoutineId,
        started_at: sessDate.toISOString(),
        finished_at: finishDate.toISOString(),
        duration_minutes: durationMin,
      })

      // Generate sets for each exercise
      for (const ex of exercises) {
        const startWeight = ex.weights[ui]
        for (let setNum = 1; setNum <= ex.sets; setNum++) {
          let weightDone = 0
          if (startWeight > 0) {
            const baseW = startWeight * progression
            weightDone = roundTo25(baseW + (Math.random() * 5 - 2.5))
            if (weightDone < 2.5) weightDone = 2.5
          }

          let repsDone = ex.reps + Math.floor(Math.random() * 3) - 1
          if (setNum >= ex.sets) repsDone -= Math.floor(Math.random() * 3)
          else if (setNum === ex.sets - 1) repsDone -= Math.floor(Math.random() * 2)
          if (repsDone < 1) repsDone = 1

          allSets.push({
            session_id: sessId,
            exercise_id: ex.eid,
            set_number: setNum,
            reps: repsDone,
            weight: weightDone,
            completed: true,
          })
        }
      }
      sessionCount++
    }
    console.log(`  ${u.name}: ${sessionCount} sesiones`)
  }

  await bulkInsert('workout_sessions', allSessions, 'Sesiones')
  await bulkInsert('session_sets', allSets, 'Sets')

  // 6. Body metrics: 180 days
  console.log('\nGenerando body metrics (180 días)...')
  const allMetrics = []

  for (let ui = 0; ui < users.length; ui++) {
    const u = users[ui]
    for (let dayOff = 180; dayOff >= 0; dayOff--) {
      const frac = (180 - dayOff) / 180
      const m = getBodyMetrics(ui, frac)
      const d = new Date(now)
      d.setDate(d.getDate() - dayOff)

      if (dayOff % 7 === 0) {
        // Full measurement
        d.setHours(8, 0, 0, 0)
        allMetrics.push({
          user_id: u.id,
          date: d.toISOString(),
          weight: m.weight,
          body_fat_pct: Math.max(m.body_fat_pct, 8),
          muscle_mass: m.muscle_mass,
          body_water_pct: m.body_water_pct,
          visceral_fat: m.visceral_fat,
          basal_metabolism: m.basal_metabolism,
          bmi: m.bmi,
          chest: m.chest,
          waist: m.waist,
          hip: m.hip,
          bicep_right: m.bicep,
          bicep_left: +(m.bicep - 0.3).toFixed(1),
          thigh_right: m.thigh,
          thigh_left: +(m.thigh - 0.2).toFixed(1),
          calf: m.calf,
          notes: frac < 0.1 ? 'Medicion inicial' : frac > 0.9 ? 'Medicion reciente - gran progreso!' : null,
        })
      } else {
        // Weight-only
        d.setHours(7 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0)
        allMetrics.push({
          user_id: u.id,
          date: d.toISOString(),
          weight: m.weight,
        })
      }
    }
    console.log(`  ${u.name}: ${181} mediciones`)
  }

  await bulkInsert('body_metrics', allMetrics, 'Body metrics')

  // 7. Habits: configs + 180 days entries
  console.log('\nGenerando hábitos (180 días)...')
  const allHabitConfigs = []
  const allHabitEntries = []

  for (let ui = 0; ui < users.length; ui++) {
    const u = users[ui]
    const habit = HABITS[u.key]

    // Insert configs
    const configIds = []
    for (const cfg of habit.configs) {
      const { data, error } = await sb.from('routine_configs').insert({
        user_id: u.id,
        ...cfg,
        active: true,
      }).select('id').single()
      if (error) { console.error('Error creating habit config:', error); process.exit(1) }
      configIds.push(data.id)
    }
    console.log(`  ${u.name}: ${configIds.length} hábitos configurados`)

    // Generate 180 days of entries
    for (let dayOff = 180; dayOff >= 1; dayOff--) {
      const d = new Date(now)
      d.setDate(d.getDate() - dayOff)
      const dateStr = d.toISOString().split('T')[0]

      const rand = Math.random()
      if (rand < habit.completionRate) {
        // Complete day: all habits
        for (const cfgId of configIds) {
          const completedAt = new Date(d)
          completedAt.setHours(7 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0)
          allHabitEntries.push({
            user_id: u.id,
            routine_config_id: cfgId,
            date: dateStr,
            completed: true,
            completed_at: completedAt.toISOString(),
          })
        }
      } else if (rand < habit.partialRate) {
        // Partial day: 1-3 habits
        const count = 1 + Math.floor(Math.random() * 3)
        for (let h = 0; h < Math.min(count, configIds.length); h++) {
          const completedAt = new Date(d)
          completedAt.setHours(8 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0)
          allHabitEntries.push({
            user_id: u.id,
            routine_config_id: configIds[h],
            date: dateStr,
            completed: true,
            completed_at: completedAt.toISOString(),
          })
        }
      }
      // else: skipped day
    }
  }

  await bulkInsert('routine_entries', allHabitEntries, 'Habit entries')

  // 8. Summary
  console.log('\n========================================')
  console.log('SEED COMPLETADO!')
  console.log('========================================')

  const { data: sesCount } = await sb.from('workout_sessions').select('id', { count: 'exact', head: true })
  const { data: setCount } = await sb.from('session_sets').select('id', { count: 'exact', head: true })
  const { data: metCount } = await sb.from('body_metrics').select('id', { count: 'exact', head: true })
  const { data: habCount } = await sb.from('routine_entries').select('id', { count: 'exact', head: true })

  console.log(`Ejercicios: ${EXERCISES.length}`)
  console.log(`Rutinas: ${users.length * 3}`)
  console.log(`Sesiones: ${allSessions.length}`)
  console.log(`Sets: ${allSets.length}`)
  console.log(`Body metrics: ${allMetrics.length}`)
  console.log(`Habit entries: ${allHabitEntries.length}`)
}

main().catch(e => { console.error('FATAL:', e); process.exit(1) })
