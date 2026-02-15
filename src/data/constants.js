// Los 3 usuarios del squad
export const SQUAD_MEMBERS = {
  juan: {
    name: 'Juan',
    nickname: 'El Tanque',
    color: '#00F0FF',
    colorName: 'cyan',
    glowClass: 'glow-cyan',
    textGlowClass: 'text-glow-cyan',
    cardClass: 'card-juan',
  },
  cristobal: {
    name: 'Cristóbal',
    nickname: 'El Estratega',
    color: '#BF00FF',
    colorName: 'violet',
    glowClass: 'glow-violet',
    textGlowClass: 'text-glow-violet',
    cardClass: 'card-cristobal',
  },
  antonio: {
    name: 'Antonio',
    nickname: 'El Loco Rápido',
    color: '#FF3D5A',
    colorName: 'red',
    glowClass: 'glow-red',
    textGlowClass: 'text-glow-red',
    cardClass: 'card-antonio',
  },
}

// Avatares con estados de ánimo
export const AVATAR_MOODS = {
  sleeping: { emoji: '😴', label: 'Durmiendo' },
  base: { emoji: '💪', label: 'Normal' },
  happy: { emoji: '🔥', label: 'Feliz' },
  flexing: { emoji: '💥', label: 'En racha' },
  sad: { emoji: '😞', label: 'Racha rota' },
  onfire: { emoji: '⚡', label: 'Imparable' },
}

// Función para determinar mood del avatar
export function getAvatarMood(streak, completedToday, totalToday) {
  if (streak >= 7) return 'onfire'
  if (streak >= 3 && completedToday === totalToday && totalToday > 0) return 'flexing'
  if (completedToday === totalToday && totalToday > 0) return 'happy'
  if (completedToday > 0) return 'base'
  // Si es temprano en el día, sleeping; si no, sad (racha en peligro)
  const hour = new Date().getHours()
  if (hour < 10) return 'sleeping'
  if (streak === 0) return 'sad'
  return 'sleeping'
}

// Copys motivacionales
export const GREETINGS = [
  'Qué pasa, {name} 🔥',
  'Vamos crack 💪',
  'Otro día más, leyenda ⚡',
  'A romperla, {name} 🚀',
  'El gym te espera, {name} 💥',
]

export const EMPTY_STATE_MESSAGES = [
  'Aquí no hay nada todavía... ¿Estás de vacaciones o qué? 💀',
  'Más vacío que tu excusa para no entrenar 👀',
  'El primer paso es el más importante. Dale. 🚀',
]

export const ALL_COMPLETE_MESSAGES = [
  'MÁQUINA. Has destrozado el día. 🔥',
  'Otro día perfecto, leyenda. ⚡',
  'IMPARABLE. Ni los dioses te paran. 💥',
]

export const STREAK_BROKEN_MESSAGES = [
  'F. Se rompió la cadena. Pero mañana se vuelve. 💪',
  'Caer está permitido. Quedarse en el suelo no. 🔥',
]

export const NEW_PR_MESSAGES = [
  '¡¡NUEVO RÉCORD PERSONAL!! Eres una bestia. 🏆',
  '¡¡PR!! Superaste tu límite. CRACK. 💪',
]

export const TAUNT_MESSAGES = {
  inactive_1day: '{name} no ha completado nada hoy... 👀',
  inactive_2days: '{name} lleva 2 días desaparecido... ¿alguien tiene su número? 👀',
  inactive_3days: '{name} lleva 3 días sin entrenar, ¿estás vivo? 💀',
}

// Grupos musculares
export const MUSCLE_GROUPS = [
  'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps',
  'Cuádriceps', 'Femoral', 'Glúteo', 'Gemelos', 'Core',
]

// Tipos de set
export const SET_TYPES = [
  { value: 'normal', label: 'Normal' },
  { value: 'warmup', label: 'Calentamiento' },
  { value: 'dropset', label: 'Drop set' },
  { value: 'restpause', label: 'Rest-pause' },
  { value: 'failure', label: 'Al fallo' },
]

