import { createElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORY_LABELS, getCategoryIcon } from '../../lib/categories'

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
    <div className="flex gap-3.5 overflow-x-auto" style={{ paddingBottom: 4, scrollbarWidth: 'none' }}>
      {CATEGORIES.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => navigate(`/buscar/${id}`)}
          className="flex-shrink-0 flex flex-col items-center gap-2 active:opacity-70 transition-opacity"
          style={{ width: 60 }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 19,
              background: '#FFFFFF',
              border: '1px solid #ECE4D8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px -2px rgba(60,40,20,.10)',
              color: '#4A4034',
            }}
          >
            {createElement(getCategoryIcon(id), { size: 24, strokeWidth: 1.9 })}
          </div>
          <span className="font-bold text-center" style={{ fontSize: 11.5, color: '#6B6152', maxWidth: 60, lineHeight: 1.15 }}>
            {CATEGORY_LABELS[id]}
          </span>
        </button>
      ))}
    </div>
  )
}

export default CategoryIcons
