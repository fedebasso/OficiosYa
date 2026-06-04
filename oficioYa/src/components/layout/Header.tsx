import { ChevronLeft } from 'lucide-react'

interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export function Header({ title, showBack = false, onBack }: HeaderProps) {
  return (
    <header className="bg-primary text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-50 shadow-md">
      {showBack && (
        <button
          onClick={onBack}
          aria-label="Volver"
          className="p-1 -ml-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {!showBack && (
        <span className="text-xl font-bold tracking-tight">
          Oficio<span className="text-accent">Ya</span>
        </span>
      )}

      {title && showBack && (
        <span className="text-lg font-semibold truncate">{title}</span>
      )}

      {!showBack && title && (
        <span className="ml-auto text-lg font-semibold truncate">{title}</span>
      )}
    </header>
  )
}

export default Header
