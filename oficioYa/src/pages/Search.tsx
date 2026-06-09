import { useState, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { ProfessionalCardSkeleton } from '../components/ui/Skeleton'
import { ProfessionalCard } from '../components/professionals/ProfessionalCard'
import { useProfessionals } from '../hooks/useProfessionals'

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricistas',
  plomero: 'Sanitarios',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero: 'Cerrajeros',
  albanil: 'Albañiles',
}

type Filter = 'disponible' | 'top' | 'rating'

export default function Search() {
  const { categoria } = useParams<{ categoria: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const textQuery = searchParams.get('q') ?? ''
  const { professionals, loading, error } = useProfessionals(categoria)
  const [activeFilters, setActiveFilters] = useState<Set<Filter>>(new Set())

  const label = categoria ? CATEGORY_LABELS[categoria] ?? categoria : textQuery ? `"${textQuery}"` : 'Profesionales'

  function toggleFilter(f: Filter) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      next.has(f) ? next.delete(f) : next.add(f)
      return next
    })
  }

  const filtered = useMemo(() => {
    let list = [...professionals]
    if (textQuery) {
      const q = textQuery.toLowerCase()
      list = list.filter(p =>
        p.profiles.full_name.toLowerCase().includes(q) ||
        p.categories.some(c => c.toLowerCase().includes(q)) ||
        p.zone.toLowerCase().includes(q) ||
        (p.bio ?? '').toLowerCase().includes(q)
      )
    }
    if (activeFilters.has('disponible')) list = list.filter(p => p.available_now)
    if (activeFilters.has('top'))        list = list.filter(p => p.jobs_count >= 50 && (p.avg_rating ?? 0) >= 4.8)
    if (activeFilters.has('rating'))     list = list.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
    return list
  }, [professionals, activeFilters, textQuery])

  const FILTERS: { key: Filter; label: string; icon: string }[] = [
    { key: 'disponible', label: 'Disponibles', icon: '●' },
    { key: 'top',        label: 'Top Pro',     icon: '★' },
    { key: 'rating',     label: 'Mejor rating', icon: '↑' },
  ]

  const header = (
    <div className="border-b px-4 py-3 sticky top-0 z-50" style={{ background: '#0f0f0f', borderColor: '#1e1e1e' }}>
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 active:opacity-70 transition-opacity"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f5f0e8' }}
        >
          ←
        </button>
        <div
          className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
        >
          <span style={{ color: '#e8683a' }} className="text-sm">🔍</span>
          <span className="text-sm truncate" style={{ color: textQuery ? '#f5f0e8' : '#555' }}>
            {textQuery || `${label}...`}
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-hide">
        {FILTERS.map(f => {
          const active = activeFilters.has(f.key)
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => toggleFilter(f.key)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-150 active:scale-[.97]"
              style={active ? {
                background: '#e8683a',
                color: '#fff',
                border: '1px solid #e8683a',
              } : {
                background: '#1a1a1a',
                color: '#888',
                border: '1px solid #2a2a2a',
              }}
            >
              <span style={{ fontSize: 9 }}>{f.icon}</span>
              {f.label}
            </button>
          )
        })}
      </div>

      {!loading && !error && (
        <p className="text-[10px] mt-1.5" style={{ color: '#555' }}>
          <span style={{ color: '#f5f0e8', fontWeight: 700 }}>{filtered.length}</span> profesionales
          {activeFilters.size > 0 && <span style={{ color: '#e8683a' }}> · filtrado</span>}
        </p>
      )}
    </div>
  )

  return (
    <PageShell header={header}>
      <div className="p-4 flex flex-col gap-3" style={{ background: '#0f0f0f', minHeight: '100%' }}>
        {loading && (
          <div className="flex flex-col gap-3">
            {[0,1,2,3].map(i => <ProfessionalCardSkeleton key={i} />)}
          </div>
        )}
        {error && (
          <p className="text-center py-8 text-sm" style={{ color: '#ef4444' }}>{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="text-4xl">🔍</div>
            <p className="font-bold" style={{ color: '#f5f0e8' }}>No encontramos profesionales</p>
            <p className="text-sm" style={{ color: '#555' }}>
              {activeFilters.size > 0 ? 'Probá quitando algún filtro' : 'Intentá con otra categoría'}
            </p>
            {activeFilters.size > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilters(new Set())}
                className="text-sm font-bold px-4 py-2 rounded-xl"
                style={{ background: 'rgba(232,104,58,.15)', color: '#e8683a' }}
              >
                Quitar filtros
              </button>
            )}
          </div>
        )}
        {filtered.map((pro, i) => (
          <div key={pro.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <ProfessionalCard
              professional={pro}
              onClick={() => navigate(`/profesional/${pro.id}`)}
            />
          </div>
        ))}
      </div>
    </PageShell>
  )
}
