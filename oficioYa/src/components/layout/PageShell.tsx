import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface PageShellProps {
  children: ReactNode
  header?: ReactNode
  showBottomNav?: boolean
}

export function PageShell({ children, header, showBottomNav = true }: PageShellProps) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F5F0E8' }}>
      {header}
      <main className={['flex-1', showBottomNav ? 'pb-16' : ''].join(' ')}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  )
}

export default PageShell
