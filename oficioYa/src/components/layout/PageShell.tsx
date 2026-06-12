import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface PageShellProps {
  children: ReactNode
  header?: ReactNode
  showBottomNav?: boolean
}

export function PageShell({ children, header, showBottomNav = true }: PageShellProps) {
  return (
    <div style={{ background: '#F5F0E8', minHeight: '100dvh' }}>
      <div
        className="flex flex-col"
        style={{
          maxWidth: 480,
          margin: '0 auto',
          minHeight: '100dvh',
          background: '#F5F0E8',
          position: 'relative',
        }}
      >
        {header}
        <main
          className="flex-1"
          style={{
            paddingBottom: showBottomNav ? 'calc(64px + var(--safe-bottom))' : 0,
            paddingLeft: 'var(--px-container)',
            paddingRight: 'var(--px-container)',
          }}
        >
          {children}
        </main>
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  )
}

export default PageShell
