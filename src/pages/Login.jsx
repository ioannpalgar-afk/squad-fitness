import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (isRegister) {
        if (!name.trim()) { setError('Escribe tu nombre, crack'); setLoading(false); return }
        await signUp(email, password, name.trim())
        setSuccess('Cuenta creada. Bienvenido al squad. 🔥')
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      const msg = err.message
      if (msg.includes('Invalid login')) setError('Email o contraseña incorrectos 💀')
      else if (msg.includes('already registered')) setError('Este email ya está en el squad')
      else if (msg.includes('least 6')) setError('Mínimo 6 caracteres, no seas vago')
      else setError(msg)
    }
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden" style={{ background: '#0A0A12' }}>
      {/* Hero background */}
      <div className="absolute inset-0">
        <img
          src="/assets/backgrounds/bg-heroBanner.png"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0A0A12 0%, transparent 50%, #0A0A1288 100%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Onboarding scene */}
        <div className="mb-6 text-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            src="/assets/escenas/escena-onboarding.png"
            alt="Squad Fitness"
            className="mx-auto mb-4 h-40 w-auto object-contain drop-shadow-2xl"
          />
          <h1 className="font-display text-2xl font-bold tracking-wider text-glow-cyan">SQUAD FITNESS</h1>
          <p className="mt-1 text-sm text-text-secondary">Entrena. Compite. Domina.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="¿Cómo te llaman?"
                className="input-cyber w-full px-4 py-3 text-sm"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="input-cyber w-full px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-secondary">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="input-cyber w-full px-4 py-3 pr-11 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-neon-red">{error}</p>}
          {success && <p className="text-sm text-neon-green">{success}</p>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm disabled:opacity-50"
          >
            {loading ? 'CARGANDO...' : isRegister ? 'UNIRSE AL SQUAD' : 'ENTRAR'}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          {isRegister ? '¿Ya estás en el squad?' : '¿Eres nuevo?'}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess('') }}
            className="font-semibold text-neon-cyan hover:text-glow-cyan"
          >
            {isRegister ? 'Inicia sesión' : 'Únete'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
