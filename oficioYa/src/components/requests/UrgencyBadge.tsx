import { Zap } from 'lucide-react'

interface Props {
  urgency: boolean
}

export function UrgencyBadge({ urgency }: Props) {
  if (!urgency) return null
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
    >
      <Zap size={10} fill="currentColor" />
      Urgente
    </span>
  )
}
