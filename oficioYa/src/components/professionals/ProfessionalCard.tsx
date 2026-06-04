import { ChevronRight } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, verified, avg_rating, zone, jobs_count } = professional
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl shadow-sm p-3.5 flex items-center gap-3 text-left hover:shadow-md transition-shadow duration-150 active:scale-[.99]"
    >
      <Avatar src={profiles.avatar_url} name={profiles.full_name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-semibold text-text-main text-sm truncate">{profiles.full_name}</span>
          {verified && (
            <span className="inline-flex items-center bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              ✓
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 leading-tight">
          {avg_rating != null && <span>⭐ {avg_rating} · </span>}
          {zone}
          {jobs_count > 0 && <span> · {jobs_count} trabajos</span>}
        </p>
      </div>
      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
    </button>
  )
}
