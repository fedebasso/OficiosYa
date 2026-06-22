import { type ReactNode, useEffect } from 'react'
import { ClientBottomNav } from '../components/layout/ClientBottomNav'
import { useRequestStore } from '../store/requestStore'
import { useAuthStore } from '../store/authStore'

export function ClientLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const loadRequests = useRequestStore((s) => s.loadRequests)

  useEffect(() => {
    if (user?.id) loadRequests()
  }, [user?.id, loadRequests])

  return (
    <>
      {children}
      <ClientBottomNav />
    </>
  )
}
