import { Link, useLocation } from 'react-router-dom'
import { House, Search, FileText, Briefcase, UserCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export function BottomNav() {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)

  const clientTabs = [
    { label: 'Inicio',      to: '/',               icon: <House size={20} /> },
    { label: 'Buscar',      to: '/buscar',          icon: <Search size={20} /> },
    { label: 'Solicitudes', to: '/mis-solicitudes', icon: <FileText size={20} /> },
  ]

  const proTabs = [
    { label: 'Inicio',      to: '/',                icon: <House size={20} /> },
    { label: 'Solicitudes', to: '/pro/solicitudes', icon: <FileText size={20} /> },
    { label: 'Trabajos',    to: '/pro/trabajos',    icon: <Briefcase size={20} /> },
    { label: 'Perfil',      to: '/pro/perfil',      icon: <UserCircle size={20} /> },
  ]

  const tabs = user?.role === 'professional' ? proTabs : clientTabs

  function isActive(to: string): boolean {
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        background: 'rgba(10,10,10,.95)',
        borderTop: '1px solid #1a1a1a',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.to)
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-opacity active:opacity-60"
            style={{ color: active ? '#e8683a' : '#444' }}
            aria-current={active ? 'page' : undefined}
          >
            {tab.icon}
            <span className="text-[10px] font-bold">{tab.label}</span>
            {active && (
              <span
                className="absolute bottom-0 w-6 h-0.5 rounded-full"
                style={{ background: '#e8683a' }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav
