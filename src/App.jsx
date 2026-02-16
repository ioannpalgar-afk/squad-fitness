import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import BottomNav from './components/layout/BottomNav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Routines from './pages/Routines'
import RoutineDetail from './pages/RoutineDetail'
import WorkoutSession from './pages/WorkoutSession'
import History from './pages/History'
import Analytics from './pages/Analytics'
import Squad from './pages/Squad'
import Profile from './pages/Profile'
import Progression from './pages/Progression'

function ProtectedLayout() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0A0A12' }}>
        <div className="text-center">
          <div className="mb-3 h-8 w-8 mx-auto animate-spin rounded-full border-2 border-transparent border-t-[#00F0FF]" />
          <p className="font-display text-xs uppercase tracking-widest text-text-muted">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  const userColor = profile?.color || '#00F0FF'

  return (
    <div className="mx-auto min-h-screen max-w-lg relative">
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="rutinas" element={<Routines />} />
        <Route path="rutinas/:id" element={<RoutineDetail />} />
        <Route path="entrenos" element={<WorkoutSession />} />
        <Route path="historial" element={<History />} />
        <Route path="analiticas" element={<Analytics />} />
        <Route path="squad" element={<Squad />} />
        <Route path="perfil" element={<Profile />} />
        <Route path="progresion" element={<Progression />} />
      </Routes>
      <BottomNav userColor={userColor} />

      {/* Scanlines overlay — CSS puro */}
      <div
        className="pointer-events-none fixed inset-0 z-[9999]"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      {/* Vignette overlay — CSS puro */}
      <div
        className="pointer-events-none fixed inset-0 z-[9998]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  )
}

function LoginRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <Login />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
