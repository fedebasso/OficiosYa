import { createElement } from 'react'
import { Heart, MapPin, Star, Check } from 'lucide-react'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'
import { getCategoryMeta, getCategoryIcon } from '../../lib/categories'
import { getInitials } from '../../lib/utils'
import { useFavoritesStore } from '../../store/favoritesStore'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

const CARD_SHADOW = '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)'

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, avg_rating, zone, jobs_count, categories, id, verified } = professional
  const { label, avatarGradient, accent } = getCategoryMeta(categories[0] ?? '')
  const catIcon = getCategoryIcon(categories[0] ?? '')
  const initials = getInitials(profiles.full_name)
  const { toggle, isFavorite } = useFavoritesStore()
  const favorite = isFavorite(id)

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="w-full text-left cursor-pointer transition-transform active:scale-[0.98]"
      style={{
        background: '#FFFFFF',
        border: '1px solid #ECE6DC',
        borderRadius: 20,
        boxShadow: CARD_SHADOW,
        padding: 16,
      }}
    >
      {/* Fila superior */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="relative flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center font-black"
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            background: profiles.avatar_url ? undefined : avatarGradient,
            boxShadow: 'inset 0 0 0 1px rgba(212,87,31,.12)',
            fontSize: 19,
          }}
        >
          {profiles.avatar_url
            ? <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
            : <span style={{ color: accent }}>{initials}</span>
          }
          {verified && (
            <span
              className="absolute flex items-center justify-center"
              style={{ bottom: -3, right: -3, width: 20, height: 20, borderRadius: '50%', background: '#22A559', border: '2.5px solid #fff' }}
            >
              <Check size={11} color="#fff" strokeWidth={3} />
            </span>
          )}
        </div>

        {/* Nombre + categoría */}
        <div className="flex-1 min-w-0">
          <div className="font-extrabold truncate" style={{ color: '#1A1712', fontSize: 17, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            {profiles.full_name}
          </div>
          <div className="flex items-center gap-1.5" style={{ marginTop: 5, color: '#7A6E5E', fontSize: 12.5, fontWeight: 700 }}>
            {createElement(catIcon, { size: 14, style: { color: '#D4571F' } })}
            {label}
          </div>
        </div>

        {/* Favorito */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggle(id) }}
          aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          className="flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
          style={{ width: 44, height: 44, borderRadius: 14, background: '#FAF6F0' }}
        >
          <Heart size={17} style={{ color: favorite ? '#EF4444' : '#C9BFB0' }} fill={favorite ? '#EF4444' : 'none'} />
        </button>
      </div>

      {/* Divisor */}
      <div style={{ height: 1, background: '#F0EAE0', margin: '13px 0 11px' }} />

      {/* Fila inferior */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <span className="flex items-center gap-1" style={{ color: '#6B6153', fontSize: 13, fontWeight: 600 }}>
            <MapPin size={14} style={{ color: '#B3A794' }} />
            {zone}
          </span>
          <span style={{ color: '#6E6455', fontSize: 13 }}>
            <b style={{ color: '#5A5142' }}>{jobs_count}</b> trabajos
          </span>
        </div>

        {avg_rating != null ? (
          <span className="flex items-center gap-1" style={{ background: '#FFF7ED', padding: '5px 10px', borderRadius: 10 }}>
            <Star size={14} fill="#F5A623" color="#F5A623" />
            <span style={{ fontWeight: 800, color: '#1A1712', fontSize: 14 }}>{avg_rating.toFixed(1)}</span>
            <span style={{ color: '#6E6455', fontSize: 11, fontWeight: 600 }}>({jobs_count})</span>
          </span>
        ) : (
          <span style={{ fontSize: 11, color: '#8A7F6E', fontWeight: 600 }}>Sin reseñas</span>
        )}
      </div>
    </div>
  )
}

export default ProfessionalCard
