import { useNavigate } from 'react-router-dom'
import { CATEGORY_GRADIENT, CATEGORY_EMOJI, CATEGORY_LABELS } from '../../lib/categories'

const CATEGORIES = [
  'electricista',
  'plomero',
  'aire_acondicionado',
  'cerrajero',
  'pintor',
  'albanil',
] as const

export function CategoryIcons() {
  const navigate = useNavigate()

  return (
    <div
      className="flex gap-4 overflow-x-auto"
      style={{ paddingBottom: 4, scrollbarWidth: 'none' }}
    >
      {CATEGORIES.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => navigate(`/buscar/${id}`)}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 active:opacity-70 transition-opacity"
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: CATEGORY_GRADIENT[id] ?? 'linear-gradient(135deg, #F5F0E8, #EDE8DE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              boxShadow: '0 2px 10px rgba(0,0,0,.08)',
            }}
          >
            {CATEGORY_EMOJI[id]}
          </div>
          <span
            className="font-bold text-center"
            style={{
              fontSize: 'var(--text-xs)',
              color: '#555555',
              maxWidth: 56,
              lineHeight: 1.2,
            }}
          >
            {CATEGORY_LABELS[id]}
          </span>
        </button>
      ))}
    </div>
  )
}

export default CategoryIcons
