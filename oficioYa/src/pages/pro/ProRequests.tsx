import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useIncomingRequests } from '../../hooks/useRequests'
import { PageShell } from '../../components/layout/PageShell'
import { CheckCircle, XCircle, MessageCircle, Clock, Inbox, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import type { ServiceRequest } from '../../store/requestStore'
import { motion } from 'framer-motion'
import { fadeUp, staggerFast, scaleIn } from '../../lib/motion'
import { isInRadius } from '../../lib/barrio-coords'
import { MOCK_PROFESSIONALS } from '../../data/mockProfessionals'

const STATUS_META: Record<ServiceRequest['status'], { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pendiente',  color: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
  confirmed:   { label: 'Aceptado',   color: '#22c55e', bg: 'rgba(34,197,94,.1)'  },
  in_progress: { label: 'En camino',  color: '#8b5cf6', bg: 'rgba(139,92,246,.1)' },
  completed:   { label: 'Completado', color: '#3b82f6', bg: 'rgba(59,130,246,.1)' },
  cancelled:   { label: 'Rechazado',  color: '#ef4444', bg: 'rgba(239,68,68,.1)'  },
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Ahora mismo'
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

function ScheduledBadge({ date }: { date: string }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-xl px-3 py-2"
      style={{ background: 'rgba(232,104,58,.08)', border: '1px solid rgba(232,104,58,.2)' }}
    >
      <span style={{ fontSize: 12 }}>📅</span>
      <span className="text-xs font-bold" style={{ color: '#E8683A' }}>
        {formatScheduled(date)}
      </span>
    </div>
  )
}

function PendingCard({ req, onAccept, onReject }: {
  req: ServiceRequest
  onAccept: () => void
  onReject: () => void
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: req.urgency ? '1.5px solid #FECACA' : '1.5px solid #E8E0D4',
        boxShadow: req.urgency
          ? '0 2px 12px rgba(239,68,68,.08), 0 1px 3px rgba(0,0,0,.04)'
          : '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: req.urgency ? '#FFF5F5' : '#FEF0EA',
          borderBottom: `1px solid ${req.urgency ? '#FECACA' : '#FDDCC8'}`,
        }}
      >
        <div className="flex items-center gap-2">
          {req.urgency ? (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: '#DC2626' }}>
              <Zap size={10} fill="currentColor" />
              Urgente
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#E8683A' }}>
              Nueva solicitud
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-[10px]" style={{ color: '#AAAAAA' }}>
          <Clock size={9} />
          {timeAgo(req.created_at)}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 pt-3.5 pb-4 flex flex-col gap-3.5">
        <p className="text-sm leading-relaxed" style={{ color: '#333333' }}>
          {req.description}
        </p>

        {req.scheduled_date && <ScheduledBadge date={req.scheduled_date} />}

        <div className="flex gap-2 flex-wrap">
          {req.category && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#F5F0E8', color: '#666' }}>
              {req.category.replace('_', ' ')}
            </span>
          )}
          {req.work_type && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
              {req.work_type === 'reparacion' ? 'Reparación' : req.work_type === 'instalacion' ? 'Instalación' : req.work_type === 'mantenimiento' ? 'Mantenimiento' : 'Otro'}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-0.5">
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
        </div>
      </div>
    </div>
  )
}

