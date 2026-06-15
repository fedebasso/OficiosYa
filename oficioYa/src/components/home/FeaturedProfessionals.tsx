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
        className="flex gap-2 overflow-x-auto mb-4"
        style={{ scrollbarWidth: 'none', paddingBottom: 2 }}
      >
        {CATEGORY_FILTERS.map((cat) => {
          const active = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className="flex-shrink-0 flex items-center gap-1.5 active:scale-95 transition-all duration-150"
              style={{
                height: 36,
                padding: '0 14px',
                borderRadius: 24,
                background: active ? '#E8683A' : '#FFFFFF',
                border: `1.5px solid ${active ? '#E8683A' : '#E8E0D4'}`,
                fontSize: 13,
                fontWeight: 700,
                color: active ? '#FFFFFF' : '#666666',
                whiteSpace: 'nowrap',
                boxShadow: active
                  ? '0 2px 10px rgba(232,104,58,.30)'
                  : '0 1px 3px rgba(0,0,0,.06)',
              }}
            >
              {cat.emoji && <span style={{ fontSize: 15 }}>{cat.emoji}</span>}
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: '#F5F0E8', border: '1.5px solid #E8E0D4' }}
          >
            🔍
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#111111' }}>Sin destacados en esta categoría</p>
            <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>Probá buscando directamente</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/buscar/${activeCategory}`)}
            className="text-sm font-bold active:opacity-70 transition-opacity"
            style={{ color: '#E8683A' }}
          >
            Ver todos los profesionales →
          </button>
        </div>
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
