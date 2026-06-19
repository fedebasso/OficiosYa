import type { ReactNode } from 'react'
import { ClientBottomNav } from '../components/layout/ClientBottomNav'

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ClientBottomNav />
    </>
  )
}
