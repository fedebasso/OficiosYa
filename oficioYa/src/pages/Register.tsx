import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const signUp = useAuthStore((s) => s.signUp)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'client' | 'professional'>('client')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signUp(email, password, fullName, role)
      navigate(role === 'professional' ? '/pro/registro' : '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
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
          <p className="text-white/70 text-sm mt-1">Creá tu cuenta</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">{error}</p>}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-main">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
              required
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-main">Soy...</label>
            <div className="grid grid-cols-2 gap-2">
              {(['client', 'professional'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-xl border-2 p-3 text-sm font-medium transition-colors ${
                    role === r
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {r === 'client' ? '👤 Cliente' : '🔧 Profesional'}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
          <p className="text-center text-sm text-gray-500">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-primary font-medium">
              Iniciá sesión
            </Link>
          </p>
        </form>
      </div>
    </PageShell>
  )
}
