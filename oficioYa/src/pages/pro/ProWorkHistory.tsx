import { useAuthStore } from '../../store/authStore'
import { useIncomingRequests } from '../../hooks/useRequests'
import { PageShell } from '../../components/layout/PageShell'
import { Header } from '../../components/layout/Header'
import { Badge } from '../../components/ui/Badge'

export default function ProWorkHistory() {
  const user = useAuthStore((s) => s.user)
  const { requests, loading } = useIncomingRequests(user?.id ?? '')
  const completed = requests.filter((r) => r.status === 'completed')

  return (
    <PageShell header={<Header title="Trabajos completados" />}>
      <div className="p-4 flex flex-col gap-3">
        {loading && <p className="text-center text-text-secondary py-8">Cargando...</p>}
        {!loading && completed.length === 0 && (
          <p className="text-center text-text-muted py-8">No hay trabajos completados aún</p>
        )}
        {completed.map((req) => (
          <div key={req.id} className="bg-bg-card rounded-xl border border-border-dark p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="completed">Completado</Badge>
              <span className="text-xs text-text-muted ml-auto">
                {new Date(req.created_at).toLocaleDateString('es-UY')}
              </span>
            </div>
            <p className="text-sm text-text-main line-clamp-2">{req.description}</p>
          </div>
        ))}
      </div>
    </PageShell>
  )
}
