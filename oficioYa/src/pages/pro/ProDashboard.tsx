import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useProRequestsStore } from '../../store/proRequestsStore'
import { PageShell } from '../../components/layout/PageShell'
import { MessageCircle, ChevronRight, Bell, User, Briefcase, Star, Clock } from 'lucide-react'

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

  const header = (
    <div
      className="px-5 pt-12 pb-5"
      style={{ background: 'linear-gradient(160deg, #E8683A 0%, #c9542a 100%)' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70" style={{ color: '#fff' }}>
        Panel profesional
      </p>
      <h1 className="text-2xl font-black" style={{ color: '#FFFFFF', letterSpacing: '-0.5px' }}>
        {greeting}, {firstName}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[
          { label: 'Pendientes', count: pending.length, icon: Bell },
          { label: 'En curso',   count: active.length,  icon: Clock },
          { label: 'Rating',     count: '4.7',           icon: Star },
        ].map(({ label, count, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl p-3 text-center"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            <Icon size={13} style={{ color: 'rgba(255,255,255,0.7)', margin: '0 auto 4px' }} />
            <div className="text-xl font-black leading-none" style={{ color: '#FFFFFF' }}>
              {count}
            </div>
            <div className="text-[9px] font-bold mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      <div className="flex flex-col gap-4 py-4">

        {/* Alerta de pendientes */}
        {!loading && pending.length > 0 && (
          <button
            type="button"
            onClick={() => navigate('/pro/solicitudes')}
            className="mx-4 rounded-2xl overflow-hidden text-left w-auto active:opacity-80"
            style={{ background: '#FEF0EA', border: '1.5px solid #FDDCC8' }}
          >
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#E8683A' }}
                >
                  <Bell size={15} style={{ color: '#fff' }} />
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: '#111' }}>
                    {pending.length} solicitud{pending.length !== 1 ? 'es' : ''} pendiente{pending.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs" style={{ color: '#E8683A' }}>
                    Última hace {timeAgo(pending[0].created_at).replace('hace ', '')}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: '#E8683A' }} />
            </div>
          </button>
        )}

        {/* Trabajos en curso */}
        {!loading && active.length > 0 && (
          <div className="flex flex-col gap-2.5 mx-4">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#AAAAAA' }}>
              En curso · {active.length}
            </p>
            {active.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
              >
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{
                    background: req.status === 'in_progress' ? 'rgba(139,92,246,.06)' : 'rgba(34,197,94,.06)',
                    borderBottom: `1px solid ${req.status === 'in_progress' ? 'rgba(139,92,246,.15)' : 'rgba(34,197,94,.15)'}`,
                  }}
                >
                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: req.status === 'in_progress' ? '#8b5cf6' : '#22c55e' }}
                  >
                    {req.status === 'in_progress' ? '🚗 En camino' : '✅ Aceptado'}
                  </span>
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: '#AAA' }}>
                    <Clock size={9} /> {timeAgo(req.created_at)}
                  </span>
                </div>
                <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
                  <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#333' }}>
                    {req.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(req.id, req.status === 'in_progress' ? 'completed' : 'in_progress')}
                      className="flex-1 rounded-xl py-2.5 text-sm font-bold"
                      style={{
                        background: req.status === 'in_progress' ? '#DCFCE7' : '#EEF2FF',
                        color: req.status === 'in_progress' ? '#16A34A' : '#4F46E5',
                        border: `1px solid ${req.status === 'in_progress' ? '#BBF7D0' : '#C7D2FE'}`,
                      }}
                    >
                      {req.status === 'in_progress' ? '🏁 Marcar completado' : '🚗 Marcar en camino'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/solicitud/${req.id}/chat`)}
                      className="w-12 flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{ background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE' }}
                    >
                      <MessageCircle size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado vacío — sin nada activo */}
        {!loading && pending.length === 0 && active.length === 0 && (
          <div
            className="mx-4 rounded-2xl overflow-hidden"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
          >
            <div
              className="px-5 py-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, rgba(232,104,58,0.08) 0%, rgba(232,104,58,0.04) 100%)', borderBottom: '1px solid #EDE8DE' }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'rgba(232,104,58,0.12)' }}>
                ✅
              </div>
              <div>
                <p className="font-black text-sm" style={{ color: '#111' }}>Todo al día, {firstName}</p>
                <p className="text-xs mt-0.5" style={{ color: '#AAA' }}>No hay solicitudes pendientes por ahora</p>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#CCC' }}>Mientras tanto</p>
              {[
                { icon: '👤', label: 'Completá tu perfil', desc: 'Más info = más clientes', to: '/pro/perfil/editar' },
                { icon: '📸', label: 'Subí fotos de trabajos', desc: 'Generá confianza con tu portfolio', to: '/pro/perfil' },
              ].map(({ icon, label, desc, to }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => navigate(to)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left w-full active:opacity-70"
                  style={{ background: '#F5F0E8', border: '1px solid #EDE8DE' }}
                >
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: '#111' }}>{label}</p>
                    <p className="text-xs" style={{ color: '#999' }}>{desc}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: '#CCC', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Accesos rápidos */}
        <div className="mx-4 flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#AAAAAA' }}>
            Accesos rápidos
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: User,      label: 'Mi perfil',   to: '/pro/perfil' },
              { icon: Briefcase, label: 'Mis trabajos', to: '/pro/trabajos' },
              { icon: MessageCircle, label: 'Mensajes', to: '/mensajes' },
            ].map(({ icon: Icon, label, to }) => (
              <button
                key={to}
                type="button"
                onClick={() => navigate(to)}
                className="flex flex-col items-center gap-2 rounded-2xl py-4 active:opacity-70"
                style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
              >
                <Icon size={20} style={{ color: '#E8683A' }} />
                <span className="text-[10px] font-bold text-center" style={{ color: '#555' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Resumen histórico */}
        {!loading && completed.length > 0 && (
          <button
            type="button"
            onClick={() => navigate('/pro/trabajos')}
            className="mx-4 rounded-2xl px-4 py-3.5 flex items-center justify-between active:opacity-80"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(34,197,94,.1)' }}>
                <Star size={15} style={{ color: '#22c55e' }} />
              </div>
              <div className="text-left">
                <p className="text-sm font-black" style={{ color: '#111' }}>
                  {completed.length} trabajo{completed.length !== 1 ? 's' : ''} completado{completed.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs" style={{ color: '#AAA' }}>Ver historial completo</p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: '#CCC' }} />
          </button>
        )}

      </div>
    </PageShell>
  )
}