// Badges definidos — con imagen real donde existe
export const BADGES = [
  { id: 'first-spark', name: 'Primera Chispa', desc: 'Completa tu primera rutina', tier: 'bronze', icon: '⚡', image: '/assets/badges/badge-primera.png' },
  { id: 'streak-7', name: 'Racha 7', desc: '7 días consecutivos', tier: 'bronze', icon: '🔥', image: '/assets/badges/badge-racha7.png' },
  { id: 'streak-30', name: 'Racha 30', desc: '30 días consecutivos', tier: 'silver', icon: '🔥', image: '/assets/badges/badge-racha30.png' },
  { id: 'streak-100', name: 'Racha 100', desc: '100 días consecutivos', tier: 'gold', icon: '🔥', image: '/assets/badges/badge-racha100.png' },
  { id: 'squad-goals', name: 'Squad Goals', desc: 'Los 3 completan todo el mismo día', tier: 'gold', icon: '🎉', image: '/assets/badges/badge-los3.png' },
  { id: 'early-bird', name: 'Madrugador', desc: 'Completar antes de las 7AM', tier: 'gold', icon: '🌅', image: '/assets/badges/badge-7am.png' },
  { id: 'night-owl', name: 'Búho Nocturno', desc: 'Completar después de las 11PM', tier: 'silver', icon: '🦉', image: '/assets/badges/badge-11pm.png' },
  { id: 'month-king', name: 'Rey del Mes', desc: 'Más constante del mes', tier: 'gold', icon: '👑', image: '/assets/badges/badge-constante.png' },
  { id: 'steel-link', name: 'Eslabón de Acero', desc: 'Racha más larga entre los 3', tier: 'silver', icon: '🔗', image: '/assets/badges/badge-rachaLarga.png' },
  { id: 'perfect-day', name: 'Máquina Perfecta', desc: 'Todas las rutinas en 1 día', tier: 'gold', icon: '💯', image: '/assets/badges/badge-todasEnUnDia.png' },
  { id: 'new-pr', name: 'Nuevo PR', desc: 'Batir récord personal en gym', tier: 'silver', icon: '🏆' },
  { id: 'centurion', name: 'Centurión', desc: '100 entrenos registrados', tier: 'gold', icon: '💪' },
  { id: 'brutal-volume', name: 'Volumen Brutal', desc: '10.000 kg en una semana', tier: 'silver', icon: '🏋️' },
  { id: 'transformation', name: 'Transformación', desc: 'Perder 5% grasa corporal', tier: 'gold', icon: '🦾' },
]

// Emojis custom (assets reales)
export const EMOJI_ASSETS = {
  fire: '/assets/emojis/emoji-fire.png',
  bicep: '/assets/emojis/emoji-bicep.png',
  trophy: '/assets/emojis/emoji-trophy.png',
  lightning: '/assets/emojis/emoji-lightning.png',
  skull: '/assets/emojis/emoji-skull.png',
  sleep: '/assets/emojis/emoji-sleep.png',
  eyes: '/assets/emojis/emoji-eyes.png',
  clap: '/assets/emojis/emoji-clap.png',
  party: '/assets/emojis/emoji-party.png',
  chain: '/assets/emojis/emoji-chain.png',
  calendar: '/assets/emojis/emoji-calendar.png',
  brain: '/assets/emojis/emoji-brain.png',
  ice: '/assets/emojis/emoji-ice.png',
  stopwatch: '/assets/emojis/emoji-stopwatch.png',
  thumbsup: '/assets/emojis/emoji-thumbsup.png',
}

// Iconos de categoría para hábitos
export const CATEGORY_ICONS = {
  gym: '/assets/iconos/cat-gym.png',
  cardio: '/assets/iconos/cat-cardio.png',
  meditacion: '/assets/iconos/cat-meditacion.png',
  lectura: '/assets/iconos/cat-lectura.png',
  sueno: '/assets/iconos/cat-sueno.png',
  hidratacion: '/assets/iconos/cat-hidratacion.png',
  nutricion: '/assets/iconos/cat-nutricion.png',
  codigo: '/assets/iconos/cat-codigo.png',
  duchaFria: '/assets/iconos/cat-duchaFria.png',
  journaling: '/assets/iconos/cat-journaling.png',
  madrugar: '/assets/iconos/cat-madrugar.png',
  digitalDetox: '/assets/iconos/cat-digitalDetox.png',
}

// Escenas ilustradas
export const ESCENAS = {
  celebrando: '/assets/escenas/escena-celebrando.png',
  emptyState: '/assets/escenas/escena-emptyState.png',
  mesPerfecto: '/assets/escenas/escena-mesPerfecto.png',
  onboarding: '/assets/escenas/escena-onboarding.png',
  podio: '/assets/escenas/escena-podio.png',
  progreso: '/assets/escenas/escena-progreso.png',
  rachaRota: '/assets/escenas/escena-rachaRota.png',
  squad: '/assets/escenas/escena-squad.png',
}

export const TIER_COLORS = {
  bronze: { bg: '#CD7F32', glow: 'rgba(205,127,50,0.3)' },
  silver: { bg: '#C0C0C0', glow: 'rgba(192,192,192,0.3)' },
  gold: { bg: '#FFD700', glow: 'rgba(255,215,0,0.4)' },
}

