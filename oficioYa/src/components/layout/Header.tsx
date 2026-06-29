import { ChevronLeft } from 'lucide-react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export function Header({ title, showBack = false, onBack }: HeaderProps) {
  return (
    <header
      className="flex items-center gap-3 sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E0D4',
        boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)',
        paddingTop: 'calc(12px + var(--safe-top))',
        paddingBottom: '12px',
        paddingLeft: 'var(--px-container)',
        paddingRight: 'var(--px-container)',
        minHeight: 'calc(56px + var(--safe-top))',
      }}
    >
      {showBack && (
        <button
          onClick={onBack}
          aria-label="Volver"
          className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity"
        >
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
      )}

      {!showBack && (
        <span
          className="font-black"
          style={{
            fontSize: 22,
            letterSpacing: '-1px',
            lineHeight: 1,
            background: 'linear-gradient(90deg, #FF6B00 0%, #cc5500 60%, #1a1a1a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >OFIX</span>
      )}

      {title && showBack && (
        <span
          className="font-bold truncate"
          style={{ color: '#111111', fontSize: 'var(--text-base)' }}
        >
          {title}
        </span>
      )}

      {!showBack && title && (
        <span
          className="ml-auto font-bold truncate"
          style={{ color: '#111111', fontSize: 'var(--text-base)' }}
        >
          {title}
        </span>
      )}
    </header>
  )
}

export default Header
