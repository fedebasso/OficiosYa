import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { useAuthStore } from '../store/authStore'

const INPUT_STYLE = {
  background: '#1a1a1a',
  border: '1px solid #2a2a2a',
  color: '#f5f0e8',
  borderRadius: '16px',
  padding: '12px 16px 12px 44px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
}

export default function Register() {
  const navigate = useNavigate()
  const signUp = useAuthStore((s) => s.signUp)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      <div className="flex flex-col min-h-screen" style={{ background: '#0f0f0f' }}>

        {/* Hero oscuro */}
        <div
          className="px-6 pt-16 pb-14 flex flex-col items-center gap-2 relative"
          style={{ background: 'linear-gradient(160deg, #1a1008 0%, #2d1f0e 100%)' }}
        >
          <h1 className="text-4xl font-black tracking-tight leading-none" style={{ color: '#f5f0e8' }}>
            Oficio<span style={{ color: '#e8683a' }}>Ya</span>
          </h1>
          <p className="text-sm" style={{ color: '#555' }}>Creá tu cuenta gratis</p>
          <div className="absolute bottom-0 left-0 right-0 h-8 rounded-t-[32px]" style={{ background: '#0f0f0f' }} />
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5 px-6 pt-6 pb-10">

          <div>
            <h2 className="text-xl font-black" style={{ color: '#f5f0e8' }}>Empezá ahora</h2>
            <p className="text-sm mt-0.5" style={{ color: '#888' }}>Solo te lleva 1 minuto</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {error && (
              <div
                id="register-error"
                role="alert"
                aria-live="polite"
                className="rounded-2xl px-4 py-3 text-sm"
                style={{ background: 'rgba(220,38,38,.1)', border: '1px solid rgba(220,38,38,.3)', color: '#f87171' }}
              >
                {error}
              </div>
            )}

            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#888' }}>
                Nombre completo
              </label>
              <div className="relative">
                <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none" style={{ color: '#555' }}>👤</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  aria-describedby={error ? 'register-error' : undefined}
                  style={INPUT_STYLE}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#888' }}>
                Email
              </label>
              <div className="relative">
                <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none" style={{ color: '#555' }}>✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  aria-describedby={error ? 'register-error' : undefined}
                  style={INPUT_STYLE}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#888' }}>
                Contraseña
              </label>
              <div className="relative">
                <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none" style={{ color: '#555' }}>🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  aria-describedby={error ? 'register-error' : undefined}
                  style={INPUT_STYLE}
                />
              </div>
            </div>

            {/* Role selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#888' }}>Soy...</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'client', icon: '👤', name: 'Cliente', desc: 'Busco profesionales para mi hogar' },
                  { value: 'professional', icon: '🔧', name: 'Profesional', desc: 'Ofrezco mis servicios y consigo clientes' },
                ] as const).map((opt) => {
                  const active = role === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className="flex flex-col items-center gap-2 rounded-2xl p-4 transition-[transform,opacity] duration-200 active:scale-[0.97]"
                      style={{
                        border: active ? '2px solid #e8683a' : '2px solid #2a2a2a',
                        background: active ? 'rgba(232,104,58,.1)' : '#1a1a1a',
                      }}
                      aria-pressed={active}
                    >
                      <span aria-hidden="true" style={{ fontSize: 28, lineHeight: 1 }}>{opt.icon}</span>
                      <span className="text-sm font-black" style={{ color: active ? '#e8683a' : '#f5f0e8' }}>
                        {opt.name}
                      </span>
                      <span className="text-[10px] text-center leading-tight" style={{ color: '#555' }}>
                        {opt.desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-4 text-base font-bold tracking-wide transition-[transform,opacity] duration-200 active:scale-[0.97] disabled:opacity-60 text-white"
              style={{ background: '#e8683a', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creando cuenta...
                </span>
              ) : 'Crear cuenta'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: '#2a2a2a' }} />
            <span className="text-xs font-medium" style={{ color: '#555' }}>o</span>
            <div className="flex-1 h-px" style={{ background: '#2a2a2a' }} />
          </div>

          {/* Login link */}
          <p className="text-center text-sm" style={{ color: '#888' }}>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="font-bold" style={{ color: '#e8683a' }}>
              Iniciá sesión
            </Link>
          </p>

        </div>
      </div>
    </PageShell>
  )
}
