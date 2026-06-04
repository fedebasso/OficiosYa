import { useNavigate } from 'react-router-dom'

interface Category {
  id: string
  label: string
  emoji: string
}

const CATEGORIES: Category[] = [
  { id: 'electricista', label: 'Electricista', emoji: '⚡' },
  { id: 'plomero', label: 'Sanitario', emoji: '🚿' },
  { id: 'aire_acondicionado', label: 'Aire Ac.', emoji: '❄️' },
  { id: 'cerrajero', label: 'Cerrajero', emoji: '🔑' },
  { id: 'albanil', label: 'Albañil', emoji: '🧱' },
]

const ROW_ONE = CATEGORIES.slice(0, 3)
const ROW_TWO = CATEGORIES.slice(3)

function CategoryButton({ cat, onClick }: { cat: Category; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col items-center justify-center gap-1.5 hover:shadow-md hover:border-accent active:scale-95 transition-all duration-150"
    >
      <span style={{ fontSize: 26, lineHeight: 1 }}>{cat.emoji}</span>
      <span className="text-[10px] uppercase font-bold text-text-main tracking-wide leading-tight text-center">
        {cat.label}
      </span>
    </button>
  )
}

export function CategoryGrid() {
  const navigate = useNavigate()
  const go = (id: string) => navigate(`/buscar/${id}`)

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {ROW_ONE.map((cat) => (
          <CategoryButton key={cat.id} cat={cat} onClick={() => go(cat.id)} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ROW_TWO.map((cat) => (
          <CategoryButton key={cat.id} cat={cat} onClick={() => go(cat.id)} />
        ))}
      </div>
    </div>
  )
}

export default CategoryGrid
