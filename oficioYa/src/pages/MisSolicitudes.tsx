import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Search, MessageCircle, Star, XCircle } from 'lucide-react'
import { useRequestStore } from '../store/requestStore'
import { ReviewForm } from '../components/requests/ReviewForm'
import { MOCK_PROFESSIONALS } from '../data/mockProfessionals'
import { getCategoryMeta } from '../lib/categories'
import { getInitials } from '../lib/utils'
import { fadeUp, staggerFast, scaleIn, SPRING_SOFT } from '../lib/motion'

// ── Metadatos de estado ─────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string; icon: string }> = {
  pending:     { label: 'Pendiente',  color: '#D97706', bg: 'rgba(245,158,11,.12)', dot: '#F59E0B', icon: '⏳' },
  confirmed:   { label: 'Confirmado', color: '#16A34A', bg: 'rgba(34,197,94,.12)',  dot: '#22C55E', icon: '✅' },
  in_progress: { label: 'En camino',  color: '#7C3AED', bg: 'rgba(139,92,246,.12)', dot: '#8B5CF6', icon: '🚗' },
  completed:   { label: 'Completado', color: '#2563EB', bg: 'rgba(37,99,235,.12)',  dot: '#3B82F6', icon: '🏁' },
  cancelled:   { label: 'Cancelado',  color: '#DC2626', bg: 'rgba(239,68,68,.12)',  dot: '#EF4444', icon: '❌' },
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function formatScheduled(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })
  const hasTime = iso.includes('T') && !iso.endsWith('T00:00:00')
  const time = hasTime ? d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : null
  return time ? `${date} · ${time}hs` : date
}

