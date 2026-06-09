import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface PageShellProps {
  children: ReactNode
  header?: ReactNode
  showBottomNav?: boolean
}

export function PageShell({ children, header, showBottomNav = true }: PageShellProps) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0f0f0f' }}>
      {header}
      <main className={['flex-1', showBottomNav ? 'pb-16' : ''].join(' ')}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  )
}

export default PageShell
