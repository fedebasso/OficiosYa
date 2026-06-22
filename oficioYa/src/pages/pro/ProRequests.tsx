import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useIncomingRequests } from '../../hooks/useRequests'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, MessageCircle, Inbox, Search, ChevronDown, ChevronUp, Zap, Clock } from 'lucide-react'
import type { ServiceRequest } from '../../store/requestStore'
import { getCategoryMeta } from '../../lib/categories'
import { fadeUp, staggerFast, scaleIn } from '../../lib/motion'

// ── Metadatos de estado ─────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:     { label: 'Pendiente',  color: '#D97706', bg: 'rgba(245,158,11,.12)', dot: '#F59E0B' },
  confirmed:   { label: 'Confirmado', color: '#16A34A', bg: 'rgba(34,197,94,.12)',  dot: '#22C55E' },
  in_progress: { label: 'En camino',  color: '#7C3AED', bg: 'rgba(139,92,246,.12)', dot: '#8B5CF6' },
  completed:   { label: 'Completado', color: '#2563EB', bg: 'rgba(37,99,235,.12)',  dot: '#3B82F6' },
  cancelled:   { label: 'Cancelado',  color: '#DC2626', bg: 'rgba(239,68,68,.12)',  dot: '#EF4444' },
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Ahora'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

function formatScheduled(iso: string) {
  const d = new Date(iso)
  const date = d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })
  const hasTime = iso.includes('T') && !iso.endsWith('T00:00:00')
  const time = hasTime ? d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : null
  return time ? `${date} · ${time}hs` : date
}

// ── Card de solicitud ────────────────────────────────────────────────────────

