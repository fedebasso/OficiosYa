import type { ServiceRequest } from '../../store/requestStore'

interface Props {
  request: ServiceRequest
}

const STATUS_META: Record<ServiceRequest['status'], { label: string; color: string }> = {
  pending:     { label: 'Pendiente',  color: '#f59e0b' },
  confirmed:   { label: 'Confirmado', color: '#22c55e' },
  in_progress: { label: 'En camino',  color: '#8b5cf6' },
  completed:   { label: 'Completado', color: '#3b82f6' },
  cancelled:   { label: 'Cancelado',  color: '#ef4444' },
}

export function RequestCard({ request }: Props) {
  const meta = STATUS_META[request.status] ?? STATUS_META.pending

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: meta.color, boxShadow: `0 0 5px ${meta.color}88` }}
          />
          <span
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
          {request.urgency && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' }}
            >
              ⚡ Urgente
            </span>
          )}
        </div>
        <span className="text-[10px]" style={{ color: '#AAAAAA' }}>
          {new Date(request.created_at).toLocaleDateString('es-UY', {
            day: '2-digit', month: 'short',
          })}
        </span>
      </div>

      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#c8c3bc' }}>
        {request.description}
      </p>

      {request.contact_phone && (
        <p className="text-[11px] font-medium" style={{ color: '#999999' }}>
          Tel: <span style={{ color: '#555555' }}>{request.contact_phone}</span>
        </p>
      )}
    </div>
  )
}
