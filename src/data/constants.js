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

// ============================================
// BADGES — organizados por categoría
// ============================================

export const BADGE_CATEGORIES = [
  { id: 'consistency', name: 'Constancia', desc: 'Recompensas por no fallar ni un día. La constancia es el superpoder.' },
  { id: 'strength', name: 'Fuerza', desc: 'Cada kilo que subes te acerca a la versión más fuerte de ti mismo.' },
  { id: 'volume', name: 'Volumen', desc: 'Toneladas movidas. El trabajo acumulado que transforma tu cuerpo.' },
  { id: 'habits', name: 'Hábitos', desc: 'Los pequeños rituales diarios que construyen grandes resultados.' },
  { id: 'body', name: 'Cuerpo', desc: 'Tu transformación física medida y documentada.' },
  { id: 'squad', name: 'Squad', desc: 'Juntos somos más fuertes. Logros compartidos con tu equipo.' },
  { id: 'explorer', name: 'Explorador', desc: 'Variedad es progreso. Desbloquea nuevos ejercicios y horarios.' },
]

export const BADGES = [
  // === CONSTANCIA ===
  { id: 'first-spark',    category: 'consistency', name: 'Primera Chispa',      desc: 'Completa tu primer entreno',                tier: 'bronze', image: '/assets/badges/badge-primera.png' },
  { id: 'streak-3',       category: 'consistency', name: 'Triple Combo',        desc: '3 días consecutivos entrenando',            tier: 'bronze', image: '/assets/badges/badge-racha3.png' },
  { id: 'streak-7',       category: 'consistency', name: 'Semana de Acero',     desc: '7 días consecutivos sin fallar',            tier: 'bronze', image: '/assets/badges/badge-racha7.png' },
  { id: 'streak-14',      category: 'consistency', name: 'Quincena Invicta',    desc: '14 días consecutivos',                      tier: 'silver', image: '/assets/badges/badge-racha14.png' },
  { id: 'streak-30',      category: 'consistency', name: 'Mes de Hierro',       desc: '30 días sin romper la cadena',              tier: 'silver', image: '/assets/badges/badge-racha30.png' },
  { id: 'streak-60',      category: 'consistency', name: 'Inquebrantable',      desc: '60 días de racha pura',                     tier: 'gold',   image: '/assets/badges/badge-racha60.png' },
  { id: 'streak-100',     category: 'consistency', name: 'Centurión',           desc: '100 días consecutivos. Leyenda.',           tier: 'gold',   image: '/assets/badges/badge-racha100.png' },
  { id: 'workouts-10',    category: 'consistency', name: 'En Marcha',           desc: '10 entrenos completados',                   tier: 'bronze', image: '/assets/badges/badge-10entrenos.png' },
  { id: 'workouts-25',    category: 'consistency', name: 'Cuarto de Siglo',     desc: '25 entrenos completados',                   tier: 'bronze', image: '/assets/badges/badge-25entrenos.png' },
  { id: 'workouts-50',    category: 'consistency', name: 'Medio Centenar',      desc: '50 entrenos completados',                   tier: 'silver', image: '/assets/badges/badge-50entrenos.png' },
  { id: 'workouts-100',   category: 'consistency', name: 'Centenario',          desc: '100 entrenos. El gym es tu segunda casa.',  tier: 'gold',   image: '/assets/badges/badge-100entrenos.png' },
  { id: 'workouts-200',   category: 'consistency', name: 'Doscientos',          desc: '200 entrenos registrados',                  tier: 'gold',   image: '/assets/badges/badge-200entrenos.png' },

  // === FUERZA ===
  { id: 'first-pr',       category: 'strength', name: 'Primer PR',             desc: 'Tu primer récord personal',                  tier: 'bronze', image: '/assets/badges/badge-primerPR.png' },
  { id: 'prs-5',          category: 'strength', name: 'Cazador de PRs',        desc: '5 records personales batidos',               tier: 'bronze', image: '/assets/badges/badge-5prs.png' },
  { id: 'prs-10',         category: 'strength', name: 'Rompe-límites',         desc: '10 records personales',                      tier: 'silver', image: '/assets/badges/badge-10prs.png' },
  { id: 'prs-25',         category: 'strength', name: 'Máquina de PRs',        desc: '25 records personales. Imparable.',          tier: 'gold',   image: '/assets/badges/badge-25prs.png' },
  { id: 'bench-60',       category: 'strength', name: 'Club del Plato',        desc: 'Press Banca con 60kg (1 plato por lado)',    tier: 'bronze', image: '/assets/badges/badge-bench60.png' },
  { id: 'bench-100',      category: 'strength', name: 'Banco Centenario',      desc: 'Press Banca con 100kg',                     tier: 'gold',   image: '/assets/badges/badge-bench100.png' },
  { id: 'squat-100',      category: 'strength', name: 'Sentadilla 100',        desc: 'Sentadilla con 100kg',                      tier: 'silver', image: '/assets/badges/badge-squat100.png' },
  { id: 'deadlift-100',   category: 'strength', name: 'Peso Muerto 100',       desc: 'Peso Muerto con 100kg',                     tier: 'silver', image: '/assets/badges/badge-dead100.png' },
  { id: 'bw-bench',       category: 'strength', name: 'Peso Corporal',         desc: 'Press Banca con tu peso corporal',           tier: 'gold',   image: '/assets/badges/badge-bwBench.png' },
  { id: 'weight-up',      category: 'strength', name: 'Subida de Peso',        desc: 'Aumentar peso en 5 ejercicios diferentes',   tier: 'bronze', image: '/assets/badges/badge-weightUp.png' },
  { id: 'weight-up-15',   category: 'strength', name: 'Progresión Constante',  desc: 'Aumentar peso en 15 ejercicios diferentes',  tier: 'silver', image: '/assets/badges/badge-weightUp15.png' },

  // === VOLUMEN ===
  { id: 'tonnage-1',      category: 'volume', name: 'Primera Tonelada',        desc: '1.000 kg totales movidos',                   tier: 'bronze', image: '/assets/badges/badge-1ton.png' },
  { id: 'tonnage-5',      category: 'volume', name: '5 Toneladas',             desc: '5.000 kg de volumen total acumulado',        tier: 'bronze', image: '/assets/badges/badge-5ton.png' },
  { id: 'tonnage-10',     category: 'volume', name: 'Diez Toneladas',          desc: '10.000 kg. Un camión de hierro.',            tier: 'silver', image: '/assets/badges/badge-10ton.png' },
  { id: 'tonnage-25',     category: 'volume', name: 'Bestia de Carga',         desc: '25.000 kg totales',                          tier: 'silver', image: '/assets/badges/badge-25ton.png' },
  { id: 'tonnage-50',     category: 'volume', name: 'Medio Centenar',          desc: '50.000 kg. Medio centenar de toneladas.',    tier: 'gold',   image: '/assets/badges/badge-50ton.png' },
  { id: 'tonnage-100',    category: 'volume', name: 'Club de las 100t',        desc: '100 toneladas totales. Brutal.',             tier: 'gold',   image: '/assets/badges/badge-100ton.png' },
  { id: 'week-volume',    category: 'volume', name: 'Semana Brutal',           desc: '10.000 kg movidos en una sola semana',       tier: 'silver', image: '/assets/badges/badge-semanaBrutal.png' },

  // === HÁBITOS ===
  { id: 'perfect-day',    category: 'habits', name: 'Día Perfecto',            desc: 'Completar todos los hábitos en un día',      tier: 'bronze', image: '/assets/badges/badge-diaPerfecto.png' },
  { id: 'perfect-7',      category: 'habits', name: 'Semana Perfecta',         desc: '7 días perfectos (todos los hábitos)',       tier: 'silver', image: '/assets/badges/badge-semanaPerfecta.png' },
  { id: 'perfect-30',     category: 'habits', name: 'Mes Perfecto',            desc: '30 días perfectos. Máquina total.',          tier: 'gold',   image: '/assets/badges/badge-mesPerfecto.png' },
  { id: 'habits-100',     category: 'habits', name: 'Cien Hábitos',            desc: '100 hábitos individuales completados',       tier: 'bronze', image: '/assets/badges/badge-100habitos.png' },
  { id: 'habits-500',     category: 'habits', name: 'Quinientos',              desc: '500 hábitos completados',                    tier: 'silver', image: '/assets/badges/badge-500habitos.png' },
  { id: 'habits-1000',    category: 'habits', name: 'Mil Hábitos',             desc: '1.000 hábitos. Disciplina pura.',            tier: 'gold',   image: '/assets/badges/badge-1000habitos.png' },

  // === CUERPO ===
  { id: 'first-measure',  category: 'body', name: 'Primera Medición',          desc: 'Registra tu primera medición corporal',      tier: 'bronze', image: '/assets/badges/badge-primerMedicion.png' },
  { id: 'measures-10',    category: 'body', name: 'Control Regular',           desc: '10 mediciones corporales registradas',       tier: 'bronze', image: '/assets/badges/badge-10mediciones.png' },
  { id: 'measures-25',    category: 'body', name: 'Control Total',             desc: '25 mediciones. Datos = progreso.',           tier: 'silver', image: '/assets/badges/badge-25mediciones.png' },
  { id: 'fat-loss-3',     category: 'body', name: 'Definición',                desc: 'Bajar 3% de grasa corporal',                tier: 'silver', image: '/assets/badges/badge-definicion.png' },
  { id: 'fat-loss-5',     category: 'body', name: 'Transformación',            desc: 'Bajar 5% de grasa corporal',                tier: 'gold',   image: '/assets/badges/badge-transformacion.png' },
  { id: 'muscle-gain-2',  category: 'body', name: 'Masa Muscular',             desc: 'Ganar 2kg de masa muscular',                tier: 'silver', image: '/assets/badges/badge-masaMuscular.png' },
  { id: 'recomp',         category: 'body', name: 'Recomposición',             desc: 'Ganar músculo y perder grasa a la vez',      tier: 'gold',   image: '/assets/badges/badge-recomp.png' },

  // === SQUAD ===
  { id: 'squad-goals',    category: 'squad', name: 'Squad Goals',              desc: 'Los 3 completan todo el mismo día',          tier: 'gold',   image: '/assets/badges/badge-los3.png' },
  { id: 'squad-same-day', category: 'squad', name: 'Día de Hermanos',          desc: 'Los 3 entrenan el mismo día',                tier: 'bronze', image: '/assets/badges/badge-diaHermanos.png' },
  { id: 'month-king',     category: 'squad', name: 'Rey del Mes',              desc: 'Ser el más constante del mes',               tier: 'gold',   image: '/assets/badges/badge-constante.png' },
  { id: 'steel-link',     category: 'squad', name: 'Eslabón de Acero',         desc: 'Tener la racha más larga del squad',         tier: 'silver', image: '/assets/badges/badge-rachaLarga.png' },
  { id: 'xp-leader',      category: 'squad', name: 'Líder XP',                 desc: 'Ser el #1 en XP del squad',                  tier: 'silver', image: '/assets/badges/badge-liderXP.png' },

  // === EXPLORADOR ===
  { id: 'exercises-5',    category: 'explorer', name: 'Curioso',               desc: 'Probar 5 ejercicios diferentes',             tier: 'bronze', image: '/assets/badges/badge-5ejercicios.png' },
  { id: 'exercises-15',   category: 'explorer', name: 'Explorador',            desc: 'Probar 15 ejercicios diferentes',            tier: 'silver', image: '/assets/badges/badge-15ejercicios.png' },
  { id: 'exercises-30',   category: 'explorer', name: 'Maestro del Hierro',    desc: 'Probar 30+ ejercicios. Lo has hecho todo.',  tier: 'gold',   image: '/assets/badges/badge-30ejercicios.png' },
  { id: 'early-bird',     category: 'explorer', name: 'Madrugador',            desc: 'Entrenar antes de las 7:00 AM',              tier: 'silver', image: '/assets/badges/badge-7am.png' },
  { id: 'night-owl',      category: 'explorer', name: 'Búho Nocturno',         desc: 'Entrenar después de las 22:00',              tier: 'silver', image: '/assets/badges/badge-11pm.png' },
  { id: 'weekend-warrior',category: 'explorer', name: 'Guerrero del Finde',    desc: 'Entrenar sábado Y domingo',                  tier: 'bronze', image: '/assets/badges/badge-finde.png' },
]

// Emojis nativos (reemplazan los PNG con fondo)
export const EMOJI_ASSETS = {
  fire: '🔥',
  bicep: '💪',
  trophy: '🏆',
  lightning: '⚡',
  skull: '💀',
  sleep: '😴',
  eyes: '👀',
  clap: '👏',
  party: '🎉',
  chain: '🔗',
  calendar: '📅',
  brain: '🧠',
  ice: '🧊',
  stopwatch: '⏱️',
  thumbsup: '👍',
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
  celebrando: '/assets/illustrations/escena-celebrando.png',
  emptyState: '/assets/illustrations/escena-emptyState.png',
  mesPerfecto: '/assets/illustrations/escena-mesPerfecto.png',
  onboarding: '/assets/illustrations/escena-onboarding.png',
  podio: '/assets/illustrations/escena-podio.png',
  progreso: '/assets/illustrations/escena-progreso.png',
  rachaRota: '/assets/illustrations/escena-rachaRota.png',
  squad: '/assets/illustrations/escena-squad.png',
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
