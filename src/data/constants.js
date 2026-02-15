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
