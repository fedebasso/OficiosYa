import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: () => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <button
      type="button"
      onClick={onSearch}
      className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
      aria-label="Buscar profesional"
    >
      <Search size={17} className="flex-shrink-0" style={{ color: '#e8683a' }} />
      <span className="flex-1 text-sm" style={{ color: '#555' }}>Electricista, plomero, cerrajero...</span>
    </button>
  )
}

export default SearchBar
