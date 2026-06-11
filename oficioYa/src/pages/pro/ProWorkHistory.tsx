import { useAuthStore } from '../../store/authStore'
import { useIncomingRequests } from '../../hooks/useRequests'
import { PageShell } from '../../components/layout/PageShell'
import { Briefcase } from 'lucide-react'
import { getCategoryMeta } from '../../lib/categories'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Hoy'
  if (d === 1) return 'Ayer'
  if (d < 30)  return `hace ${d}d`
  const m = Math.floor(d / 30)
  return `hace ${m} mes${m > 1 ? 'es' : ''}`
}

function WorkSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
    >
      <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: '#EDE8DE' }} />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3 rounded w-2/3" style={{ background: '#EDE8DE' }} />
        <div className="h-2.5 rounded w-1/2" style={{ background: '#F0EBE1' }} />
      </div>
    </div>
  )
}

export default function ProWorkHistory() {
  const user = useAuthStore((s) => s.user)
  const { requests, loading } = useIncomingRequests(user?.id ?? '')
  const completed = requests.filter((r) => r.status === 'completed')

  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#e8683a' }}>
        Panel profesional
      </p>
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-black leading-none" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
          Trabajos
        </h1>
        {!loading && completed.length > 0 && (
          <span className="text-xs font-bold mb-0.5" style={{ color: '#999999' }}>
            {completed.length} completado{completed.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )

  return (
    <PageShell header={header}>
      <div className="p-4 flex flex-col gap-2.5">

        {loading && [0, 1, 2].map((i) => <WorkSkeleton key={i} />)}

        {!loading && completed.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
            >
              <Briefcase size={24} style={{ color: '#CCCCCC' }} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: '#111111' }}>Sin trabajos aún</p>
              <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>
                Los trabajos completados aparecerán acá
              </p>
            </div>
          </div>
        )}

        {completed.map((req, i) => {
          const { emoji, label, accent } = getCategoryMeta(req.category)
          return (
            <div
              key={req.id}
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #E8E0D4',
                animation: `fadeUp .25s ease both`,
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {/* Ícono categoría */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}
              >
                {emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: accent }}>{label}</span>
                  <span className="text-[10px] flex-shrink-0" style={{ color: '#AAAAAA' }}>
                    {timeAgo(req.created_at)}
                  </span>
                </div>
                <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: '#555555' }}>
                  {req.description}
                </p>
              </div>
            </div>
          )
        })}

      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </PageShell>
  )
}