function ActiveCard({ req, onProgress, onChat }: {
  req: ServiceRequest
  onProgress: (status: ServiceRequest['status']) => void
  onChat: () => void
}) {
  const isInProgress = req.status === 'in_progress'
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: isInProgress ? 'rgba(139,92,246,.06)' : 'rgba(34,197,94,.06)', borderBottom: `1px solid ${isInProgress ? 'rgba(139,92,246,.15)' : 'rgba(34,197,94,.15)'}` }}>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: isInProgress ? '#8b5cf6' : '#22c55e' }}>
          {isInProgress ? '🚗 En camino' : '✅ Aceptado'}
        </span>
        <span className="flex items-center gap-1 text-[10px]" style={{ color: '#AAAAAA' }}>
          <Clock size={9} />{timeAgo(req.created_at)}
        </span>
      </div>
      <div className="px-4 pt-3.5 pb-4 flex flex-col gap-3">
        <p className="text-sm leading-relaxed" style={{ color: '#333333' }}>{req.description}</p>
        {req.scheduled_date && <ScheduledBadge date={req.scheduled_date} />}
        {req.contact_phone && (
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#F5F0E8', border: '1px solid #E8E0D4' }}>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#AAAAAA' }}>Tel</span>
            <span className="text-sm font-semibold" style={{ color: '#111111' }}>{req.contact_phone}</span>
          </div>
        )}
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={() => onProgress(isInProgress ? 'completed' : 'in_progress')}
            whileTap={{ scale: 0.97 }}
            className="flex-1 rounded-xl py-3 text-sm font-bold"
            style={{ background: isInProgress ? '#DCFCE7' : '#EEF2FF', color: isInProgress ? '#16A34A' : '#4F46E5', border: `1px solid ${isInProgress ? '#BBF7D0' : '#C7D2FE'}` }}
          >
            {isInProgress ? '🏁 Marcar completado' : '🚗 Marcar en camino'}
          </motion.button>
          <motion.button
            type="button"
            onClick={onChat}
            whileTap={{ scale: 0.97 }}
            className="w-12 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }}
          >
            <MessageCircle size={15} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function HistoryCard({ req }: { req: ServiceRequest }) {
  const meta = STATUS_META[req.status] ?? STATUS_META.pending
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-3.5 py-3"
      style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
    >
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}66` }}
      />
      <p className="flex-1 text-xs truncate" style={{ color: '#777' }}>
        {req.description}
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full"
          style={{ background: meta.bg, color: meta.color }}
        >
          {meta.label}
        </span>
        <span className="text-[9px]" style={{ color: '#AAAAAA' }}>{timeAgo(req.created_at)}</span>
      </div>
    </div>
  )
}

export default function ProRequests() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { requests, loading, error, updateStatus } = useIncomingRequests(user?.id ?? '')
  const [historyOpen, setHistoryOpen] = useState(true)

  const currentPro = MOCK_PROFESSIONALS.find((p) => p.profiles.id === user?.id)

  const visibleRequests = requests.filter((req) =>
    isInRadius(
      currentPro?.zone ?? '',
      currentPro?.radius_km ?? null,
      req.location ?? ''
    )
  )

  const pending = visibleRequests.filter((r) => r.status === 'pending')
  const active  = visibleRequests.filter((r) => r.status === 'confirmed' || r.status === 'in_progress')
  const others  = visibleRequests.filter((r) => r.status !== 'pending' && r.status !== 'confirmed' && r.status !== 'in_progress')


  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4' }}
    >
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#e8683a' }}>
            Panel profesional
          </p>
          <h1 className="text-2xl font-black leading-none" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
            Solicitudes
          </h1>
        </div>
        {!loading && pending.length > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(232,104,58,.12)', border: '1px solid rgba(232,104,58,.25)' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#e8683a', animation: 'ping-slow 2s ease-in-out infinite' }}
            />
            <span className="text-xs font-black" style={{ color: '#e8683a' }}>
              {pending.length} nueva{pending.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      {/* Stats */}
      {!loading && (
        <div className="flex gap-2 mt-3">
          {[
            { label: 'Pendientes', count: pending.length, color: '#f59e0b', bg: 'rgba(245,158,11,.1)' },
            { label: 'Activos', count: requests.filter(r => r.status === 'confirmed' || r.status === 'in_progress').length, color: '#8b5cf6', bg: 'rgba(139,92,246,.1)' },
            { label: 'Completados', count: requests.filter(r => r.status === 'completed').length, color: '#22c55e', bg: 'rgba(34,197,94,.1)' },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-xl px-3 py-2 text-center" style={{ background: s.bg }}>
              <div className="text-lg font-black leading-none" style={{ color: s.color }}>{s.count}</div>
              <div className="text-[9px] font-bold mt-0.5" style={{ color: s.color }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <PageShell header={header}>
      <style>{`
        @keyframes ping-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: .5; transform: scale(1.4); }
        }
      `}</style>

      <div className="p-4 flex flex-col gap-4" style={{ minHeight: '100%' }}>

        {loading && (
          <div className="flex flex-col gap-3 pt-2">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-40 rounded-2xl"
                style={{
                  background: 'linear-gradient(90deg,#EDE8DE 25%,#F5F0E8 50%,#EDE8DE 75%)',
                  backgroundSize: '200% 100%',
                  animation: `shimmer 1.4s ease-in-out ${i * .15}s infinite`,
                  animationDelay: `${i * 0.15}s`,
                  border: '1.5px solid #E8E0D4',
                }}
              />
            ))}
          </div>
        )}

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444' }}
          >
            {error}
          </div>
        )}

        {!loading && pending.length === 0 && others.length === 0 && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
            >
              <Inbox size={24} style={{ color: '#CCCCCC' }} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: '#111111' }}>Sin solicitudes aún</p>
              <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>Las nuevas solicitudes aparecerán acá</p>
            </div>
          </motion.div>
        )}

        {/* Pendientes */}
        {pending.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest px-0.5" style={{ color: '#AAAAAA' }}>
              Por responder · {pending.length}
            </p>
            <motion.div
              variants={staggerFast}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-2.5"
            >
              {pending.map((req) => (
                <motion.div key={req.id} variants={fadeUp}>
                  <PendingCard
                    req={req}
                    onAccept={() => updateStatus(req.id, 'confirmed')}
                    onReject={() => updateStatus(req.id, 'cancelled')}
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Activos (confirmed + in_progress) */}
        {active.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest px-0.5" style={{ color: '#AAAAAA' }}>
              En curso · {active.length}
            </p>
            <motion.div variants={staggerFast} initial="hidden" animate="visible" className="flex flex-col gap-2.5">
              {active.map((req) => (
                <motion.div key={req.id} variants={fadeUp}>
                  <ActiveCard
                    req={req}
                    onProgress={(status) => updateStatus(req.id, status)}

                    onChat={() => navigate(`/solicitud/${req.id}/chat`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Historial */}
        {others.length > 0 && (
          <section className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="flex items-center justify-between px-0.5"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#AAAAAA' }}>
                Historial · {others.length}
              </p>
              {historyOpen
                ? <ChevronUp size={13} style={{ color: '#AAAAAA' }} />
                : <ChevronDown size={13} style={{ color: '#AAAAAA' }} />
              }
            </button>
            {historyOpen && (
              <motion.div
                variants={staggerFast}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-1.5"
              >
                {others.map((req) => (
                  <motion.div key={req.id} variants={fadeUp}>
                    <HistoryCard req={req} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        )}

      </div>
    </PageShell>
  )
}
