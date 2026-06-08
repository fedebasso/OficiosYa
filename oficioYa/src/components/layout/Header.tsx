import { ChevronLeft } from 'lucide-react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export function Header({ title, showBack = false, onBack }: HeaderProps) {
  return (
    <header className="bg-background border-b border-border-dark px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
      {showBack && (
        <button
          onClick={onBack}
          aria-label="Volver"
          className="p-1 -ml-1 rounded-full hover:bg-bg-elevated active:bg-bg-elevated transition-colors"
        >
          <ChevronLeft size={24} className="text-text-main" />
        </button>
      )}

      {!showBack && (
        <span className="text-xl font-display text-text-main tracking-tight">
          Oficio<span className="text-primary">Ya</span>
        </span>
      )}

      {title && showBack && (
        <span className="text-lg font-semibold text-text-main truncate">{title}</span>
      )}

      {!showBack && title && (
        <span className="ml-auto text-lg font-semibold text-text-main truncate">{title}</span>
      )}
    </header>
  )
}

export default Header
