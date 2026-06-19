import { Link, useLocation } from 'react-router-dom'
import { House, FileText, MessageCircle, UserCircle } from 'lucide-react'

const TABS = [
  { label: 'Inicio',      to: '/',                icon: House },
  { label: 'Solicitudes', to: '/mis-solicitudes',  icon: FileText },
  { label: 'Mensajes',    to: '/mensajes',          icon: MessageCircle },
  { label: 'Perfil',      to: '/perfil',            icon: UserCircle },
]

export function ClientBottomNav() {
  const { pathname } = useLocation()

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
      {TABS.map(({ label, to, icon: Icon }) => {
        const active = isActive(to)
        return (
          <Link
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-opacity active:opacity-60"
            style={{ color: active ? '#E8683A' : '#AAAAAA', paddingTop: 10, paddingBottom: 10 }}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={22} />
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
