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

function CategoryButton({ cat, onClick }: { cat: Category; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden active:scale-[.97] transition-transform duration-150 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E8683A]"
      style={{ aspectRatio: '4/3', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}
    >
      <img
        src={cat.photo}
        alt={cat.label}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute inset-0 -z-10 flex items-center justify-center" style={{ background: 'rgba(232,104,58,.15)' }}>
        <span style={{ fontSize: 28 }}>{cat.emoji}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <span
          className="text-white font-black leading-tight block truncate"
          style={{ fontSize: 'var(--text-sm)', textShadow: '0 1px 3px rgba(0,0,0,.6)' }}
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
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {CATEGORIES.map((cat) => (
        <CategoryButton key={cat.id} cat={cat} onClick={() => go(cat.id)} />
      ))}
    </div>
  )
}

export default CategoryGrid
