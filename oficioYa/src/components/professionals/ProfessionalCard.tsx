import { Heart } from 'lucide-react'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'
import { getCategoryMeta } from '../../lib/categories'
import { getInitials } from '../../lib/utils'
import { useFavoritesStore } from '../../store/favoritesStore'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, verified, avg_rating, zone, jobs_count, categories, id } = professional
  const { label, emoji, accent, avatarGradient } = getCategoryMeta(categories[0] ?? '')
  const initials = getInitials(profiles.full_name)
  const { toggle, isFavorite } = useFavoritesStore()
  const favorite = isFavorite(id)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden flex items-stretch active:scale-[0.985] transition-transform duration-150"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #EDE8DE',
        boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
      }}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0" style={{ padding: 'var(--space-3)' }}>

        {/* Avatar — foto si tiene, iniciales con gradiente si no */}
        <div
          className="rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center font-black"
          style={{
            width: 56,
            height: 56,
            background: profiles.avatar_url ? undefined : avatarGradient,
            fontSize: 'var(--text-lg)',
          }}
        >
          {profiles.avatar_url ? (
            <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
          ) : (
            <span style={{ color: accent }}>{initials}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-bold truncate" style={{ color: '#111111', fontSize: 'var(--text-base)' }}>
              {profiles.full_name}
            </span>
            {verified && (
              <span
                className="font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: '#EFF6FF', color: '#3B82F6', fontSize: 'var(--text-xs)', border: '1px solid rgba(59,130,246,.2)' }}
              >✓ Verificado</span>
            )}
          </div>
          <div className="font-semibold mb-1 truncate" style={{ color: accent, fontSize: 'var(--text-sm)' }}>
            {emoji} {label}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium truncate" style={{ color: '#555555', fontSize: 'var(--text-sm)' }}>
              📍 {zone}
            </span>
            <span className="flex-shrink-0" style={{ color: '#AAAAAA', fontSize: 'var(--text-sm)' }}>
              🔨 {jobs_count} trabajos
            </span>
          </div>
        </div>

        {/* Rating + favorito */}
        <div className="flex flex-col items-end justify-between flex-shrink-0 py-0.5" style={{ minHeight: 56 }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggle(id) }}
            aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{
              background: favorite ? '#FEF2F2' : '#F5F0E8',
              border: `1px solid ${favorite ? '#FECACA' : '#EDE8DE'}`,
            }}
          >
            <Heart size={13} style={{ color: favorite ? '#EF4444' : '#CCCCCC' }} fill={favorite ? '#EF4444' : 'none'} />
          </button>
          {avg_rating != null && (
            <div className="flex items-center gap-1">
              <span style={{ color: '#F59E0B', fontSize: 'var(--text-base)' }}>★</span>
              <span className="font-black" style={{ color: '#111111', fontSize: 'var(--text-lg)', lineHeight: 1 }}>
                {avg_rating}
              </span>
            </div>
          )}
        </div>

      </div>
    </button>
  )
}

export default ProfessionalCard
