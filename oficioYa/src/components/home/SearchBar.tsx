import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  onSearch: () => void
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.18)' }}>
      <button
        type="button"
        onClick={onSearch}
        aria-label="Buscar"
        className="text-white/80 hover:text-white transition-colors shrink-0"
      >
        <Search size={18} />
      </button>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="¿Qué servicio buscás?"
        className="flex-1 bg-transparent text-white placeholder-white/60 text-sm outline-none"
      />
    </div>
  )
}

export default SearchBar
