import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, staggerContainer, SPRING_SOFT } from '../lib/motion'

const INPUT_STYLE = {
  background: '#FFFFFF',
  border: '1.5px solid #E8E0D4',
  color: '#111111',
  borderRadius: '14px',
  padding: '14px 16px 14px 48px',
  fontSize: 16,
  width: '100%',
  outline: 'none',
  caretColor: '#E8683A',
}

export default function Login() {
  const navigate = useNavigate()
  const signIn = useAuthStore((s) => s.signIn)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

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

  const fillDemo = (role: 'client' | 'professional') => {
    setEmail(role === 'client' ? 'cliente@demo.com' : 'pro@demo.com')
    setPassword('demo123')
  }

  return (
    <PageShell showBottomNav={false}>
      <div className="flex flex-col min-h-screen" style={{ background: '#F5F0E8' }}>

        {/* Hero naranja */}
        <div
          className="px-6 pt-16 pb-14 flex flex-col items-center gap-2 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #E8683A 0%, #c44d1f 100%)' }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="absolute top-10 left-4 p-1 rounded-full active:opacity-60 transition-opacity"
          >
            <ChevronLeft size={24} color="#FFFFFF" />
          </button>
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,.12) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-1 -left-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%)' }}
          />
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="text-[40px] font-black tracking-tight leading-none"
            style={{ color: '#FFFFFF', letterSpacing: '-2px' }}
          >
            <span style={{ color: '#FFFFFF' }}>O</span><span style={{ color: 'rgba(255,255,255,.7)' }}>fix</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 28 }}
            className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,.8)' }}
          >
            Profesionales de confianza en Montevideo
          </motion.p>
          <div
            className="absolute bottom-0 left-0 right-0 h-10 rounded-t-[32px]"
            style={{ background: '#F5F0E8' }}
          />
        </div>

        {/* Form */}
        <motion.div
          className="flex flex-col gap-5 px-5 pt-6 pb-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >

          <motion.div variants={fadeUp}>
            <h2 className="text-2xl font-black" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
              Bienvenido de vuelta
            </h2>
            <p className="text-sm mt-1" style={{ color: '#999999' }}>Ingresá a tu cuenta para continuar</p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <AnimatePresence>
              {error && (
                <motion.div
                  role="alert"
                  aria-live="polite"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="rounded-2xl px-4 py-3 text-sm font-medium flex items-center gap-2"
                  style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', color: '#DC2626' }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={fadeUp}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#CCCCCC', fontSize: 16 }}>
                    ✉️
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    style={INPUT_STYLE}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#CCCCCC', fontSize: 16 }}>
                    🔒
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{ ...INPUT_STYLE, paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 active:opacity-60"
                    style={{ color: '#CCCCCC' }}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_SOFT}
                className="w-full rounded-2xl py-4 text-base font-black tracking-wide disabled:opacity-50 mt-1"
                style={{
                  background: '#E8683A',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(232,104,58,.35)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Ingresando...
                  </span>
                ) : 'Ingresar'}
              </motion.button>

            </form>
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: '#E8E0D4' }} />
            <span className="text-xs font-medium" style={{ color: '#CCCCCC' }}>o</span>
            <div className="flex-1 h-px" style={{ background: '#E8E0D4' }} />
          </motion.div>

          {/* Register link */}
          <motion.p variants={fadeUp} className="text-center text-sm" style={{ color: '#999999' }}>
            ¿No tenés cuenta?{' '}
            <Link to="/registro" className="font-bold" style={{ color: '#E8683A' }}>
              Registrate gratis
            </Link>
          </motion.p>

          {/* Demo card — clickeable */}
          <motion.div
            variants={fadeUp}
            className="rounded-2xl p-4"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full"
                style={{ background: '#E8683A' }}
              >
                DEMO
              </span>
              <span className="text-xs font-bold" style={{ color: '#111111' }}>Accesos de prueba</span>
            </div>
            <div className="flex flex-col gap-2">
              <motion.button
                type="button"
                onClick={() => fillDemo('client')}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_SOFT}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl w-full text-left"
                style={{ background: '#F5F0E8', border: '1px solid #E8E0D4' }}
              >
                <span className="text-xs font-bold" style={{ color: '#E8683A' }}>👤 Cliente</span>
                <span className="text-[11px] font-mono" style={{ color: '#999999' }}>cliente@demo.com</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => fillDemo('professional')}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_SOFT}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl w-full text-left"
                style={{ background: '#F5F0E8', border: '1px solid #E8E0D4' }}
              >
                <span className="text-xs font-bold" style={{ color: '#E8683A' }}>🔧 Profesional</span>
                <span className="text-[11px] font-mono" style={{ color: '#999999' }}>pro@demo.com</span>
              </motion.button>
            </div>
            <p className="text-[10px] mt-2 text-center" style={{ color: '#CCCCCC' }}>
              Toca un acceso para auto-completar
            </p>
          </motion.div>

        </motion.div>
      </div>
    </PageShell>
  )
}
