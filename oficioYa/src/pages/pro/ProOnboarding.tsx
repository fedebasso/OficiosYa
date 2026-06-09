import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { PageShell } from '../../components/layout/PageShell'

const STEPS = [
  { icon: '📝', title: 'Completá tu bio', desc: 'Contá tu experiencia y especialidades' },
  { icon: '📸', title: 'Subí fotos de trabajos', desc: 'Mostrá tus trabajos anteriores' },
  { icon: '📱', title: 'Agregá tu WhatsApp', desc: 'Los clientes podrán contactarte directamente' },
]

export default function ProOnboarding() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const firstName = user?.full_name?.split(' ')[0] ?? 'profesional'

  return (
    <PageShell showBottomNav={false}>
      <div className="flex flex-col min-h-screen" style={{ background: '#0f0f0f' }}>

        {/* Hero dark */}
        <div
          className="px-6 pt-14 pb-12 flex flex-col items-center gap-2 relative"
          style={{ background: 'linear-gradient(160deg, #1a1008 0%, #2d1f0e 100%)' }}
        >
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(232,104,58,.1) 0%, transparent 70%)' }}
          />
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2"
            style={{ background: 'rgba(232,104,58,.15)', border: '1px solid rgba(232,104,58,.25)' }}
          >
            🔧
          </div>
          <h1 className="text-2xl font-black" style={{ color: '#f5f0e8', letterSpacing: '-0.5px' }}>
            Oficio<span style={{ color: '#e8683a' }}>Ya</span>
          </h1>
          <p className="text-sm" style={{ color: '#888' }}>Portal de profesionales</p>
          <div className="absolute bottom-0 left-0 right-0 h-8 rounded-t-[32px]" style={{ background: '#0f0f0f' }} />
        </div>

        {/* Contenido */}
        <div className="flex flex-col gap-4 px-5 pt-6 pb-10">

          {/* Bienvenida */}
          <div className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
            <h2 className="font-black text-base mb-1" style={{ color: '#f5f0e8' }}>
              ¡Bienvenido, {firstName}! 👋
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
              Completá tu perfil para aparecer en los resultados de búsqueda y recibir solicitudes de clientes.
            </p>
          </div>

          {/* Pasos */}
          <div className="flex flex-col gap-2">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="flex items-center gap-3 rounded-2xl p-4"
                style={{ background: '#141414', border: '1px solid #1e1e1e' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'rgba(232,104,58,.1)', border: '1px solid rgba(232,104,58,.15)' }}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: '#f5f0e8' }}>{step.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#555' }}>{step.desc}</p>
                </div>
                <div
                  className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                  style={{ borderColor: '#2a2a2a', color: '#555' }}
                >
                  {i + 1}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <button
            type="button"
            onClick={() => navigate('/pro/perfil')}
            className="w-full rounded-2xl py-4 text-base font-bold text-white active:opacity-80 transition-opacity mt-2"
            style={{ background: '#e8683a', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
          >
            Completar mi perfil
          </button>
          <button
            type="button"
            onClick={() => navigate('/pro/solicitudes')}
            className="w-full rounded-2xl py-3.5 text-sm font-bold active:opacity-70 transition-opacity"
            style={{ background: 'transparent', color: '#e8683a' }}
          >
            Ver solicitudes →
          </button>

        </div>
      </div>
    </PageShell>
  )
}
