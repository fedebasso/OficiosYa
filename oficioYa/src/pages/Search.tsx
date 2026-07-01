import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useBack } from '../hooks/useBack'
import { Search as SearchIcon, ChevronLeft, Clock, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { ProfessionalCardSkeleton } from '../components/ui/Skeleton'
import { ProfessionalCard } from '../components/professionals/ProfessionalCard'
import { useProfessionals } from '../hooks/useProfessionals'
import { fadeUp, scaleIn, staggerFast, SPRING_SOFT } from '../lib/motion'
import { POPULAR_BARRIOS } from '../lib/barrios'

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricistas',
  plomero: 'Sanitarios',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero: 'Cerrajeros',
  albanil: 'Albañiles',
  pintor: 'Pintores',
}

const RATING_OPTIONS: { label: string; value: number | null }[] = [
  { label: '★ Rating', value: null },
  { label: '★ 4.0+',  value: 4.0 },
  { label: '★ 4.5+',  value: 4.5 },
  { label: '★ 4.8+',  value: 4.8 },
]

const AUTOCOMPLETE_CATEGORIES = [
  { id: 'electricista',       emoji: '⚡', label: 'Electricista',      keywords: ['electri', 'luz', 'tomacorriente', 'tablero'] },
  { id: 'plomero',            emoji: '🚿', label: 'Sanitario/Plomero', keywords: ['plom', 'sanit', 'caño', 'agua', 'pérdida'] },
  { id: 'aire_acondicionado', emoji: '❄️', label: 'Aire Acondicionado', keywords: ['aire', 'ac', 'frío', 'calor', 'refriger'] },
  { id: 'cerrajero',          emoji: '🔑', label: 'Cerrajero',         keywords: ['cerraj', 'llave', 'cerradura', 'portón', 'urgent', 'emergencia', '24hs'] },
  { id: 'albanil',            emoji: '🧱', label: 'Albañil',           keywords: ['alba', 'pared', 'fisura', 'mampost', 'cemento'] },
  { id: 'pintor',             emoji: '🎨', label: 'Pintor',            keywords: ['pint', 'color', 'pared'] },
]

const HISTORY_KEY = 'ofix_search_history'

function getHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveToHistory(query: string) {
  const trimmed = query.trim()
  if (!trimmed) return
  const current = getHistory().filter((h) => h !== trimmed)
  localStorage.setItem(HISTORY_KEY, JSON.stringify([trimmed, ...current].slice(0, 5)))
}

function removeFromHistory(query: string) {
  const current = getHistory().filter((h) => h !== query)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(current))
}

type Filter = 'disponible' | 'top' | 'rating'

