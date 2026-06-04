import { Zap } from 'lucide-react'

interface Props {
  urgency: boolean
}

export function UrgencyBadge({ urgency }: Props) {
  if (!urgency) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
      <Zap size={10} fill="currentColor" />
      Urgente
    </span>
  )
}
