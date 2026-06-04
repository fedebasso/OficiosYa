import { useNavigate } from 'react-router-dom'

interface Category {
  id: string
  label: string
  emoji: string
}

const CATEGORIES: Category[] = [
  { id: 'electricista', label: 'Electricista', emoji: '⚡' },
  { id: 'plomero', label: 'Sanitario', emoji: '🚿' },
  { id: 'aire_acondicionado', label: 'Aire Acond.', emoji: '❄️' },
]

export function CategoryGrid() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-3 gap-3">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => navigate(`/buscar/${cat.id}`)}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-[10px] flex flex-col items-center justify-center gap-1.5 hover:shadow-md active:scale-95 transition-all"
        >
          <span style={{ fontSize: 28, lineHeight: 1 }}>{cat.emoji}</span>
          <span className="text-[11px] uppercase font-semibold text-text-main tracking-wide leading-tight text-center">
            {cat.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export default CategoryGrid
