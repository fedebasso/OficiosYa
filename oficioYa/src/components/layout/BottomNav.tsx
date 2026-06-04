import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { House, Search, FileText } from 'lucide-react'

interface NavTab {
  label: string
  to: string
  icon: ReactNode
}

const tabs: NavTab[] = [
  { label: 'Inicio', to: '/', icon: <House size={22} /> },
  { label: 'Buscar', to: '/buscar', icon: <Search size={22} /> },
  { label: 'Solicitudes', to: '/mis-solicitudes', icon: <FileText size={22} /> },
]

export function BottomNav() {
  const { pathname } = useLocation()

  function isActive(to: string): boolean {
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
      {tabs.map((tab) => {
        const active = isActive(tab.to)
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={[
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors',
              active ? 'text-primary' : 'text-gray-400',
            ].join(' ')}
            aria-current={active ? 'page' : undefined}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default BottomNav
