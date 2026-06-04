import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const signIn = useAuthStore((s) => s.signIn)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell showBottomNav={false}>
      <div className="flex flex-col min-h-screen">
        <div className="bg-primary px-6 py-12 text-center">
          <h1 className="text-2xl font-semibold text-white">
            Oficio<span className="text-accent">Ya</span>
          </h1>
          <p className="text-white/70 text-sm mt-1">Ingresá a tu cuenta</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-main">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-main">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
          <p className="text-center text-sm text-gray-500">
            ¿No tenés cuenta?{' '}
            <Link to="/registro" className="text-primary font-medium">
              Registrate
            </Link>
          </p>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
            <p className="font-medium mb-1">Demo (modo sin Supabase):</p>
            <p>Cliente: cliente@demo.com / demo123</p>
            <p>Profesional: pro@demo.com / demo123</p>
          </div>
        </form>
      </div>
    </PageShell>
  )
}
