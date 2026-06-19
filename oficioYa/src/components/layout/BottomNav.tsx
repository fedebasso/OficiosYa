import { useAuthStore } from '../../store/authStore'
import { ClientBottomNav } from './ClientBottomNav'
import { ProBottomNav } from './ProBottomNav'

export function BottomNav() {
  const user = useAuthStore((s) => s.user)
  return user?.role === 'professional' ? <ProBottomNav /> : <ClientBottomNav />
}

export default BottomNav
