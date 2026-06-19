import type { ReactNode } from 'react'
import { ProBottomNav } from '../components/layout/ProBottomNav'

export function ProLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ProBottomNav />
    </>
  )
}
