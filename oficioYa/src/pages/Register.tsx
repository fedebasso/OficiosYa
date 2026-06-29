import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { useAuthStore } from '../store/authStore'
import { Eye, EyeOff, ChevronLeft } from 'lucide-react'
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

export default function Register() {
  const navigate  = useNavigate()
  const signUp    = useAuthStore((s) => s.signUp)
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [role, setRole]           = useState<'client' | 'professional'>('client')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

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
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <span
              className="font-black"
              style={{
                fontSize: 40,
                letterSpacing: '-2px',
                lineHeight: 1,
                background: 'linear-gradient(90deg, #FF6B00 0%, #cc5500 60%, #1a1a1a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              OFIX
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 28 }}
            className="text-sm font-medium"
            style={{ color: 'rgba(255,255,255,.8)' }}
          >
            Creá tu cuenta gratis
          </motion.p>
          <div className="absolute bottom-0 left-0 right-0 h-10 rounded-t-[32px]" style={{ background: '#F5F0E8' }} />
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
              Empezá ahora
            </h2>
            <p className="text-sm mt-1" style={{ color: '#999999' }}>Solo te lleva 1 minuto</p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <AnimatePresence>
              {error && (
                <motion.div
                  role="alert" aria-live="polite"
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

          {/* Selector de rol — primero para contexto */}
          <motion.div variants={fadeUp} className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
              Soy...
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'client',       icon: '👤', name: 'Cliente',      desc: 'Busco profesionales para mi hogar' },
                { value: 'professional', icon: '🔧', name: 'Profesional',  desc: 'Ofrezco mis servicios y consigo clientes' },
              ] as const).map((opt) => {
                const active = role === opt.value
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    whileTap={{ scale: 0.95 }}
                    transition={SPRING_SOFT}
                    className="flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-150"
                    style={{
                      background: active ? '#FEF0EA' : '#FFFFFF',
                      border: active ? '2px solid #E8683A' : '1.5px solid #E8E0D4',
                      boxShadow: active ? '0 2px 8px rgba(232,104,58,.15)' : '0 1px 3px rgba(0,0,0,.04)',
                    }}
                    aria-pressed={active}
                  >
                    <span style={{ fontSize: 28, lineHeight: 1 }}>{opt.icon}</span>
                    <span className="text-sm font-black" style={{ color: active ? '#E8683A' : '#111111' }}>
                      {opt.name}
                    </span>
                    <span className="text-[10px] text-center leading-tight" style={{ color: '#999999' }}>
                      {opt.desc}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="flex flex-col gap-3">

            {/* Nombre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
                Nombre completo
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#CCCCCC', fontSize: 16 }}>👤</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  style={INPUT_STYLE}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
                Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#CCCCCC', fontSize: 16 }}>✉️</span>
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#CCCCCC', fontSize: 16 }}>🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
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
                  Creando cuenta...
                </span>
              ) : 'Crear cuenta'}
            </motion.button>

          </motion.form>

          {/* Divider */}
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: '#E8E0D4' }} />
            <span className="text-xs font-medium" style={{ color: '#CCCCCC' }}>o</span>
            <div className="flex-1 h-px" style={{ background: '#E8E0D4' }} />
          </motion.div>

          {/* Login link */}
          <motion.p variants={fadeUp} className="text-center text-sm" style={{ color: '#999999' }}>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="font-bold" style={{ color: '#E8683A' }}>
              Iniciá sesión
            </Link>
          </motion.p>

        </motion.div>
      </div>
    </PageShell>
  )
}
