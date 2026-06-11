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
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E0D4',
        boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)',
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
        <span className="text-xl font-black tracking-tight" style={{ color: '#111111' }}>
          Oficio<span style={{ color: '#E8683A' }}>Ya</span>
        </span>
      )}

      {title && showBack && (
        <span className="text-base font-bold truncate" style={{ color: '#111111' }}>{title}</span>
      )}

      {!showBack && title && (
        <span className="ml-auto text-base font-bold truncate" style={{ color: '#111111' }}>{title}</span>
      )}
    </header>
  )
}

export default Header
