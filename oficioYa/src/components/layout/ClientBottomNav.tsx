import { Link, useLocation } from 'react-router-dom'
import { House, FileText, MessageCircle, UserCircle } from 'lucide-react'
import { useRequestStore } from '../../store/requestStore'

export function ClientBottomNav() {
  const { pathname } = useLocation()
  const requests = useRequestStore((s) => s.requests)

  // Badge: solicitudes con chat activo (confirmed o in_progress)
  const activeChats = requests.filter(
    (r) => r.status === 'confirmed' || r.status === 'in_progress'
  ).length

  function isActive(to: string) {
    return to === '/' ? pathname === '/' : pathname.startsWith(to)
  }

  return (
    <nav
      className="fixed bottom-0 z-50 flex"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: '#FFFFFF',
        borderTop: '1px solid #E8E0D4',
        paddingBottom: 'var(--safe-bottom)',
        minHeight: 'calc(60px + var(--safe-bottom))',
      }}
    >
      {[
        { label: 'Inicio',      to: '/',               Icon: House },
        { label: 'Solicitudes', to: '/mis-solicitudes', Icon: FileText },
        { label: 'Mensajes',    to: '/mensajes',         Icon: MessageCircle, badge: activeChats },
        { label: 'Perfil',      to: '/perfil',           Icon: UserCircle },
      ].map(({ label, to, Icon, badge }) => {
        const active = isActive(to)
        return (
          <Link
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-opacity active:opacity-60"
            style={{ color: active ? '#E8683A' : '#AAAAAA', paddingTop: 10, paddingBottom: 10 }}
            aria-current={active ? 'page' : undefined}
          >
            <div className="relative">
              <Icon size={22} />
              {badge != null && badge > 0 && !active && (
                <span
                  className="absolute -top-1 -right-1.5 flex items-center justify-center rounded-full text-white font-black"
                  style={{
                    minWidth: 16,
                    height: 16,
                    fontSize: 9,
                    background: '#E8683A',
                    padding: '0 3px',
                  }}
                >
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </div>
            <span style={{ fontWeight: 700, fontSize: 'var(--text-xs, 10px)' }}>{label}</span>
            {active && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                style={{ background: '#E8683A' }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
