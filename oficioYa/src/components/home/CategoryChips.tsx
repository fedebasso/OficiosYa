import { useNavigate } from 'react-router-dom'

const CHIPS = [
  { id: 'todos',              label: 'Todos',   emoji: '' },
  { id: 'electricista',       label: 'Electr.', emoji: '⚡' },
  { id: 'plomero',            label: 'Sanit.',  emoji: '🚿' },
  { id: 'aire_acondicionado', label: 'Aire',    emoji: '❄️' },
  { id: 'cerrajero',          label: 'Cerraj.', emoji: '🔑' },
  { id: 'pintor',             label: 'Pintor',  emoji: '🎨' },
  { id: 'albanil',            label: 'Albañil', emoji: '🧱' },
]

export function CategoryChips() {
  const navigate = useNavigate()

  const handleChip = (id: string) => {
    if (id === 'todos') navigate('/buscar')
    else navigate(`/buscar/${id}`)
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto"
      style={{
        padding: '10px 16px',
        background: '#FFFFFF',
        borderBottom: '1px solid #EDE8DE',
        scrollbarWidth: 'none',
      }}
    >
      {CHIPS.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => handleChip(chip.id)}
          className="flex-shrink-0 flex items-center gap-1.5 active:opacity-70 transition-opacity"
          style={{
            height: 28,
            padding: '0 10px',
            borderRadius: 20,
            background: '#F5F0E8',
            border: '1.5px solid #EDE8DE',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            color: '#888888',
            whiteSpace: 'nowrap',
          }}
        >
          {chip.emoji && <span>{chip.emoji}</span>}
          {chip.label}
        </button>
      ))}
    </div>
  )
}

export default CategoryChips
