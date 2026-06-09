import { useEffect, useState } from 'react'
import { PageShell } from '../components/layout/PageShell'
import { RequestCard } from '../components/requests/RequestCard'
import { ReviewForm } from '../components/requests/ReviewForm'
import { useRequestStore } from '../store/requestStore'

function SolicitudSkeleton() {
  return (
    <div className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl" style={{ background: '#242424', animation: 'shimmer 1.4s ease-in-out infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg,#1a1a1a 25%,#242424 50%,#1a1a1a 75%)' }} />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 rounded" style={{ width: '50%', background: '#242424' }} />
          <div className="h-2.5 rounded" style={{ width: '35%', background: '#1e1e1e' }} />
        </div>
        <div className="h-6 w-16 rounded-full" style={{ background: '#1e1e1e' }} />
      </div>
      <div className="h-2.5 rounded mb-2" style={{ width: '80%', background: '#1e1e1e' }} />
      <div className="h-2.5 rounded" style={{ width: '60%', background: '#1e1e1e' }} />
    </div>
  )
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending:    { label: 'Pendiente',   color: '#f59e0b', bg: 'rgba(245,158,11,.1)',  icon: '⏳' },
  confirmed:  { label: 'Confirmado',  color: '#3b82f6', bg: 'rgba(59,130,246,.1)', icon: '✅' },
  in_progress:{ label: 'En camino',   color: '#8b5cf6', bg: 'rgba(139,92,246,.1)', icon: '🚗' },
  completed:  { label: 'Completado',  color: '#22c55e', bg: 'rgba(34,197,94,.1)',  icon: '🏁' },
  cancelled:  { label: 'Cancelado',   color: '#ef4444', bg: 'rgba(239,68,68,.1)',  icon: '❌' },
}

export default function MisSolicitudes() {
  const { requests, loading, loadRequests, submitReview } = useRequestStore()
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  useEffect(() => { loadRequests() }, [loadRequests])

  const header = (
    <div className="px-4 pt-10 pb-4 sticky top-0 z-50" style={{ background: '#0f0f0f', borderBottom: '1px solid #1e1e1e' }}>
      <h1 className="text-xl font-black" style={{ color: '#f5f0e8', letterSpacing: '-0.5px' }}>
        Mis solicitudes
      </h1>
      {!loading && requests.length > 0 && (
        <p className="text-xs mt-0.5" style={{ color: '#555' }}>
          {requests.length} solicitud{requests.length !== 1 ? 'es' : ''}
        </p>
      )}
    </div>
  )

  return (
    <PageShell header={header}>
      <div className="p-4 flex flex-col gap-3" style={{ background: '#0f0f0f', minHeight: '100%' }}>

        {loading && [0,1,2].map(i => <SolicitudSkeleton key={i} />)}

        {!loading && requests.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: '#141414', border: '1px solid #1e1e1e' }}
            >
              📋
            </div>
            <div>
              <p className="font-black text-base" style={{ color: '#f5f0e8' }}>Sin solicitudes aún</p>
              <p className="text-sm mt-1" style={{ color: '#555' }}>
                Tus trabajos solicitados aparecerán acá
              </p>
            </div>
          </div>
        )}

        {requests.map((req) => {
          const status = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending
          return (
            <div key={req.id} className="flex flex-col gap-2 animate-fade-up">
              <div className="rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
                {/* Status bar */}
                <div className="flex items-center justify-between px-4 py-2.5" style={{ background: status.bg, borderBottom: `1px solid ${status.color}22` }}>
                  <div className="flex items-center gap-2">
                    <span>{status.icon}</span>
                    <span className="text-xs font-black uppercase tracking-wide" style={{ color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                  <span className="text-[10px]" style={{ color: '#555' }}>
                    {new Date(req.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                {/* Card body */}
                <div className="p-4">
                  <RequestCard request={req} />
                </div>
              </div>
              {req.status === 'completed' && (
                <button
                  type="button"
                  onClick={() => setReviewingId(req.id)}
                  className="w-full rounded-2xl py-2.5 text-sm font-bold active:opacity-70 transition-opacity"
                  style={{ background: 'rgba(232,104,58,.1)', color: '#e8683a', border: '1px solid rgba(232,104,58,.2)' }}
                >
                  ★ Dejar reseña
                </button>
              )}
            </div>
          )
        })}

      </div>

      {reviewingId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,.7)' }}>
          <div className="w-full max-w-md rounded-t-2xl p-6" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
            <ReviewForm
              requestId={reviewingId}
              onSubmit={async (rating, comment) => {
                await submitReview(reviewingId, rating, comment)
              }}
              onClose={() => setReviewingId(null)}
            />
          </div>
        </div>
      )}
    </PageShell>
  )
}
