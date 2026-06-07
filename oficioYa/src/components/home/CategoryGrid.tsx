import { useNavigate } from 'react-router-dom'

interface Category {
  id: string
  label: string
  emoji: string
  photo: string
}

const CATEGORIES: Category[] = [
  {
    id: 'electricista',
    label: 'Electricista',
    emoji: '⚡',
    photo: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80',
  },
  {
    id: 'plomero',
    label: 'Sanitario',
    emoji: '🚿',
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  },
  {
    id: 'aire_acondicionado',
    label: 'Aire Ac.',
    emoji: '❄️',
    photo: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80',
  },
  {
    id: 'cerrajero',
    label: 'Cerrajero',
    emoji: '🔑',
    photo: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&q=80',
  },
  {
    id: 'albanil',
    label: 'Albañil',
    emoji: '🧱',
    photo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
  },
]

const ROW_ONE = CATEGORIES.slice(0, 3)
const ROW_TWO = CATEGORIES.slice(3)

function CategoryButton({ cat, onClick }: { cat: Category; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative aspect-square rounded-2xl overflow-hidden active:scale-[.97] transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* Foto real */}
      <img
        src={cat.photo}
        alt={cat.label}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      {/* Fallback si no carga */}
      <div className="absolute inset-0 -z-10 bg-primary/20 flex items-center justify-center">
        <span style={{ fontSize: 28 }}>{cat.emoji}</span>
      </div>
      {/* Nombre */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <span
          className="text-white text-[9px] font-black uppercase tracking-wider leading-tight block"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,.6)' }}
        >
          {cat.label}
        </span>
      </div>
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
