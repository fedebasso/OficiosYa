import { Navigate, useNavigate } from 'react-router-dom'
import { Heart, FileText, Wrench, LogOut, ChevronRight } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { Header } from '../components/layout/Header'
import { useAuthStore } from '../store/authStore'
import { getInitials } from '../lib/utils'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, SPRING_SOFT } from '../lib/motion'

function ProfileRow({
  icon,
  label,
  onClick,
  accent = false,
  danger = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  accent?: boolean
  danger?: boolean
}) {
  const color = danger ? '#EF4444' : accent ? '#E8683A' : '#111111'
  const bg = danger ? '#FEF2F2' : accent ? '#FEF0EA' : '#F5F0E8'

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SOFT}
      className="w-full flex items-center gap-3 rounded-2xl"
      style={{ background: bg, padding: 'var(--space-4)' }}
    >
      <span style={{ color, flexShrink: 0 }}>{icon}</span>
      <span className="font-bold flex-1 text-left" style={{ fontSize: 'var(--text-base)', color }}>
        {label}
      </span>
      {!danger && <ChevronRight size={18} style={{ color: '#CCCCCC' }} />}
    </motion.button>
  )
}

export default function ClientProfile() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)

  if (!user) return <Navigate to="/login" replace />

  const initials = getInitials(user.full_name)
  const roleLabel = user.role === 'professional' ? 'Profesional' : 'Cliente'

  const header = (
    <Header
      title="Mi perfil"
      showBack
      onBack={() => navigate(-1)}
    />
  )

  return (
    <PageShell header={header} showBottomNav>
      <motion.div
        className="flex flex-col gap-4 pt-4 pb-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >

        {/* Avatar + nombre + rol */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 py-4">
          <div
            className="rounded-full flex items-center justify-center font-black text-white"
            style={{
              width: 72,
              height: 72,
              background: 'linear-gradient(135deg, #f5b99a, #E8683A)',
              fontSize: 'var(--text-2xl)',
            }}
          >
            {initials}
          </div>
          <h1 className="font-bold" style={{ fontSize: 'var(--text-xl)', color: '#111111' }}>
            {user.full_name}
          </h1>
          <span
            className="px-3 py-1 rounded-full font-bold"
            style={{ fontSize: 'var(--text-xs)', background: '#F5F0E8', color: '#555555' }}
          >
            {roleLabel}
          </span>
        </motion.div>

        {/* Mi actividad */}
        <motion.div variants={fadeUp} className="flex flex-col gap-2">
          <h2
            className="font-bold uppercase tracking-wide"
            style={{ fontSize: 'var(--text-xs)', color: '#999999' }}
          >
            Mi actividad
          </h2>
          <ProfileRow
            icon={<Heart size={20} />}
            label="Mis favoritos"
            onClick={() => navigate('/favoritos')}
          />
          <ProfileRow
            icon={<FileText size={20} />}
            label="Mis solicitudes"
            onClick={() => navigate('/mis-solicitudes')}
          />
        </motion.div>

        {/* Ajustes */}
        <motion.div variants={fadeUp} className="flex flex-col gap-2">
          <h2
            className="font-bold uppercase tracking-wide"
            style={{ fontSize: 'var(--text-xs)', color: '#999999' }}
          >
            Ajustes
          </h2>
          {user.role === 'client' && (
            <ProfileRow
              icon={<Wrench size={20} />}
              label="Quiero ser profesional"
              onClick={() => navigate('/pro/onboarding')}
              accent
            />
          )}
          <ProfileRow
            icon={<LogOut size={20} />}
            label="Cerrar sesión"
            onClick={async () => {
              await signOut()
              navigate('/login')
            }}
            danger
          />
        </motion.div>

      </motion.div>
    </PageShell>
  )
}