// ============================================
// GAMIFICATION - Ranks & Levels
// ============================================

export const RANKS = [
  { id: 'rookie',  name: 'ROOKIE',  minLevel: 1,  maxLevel: 5,  color: '#8B8B8B', gradient: 'linear-gradient(135deg, #8B8B8B, #555568)', desc: 'Empezando el viaje' },
  { id: 'chrome',  name: 'CHROME',  minLevel: 6,  maxLevel: 10, color: '#C0C0C0', gradient: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)', desc: 'Construyendo hábitos' },
  { id: 'cyber',   name: 'CYBER',   minLevel: 11, maxLevel: 15, color: '#00F0FF', gradient: 'linear-gradient(135deg, #00F0FF, #0088FF)', desc: 'Mejora consistente' },
  { id: 'ghost',   name: 'GHOST',   minLevel: 16, maxLevel: 20, color: '#BF00FF', gradient: 'linear-gradient(135deg, #BF00FF, #8000CC)', desc: 'Disciplina de acero' },
  { id: 'neural',  name: 'NEURAL',  minLevel: 21, maxLevel: 25, color: '#FFD700', gradient: 'linear-gradient(135deg, #FFD700, #FF8C00)', desc: 'Atleta completo' },
  { id: 'apex',    name: 'APEX',    minLevel: 26, maxLevel: 30, color: '#FF3D5A', gradient: 'linear-gradient(135deg, #FF3D5A, #FF0044)', desc: 'Elite absoluta' },
  { id: 'legend',  name: 'LEGEND',  minLevel: 31, maxLevel: 99, color: '#FF8C00', gradient: 'linear-gradient(135deg, #FF8C00, #FFD700, #FF3D5A)', desc: 'Leyenda viviente' },
]

export function getRankForLevel(level) {
  return RANKS.find(r => level >= r.minLevel && level <= r.maxLevel) || RANKS[RANKS.length - 1]
}

// Milestones (achievements that give XP and mark progression)
export const MILESTONES = [
  { id: 'first-workout',     xpReward: 100,  label: 'Primer entreno',            check: s => s.workoutCount >= 1 },
  { id: 'workouts-10',       xpReward: 200,  label: '10 entrenos',               check: s => s.workoutCount >= 10 },
  { id: 'workouts-50',       xpReward: 500,  label: '50 entrenos',               check: s => s.workoutCount >= 50 },
  { id: 'workouts-100',      xpReward: 1000, label: '100 entrenos',              check: s => s.workoutCount >= 100 },
  { id: 'workouts-200',      xpReward: 2000, label: '200 entrenos',              check: s => s.workoutCount >= 200 },
  { id: 'streak-7',          xpReward: 300,  label: 'Racha de 7 días',           check: s => s.streak >= 7 },
  { id: 'streak-30',         xpReward: 1000, label: 'Racha de 30 días',          check: s => s.streak >= 30 },
  { id: 'streak-100',        xpReward: 3000, label: 'Racha de 100 días',         check: s => s.streak >= 100 },
  { id: 'exercises-10',      xpReward: 300,  label: '10 ejercicios diferentes',  check: s => s.uniqueExercises >= 10 },
  { id: 'exercises-25',      xpReward: 700,  label: '25 ejercicios diferentes',  check: s => s.uniqueExercises >= 25 },
  { id: 'tonnage-1',         xpReward: 200,  label: '1 tonelada total',          check: s => s.tonnageTons >= 1 },
  { id: 'tonnage-10',        xpReward: 500,  label: '10 toneladas totales',      check: s => s.tonnageTons >= 10 },
  { id: 'tonnage-50',        xpReward: 1000, label: '50 toneladas totales',      check: s => s.tonnageTons >= 50 },
  { id: 'tonnage-100',       xpReward: 2000, label: '100 toneladas totales',     check: s => s.tonnageTons >= 100 },
  { id: 'prs-5',             xpReward: 500,  label: '5 records personales',      check: s => s.prCount >= 5 },
  { id: 'prs-15',            xpReward: 1000, label: '15 records personales',     check: s => s.prCount >= 15 },
  { id: 'body-5',            xpReward: 200,  label: '5 mediciones corporales',   check: s => s.bodyMetricEntries >= 5 },
  { id: 'body-20',           xpReward: 500,  label: '20 mediciones corporales',  check: s => s.bodyMetricEntries >= 20 },
  { id: 'perfect-days-7',    xpReward: 400,  label: '7 días perfectos',          check: s => s.allHabitsDays >= 7 },
  { id: 'perfect-days-30',   xpReward: 1500, label: '30 días perfectos',         check: s => s.allHabitsDays >= 30 },
]
