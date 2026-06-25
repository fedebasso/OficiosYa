import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronLeft, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { OfficialServiceCard } from '../components/officialServices/OfficialServiceCard'
import { useOfficialServiceStore } from '../store/officialServiceStore'
import { fadeUp, staggerFast } from '../lib/motion'

const CATEGORIES: { id: string; emoji: string; label: string }[] = [
  { id: '',                   emoji: '🔧', label: 'Todos' },
  { id: 'aire_acondicionado', emoji: '❄️', label: 'Aire AC' },
  { id: 'heladera',           emoji: '🧊', label: 'Heladeras' },
  { id: 'lavarropas',         emoji: '🫧', label: 'Lavarropas' },
  { id: 'tv',                 emoji: '📺', label: 'TV' },
  { id: 'horno',              emoji: '🍳', label: 'Hornos' },
]

const ZONES = [
  'Todas', 'Pocitos', 'Malvín', 'Centro', 'Carrasco', 'Punta Carretas',
  'Cordón', 'Tres Cruces', 'La Blanqueada', 'Buceo', 'Parque Batlle',
]

export default function OfficialServicesPage() {
  const navigate = useNavigate()
  const { services, loading, fetchServices, fetchSlots, getNextSlots } = useOfficialServiceStore()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [activeZone, setActiveZone] = useState('Todas')

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Pre-cargar slots de todos los services con agenda/destacado
  useEffect(() => {
    const dates = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() + i)
      return d.toISOString().split('T')[0]
    })
    for (const s of services) {
      if (s.plan !== 'presencia') fetchSlots(s.id, dates)
    }
  }, [services, fetchSlots])

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const q = query.toLowerCase()
      const matchQuery = !q
        || s.company_name.toLowerCase().includes(q)
        || s.brands.some((b) => b.toLowerCase().includes(q))
      const matchCat = !activeCategory || s.categories.includes(activeCategory)
      const matchZone = activeZone === 'Todas' || s.zones.includes(activeZone)
      return matchQuery && matchCat && matchZone
    })
  }, [services, query, activeCategory, activeZone])

  const header = (
    <header
      className="sticky top-0 z-50"
      style={{ background: '#FFFFFF', boxShadow: '0 1px 0 #EDE8DE' }}
    >
      <div
        className="flex items-center gap-3"
        style={{ padding: 'calc(14px + var(--safe-top)) var(--px-container) 10px' }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center active:opacity-60 transition-opacity"
          style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F0E8', border: '1.5px solid #EDE8DE' }}
        >
          <ChevronLeft size={18} color="#333" />
        </button>
        <h1 className="font-black" style={{ fontSize: 20, color: '#111111', flex: 1 }}>
          Servicios Oficiales
        </h1>
      </div>

      {/* Search bar */}
      <div style={{ padding: '0 var(--px-container) 10px' }}>
        <div
          className="flex items-center gap-2"
          style={{ background: '#F5F0E8', border: '1.5px solid #EDE8DE', borderRadius: 12, padding: '0 12px', height: 42 }}
        >
          <Search size={16} color="#AAAAAA" />
          <input
            type="search"
            placeholder="Buscar marca o empresa..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 'var(--text-sm)', color: '#111111' }}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')}>
              <X size={14} color="#AAAAAA" />
            </button>
          )}
        </div>
      </div>

      {/* Chips de categoría */}
      <div
        className="flex gap-2 overflow-x-auto"
        style={{ padding: '0 var(--px-container) 10px', scrollbarWidth: 'none' }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className="flex-shrink-0 font-bold transition-all"
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 'var(--text-sm)',
              background: activeCategory === cat.id ? '#0F6E56' : '#F5F0E8',
              color: activeCategory === cat.id ? '#FFFFFF' : '#555555',
              border: '1.5px solid',
              borderColor: activeCategory === cat.id ? '#0F6E56' : '#EDE8DE',
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Chips de zona */}
      <div
        className="flex gap-2 overflow-x-auto"
        style={{ padding: '0 var(--px-container) 12px', scrollbarWidth: 'none' }}
      >
        {ZONES.map((zone) => (
          <button
            key={zone}
            type="button"
            onClick={() => setActiveZone(zone)}
            className="flex-shrink-0 font-bold transition-all"
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 'var(--text-xs)',
              background: activeZone === zone ? '#E8683A' : '#F5F0E8',
              color: activeZone === zone ? '#FFFFFF' : '#777777',
              border: '1.5px solid',
              borderColor: activeZone === zone ? '#E8683A' : '#EDE8DE',
            }}
          >
            {zone}
          </button>
        ))}
      </div>
    </header>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      <div style={{ padding: '16px 0', paddingBottom: 32 }}>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl" style={{ height: 88, background: '#F5F0E8' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span style={{ fontSize: 40 }}>🔍</span>
            <p className="font-bold" style={{ color: '#333333' }}>Sin resultados</p>
            <p style={{ fontSize: 'var(--text-sm)', color: '#AAAAAA' }}>
              Probá con otra categoría o zona
            </p>
          </div>
        ) : (
          <motion.div
            className="flex flex-col gap-3"
            variants={staggerFast}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filtered.map((service) => (
                <motion.div key={service.id} variants={fadeUp}>
                  <OfficialServiceCard
                    service={service}
                    nextSlots={getNextSlots(service.id, 2)}
                    onClick={() => navigate(`/servicios-oficiales/${service.id}`)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PageShell>
  )
}
