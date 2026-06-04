import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: () => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <button
      type="button"
      onClick={onSearch}
      className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg text-left"
      aria-label="Buscar profesional"
    >
      <Search size={17} className="text-primary flex-shrink-0" />
      <span className="flex-1 text-sm text-gray-400">Electricista, plomero, cerrajero...</span>
    </button>
  )
}

export default SearchBar