export default function Search() {
  const { categoria } = useParams<{ categoria: string }>()
  const navigate = useNavigate()
  const goBack = useBack('/')
  const [searchParams, setSearchParams] = useSearchParams()
  const textQuery = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(textQuery)
  const [isFocused, setIsFocused] = useState(false)
  const [history, setHistory] = useState<string[]>(getHistory)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [showZonePicker, setShowZonePicker] = useState(false)
  const [ratingIndex, setRatingIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { professionals, loading, error } = useProfessionals(categoria)
  const [activeFilters, setActiveFilters] = useState<Set<Filter>>(new Set())

  const label = categoria ? CATEGORY_LABELS[categoria] ?? categoria : textQuery ? `"${textQuery}"` : 'Profesionales'

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sugerencias filtradas mientras tipea
  const suggestions = useMemo(() => {
    if (!inputValue.trim()) return []
    const q = inputValue.toLowerCase()
    const seen = new Set<string>()
    return AUTOCOMPLETE_CATEGORIES.filter((cat) => {
      if (seen.has(cat.id)) return false
      const matches = cat.label.toLowerCase().includes(q) || cat.keywords.some((k) => k.includes(q))
      if (matches) seen.add(cat.id)
      return matches
    })
  }, [inputValue])

  const showDropdown = isFocused && (suggestions.length > 0 || (history.length > 0 && !inputValue.trim()))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = inputValue.trim()
    if (q) {
      saveToHistory(q)
      setHistory(getHistory())
      setSearchParams({ q })
    } else {
      setSearchParams({})
    }
    setIsFocused(false)
    inputRef.current?.blur()
  }

  function handleSelectSuggestion(catId: string, catLabel: string) {
    saveToHistory(catLabel)
    setHistory(getHistory())
    setIsFocused(false)
    navigate(`/buscar/${catId}`)
  }

  function handleSelectHistory(query: string) {
    setInputValue(query)
    saveToHistory(query)
    setHistory(getHistory())
    setSearchParams({ q: query })
    setIsFocused(false)
    inputRef.current?.blur()
  }

  function handleRemoveHistory(query: string, e: React.MouseEvent) {
    e.stopPropagation()
    removeFromHistory(query)
    setHistory(getHistory())
  }

  function toggleFilter(f: Filter) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      return next
    })
  }

  const totalActiveFilters = activeFilters.size + (selectedZone ? 1 : 0) + (ratingIndex > 0 ? 1 : 0)

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
    if (selectedZone) list = list.filter(p => p.zone.toLowerCase().includes(selectedZone.toLowerCase()))
    const minRating = RATING_OPTIONS[ratingIndex].value
    if (minRating !== null) list = list.filter(p => (p.avg_rating ?? 0) >= minRating)
    return list
  }, [professionals, activeFilters, textQuery, selectedZone, ratingIndex])

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
        borderBottom: showDropdown ? 'none' : '1px solid #E8E0D4',
        boxShadow: showDropdown ? 'none' : '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)',
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
          style={{
            background: '#FFFFFF',
            border: `1.5px solid ${isFocused ? '#E8683A' : '#E8E0D4'}`,
            height: 44,
            transition: 'border-color .15s',
          }}
          onSubmit={handleSubmit}
        >
          <SearchIcon size={14} style={{ color: '#E8683A', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={`${label}...`}
            className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
            style={{ color: '#111111', caretColor: '#E8683A' }}
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => { setInputValue(''); setSearchParams({}); inputRef.current?.focus() }}
              className="flex-shrink-0"
            >
              <X size={14} style={{ color: '#CCCCCC' }} />
            </button>
          )}
        </form>
      </div>

      {/* Filtros */}
      {!showDropdown && (
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
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                style={active ? {
                  background: '#E8683A', color: '#FFFFFF', border: '1.5px solid #E8683A',
                } : {
                  background: '#F5F0E8', color: '#555555', border: '1.5px solid #E8E0D4',
                }}
              >
                <span style={{ fontSize: 9 }}>{f.icon}</span>
                {f.label}
              </motion.button>
            )
          })}

          {/* Chip de zona */}
          <motion.button
            type="button"
            onClick={() => setShowZonePicker(v => !v)}
            whileTap={{ scale: 0.94 }}
            transition={SPRING_SOFT}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
            style={selectedZone ? {
              background: 'rgba(232,104,58,0.12)', color: '#E8683A', border: '1.5px solid rgba(232,104,58,0.3)',
            } : {
              background: '#F5F0E8', color: '#555555', border: '1.5px solid #E8E0D4',
            }}
          >
            📍 {selectedZone ?? 'Zona'}
          </motion.button>

          {/* Chip de rating */}
          <motion.button
            type="button"
            onClick={() => setRatingIndex(i => (i + 1) % RATING_OPTIONS.length)}
            whileTap={{ scale: 0.94 }}
            transition={SPRING_SOFT}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
            style={ratingIndex > 0 ? {
              background: 'rgba(232,104,58,0.12)', color: '#E8683A', border: '1.5px solid rgba(232,104,58,0.3)',
            } : {
              background: '#F5F0E8', color: '#555555', border: '1.5px solid #E8E0D4',
            }}
          >
            {RATING_OPTIONS[ratingIndex].label}
          </motion.button>
        </div>
      )}

      {!showDropdown && !loading && !error && (
        <p className="text-[10px] mt-1.5 flex items-center gap-2" style={{ color: '#999999' }}>
          <span><span style={{ color: '#111111', fontWeight: 700 }}>{filtered.length}</span> profesionales</span>
          {totalActiveFilters > 0 && (
            <>
              <span style={{ color: '#E8683A' }}>· filtrado</span>
              <button
                type="button"
                onClick={() => { setActiveFilters(new Set()); setSelectedZone(null); setRatingIndex(0) }}
                className="font-bold"
                style={{ color: '#E8683A' }}
              >
                ✕ Limpiar
              </button>
            </>
          )}
        </p>
      )}

      {/* Dropdown autocomplete / historial */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute left-0 right-0 z-50 px-4 pb-4"
            style={{
              top: '100%',
              background: '#FFFFFF',
              borderBottom: '1px solid #E8E0D4',
              boxShadow: '0 8px 24px rgba(0,0,0,.08)',
            }}
          >
            {/* Sugerencias mientras tipea */}
            {suggestions.length > 0 && (
              <div className="flex flex-col gap-2 pt-2">
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#AAA' }}>
                  Sugerencias
                </p>
                {suggestions.map((cat) => (
                  <motion.button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(cat.id, cat.label)}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING_SOFT}
                    className="flex items-center gap-3 rounded-xl p-2.5 text-left w-full"
                    style={{ background: '#F9F6F2' }}
                  >
                    <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{ width: 32, height: 32, background: '#FEF0EA', fontSize: 16 }}>
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold" style={{ color: '#111' }}>
                        {/* Resaltar match */}
                        {cat.label.toLowerCase().includes(inputValue.toLowerCase()) ? (
                          <>
                            {cat.label.substring(0, cat.label.toLowerCase().indexOf(inputValue.toLowerCase()))}
                            <span style={{ color: '#E8683A' }}>
                              {cat.label.substring(
                                cat.label.toLowerCase().indexOf(inputValue.toLowerCase()),
                                cat.label.toLowerCase().indexOf(inputValue.toLowerCase()) + inputValue.length
                              )}
                            </span>
                            {cat.label.substring(cat.label.toLowerCase().indexOf(inputValue.toLowerCase()) + inputValue.length)}
                          </>
                        ) : cat.label}
                      </span>
                    </div>
                    <span className="text-[10px] flex-shrink-0" style={{ color: '#AAA' }}>
                      {professionals.filter(p => p.categories.includes(cat.id)).length} pros
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Historial cuando no está tipeando */}
            {!inputValue.trim() && history.length > 0 && (
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#AAA' }}>
                    Buscaste antes
                  </p>
                  <button
                    type="button"
                    onClick={() => { localStorage.removeItem(HISTORY_KEY); setHistory([]) }}
                    className="text-[9px] font-bold"
                    style={{ color: '#CCC' }}
                  >
                    Borrar todo
                  </button>
                </div>
                {history.map((query) => (
                  <motion.button
                    key={query}
                    type="button"
                    onClick={() => handleSelectHistory(query)}
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING_SOFT}
                    className="flex items-center gap-3 rounded-xl p-2.5 text-left w-full"
                    style={{ background: '#F9F6F2' }}
                  >
                    <Clock size={14} style={{ color: '#CCCCCC', flexShrink: 0 }} />
                    <span className="text-sm flex-1 min-w-0 truncate" style={{ color: '#555' }}>{query}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveHistory(query, e)}
                      className="flex-shrink-0 p-1"
                    >
                      <X size={12} style={{ color: '#DDD' }} />
                    </button>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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

      {/* Bottom sheet selector de zona */}
      <AnimatePresence>
        {showZonePicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.45)' }}
              onClick={() => setShowZonePicker(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
              style={{
                background: '#FFFFFF',
                maxWidth: 480,
                margin: '0 auto',
                maxHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
                <p className="text-base font-black" style={{ color: '#111' }}>Elegí una zona</p>
                {selectedZone && (
                  <button
                    type="button"
                    onClick={() => { setSelectedZone(null); setShowZonePicker(false) }}
                    className="text-xs font-bold"
                    style={{ color: '#E8683A' }}
                  >
                    Quitar zona
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1 px-3 pb-8">
                <div className="flex flex-wrap gap-2 py-2">
                  {POPULAR_BARRIOS.map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => { setSelectedZone(z); setShowZonePicker(false) }}
                      className="px-4 py-2.5 rounded-2xl text-sm font-bold"
                      style={selectedZone === z
                        ? { background: '#E8683A', color: '#fff', border: '2px solid #E8683A' }
                        : { background: '#F5F0E8', color: '#444', border: '2px solid #EDE8DE' }
                      }
                    >
                      {selectedZone === z ? '✓ ' : ''}{z}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageShell>
  )
}
