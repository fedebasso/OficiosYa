import { useNavigate } from 'react-router-dom'
import { Heart, User, Wrench, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface MoreMenuProps {
  open: boolean
  onClose: () => void
}

export function MoreMenu({ open, onClose }: MoreMenuProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)

  const go = (path: string) => {
    onClose()
    navigate(path)
  }

  const handleSignOut = async () => {
    onClose()
    await signOut()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 transition-opacity duration-200"
        style={{
          zIndex: 45,
          background: 'rgba(0,0,0,.4)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed left-0 right-0 rounded-t-3xl"
        style={{
          zIndex: 45,
          bottom: 'calc(60px + var(--safe-bottom))',
          background: '#FFFFFF',
          padding: '12px 16px 16px',
          boxShadow: '0 -4px 24px rgba(0,0,0,.10)',
          transform: open ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 300ms var(--ease-ios)',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        {/* Handle */}
        <div
          className="mx-auto mb-4 rounded-full"
          style={{ width: 36, height: 4, background: '#E8E0D4' }}
        />

        <div className="flex flex-col gap-2">
          {/* Favoritos */}
          <button
            type="button"
            onClick={() => go('/favoritos')}
            className="w-full flex items-center gap-3 rounded-2xl active:opacity-60 transition-opacity"
            style={{ background: '#F5F0E8', padding: 'var(--space-4)' }}
          >
            <Heart size={20} style={{ color: '#E8683A', flexShrink: 0 }} />
            <span className="font-bold flex-1 text-left" style={{ fontSize: 'var(--text-base)', color: '#111111' }}>
              Mis favoritos
            </span>
            <ChevronRight size={18} style={{ color: '#CCCCCC' }} />
          </button>

          {/* Perfil */}
          <button
            type="button"
            onClick={() => go('/perfil')}
            className="w-full flex items-center gap-3 rounded-2xl active:opacity-60 transition-opacity"
            style={{ background: '#F5F0E8', padding: 'var(--space-4)' }}
          >
            <User size={20} style={{ color: '#E8683A', flexShrink: 0 }} />
            <span className="font-bold flex-1 text-left" style={{ fontSize: 'var(--text-base)', color: '#111111' }}>
              Mi perfil
            </span>
            <ChevronRight size={18} style={{ color: '#CCCCCC' }} />
          </button>

          {/* Separador */}
          <div style={{ height: 1, background: '#E8E0D4', margin: '4px 0' }} />

          {/* Ser profesional — solo si es cliente */}
          {user?.role === 'client' && (
            <button
              type="button"
              onClick={() => go('/pro/registro')}
              className="w-full flex items-center gap-3 rounded-2xl active:opacity-60 transition-opacity"
              style={{ background: '#FEF0EA', padding: 'var(--space-4)' }}
            >
              <Wrench size={20} style={{ color: '#E8683A', flexShrink: 0 }} />
              <span className="font-bold flex-1 text-left" style={{ fontSize: 'var(--text-base)', color: '#E8683A' }}>
                Quiero ser profesional
              </span>
              <ChevronRight size={18} style={{ color: '#E8683A', opacity: 0.5 }} />
            </button>
          )}

          {/* Cerrar sesión */}
          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 rounded-2xl active:opacity-60 transition-opacity"
              style={{ background: '#FEF2F2', padding: 'var(--space-4)' }}
            >
              <LogOut size={20} style={{ color: '#EF4444', flexShrink: 0 }} />
              <span className="font-bold flex-1 text-left" style={{ fontSize: 'var(--text-base)', color: '#EF4444' }}>
                Cerrar sesión
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default MoreMenu
