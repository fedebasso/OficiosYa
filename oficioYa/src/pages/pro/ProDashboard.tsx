import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useProRequestsStore } from '../../store/proRequestsStore'
import { PageShell } from '../../components/layout/PageShell'
import { CheckCircle, XCircle, Clock, ChevronRight, MessageCircle } from 'lucide-react'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Ahora mismo'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export default function ProDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const requests = useProRequestsStore((s) => s.requests)
  const loading = useProRequestsStore((s) => s.loading)
  const load = useProRequestsStore((s) => s.load)
  const updateStatus = useProRequestsStore((s) => s.updateStatus)

  useEffect(() => {
    if (user?.id) load(user.id)
  }, [user?.id, load])

  const firstName = user?.full_name?.split(' ')[0] ?? 'profesional'
  const pending = requests.filter((r) => r.status === 'pending')
  const active = requests.filter((r) => r.status === 'confirmed' || r.status === 'in_progress')
  const completed = requests.filter((r) => r.status === 'completed')

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  const STATS = [
    { label: 'Pendientes', count: pending.length, color: '#F59E0B', bg: 'rgba(245,158,11,.1)' },
    { label: 'En curso',   count: active.length,  color: '#8B5CF6', bg: 'rgba(139,92,246,.1)' },
    { label: 'Rating',     count: '4.7',           color: '#F59E0B', bg: 'rgba(245,158,11,.1)' },
  ]

  const header = (
    <div
      className="px-5 pt-12 pb-4"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#E8683A' }}>
        Panel profesional
      </p>
      <h1 className="text-2xl font-black" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
        {greeting}, {firstName}
      </h1>
    </div>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      <div className="flex flex-col gap-5 py-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-3 text-center"
              style={{ background: s.bg, border: `1px solid ${s.color}30` }}
            >
              <div className="text-xl font-black leading-none" style={{ color: s.color }}>
                {s.count}
              </div>
              <div className="text-[9px] font-bold mt-1" style={{ color: s.color }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feed de pendientes */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#AAAAAA' }}>
              Solicitudes pendientes · {pending.length}
            </p>
            {pending.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/pro/solicitudes')}
                className="flex items-center gap-1 text-[10px] font-bold"
                style={{ color: '#E8683A' }}
              >
                Ver todas <ChevronRight size={12} />
              </button>
            )}
          </div>

          {loading && (
            <div className="flex flex-col gap-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl"
                  style={{
                    background: 'linear-gradient(90deg,#EDE8DE 25%,#F5F0E8 50%,#EDE8DE 75%)',
                    backgroundSize: '200% 100%',
                    animation: `shimmer 1.4s ease-in-out ${i * 0.15}s infinite`,
                    border: '1.5px solid #E8E0D4',
                  }}
                />
              ))}
              <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
            </div>
          )}

          {!loading && pending.length === 0 && (
            <div
              className="flex flex-col items-center gap-3 py-10 text-center rounded-2xl"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
            >
              <span className="text-3xl">✓</span>
              <div>
                <p className="font-black text-sm" style={{ color: '#111' }}>Todo al día</p>
                <p className="text-xs mt-1" style={{ color: '#AAA' }}>No tenés solicitudes pendientes</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/pro/perfil')}
                className="px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(232,104,58,.12)', color: '#E8683A' }}
              >
                Completar perfil
              </button>
            </div>
          )}

          {!loading && pending.slice(0, 5).map((req) => (
            <div
              key={req.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
            >
              <div
                className="flex items-center justify-between px-4 py-2"
                style={{ background: '#FEF0EA', borderBottom: '1px solid #FDDCC8' }}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#E8683A' }}>
                  Nueva solicitud
                </span>
                <span className="flex items-center gap-1 text-[10px]" style={{ color: '#AAA' }}>
                  <Clock size={9} /> {timeAgo(req.created_at)}
                </span>
              </div>
              <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
                <p className="text-sm leading-relaxed" style={{ color: '#333' }}>
                  {req.description}
                </p>
                {req.category && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full self-start"
                    style={{ background: '#F5F0E8', color: '#666' }}
                  >
                    {req.category.replace('_', ' ')}
                  </span>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatus(req.id, 'confirmed')}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold"
                    style={{ background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' }}
                  >
                    <CheckCircle size={14} /> Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(req.id, 'cancelled')}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold"
                    style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
                  >
                    <XCircle size={14} /> Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && pending.length > 5 && (
            <button
              type="button"
              onClick={() => navigate('/pro/solicitudes')}
              className="w-full py-3 rounded-2xl text-sm font-bold"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', color: '#E8683A' }}
            >
              Ver {pending.length - 5} solicitudes más →
            </button>
          )}
        </div>

        {/* En curso — solicitudes confirmadas con botón chat */}
        {active.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#AAAAAA' }}>
                En curso · {active.length}
              </p>
            </div>
            {active.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
              >
                <div
                  className="flex items-center justify-between px-4 py-2"
                  style={{ background: 'rgba(34,197,94,.06)', borderBottom: '1px solid rgba(34,197,94,.15)' }}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#22c55e' }}>
                    ✅ {req.status === 'in_progress' ? 'En camino' : 'Aceptado'}
                  </span>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: '#AAA' }}>
                    <Clock size={9} /> {timeAgo(req.created_at)}
                  </span>
                </div>
                <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
                  <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#333' }}>
                    {req.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/solicitud/${req.id}/chat`)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold"
                    style={{ background: '#E8683A', color: '#FFFFFF' }}
                  >
                    <MessageCircle size={14} /> Ir al chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resumen de completados */}
        {completed.length > 0 && (
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
          >
            <div>
              <p className="text-sm font-black" style={{ color: '#111' }}>
                {completed.length} trabajo{completed.length !== 1 ? 's' : ''} completado{completed.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs" style={{ color: '#AAA' }}>Historial completo en Solicitudes</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/pro/solicitudes')}
              className="flex items-center gap-1 text-sm font-bold"
              style={{ color: '#E8683A' }}
            >
              Ver <ChevronRight size={14} />
            </button>
          </div>
        )}

      </div>
    </PageShell>
  )
}
