import { Heart } from 'lucide-react'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'
import { getCategoryMeta } from '../../lib/categories'
import { getInitials } from '../../lib/utils'
import { useFavoritesStore } from '../../store/favoritesStore'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

function AvailableBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-full"
      style={{ background: '#DCFCE7', color: '#16A34A' }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: '#16A34A', animation: 'pulse-green 2s ease-in-out infinite' }}
      />
      Online
    </span>
  )
}

function TopBadge() {
  return (
    <span
      className="inline-flex items-center text-[10px] font-black px-2 py-1 rounded-full"
      style={{ background: '#FEF9C3', color: '#D97706' }}
    >
      ★ Top
    </span>
  )
}

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, verified, avg_rating, zone, jobs_count, available_now, categories, id } = professional
  const { label, emoji, accent } = getCategoryMeta(categories[0] ?? '')
  const isTopPro = jobs_count >= 50 && avg_rating != null && avg_rating >= 4.8
  const initials = getInitials(profiles.full_name)
  const { toggle, isFavorite } = useFavoritesStore()
  const favorite = isFavorite(id)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden flex items-stretch active:scale-[0.985] transition-transform duration-150"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E8E0D4',
        boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
      }}
    >
      {/* Barra de color por categoría */}
      <div className="w-1 flex-shrink-0" style={{ background: accent }} />

      {/* Contenido */}
      <div className="flex items-start gap-3 p-3.5 flex-1">
        {/* Avatar */}
        <div className="w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#F5F0E8' }}>
          {profiles.avatar_url ? (
            <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-xl font-black"
              style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})` }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5">
          {/* Nombre + verificado */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[16px] font-bold truncate" style={{ color: '#111111' }}>
              {profiles.full_name}
            </span>
            {verified && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: '#FEF0EA', color: '#E8683A' }}
              >✓</span>
            )}
          </div>

          {/* Categoría */}
          <div className="text-[13px] font-600 mb-1.5" style={{ color: accent }}>
            {emoji} {label}
          </div>

          {/* Zona + trabajos */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium" style={{ color: '#555555' }}>
              📍 {zone}
            </span>
            <span className="text-[12px]" style={{ color: '#999999' }}>
              {jobs_count} trabajos
            </span>
          </div>
        </div>

        {/* Derecha: rating + corazón + badges */}
        <div className="flex flex-col items-end justify-between min-h-[72px] flex-shrink-0 py-0.5">
          <div className="flex items-center gap-2">
            {/* Rating */}
            {avg_rating != null && (
              <div className="flex items-center gap-1">
                <span style={{ color: '#F59E0B', fontSize: 15 }}>★</span>
                <span className="font-black" style={{ color: '#111111', fontSize: 18, lineHeight: 1 }}>
                  {avg_rating}
                </span>
              </div>
            )}
            {/* Favorito */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggle(id) }}
              aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              style={{
                background: favorite ? '#FEF2F2' : '#F5F0E8',
                border: `1px solid ${favorite ? '#FECACA' : '#E8E0D4'}`,
              }}
            >
              <Heart
                size={13}
                style={{ color: favorite ? '#EF4444' : '#CCCCCC' }}
                fill={favorite ? '#EF4444' : 'none'}
              />
            </button>
          </div>

          {/* Badges — max 2 */}
          <div className="flex flex-col items-end gap-1 mt-1">
            {isTopPro && <TopBadge />}
            {available_now
              ? <AvailableBadge />
              : null
            }
          </div>
        </div>
      </div>
    </button>
  )
}

export default ProfessionalCard
