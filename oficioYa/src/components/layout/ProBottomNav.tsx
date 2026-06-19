import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, UserCircle } from 'lucide-react'
import { useProRequestsStore } from '../../store/proRequestsStore'
import { useAuthStore } from '../../store/authStore'
import { useEffect } from 'react'

export function ProBottomNav() {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const load = useProRequestsStore((s) => s.load)
  const requests = useProRequestsStore((s) => s.requests)
  const pendingCount = requests.filter((r) => r.status === 'pending').length

  useEffect(() => {
    if (user?.id) load(user.id)
  }, [user?.id, load])

  const TABS = [
    { label: 'Dashboard',   to: '/pro/dashboard',   icon: LayoutDashboard, badge: pendingCount > 0 ? pendingCount : null },
    { label: 'Solicitudes', to: '/pro/solicitudes',  icon: FileText, badge: null },
    { label: 'Perfil',      to: '/pro/perfil',       icon: UserCircle, badge: null },
  ]

  function isActive(to: string) {
    return pathname.startsWith(to)
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
      {TABS.map(({ label, to, icon: Icon, badge }) => {
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
              {badge !== null && (
                <span
                  className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-white"
                  style={{ background: '#EF4444', fontSize: 9 }}
                >
                  {badge}
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
