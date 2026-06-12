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
      className="inline-flex items-center gap-1.5 font-bold px-2 py-1 rounded-full flex-shrink-0"
      style={{ background: '#DCFCE7', color: '#16A34A', fontSize: 'var(--text-xs)' }}
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
      className="inline-flex items-center font-black px-2 py-1 rounded-full flex-shrink-0"
      style={{ background: '#FEF9C3', color: '#D97706', fontSize: 'var(--text-xs)' }}
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
      <div className="flex items-start gap-3 flex-1 min-w-0" style={{ padding: 'var(--space-3)' }}>
        {/* Avatar */}
        <div
          className="rounded-xl overflow-hidden flex-shrink-0"
          style={{ width: 64, height: 64, background: '#F5F0E8' }}
        >
          {profiles.avatar_url ? (
            <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-black"
              style={{ background: `linear-gradient(135deg, ${accent}cc, ${accent})`, fontSize: 'var(--text-lg)' }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 py-0.5">
          {/* Nombre + verificado */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className="font-bold truncate"
              style={{ color: '#111111', fontSize: 'var(--text-base)' }}
            >
              {profiles.full_name}
            </span>
            {verified && (
              <span
                className="font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: '#FEF0EA', color: '#E8683A', fontSize: 'var(--text-xs)' }}
              >✓</span>
            )}
          </div>

          {/* Categoría */}
          <div className="font-semibold mb-1.5 truncate" style={{ color: accent, fontSize: 'var(--text-sm)' }}>
            {emoji} {label}
          </div>

          {/* Zona + trabajos */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium truncate" style={{ color: '#555555', fontSize: 'var(--text-sm)' }}>
              📍 {zone}
            </span>
            <span className="flex-shrink-0" style={{ color: '#999999', fontSize: 'var(--text-xs)' }}>
              {jobs_count} trabajos
            </span>
          </div>
        </div>

        {/* Derecha: rating + corazón + badges */}
        <div className="flex flex-col items-end justify-between flex-shrink-0 py-0.5" style={{ minHeight: 64 }}>
          <div className="flex items-center gap-2">
            {/* Rating */}
            {avg_rating != null && (
              <div className="flex items-center gap-1">
                <span style={{ color: '#F59E0B', fontSize: 'var(--text-base)' }}>★</span>
                <span className="font-black" style={{ color: '#111111', fontSize: 'var(--text-lg)', lineHeight: 1 }}>
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
            {available_now && <AvailableBadge />}
          </div>
        </div>
      </div>
    </button>
  )
}

export default ProfessionalCard
