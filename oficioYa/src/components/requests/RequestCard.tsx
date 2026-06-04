import { Badge } from '../ui/Badge'
import { UrgencyBadge } from './UrgencyBadge'
import type { ServiceRequest } from '../../store/requestStore'

interface Props {
  request: ServiceRequest
}

const STATUS_LABELS: Record<ServiceRequest['status'], string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  completed: 'Completado',
  rejected: 'Rechazado',
}

export function RequestCard({ request }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Badge variant={request.status}>{STATUS_LABELS[request.status]}</Badge>
        <UrgencyBadge urgency={request.urgency} />
      </div>
      <p className="text-sm text-text-main line-clamp-2">{request.description}</p>
      <p className="text-xs text-gray-400">
        {new Date(request.created_at).toLocaleDateString('es-UY', {
          day: '2-digit', month: 'short', year: 'numeric',
        })}
      </p>
    </div>
  )
}
