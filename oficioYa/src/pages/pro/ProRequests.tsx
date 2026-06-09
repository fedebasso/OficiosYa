import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useIncomingRequests } from '../../hooks/useRequests'
import { PageShell } from '../../components/layout/PageShell'
import { CheckCircle, XCircle, MessageCircle, Clock, Inbox, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import type { ServiceRequest } from '../../store/requestStore'

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

function PendingCard({ req, onAccept, onReject, onWhatsApp }: {
  req: ServiceRequest
  onAccept: () => void
  onReject: () => void
  onWhatsApp: () => void
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #161616 0%, #111 100%)',
        border: req.urgency ? '1px solid rgba(239,68,68,.4)' : '1px solid #242424',
        boxShadow: req.urgency ? '0 0 20px rgba(239,68,68,.08)' : 'none',
        animation: 'slideIn .28s cubic-bezier(.22,.68,0,1.2) both',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: req.urgency ? 'rgba(239,68,68,.08)' : 'rgba(232,104,58,.06)',
          borderBottom: `1px solid ${req.urgency ? 'rgba(239,68,68,.18)' : 'rgba(232,104,58,.12)'}`,
        }}
      >
        <div className="flex items-center gap-2">
          {req.urgency ? (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: '#ef4444' }}>
              <Zap size={10} fill="currentColor" />
              Urgente
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#e8683a' }}>
              Nueva solicitud
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-[10px]" style={{ color: '#555' }}>
          <Clock size={9} />
          {timeAgo(req.created_at)}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 pt-3.5 pb-4 flex flex-col gap-3.5">
        <p className="text-sm leading-relaxed" style={{ color: '#d4cfc8' }}>
          {req.description}
        </p>

        {req.contact_phone && (
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: '#1a1a1a', border: '1px solid #242424' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#555' }}>Tel</span>
            <span className="text-sm font-semibold" style={{ color: '#f5f0e8' }}>{req.contact_phone}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-0.5">
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold active:scale-[.97] transition-transform"
            style={{ background: 'rgba(34,197,94,.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,.2)' }}
          >
            <CheckCircle size={14} />
            Aceptar
          </button>
          <button
            type="button"
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold active:scale-[.97] transition-transform"
            style={{ background: 'rgba(239,68,68,.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,.15)' }}
          >
            <XCircle size={14} />
            Rechazar
          </button>
          {req.contact_phone && (
            <button
              type="button"
              onClick={onWhatsApp}
              className="w-11 flex items-center justify-center rounded-xl active:scale-[.97] transition-transform flex-shrink-0"
              style={{ background: 'rgba(37,211,102,.1)', color: '#25D366', border: '1px solid rgba(37,211,102,.2)' }}
              aria-label="WhatsApp"
            >
              <MessageCircle size={15} />
            </button>
          )}
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
      style={{ background: '#141414', border: '1px solid #1e1e1e' }}
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
        <span className="text-[9px]" style={{ color: '#444' }}>{timeAgo(req.created_at)}</span>
      </div>
    </div>
  )
}

export default function ProRequests() {
  const user = useAuthStore((s) => s.user)
  const { requests, loading, error, updateStatus } = useIncomingRequests(user?.id ?? '')
  const [historyOpen, setHistoryOpen] = useState(true)

  const pending = requests.filter((r) => r.status === 'pending')
  const others  = requests.filter((r) => r.status !== 'pending')

  function openWhatsApp(phone: string) {
    const msg = encodeURIComponent('Hola! Vi tu solicitud en OficioYa y me gustaría ayudarte.')
    window.open(`https://wa.me/${phone.replace(/\s/g, '')}?text=${msg}`, '_blank')
  }

  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50"
      style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }}
    >
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#e8683a' }}>
            Panel profesional
          </p>
          <h1 className="text-2xl font-black leading-none" style={{ color: '#f5f0e8', letterSpacing: '-0.5px' }}>
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
    </div>
  )

  return (
    <PageShell header={header}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px) scale(.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
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
                  background: 'linear-gradient(90deg,#141414 25%,#1a1a1a 50%,#141414 75%)',
                  backgroundSize: '200% 100%',
                  animation: `shimmer 1.4s ease-in-out ${i * .15}s infinite`,
                  animationDelay: `${i * 0.15}s`,
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
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: '#141414', border: '1px solid #1e1e1e' }}
            >
              <Inbox size={24} style={{ color: '#333' }} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: '#f5f0e8' }}>Sin solicitudes aún</p>
              <p className="text-xs mt-1" style={{ color: '#444' }}>Las nuevas solicitudes aparecerán acá</p>
            </div>
          </div>
        )}

        {/* Pendientes */}
        {pending.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest px-0.5" style={{ color: '#444' }}>
              Por responder · {pending.length}
            </p>
            {pending.map((req, i) => (
              <div key={req.id} style={{ animationDelay: `${i * 0.07}s` }}>
                <PendingCard
                  req={req}
                  onAccept={() => updateStatus(req.id, 'confirmed')}
                  onReject={() => updateStatus(req.id, 'cancelled')}
                  onWhatsApp={() => req.contact_phone && openWhatsApp(req.contact_phone)}
                />
              </div>
            ))}
          </section>
        )}

        {/* Historial */}
        {others.length > 0 && (
          <section className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="flex items-center justify-between px-0.5 active:opacity-70 transition-opacity"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#444' }}>
                Historial · {others.length}
              </p>
              {historyOpen
                ? <ChevronUp size={13} style={{ color: '#444' }} />
                : <ChevronDown size={13} style={{ color: '#444' }} />
              }
            </button>
            {historyOpen && (
              <div className="flex flex-col gap-1.5">
                {others.map((req) => (
                  <HistoryCard key={req.id} req={req} />
                ))}
              </div>
            )}
          </section>
        )}

      </div>
    </PageShell>
  )
}
