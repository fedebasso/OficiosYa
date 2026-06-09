import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
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

  const inputStyle = {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    color: '#f5f0e8',
    borderRadius: '16px',
    padding: '12px 16px 12px 44px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
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
          <p className="text-sm" style={{ color: '#555' }}>Profesionales de confianza en Montevideo</p>
          <div className="absolute bottom-0 left-0 right-0 h-8 rounded-t-[32px]" style={{ background: '#0f0f0f' }} />
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5 px-6 pt-6 pb-10">

          <div>
            <h2 className="text-xl font-black" style={{ color: '#f5f0e8' }}>Bienvenido de vuelta</h2>
            <p className="text-sm mt-0.5" style={{ color: '#888' }}>Ingresá a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {error && (
              <div
                id="login-error"
                role="alert"
                aria-live="polite"
                className="rounded-2xl px-4 py-3 text-sm"
                style={{ background: 'rgba(220,38,38,.1)', border: '1px solid rgba(220,38,38,.3)', color: '#f87171' }}
              >
                {error}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#888' }}>
                Email
              </label>
              <div className="relative">
                <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none" style={{ color: '#555' }}>
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  aria-describedby={error ? 'login-error' : undefined}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#888' }}>
                Contraseña
              </label>
              <div className="relative">
                <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-base pointer-events-none" style={{ color: '#555' }}>
                  🔒
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  aria-describedby={error ? 'login-error' : undefined}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-4 text-base font-bold tracking-wide transition-all duration-150 active:scale-[.99] disabled:opacity-60"
              style={{ background: '#e8683a', color: '#fff', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: '#2a2a2a' }} />
            <span className="text-xs font-medium" style={{ color: '#555' }}>o</span>
            <div className="flex-1 h-px" style={{ background: '#2a2a2a' }} />
          </div>

          {/* Register link */}
          <p className="text-center text-sm" style={{ color: '#888' }}>
            ¿No tenés cuenta?{' '}
            <Link to="/registro" className="font-bold" style={{ color: '#e8683a' }}>
              Registrate gratis
            </Link>
          </p>

          {/* Demo card */}
          <div className="rounded-2xl p-4" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: '#e8683a' }}>
                DEMO
              </span>
              <span className="text-xs font-bold" style={{ color: '#f5f0e8' }}>Accesos de prueba</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid #2a2a2a' }}>
                <span className="text-xs font-bold" style={{ color: '#e8683a' }}>👤 Cliente</span>
                <span className="text-[11px] font-mono" style={{ color: '#888' }}>cliente@demo.com / demo123</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs font-bold" style={{ color: '#e8683a' }}>🔧 Profesional</span>
                <span className="text-[11px] font-mono" style={{ color: '#888' }}>pro@demo.com / demo123</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageShell>
  )
}
