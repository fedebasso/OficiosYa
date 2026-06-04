import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onSearch: () => void
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <button
      type="button"
      onClick={onSearch}
      className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg text-left"
      aria-label="Abrir búsqueda"
    >
      <Search size={17} className="text-primary flex-shrink-0" />
      {value ? (
        <span className="flex-1 text-sm text-text-main">{value}</span>
      ) : (
        <span className="flex-1 text-sm text-gray-400">Electricista, plomero, cerrajero...</span>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
      />
    </button>
  )
}

export default SearchBar
