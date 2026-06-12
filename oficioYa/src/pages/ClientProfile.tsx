import { Navigate, useNavigate } from 'react-router-dom'
import { Heart, FileText, Wrench, LogOut, ChevronRight } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { Header } from '../components/layout/Header'
import { useAuthStore } from '../store/authStore'
import { getInitials } from '../lib/utils'

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
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-2xl active:opacity-60 transition-opacity"
      style={{ background: bg, padding: 'var(--space-4)' }}
    >
      <span style={{ color, flexShrink: 0 }}>{icon}</span>
      <span className="font-bold flex-1 text-left" style={{ fontSize: 'var(--text-base)', color }}>
        {label}
      </span>
      {!danger && <ChevronRight size={18} style={{ color: '#CCCCCC' }} />}
    </button>
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
      <div className="flex flex-col gap-4 pt-4 pb-6">

        {/* Avatar + nombre + rol */}
        <div className="flex flex-col items-center gap-2 py-4">
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
        </div>

        {/* Mi actividad */}
        <div className="flex flex-col gap-2">
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
        </div>

        {/* Ajustes */}
        <div className="flex flex-col gap-2">
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
              onClick={() => navigate('/pro/registro')}
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
        </div>

      </div>
    </PageShell>
  )
}
