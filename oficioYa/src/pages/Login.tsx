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

  return (
    <PageShell showBottomNav={false}>
      <div className="flex flex-col min-h-screen">

        {/* Hero verde */}
        <div className="bg-primary px-6 pt-16 pb-14 flex flex-col items-center gap-2 relative">
          <h1 className="text-4xl font-black text-white tracking-tight leading-none">
            Oficio<span className="text-accent">Ya</span>
          </h1>
          <p className="text-white/60 text-sm">Profesionales de confianza en Montevideo</p>
          {/* Wave */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[32px]" />
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5 px-6 pt-6 pb-10">

          <div>
            <h2 className="text-xl font-black text-text-main">Bienvenido de vuelta</h2>
            <p className="text-sm text-gray-400 mt-0.5">Ingresá a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {error && (
              <div
                id="login-error"
                role="alert"
                aria-live="polite"
                className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-base pointer-events-none">
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  aria-describedby={error ? 'login-error' : undefined}
                  className="w-full bg-white border-[1.5px] border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-text-main placeholder:text-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-base pointer-events-none">
                  🔒
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  aria-describedby={error ? 'login-error' : undefined}
                  className="w-full bg-white border-[1.5px] border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-text-main placeholder:text-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white rounded-2xl py-4 text-base font-bold tracking-wide transition-all duration-150 active:scale-[.99] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              style={{ boxShadow: '0 4px 14px rgba(15,110,86,.3)' }}
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
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-300 font-medium">o</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500">
            ¿No tenés cuenta?{' '}
            <Link to="/registro" className="text-primary font-bold">
              Registrate gratis
            </Link>
          </p>

          {/* Demo card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                DEMO
              </span>
              <span className="text-xs font-bold text-emerald-800">Accesos de prueba</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between py-1.5 border-b border-green-100">
                <span className="text-xs font-bold text-primary">👤 Cliente</span>
                <span className="text-[11px] text-gray-500 font-mono">cliente@demo.com / demo123</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-xs font-bold text-primary">🔧 Profesional</span>
                <span className="text-[11px] text-gray-500 font-mono">pro@demo.com / demo123</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageShell>
  )
}
