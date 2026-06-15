import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProfessionalCard } from '../professionals/ProfessionalCard'
import { FeaturedSkeleton } from '../ui/Skeleton'
import { useProfessionals } from '../../hooks/useProfessionals'

const CATEGORY_FILTERS = [
  { id: 'todos',              label: 'Todos',        emoji: '' },
  { id: 'electricista',       label: 'Electricista', emoji: '⚡' },
  { id: 'plomero',            label: 'Sanitario',    emoji: '🚿' },
  { id: 'aire_acondicionado', label: 'Aire Ac.',     emoji: '❄️' },
  { id: 'cerrajero',          label: 'Cerrajero',    emoji: '🔑' },
  { id: 'pintor',             label: 'Pintor',       emoji: '🎨' },
  { id: 'albanil',            label: 'Albañil',      emoji: '🧱' },
]

export function FeaturedProfessionals() {
  const navigate = useNavigate()
  const { professionals, loading } = useProfessionals()
  const [activeCategory, setActiveCategory] = useState('todos')

  const featured = professionals.filter((p) => p.featured)

  const visible = activeCategory === 'todos'
    ? featured
    : featured.filter((p) => p.categories.includes(activeCategory))

  if (loading) return (
    <section>
      <h2 className="text-[11px] font-bold uppercase tracking-[.7px] mb-2.5" style={{ color: '#999999' }}>
        Más recomendados
      </h2>
      <FeaturedSkeleton />
    </section>
  )

  if (featured.length === 0) return null

  return (
    <section>
      <h2 className="text-[11px] font-bold uppercase tracking-[.7px] mb-2.5" style={{ color: '#999999' }}>
        Más recomendados
      </h2>

      {/* Filtros de categoría */}
      <div
        className="flex gap-2 overflow-x-auto mb-3"
        style={{ scrollbarWidth: 'none' }}
      >
        {CATEGORY_FILTERS.map((cat) => {
          const active = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className="flex-shrink-0 flex items-center gap-1 active:opacity-70 transition-all duration-150"
              style={{
                height: 30,
                padding: '0 12px',
                borderRadius: 20,
                background: active ? '#E8683A' : '#F5F0E8',
                border: `1.5px solid ${active ? '#E8683A' : '#EDE8DE'}`,
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: active ? '#FFFFFF' : '#888888',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.emoji && <span>{cat.emoji}</span>}
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: '#AAAAAA' }}>
          No hay profesionales destacados en esta categoría
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((pro, i) => (
            <div key={pro.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <ProfessionalCard
                professional={pro}
                onClick={() => navigate(`/profesional/${pro.id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default FeaturedProfessionals