function SolicitudSkeleton() {
  return (
    <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(90deg,#EDE8DE 25%,#F5F0E8 50%,#EDE8DE 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite' }} />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 rounded" style={{ width: '55%', background: '#EDE8DE' }} />
          <div className="h-2.5 rounded" style={{ width: '40%', background: '#F0EBE1' }} />
        </div>
        <div className="h-6 w-20 rounded-full" style={{ background: '#F0EBE1' }} />
      </div>
      <div className="h-2.5 rounded mb-1.5" style={{ width: '85%', background: '#EDE8DE' }} />
      <div className="h-2.5 rounded" style={{ width: '65%', background: '#F0EBE1' }} />
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function MisSolicitudes() {
  const navigate = useNavigate()
  const { requests, loading, loadRequests, submitReview, updateStatus } = useRequestStore()
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => { loadRequests() }, [loadRequests])

  // Búsqueda
  const filtered = useMemo(() => {
    if (!query.trim()) return requests
    const q = query.toLowerCase()
    return requests.filter((r) => {
      const pro = MOCK_PROFESSIONALS.find((p) => p.id === r.professional_id)
      const name = pro?.profiles?.full_name?.toLowerCase() ?? ''
      const { label } = getCategoryMeta(r.category)
      return name.includes(q) || label.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    })
  }, [requests, query])

  // Secciones
  const active   = filtered.filter((r) => r.status === 'pending' || r.status === 'confirmed' || r.status === 'in_progress')
  const history  = filtered.filter((r) => r.status === 'completed' || r.status === 'cancelled')

  // ── Header ────────────────────────────────────────────────────────────────

  const header = (
    <div
      className="sticky top-0 z-50"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}
    >
      <div className="flex items-center gap-3 px-4 pt-12 pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0"
        >
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.4px' }}>
            Mis solicitudes
          </h1>
          {requests.length > 0 && (
            <p className="text-xs" style={{ color: '#AAAAAA' }}>
              {active.length} activa{active.length !== 1 ? 's' : ''} · {history.length} en historial
            </p>
          )}
        </div>
      </div>

      {requests.length > 0 && (
        <div className="px-4 pb-3">
          <div
            className="flex items-center gap-2 rounded-2xl px-3 py-2.5"
            style={{ background: '#F5F0E8', border: '1.5px solid #E8E0D4' }}
          >
            <Search size={14} style={{ color: '#AAAAAA', flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por profesional, oficio o descripción…"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#111111', caretColor: '#E8683A' }}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} style={{ color: '#AAAAAA', fontSize: 16, lineHeight: 1 }}>×</button>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // ── Card de solicitud ─────────────────────────────────────────────────────

  function SolicitudCard({ req }: { req: ReturnType<typeof useRequestStore.getState>['requests'][0] }) {
    const pro      = MOCK_PROFESSIONALS.find((p) => p.id === req.professional_id)
    const proName  = pro?.profiles?.full_name ?? 'Profesional'
    const proAvatar = pro?.profiles?.avatar_url
    const proZone  = pro?.zone
    const { emoji, label } = getCategoryMeta(req.category)
    const meta     = STATUS_META[req.status] ?? STATUS_META.pending
    const isActive = req.status === 'confirmed' || req.status === 'in_progress'

    return (
      <motion.div
        variants={fadeUp}
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          border: isActive ? '1.5px solid rgba(232,104,58,.25)' : '1.5px solid #EDE8DE',
          boxShadow: isActive
            ? '0 2px 16px rgba(232,104,58,.08), 0 1px 4px rgba(0,0,0,.05)'
            : '0 1px 4px rgba(0,0,0,.05)',
        }}
      >
        {/* Cuerpo */}
        <div className="p-3.5 flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="overflow-hidden flex items-center justify-center font-bold text-sm"
              style={{
                width: 48, height: 48, borderRadius: '50%',
                background: proAvatar ? undefined : 'linear-gradient(135deg, #f5b99a, #E8683A)',
                color: '#fff', border: '2px solid #EDE8DE', fontSize: 15,
              }}
            >
              {proAvatar
                ? <img src={proAvatar} alt={proName} className="w-full h-full object-cover" />
                : getInitials(proName)
              }
            </div>
            <span
              className="absolute bottom-0.5 right-0.5 rounded-full"
              style={{ width: 11, height: 11, background: meta.dot, border: '2px solid #FFFFFF' }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Fila 1: nombre + fecha */}
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-black truncate" style={{ color: '#111111' }}>{proName}</p>
              <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: '#BBBBBB' }}>
                {formatDate(req.created_at)}
              </span>
            </div>

            {/* Fila 2: chips */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(232,104,58,.1)', color: '#E8683A' }}>
                {emoji} {label}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: meta.bg, color: meta.color }}>
                {meta.label}
              </span>
              {req.urgency && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,.1)', color: '#DC2626' }}>
                  🚨 Urgente
                </span>
              )}
            </div>

            {/* Fila 3: zona */}
            {proZone && (
              <p className="text-[10px] mb-0.5" style={{ color: '#AAAAAA' }}>📍 {proZone}</p>
            )}

            {/* Fila 4: fecha/hora agendada */}
            {req.scheduled_date && (
              <p className="text-[10px] font-semibold mb-0.5" style={{ color: '#E8683A' }}>
                📅 {formatScheduled(req.scheduled_date)}
              </p>
            )}

            {/* Fila 5: descripción */}
            <p className="text-xs leading-relaxed line-clamp-2 mt-1" style={{ color: '#777777' }}>
              {req.description}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div
          className="flex gap-2 px-3.5 pb-3.5"
          style={{ borderTop: req.status !== 'cancelled' ? '1px solid #F5F0E8' : undefined, paddingTop: req.status !== 'cancelled' ? 10 : 0 }}
        >
          {(req.status === 'confirmed' || req.status === 'in_progress') && (
            <button
              type="button"
              onClick={() => navigate(`/solicitud/${req.id}/chat`)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold text-white active:opacity-80 transition-opacity"
              style={{ background: '#E8683A', boxShadow: '0 2px 8px rgba(232,104,58,.25)' }}
            >
              <MessageCircle size={13} />
              Ir al chat
            </button>
          )}
          {req.status === 'completed' && (
            <button
              type="button"
              onClick={() => setReviewingId(req.id)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold active:opacity-80 transition-opacity"
              style={{ background: 'rgba(232,104,58,.08)', color: '#E8683A', border: '1px solid rgba(232,104,58,.2)' }}
            >
              <Star size={13} />
              Dejar reseña
            </button>
          )}
          {req.status === 'pending' && (
            <button
              type="button"
              onClick={() => setCancellingId(req.id)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold active:opacity-80 transition-opacity"
              style={{ background: 'rgba(239,68,68,.06)', color: '#DC2626', border: '1px solid rgba(239,68,68,.15)' }}
            >
              <XCircle size={13} />
              Cancelar
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────────────────

  const emptyState = (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-5 py-20 text-center px-8"
    >
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
        style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}
      >
        📋
      </div>
      <div>
        <p className="font-black text-base mb-1" style={{ color: '#111111' }}>Sin solicitudes aún</p>
        <p className="text-sm leading-relaxed" style={{ color: '#AAAAAA' }}>
          Cuando pidas un servicio, tus solicitudes aparecerán acá.
        </p>
      </div>
      <motion.button
        type="button"
        onClick={() => navigate('/buscar')}
        whileTap={{ scale: 0.97 }}
        transition={SPRING_SOFT}
        className="px-6 py-3 rounded-2xl text-sm font-bold text-white"
        style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
      >
        Buscar profesionales
      </motion.button>
    </motion.div>
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      {header}

      <div className="flex flex-col gap-4 p-3 pb-8 flex-1">

        {loading && [0, 1, 2].map((i) => <SolicitudSkeleton key={i} />)}

        {!loading && requests.length === 0 && emptyState}

        {!loading && query && filtered.length === 0 && (
          <p className="text-sm text-center py-10 font-bold" style={{ color: '#888' }}>
            Sin resultados para "{query}"
          </p>
        )}

        {/* Activas */}
        {!loading && active.length > 0 && (
          <section className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: '#AAAAAA' }}>
              Activas · {active.length}
            </p>
            <motion.div variants={staggerFast} initial="hidden" animate="visible" className="flex flex-col gap-2">
              {active.map((req) => <SolicitudCard key={req.id} req={req} />)}
            </motion.div>
          </section>
        )}

        {/* Historial */}
        {!loading && history.length > 0 && (
          <section className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: '#AAAAAA' }}>
              Historial · {history.length}
            </p>
            <motion.div variants={staggerFast} initial="hidden" animate="visible" className="flex flex-col gap-2">
              {history.map((req) => <SolicitudCard key={req.id} req={req} />)}
            </motion.div>
          </section>
        )}

      </div>

      {/* Modal reseña */}
      <AnimatePresence>
        {reviewingId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,.6)' }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="w-full rounded-t-2xl p-6"
              style={{ background: '#FFFFFF', maxWidth: 480 }}
            >
              <ReviewForm
                requestId={reviewingId}
                onSubmit={async (rating, comment) => { await submitReview(reviewingId, rating, comment) }}
                onClose={() => setReviewingId(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal cancelar */}
      <AnimatePresence>
        {cancellingId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,.6)' }}
            onClick={() => setCancellingId(null)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="w-full rounded-t-2xl p-6 flex flex-col gap-4"
              style={{ background: '#FFFFFF', maxWidth: 480 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#DC2626' }}>
                  Cancelar solicitud
                </p>
                <p className="text-base font-black" style={{ color: '#111111' }}>¿Confirmás la cancelación?</p>
                <p className="text-sm mt-1" style={{ color: '#999999' }}>El profesional será notificado.</p>
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setCancellingId(null)}
                  className="flex-1 rounded-xl py-3 text-sm font-bold active:opacity-70"
                  style={{ background: '#EDE8DE', color: '#555555', border: '1.5px solid #E8E0D4' }}
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={async () => { await updateStatus(cancellingId, 'cancelled'); setCancellingId(null) }}
                  className="flex-1 rounded-xl py-3 text-sm font-bold text-white active:opacity-80"
                  style={{ background: '#DC2626' }}
                >
                  Sí, cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