function RequestCard({
  req,
  onAccept,
  onReject,
  onProgress,
  onChat,
  sentProgressId,
}: {
  req: ServiceRequest
  onAccept?: () => void
  onReject?: () => void
  onProgress?: (s: ServiceRequest['status']) => void
  onChat?: () => void
  sentProgressId?: string
}) {
  const { emoji, label } = getCategoryMeta(req.category)
  const meta = STATUS_META[req.status] ?? STATUS_META.pending
  const isPending    = req.status === 'pending'
  const isInProgress = req.status === 'in_progress'
  const isActive     = req.status === 'confirmed' || isInProgress

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: isPending
          ? `1.5px solid ${req.urgency ? 'rgba(239,68,68,.3)' : 'rgba(232,104,58,.25)'}`
          : '1.5px solid #EDE8DE',
        boxShadow: isPending
          ? `0 2px 16px ${req.urgency ? 'rgba(239,68,68,.08)' : 'rgba(232,104,58,.08)'}, 0 1px 4px rgba(0,0,0,.05)`
          : '0 1px 4px rgba(0,0,0,.05)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3.5 py-2"
        style={{
          background: isPending
            ? req.urgency ? 'rgba(239,68,68,.06)' : 'rgba(232,104,58,.06)'
            : `${meta.bg}`,
          borderBottom: `1px solid ${isPending ? (req.urgency ? 'rgba(239,68,68,.12)' : 'rgba(232,104,58,.12)') : 'rgba(0,0,0,.05)'}`,
        }}
      >
        <div className="flex items-center gap-1.5">
          {isPending && req.urgency && (
            <Zap size={10} style={{ color: '#DC2626' }} fill="#DC2626" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: isPending ? (req.urgency ? '#DC2626' : '#E8683A') : meta.color }}>
            {isPending ? (req.urgency ? 'Urgente' : 'Nueva solicitud') : meta.label}
          </span>
          {/* Dot de estado */}
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: meta.dot }} />
        </div>
        <span className="flex items-center gap-1 text-[10px]" style={{ color: '#AAAAAA' }}>
          <Clock size={9} />
          {timeAgo(req.created_at)}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="p-3.5 flex flex-col gap-2.5">
        {/* Chips: categoría + urgencia */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(232,104,58,.1)', color: '#E8683A' }}>
            {emoji} {label}
          </span>
          {req.urgency && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,.1)', color: '#DC2626' }}>
              🚨 Urgente
            </span>
          )}
          {req.work_type && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: '#F5F0E8', color: '#777' }}>
              {req.work_type === 'reparacion' ? '🔧 Reparación' : req.work_type === 'instalacion' ? '⚙️ Instalación' : req.work_type === 'mantenimiento' ? '🛠️ Mantenimiento' : '📋 Otro'}
            </span>
          )}
        </div>

        {/* Descripción */}
        <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#333333' }}>
          {req.description}
        </p>

        {/* Fecha agendada */}
        {req.scheduled_date && (
          <div
            className="flex items-center gap-1.5 rounded-xl px-3 py-2"
            style={{ background: 'rgba(232,104,58,.08)', border: '1px solid rgba(232,104,58,.2)' }}
          >
            <span style={{ fontSize: 12 }}>📅</span>
            <span className="text-xs font-bold" style={{ color: '#E8683A' }}>
              {formatScheduled(req.scheduled_date)}
            </span>
          </div>
        )}

        {/* Teléfono (solo activos) */}
        {isActive && req.contact_phone && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: '#F5F0E8', border: '1px solid #E8E0D4' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#AAAAAA' }}>Tel</span>
            <span className="text-sm font-semibold" style={{ color: '#111111' }}>{req.contact_phone}</span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="px-3.5 pb-3.5 flex gap-2">
        {isPending && onAccept && onReject && (
          <>
            <motion.button
              type="button"
              onClick={onAccept}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold"
              style={{ background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' }}
            >
              <CheckCircle size={14} />
              Aceptar
            </motion.button>
            <motion.button
              type="button"
              onClick={onReject}
              whileTap={{ scale: 0.97 }}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold"
              style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
            >
              <XCircle size={14} />
              Rechazar
            </motion.button>
          </>
        )}

        {isActive && onProgress && onChat && (
          <>
            <motion.button
              type="button"
              onClick={() => onProgress(isInProgress ? 'completed' : 'in_progress')}
              whileTap={{ scale: 0.97 }}
              className="flex-1 rounded-xl py-3 text-sm font-bold"
              style={{
                background: sentProgressId === req.id
                  ? '#DCFCE7'
                  : isInProgress ? '#DCFCE7' : '#EEF2FF',
                color: sentProgressId === req.id
                  ? '#16A34A'
                  : isInProgress ? '#16A34A' : '#4F46E5',
                border: `1px solid ${sentProgressId === req.id || isInProgress ? '#BBF7D0' : '#C7D2FE'}`,
              }}
            >
              {sentProgressId === req.id
                ? '✓ Cliente notificado'
                : isInProgress ? '🏁 Completado' : '🚗 En camino'}
            </motion.button>
            <motion.button
              type="button"
              onClick={onChat}
              whileTap={{ scale: 0.97 }}
              className="w-12 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: 'rgba(232,104,58,.1)', color: '#E8683A', border: '1px solid rgba(232,104,58,.2)' }}
            >
              <MessageCircle size={15} />
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function ProRequests() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { requests, loading, error, updateStatus } = useIncomingRequests(user?.id ?? '')
  const [historyOpen, setHistoryOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [sentProgress, setSentProgress] = useState<string | null>(null)

  function handleConfirmReject() {
    if (!rejectingId) return
    updateStatus(rejectingId, 'cancelled')
    setRejectingId(null)
  }

  function handleInProgress(reqId: string) {
    updateStatus(reqId, 'in_progress')
    setSentProgress(reqId)
    setTimeout(() => setSentProgress(null), 1500)
  }

  // Filtro de búsqueda
  const filtered = useMemo(() => {
    if (!query.trim()) return requests
    const q = query.toLowerCase()
    return requests.filter((r) => {
      const { label } = getCategoryMeta(r.category)
      return r.description.toLowerCase().includes(q) || label.toLowerCase().includes(q)
    })
  }, [requests, query])

  const pending  = filtered.filter((r) => r.status === 'pending')
  const active   = filtered.filter((r) => r.status === 'confirmed' || r.status === 'in_progress')
  const history  = filtered.filter((r) => r.status !== 'pending' && r.status !== 'confirmed' && r.status !== 'in_progress')

  // ── Header ──────────────────────────────────────────────────────────────

  const header = (
    <div
      className="sticky top-0 z-50"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}
    >
      <div className="px-4 pt-12 pb-3 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: '#E8683A' }}>
            Panel profesional
          </p>
          <h1 className="text-xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.4px' }}>
            Solicitudes
          </h1>
          {!loading && (
            <p className="text-xs" style={{ color: '#AAAAAA' }}>
              {pending.length} pendiente{pending.length !== 1 ? 's' : ''} · {active.length} en curso
            </p>
          )}
        </div>

        {/* Stats chips */}
        {!loading && (
          <div className="flex gap-1.5">
            {[
              { count: pending.length,  color: '#D97706', bg: 'rgba(245,158,11,.12)' },
              { count: active.length,   color: '#7C3AED', bg: 'rgba(139,92,246,.12)' },
              { count: requests.filter(r => r.status === 'completed').length, color: '#2563EB', bg: 'rgba(37,99,235,.12)' },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-xl px-2.5 py-1.5 text-center"
                style={{ background: s.bg }}
              >
                <div className="text-sm font-black leading-none" style={{ color: s.color }}>{s.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Búsqueda */}
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
            placeholder="Buscar por descripción u oficio…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#111111', caretColor: '#E8683A' }}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} style={{ color: '#AAAAAA', fontSize: 16, lineHeight: 1 }}>×</button>
          )}
        </div>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100dvh', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      {header}

      <div className="flex flex-col gap-4 p-3 pb-8 flex-1">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl"
                style={{
                  background: 'linear-gradient(90deg,#EDE8DE 25%,#F5F0E8 50%,#EDE8DE 75%)',
                  backgroundSize: '200% 100%',
                  animation: `shimmer 1.4s ease-in-out ${i * 0.15}s infinite`,
                  border: '1.5px solid #E8E0D4',
                }}
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#DC2626' }}>
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && pending.length === 0 && active.length === 0 && history.length === 0 && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-5 py-20 text-center px-8"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', boxShadow: '0 4px 16px rgba(0,0,0,.06)' }}
            >
              <Inbox size={32} style={{ color: '#CCCCCC' }} />
            </div>
            <div>
              <p className="font-black text-base mb-1" style={{ color: '#111111' }}>Sin solicitudes aún</p>
              <p className="text-sm leading-relaxed" style={{ color: '#AAAAAA' }}>
                Las nuevas solicitudes aparecerán acá cuando los clientes te contacten.
              </p>
            </div>
          </motion.div>
        )}

        {/* Sin resultados de búsqueda */}
        {!loading && query && pending.length === 0 && active.length === 0 && history.length === 0 && (
          <p className="text-sm text-center py-10 font-bold" style={{ color: '#888' }}>
            Sin resultados para "{query}"
          </p>
        )}

        {/* Por responder */}
        {pending.length > 0 && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: '#F59E0B', animation: 'ping-slow 2s ease-in-out infinite' }}
              />
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#AAAAAA' }}>
                Por responder · {pending.length}
              </p>
            </div>
            <motion.div variants={staggerFast} initial="hidden" animate="visible" className="flex flex-col gap-2">
              {pending.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  onAccept={() => updateStatus(req.id, 'confirmed')}
                  onReject={() => setRejectingId(req.id)}
                />
              ))}
            </motion.div>
          </section>
        )}

        {/* En curso */}
        {active.length > 0 && (
          <section className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest px-1" style={{ color: '#AAAAAA' }}>
              En curso · {active.length}
            </p>
            <motion.div variants={staggerFast} initial="hidden" animate="visible" className="flex flex-col gap-2">
              {active.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  onProgress={(s) => {
                    if (s === 'in_progress') {
                      handleInProgress(req.id)
                    } else {
                      updateStatus(req.id, s)
                    }
                  }}
                  onChat={() => navigate(`/solicitud/${req.id}/chat`)}
                  sentProgressId={sentProgress ?? undefined}
                />
              ))}
            </motion.div>
          </section>
        )}

        {/* Historial */}
        {history.length > 0 && (
          <section className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="flex items-center justify-between px-1"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#AAAAAA' }}>
                Historial · {history.length}
              </p>
              {historyOpen
                ? <ChevronUp size={13} style={{ color: '#AAAAAA' }} />
                : <ChevronDown size={13} style={{ color: '#AAAAAA' }} />
              }
            </button>

            <AnimatePresence>
              {historyOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col gap-2 overflow-hidden"
                >
                  {history.map((req) => {
                    const { emoji, label } = getCategoryMeta(req.category)
                    const meta = STATUS_META[req.status] ?? STATUS_META.completed
                    return (
                      <motion.div
                        key={req.id}
                        variants={fadeUp}
                        className="flex items-center gap-3 rounded-2xl px-3.5 py-3"
                        style={{ background: '#FFFFFF', border: '1.5px solid #EDE8DE' }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: meta.dot, boxShadow: `0 0 6px ${meta.dot}66` }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(232,104,58,.1)', color: '#E8683A' }}>
                              {emoji} {label}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: meta.bg, color: meta.color }}>
                              {meta.label}
                            </span>
                          </div>
                          <p className="text-xs truncate" style={{ color: '#777' }}>{req.description}</p>
                          {req.scheduled_date && (
                            <p className="text-[10px] mt-0.5 font-semibold" style={{ color: '#E8683A' }}>
                              📅 {formatScheduled(req.scheduled_date)}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] flex-shrink-0" style={{ color: '#CCCCCC' }}>
                          {timeAgo(req.created_at)}
                        </span>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

      </div>

      {/* ── Modal confirmación de rechazo ── */}
      <AnimatePresence>
        {rejectingId && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,.45)' }}
              onClick={() => setRejectingId(null)}
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-6 flex flex-col gap-4"
              style={{ background: '#FFFFFF', maxWidth: 480, margin: '0 auto' }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-base font-black" style={{ color: '#111111' }}>
                  ¿Rechazar esta solicitud?
                </p>
                <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>
                  Esta acción no se puede deshacer.
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 rounded-2xl py-3.5 text-sm font-bold"
                  style={{ background: '#F5F0E8', color: '#555555', border: '1.5px solid #E8E0D4' }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleConfirmReject}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-white"
                  style={{ background: '#DC2626', boxShadow: '0 4px 14px rgba(220,38,38,.3)' }}
                >
                  Rechazar →
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes ping-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .4; transform: scale(1.5); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
