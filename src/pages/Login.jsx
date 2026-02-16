import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UserPlus, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AvatarWithMood from '../components/avatar/AvatarWithMood'

export default function Login() {
  const { signInByName, signUpByName, fetchAllProfiles } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [mode, setMode] = useState('select') // 'select' | 'join'
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(null)

  useEffect(() => {
    fetchAllProfiles().then(setProfiles)
  }, [])

  async function handleSelect(profile) {
    setError('')
    setLoadingProfile(profile.id)
    try {
      await signInByName(profile.name)
    } catch {
      setError('No se pudo entrar. Intenta de nuevo.')
      setLoadingProfile(null)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Escribe tu nombre, crack'); return }
    setError('')
    setLoading(true)
    try {
      await signUpByName(name.trim())
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setError('Este nombre ya está en el squad')
      } else {
        setError(err.message || 'Error al crear cuenta')
      }
    }
    setLoading(false)
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: '#0A0A12' }}
    >
      {/* Hero background */}
      <div className="absolute inset-0">
        <img
          src="/assets/backgrounds/heroes/neon-city.png"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #0A0A12 0%, transparent 50%, #0A0A1288 100%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            src="/assets/illustrations/escena-onboarding.png"
            alt="Squad Fitness"
            className="mx-auto mb-4 h-40 w-auto object-contain drop-shadow-2xl"
          />
          <h1 className="font-display text-2xl font-bold tracking-wider text-glow-cyan">
            SQUAD FITNESS
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {mode === 'select' ? '¿Quién entrena hoy?' : 'Únete al squad'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'select' ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Profile avatar grid */}
              {profiles.length > 0 ? (
                <div className="mb-6 grid grid-cols-3 gap-3">
                  {profiles.map((p, i) => (
                    <motion.button
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      onClick={() => handleSelect(p)}
                      disabled={loadingProfile !== null}
                      className="card flex flex-col items-center gap-2 px-2 py-4 transition-all active:scale-95 disabled:opacity-50"
                      style={{
                        borderColor: loadingProfile === p.id ? (p.color || '#00F0FF') + '44' : 'transparent',
                        borderWidth: 1,
                        boxShadow: loadingProfile === p.id ? `0 0 20px ${p.color || '#00F0FF'}22` : 'none',
                      }}
                    >
                      <AvatarWithMood
                        name={p.name}
                        color={p.color || '#00F0FF'}
                        avatarBase={p.name?.toLowerCase()}
                        size="lg"
                        mood="base"
                      />
                      <span className="text-sm font-bold">{p.name}</span>
                      {p.nickname && (
                        <span
                          className="text-[10px] uppercase tracking-wider"
                          style={{ color: p.color || '#00F0FF' }}
                        >
                          {p.nickname}
                        </span>
                      )}
                      {loadingProfile === p.id && (
                        <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                          <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="h-full w-1/2 rounded-full"
                            style={{ background: p.color || '#00F0FF' }}
                          />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="mb-6 text-center">
                  <p className="text-sm text-text-muted">Cargando squad...</p>
                </div>
              )}

              {error && <p className="mb-4 text-center text-sm text-neon-red">{error}</p>}

              {/* Join button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => { setMode('join'); setError('') }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-3 text-sm text-text-secondary transition hover:border-neon-cyan/30 hover:text-neon-cyan"
              >
                <UserPlus size={16} />
                Nuevo? Únete al squad
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="¿Cómo te llaman?"
                    autoFocus
                    className="input-cyber w-full px-4 py-3 text-sm"
                  />
                </div>

                {error && <p className="text-sm text-neon-red">{error}</p>}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm disabled:opacity-50"
                >
                  {loading ? 'CREANDO...' : 'UNIRSE AL SQUAD'}
                </motion.button>
              </form>

              <button
                onClick={() => { setMode('select'); setError('') }}
                className="mt-4 flex w-full items-center justify-center gap-1 text-sm text-text-muted"
              >
                <ArrowLeft size={14} />
                Volver
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
