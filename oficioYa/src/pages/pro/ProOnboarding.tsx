import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { PageShell } from '../../components/layout/PageShell'
import { Button } from '../../components/ui/Button'

export default function ProOnboarding() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  return (
    <PageShell showBottomNav={false}>
      <div className="flex flex-col min-h-screen">
        <div className="bg-primary px-6 py-12 text-center">
          <h1 className="text-2xl font-semibold text-white">
            Oficio<span className="text-accent">Ya</span>
          </h1>
          <p className="text-white/80 text-sm mt-1">Portal de profesionales</p>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="bg-bg-card rounded-xl border border-border-dark p-4">
            <h2 className="font-semibold text-text-main mb-1">
              ¡Bienvenido, {user?.full_name?.split(' ')[0] ?? 'profesional'}!
            </h2>
            <p className="text-sm text-text-secondary">
              Completá tu perfil para aparecer en los resultados de búsqueda y recibir solicitudes de clientes.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { icon: '📝', title: 'Completá tu bio', desc: 'Contá tu experiencia y especialidades' },
              { icon: '📷', title: 'Subí fotos de trabajos', desc: 'Mostrá tus trabajos anteriores' },
              { icon: '📱', title: 'Agregá tu WhatsApp', desc: 'Los clientes podrán contactarte directamente' },
            ].map((step) => (
              <div key={step.title} className="flex items-start gap-3 bg-bg-card rounded-xl border border-border-dark p-3">
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <p className="font-medium text-sm text-text-main">{step.title}</p>
                  <p className="text-xs text-text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="primary" fullWidth onClick={() => navigate('/pro/perfil')}>
            Completar mi perfil
          </Button>
          <Button variant="ghost" onClick={() => navigate('/pro/solicitudes')}>
            Ver solicitudes
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
