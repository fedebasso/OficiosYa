import { useAuthStore } from '../../store/authStore'
import { useIncomingRequests } from '../../hooks/useRequests'
import { PageShell } from '../../components/layout/PageShell'
import { Header } from '../../components/layout/Header'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { UrgencyBadge } from '../../components/requests/UrgencyBadge'
import { CheckCircle, XCircle, MessageCircle } from 'lucide-react'

export default function ProRequests() {
  const user = useAuthStore((s) => s.user)
  const { requests, loading, error, updateStatus } = useIncomingRequests(user?.id ?? '')

  const pending = requests.filter((r) => r.status === 'pending')
  const others = requests.filter((r) => r.status !== 'pending')

  return (
    <PageShell header={<Header title="Solicitudes" />}>
      <div className="p-4 flex flex-col gap-4">
        {loading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}
        {error && <p className="text-center text-red-500 py-8">{error}</p>}

        {!loading && pending.length === 0 && others.length === 0 && (
          <p className="text-center text-text-muted py-8">No hay solicitudes aún</p>
        )}

        {pending.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-2">Nuevas</h2>
            <div className="flex flex-col gap-3">
              {pending.map((req) => (
                <div key={req.id} className="bg-bg-card rounded-xl border border-border-dark p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="pending">Pendiente</Badge>
                    <UrgencyBadge urgency={req.urgency} />
                  </div>
                  <p className="text-sm text-text-main">{req.description}</p>
                  {req.contact_phone && (
                    <p className="text-xs text-text-muted">Contacto: {req.contact_phone}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateStatus(req.id, 'accepted')}
                    >
                      <CheckCircle size={14} className="inline mr-1" />
                      Aceptar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateStatus(req.id, 'rejected')}
                    >
                      <XCircle size={14} className="inline mr-1" />
                      Rechazar
                    </Button>
                    {req.contact_phone && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const msg = encodeURIComponent(
                            `Hola! Vi tu solicitud en OficioYa y me gustaría ayudarte.`
                          )
                          window.open(
                            `https://wa.me/${req.contact_phone?.replace(/\s/g, '')}?text=${msg}`,
                            '_blank'
                          )
                        }}
                      >
                        <MessageCircle size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {others.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-2">Historial</h2>
            <div className="flex flex-col gap-2">
              {others.map((req) => (
                <div key={req.id} className="bg-bg-card rounded-xl border border-border-dark p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={req.status}>{req.status}</Badge>
                    <UrgencyBadge urgency={req.urgency} />
                  </div>
                  <p className="text-xs text-text-muted line-clamp-1">{req.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  )
}
