import { ChevronLeft } from 'lucide-react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export function Header({ title, showBack = false, onBack }: HeaderProps) {
  return (
    <header
      className="px-4 py-3 flex items-center gap-3 sticky top-0 z-50"
      style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }}
    >
      {showBack && (
        <button
          onClick={onBack}
          aria-label="Volver"
          className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity"
        >
          <ChevronLeft size={24} style={{ color: '#f5f0e8' }} />
        </button>
      )}

      {!showBack && (
        <span className="text-xl font-black tracking-tight" style={{ color: '#f5f0e8' }}>
          Oficio<span style={{ color: '#e8683a' }}>Ya</span>
        </span>
      )}

      {title && showBack && (
        <span className="text-lg font-semibold truncate" style={{ color: '#f5f0e8' }}>{title}</span>
      )}

      {!showBack && title && (
        <span className="ml-auto text-lg font-semibold truncate" style={{ color: '#f5f0e8' }}>{title}</span>
      )}
    </header>
  )
}

export default Header
