import { useState, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  initialValue?: string
}

export function SearchBar({ onSearch, initialValue = '' }: SearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value.trim())
    inputRef.current?.blur()
  }

  const clear = () => {
    setValue('')
    onSearch('')
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 rounded-2xl"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E8E0D4',
        height: 48,
        paddingLeft: 'var(--px-container)',
        paddingRight: 'var(--px-container)',
        boxShadow: '0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      <Search size={16} style={{ color: '#E8683A', flexShrink: 0 }} />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Electricista, plomero, cerrajero..."
        className="flex-1 bg-transparent focus:outline-none min-w-0"
        style={{ color: '#111111', caretColor: '#E8683A', fontSize: 16 }}
      />
      {value && (
        <button type="button" onClick={clear} className="flex-shrink-0 active:opacity-60">
          <X size={15} style={{ color: '#AAAAAA' }} />
        </button>
      )}
    </form>
  )
}

export default SearchBar
