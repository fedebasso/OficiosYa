import { createElement, useState, useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useIncomingRequests } from '../../hooks/useRequests'
import { PageShell } from '../../components/layout/PageShell'
import { Briefcase, TrendingUp, Star, Filter, CheckCircle2, Siren, Search as SearchIcon } from 'lucide-react'
import { getCategoryMeta, getCategoryIcon } from '../../lib/categories'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, staggerFast, scaleIn, staggerContainer, SPRING_SOFT } from '../../lib/motion'
import type { ServiceRequest } from '../../store/requestStore'

const WORK_TYPE_LABELS: Record<string, string> = {
  reparacion:    'Reparación',
  instalacion:   'Instalación',
  mantenimiento: 'Mantenimiento',
  otro:          'Otro',
}

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString('es', { month: 'long', year: 'numeric' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short' })
}

function WorkSkeleton() {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-3"
      style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8' }}>
      <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: '#EDE8DE' }} />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3 rounded w-2/3" style={{ background: '#EDE8DE' }} />
        <div className="h-2.5 rounded w-1/2" style={{ background: '#F0EBE1' }} />
      </div>
    </div>
  )
}

function WorkCard({ req }: { req: ServiceRequest }) {
  const { label, accent } = getCategoryMeta(req.category)
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
          {createElement(getCategoryIcon(req.category), { size: 18, style: { color: '#D4571F' } })}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold" style={{ color: accent }}>{label}</span>
            <span className="text-[10px] flex-shrink-0" style={{ color: '#AAAAAA' }}>
              {formatDate(req.created_at)}
            </span>
          </div>
          <p className="text-sm leading-relaxed line-clamp-2 mb-2" style={{ color: '#555' }}>
            {req.description}
          </p>
          <div className="flex gap-2 flex-wrap">
            {req.work_type && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                {WORK_TYPE_LABELS[req.work_type] ?? req.work_type}
              </span>
            )}
            {req.urgency && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444' }}>
                {createElement(Siren, { size: 9 })} Urgente
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(34,197,94,.1)', color: '#16a34a' }}>
              {createElement(CheckCircle2, { size: 9 })} Completado
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProWorkHistory() {
  const user = useAuthStore((s) => s.user)
  const { requests, loading } = useIncomingRequests(user?.id ?? '')
  const [activeCategory, setActiveCategory] = useState<string>('todos')

  const completed = requests.filter((r) => r.status === 'completed')

  // Stats
  const totalJobs = completed.length
  const avgRating = 4.7 // mock hasta conectar Supabase
  const thisMonth = completed.filter(r => {
    const d = new Date(r.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  // Categorías únicas para filtro
  const categories = useMemo(() => {
    const cats = [...new Set(completed.map(r => r.category).filter(Boolean))]
    return cats
  }, [completed])

  // Filtrado
  const filtered = activeCategory === 'todos'
    ? completed
    : completed.filter(r => r.category === activeCategory)

  // Agrupar por mes
  const grouped = useMemo(() => {
    const map = new Map<string, ServiceRequest[]>()
    filtered.forEach(req => {
      const key = formatMonth(req.created_at)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(req)
    })
    return [...map.entries()]
  }, [filtered])

  const header = (
    <div className="px-4 pt-10 pb-4 sticky top-0 z-50"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #ECE4D8' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#e8683a' }}>
        Panel profesional
      </p>
      <h1 className="text-2xl font-black leading-none" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
        Trabajos
      </h1>
    </div>
  )

  return (
    <PageShell header={header}>
      <motion.div
        variants={staggerContainer} initial="hidden" animate="visible"
        className="p-4 flex flex-col gap-4 pb-8"
      >

        {/* Stats */}
        {!loading && totalJobs > 0 && (
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl p-3 text-center" style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8' }}>
              <div className="flex justify-center mb-1"><Briefcase size={14} style={{ color: '#E8683A' }} /></div>
              <div className="text-xl font-black leading-none" style={{ color: '#111' }}>{totalJobs}</div>
              <div className="text-[9px] font-bold mt-1" style={{ color: '#AAA' }}>Total</div>
            </div>
            <div className="rounded-2xl p-3 text-center" style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8' }}>
              <div className="flex justify-center mb-1"><TrendingUp size={14} style={{ color: '#22c55e' }} /></div>
              <div className="text-xl font-black leading-none" style={{ color: '#111' }}>{thisMonth}</div>
              <div className="text-[9px] font-bold mt-1" style={{ color: '#AAA' }}>Este mes</div>
            </div>
            <div className="rounded-2xl p-3 text-center" style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8' }}>
              <div className="flex justify-center mb-1"><Star size={14} fill="#F5A623" color="#F5A623" /></div>
              <div className="text-xl font-black leading-none" style={{ color: '#111' }}>{avgRating}</div>
              <div className="text-[9px] font-bold mt-1" style={{ color: '#AAA' }}>Rating</div>
            </div>
          </motion.div>
        )}

        {/* Filtro por categoría */}
        {!loading && categories.length > 1 && (
          <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <motion.button
              type="button"
              onClick={() => setActiveCategory('todos')}
              whileTap={{ scale: 0.94 }} transition={SPRING_SOFT}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={activeCategory === 'todos' ? { background: '#E8683A', color: '#fff', border: '1.5px solid #E8683A' } : { background: '#F5F0E8', color: '#555', border: '1.5px solid #ECE4D8' }}
            >
              <Filter size={9} /> Todos
            </motion.button>
            {categories.map(cat => {
              const { label } = getCategoryMeta(cat)
              const active = activeCategory === cat
              return (
                <motion.button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  whileTap={{ scale: 0.94 }} transition={SPRING_SOFT}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                  style={active ? { background: '#E8683A', color: '#fff', border: '1.5px solid #E8683A' } : { background: '#F5F0E8', color: '#555', border: '1.5px solid #ECE4D8' }}
                >
                  {createElement(getCategoryIcon(cat), { size: 10, style: { color: active ? '#fff' : '#D4571F' } })} {label}
                </motion.button>
              )
            })}
          </motion.div>
        )}

        {loading && [0, 1, 2].map((i) => <WorkSkeleton key={i} />)}

        {!loading && completed.length === 0 && (
          <motion.div variants={scaleIn} initial="hidden" animate="visible"
            className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8' }}>
              <Briefcase size={24} style={{ color: '#CCCCCC' }} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: '#111111' }}>Sin trabajos aún</p>
              <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>Los trabajos completados aparecerán acá</p>
            </div>
          </motion.div>
        )}

        {/* Lista agrupada por mes */}
        <AnimatePresence mode="wait">
          {!loading && grouped.length > 0 && (
            <motion.div key={activeCategory} variants={staggerFast} initial="hidden" animate="visible" className="flex flex-col gap-4">
              {grouped.map(([month, reqs]) => (
                <div key={month} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest capitalize" style={{ color: '#AAA' }}>
                      {month}
                    </p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: '#F5F0E8', color: '#999' }}>
                      {reqs.length}
                    </span>
                  </div>
                  <motion.div variants={staggerFast} initial="hidden" animate="visible" className="flex flex-col gap-2">
                    {reqs.map(req => <WorkCard key={req.id} req={req} />)}
                  </motion.div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sin resultados para el filtro */}
        {!loading && completed.length > 0 && filtered.length === 0 && (
          <motion.div variants={scaleIn} initial="hidden" animate="visible"
            className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: '#F5F0E8', border: '1.5px solid #ECE4D8' }}>
              <SearchIcon size={20} style={{ color: '#CCCCCC' }} />
            </div>
            <p className="font-bold text-sm" style={{ color: '#111' }}>Sin trabajos en esta categoría</p>
            <motion.button type="button" onClick={() => setActiveCategory('todos')}
              whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
              className="text-sm font-bold px-4 py-2 rounded-xl"
              style={{ background: 'rgba(232,104,58,.12)', color: '#E8683A' }}>
              Ver todos
            </motion.button>
          </motion.div>
        )}

      </motion.div>
    </PageShell>
  )
}
