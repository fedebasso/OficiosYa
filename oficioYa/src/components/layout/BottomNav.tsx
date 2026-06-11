import { Link, useLocation } from 'react-router-dom'
import { House, Search, FileText, Briefcase, UserCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export function BottomNav() {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)

  const clientTabs = [
    { label: 'Inicio',      to: '/',               icon: <House size={22} /> },
    { label: 'Buscar',      to: '/buscar',          icon: <Search size={22} /> },
    { label: 'Solicitudes', to: '/mis-solicitudes', icon: <FileText size={22} /> },
  ]

  const proTabs = [
    { label: 'Inicio',      to: '/',                icon: <House size={22} /> },
    { label: 'Solicitudes', to: '/pro/solicitudes', icon: <FileText size={22} /> },
    { label: 'Trabajos',    to: '/pro/trabajos',    icon: <Briefcase size={22} /> },
    { label: 'Perfil',      to: '/pro/perfil',      icon: <UserCircle size={22} /> },
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
        background: '#FFFFFF',
        borderTop: '1px solid #E8E0D4',
        boxShadow: '0 -1px 0 #E8E0D4',
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.to)
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-opacity active:opacity-60"
            style={{ color: active ? '#E8683A' : '#AAAAAA' }}
            aria-current={active ? 'page' : undefined}
          >
            {tab.icon}
            <span className="text-[10px] font-bold">{tab.label}</span>
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

export default BottomNav
