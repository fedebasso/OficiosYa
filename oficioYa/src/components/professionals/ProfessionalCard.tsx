import { ChevronRight } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { RatingStars } from './RatingStars'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, verified, avg_rating, zone } = professional
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 text-left"
    >
      <Avatar src={profiles.avatar_url} name={profiles.full_name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-text-main truncate">{profiles.full_name}</span>
          {verified && <Badge variant="verified">Verificado</Badge>}
        </div>
        <p className="text-xs text-gray-500">{zone}</p>
        <RatingStars rating={avg_rating} size="sm" />
      </div>
      <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
    </button>
  )
}
