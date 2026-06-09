import { useState } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex-shrink-0"
        style={{ color: '#e8683a' }}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Electricista, plomero, cerrajero..."
        className="w-full rounded-2xl pl-9 pr-4 py-3 text-sm focus:outline-none"
        style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          color: '#f5f0e8',
          caretColor: '#e8683a',
        }}
        onKeyDown={(e) => e.key === 'Enter' && onSearch(value.trim())}
      />
    </form>
  )
}

export default SearchBar
