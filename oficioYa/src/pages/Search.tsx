import { useState, useMemo, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useBack } from '../hooks/useBack'
import { Search as SearchIcon, ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { ProfessionalCardSkeleton } from '../components/ui/Skeleton'
import { ProfessionalCard } from '../components/professionals/ProfessionalCard'
import { useProfessionals } from '../hooks/useProfessionals'
import { fadeUp, scaleIn, staggerFast, SPRING_SOFT } from '../lib/motion'

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
  const goBack = useBack('/')
  const [searchParams, setSearchParams] = useSearchParams()
  const textQuery = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(textQuery)
  const inputRef = useRef<HTMLInputElement>(null)
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
    <div
      className="px-4 pt-12 pb-3 sticky top-0 z-50"
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E0D4',
        boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={goBack}
          aria-label="Volver"
          className="p-1 -ml-1 rounded-full flex-shrink-0 active:opacity-60 transition-opacity"
        >
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
        <form
          className="flex-1 flex items-center gap-2 rounded-2xl px-3.5"
          style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', height: 44 }}
          onSubmit={(e) => {
            e.preventDefault()
            const q = inputValue.trim()
            if (q) setSearchParams({ q })
            else setSearchParams({})
            inputRef.current?.blur()
          }}
        >
          <SearchIcon size={14} style={{ color: '#E8683A', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`${label}...`}
            className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
            style={{ color: '#111111', caretColor: '#E8683A' }}
          />
        </form>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-hide">
        {FILTERS.map(f => {
          const active = activeFilters.has(f.key)
          return (
            <motion.button
              key={f.key}
              type="button"
              onClick={() => toggleFilter(f.key)}
              whileTap={{ scale: 0.94 }}
              transition={SPRING_SOFT}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-150"
              style={active ? {
                background: '#E8683A',
                color: '#FFFFFF',
                border: '1.5px solid #E8683A',
              } : {
                background: '#F5F0E8',
                color: '#555555',
                border: '1.5px solid #E8E0D4',
              }}
            >
              <span style={{ fontSize: 9 }}>{f.icon}</span>
              {f.label}
            </motion.button>
          )
        })}
      </div>

      {!loading && !error && (
        <p className="text-[10px] mt-1.5" style={{ color: '#999999' }}>
          <span style={{ color: '#111111', fontWeight: 700 }}>{filtered.length}</span> profesionales
          {activeFilters.size > 0 && <span style={{ color: '#E8683A' }}> · filtrado</span>}
        </p>
      )}
    </div>
  )

  return (
    <PageShell header={header}>
      <div className="p-4 flex flex-col gap-3" style={{ minHeight: '100%' }}>
        {loading && (
          <div className="flex flex-col gap-3">
            {[0,1,2,3].map(i => <ProfessionalCardSkeleton key={i} />)}
          </div>
        )}
        {error && (
          <p className="text-center py-8 text-sm" style={{ color: '#ef4444' }}>{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-3 py-16 text-center"
          >
            <div className="text-4xl">🔍</div>
            <p className="font-bold" style={{ color: '#111111' }}>No encontramos profesionales</p>
            <p className="text-sm" style={{ color: '#999999' }}>
              {activeFilters.size > 0 ? 'Probá quitando algún filtro' : 'Intentá con otra categoría'}
            </p>
            {activeFilters.size > 0 && (
              <motion.button
                type="button"
                onClick={() => setActiveFilters(new Set())}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_SOFT}
                className="text-sm font-bold px-4 py-2 rounded-xl"
                style={{ background: 'rgba(232,104,58,.15)', color: '#e8683a' }}
              >
                Quitar filtros
              </motion.button>
            )}
          </motion.div>
        )}
        <motion.div
          variants={staggerFast}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          {filtered.map((pro) => (
            <motion.div key={pro.id} variants={fadeUp}>
              <ProfessionalCard
                professional={pro}
                onClick={() => navigate(`/profesional/${pro.id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageShell>
  )
}
