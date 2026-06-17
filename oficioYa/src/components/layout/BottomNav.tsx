import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { House, FileText, Briefcase, UserCircle, Menu } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { MoreMenu } from './MoreMenu'
import { useIncomingRequests } from '../../hooks/useRequests'

interface NavTab {
  label: string
  to: string
  icon: ReactNode
  badge?: number | null
  onPress?: () => void
}

export function BottomNav() {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const [moreOpen, setMoreOpen] = useState(false)
  const { requests: incomingReqs } = useIncomingRequests(user?.id ?? '')
  const pendingCount = user?.role === 'professional' ? incomingReqs.filter(r => r.status === 'pending').length : 0

  const clientTabs: NavTab[] = [
    { label: 'Inicio',      to: '/',               icon: <House size={22} /> },
    { label: 'Solicitudes', to: '/mis-solicitudes', icon: <FileText size={22} /> },
    { label: 'Más',         to: '',                 icon: <Menu size={22} />, onPress: () => setMoreOpen(v => !v) },
  ]

  const proTabs: NavTab[] = [
    { label: 'Inicio',      to: '/',                icon: <House size={22} /> },
    { label: 'Solicitudes', to: '/pro/solicitudes', icon: <FileText size={22} />, badge: pendingCount > 0 ? pendingCount : null },
    { label: 'Trabajos',    to: '/pro/trabajos',    icon: <Briefcase size={22} /> },
    { label: 'Perfil',      to: '/pro/perfil',      icon: <UserCircle size={22} /> },
  ]

  const tabs = user?.role === 'professional' ? proTabs : clientTabs

  function isActive(to: string): boolean {
    if (to === '') return moreOpen
    if (to === '/') return pathname === '/'
    return pathname.startsWith(to)
  }

  return (
    <>
      <MoreMenu open={moreOpen} onClose={() => setMoreOpen(false)} />

      <nav
        className="fixed bottom-0 z-50 flex"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          background: '#FFFFFF',
          borderTop: '1px solid #E8E0D4',
          boxShadow: '0 -1px 0 #E8E0D4',
          paddingBottom: 'var(--safe-bottom)',
          minHeight: 'calc(60px + var(--safe-bottom))',
        }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.to)
          const content = (
            <>
              <div className="relative">
                {tab.icon}
                {'badge' in tab && tab.badge && (
                  <span
                    className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-white"
                    style={{ background: '#EF4444', fontSize: 9 }}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-xs)' }}>{tab.label}</span>
              {active && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ background: '#E8683A' }}
                />
              )}
            </>
          )

          if (tab.onPress) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={tab.onPress}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-opacity active:opacity-60"
                style={{
                  color: active ? '#E8683A' : '#AAAAAA',
                  paddingTop: 10,
                  paddingBottom: 10,
                }}
              >
                {content}
              </button>
            )
          }

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-opacity active:opacity-60"
              style={{
                color: active ? '#E8683A' : '#AAAAAA',
                paddingTop: 10,
                paddingBottom: 10,
              }}
              aria-current={active ? 'page' : undefined}
            >
              {content}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export default BottomNav
