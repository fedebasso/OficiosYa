import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'
import { getCategoryMeta } from '../../lib/categories'
import { getInitials } from '../../lib/utils'
import { useFavoritesStore } from '../../store/favoritesStore'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, avg_rating, zone, jobs_count, categories, id } = professional
  const { label, emoji, avatarGradient, accent } = getCategoryMeta(categories[0] ?? '')
  const initials = getInitials(profiles.full_name)
  const { toggle, isFavorite } = useFavoritesStore()
  const favorite = isFavorite(id)

  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden flex items-stretch"
      whileTap={{ scale: 0.98, y: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #EDE8DE',
        boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0" style={{ padding: 'var(--space-3)' }}>

        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate mb-1" style={{ color: '#111111', fontSize: 'var(--text-base)' }}>
            {profiles.full_name}
          </div>

          {/* Chip de profesión */}
          <div className="mb-1.5">
            <span
              className="inline-block font-bold"
              style={{
                background: 'rgba(232,104,58,.12)',
                color: '#E8683A',
                fontSize: 'var(--text-xs)',
                padding: '2px 8px',
                borderRadius: 6,
              }}
            >
              {emoji} {label}
            </span>
          </div>

          {/* Zona y trabajos */}
          <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)' }}>
            <span style={{ color: '#888888', fontWeight: 600 }}>📍 {zone}</span>
            <span style={{ color: '#DDDDDD' }}>|</span>
            <span>
              <span style={{ color: '#333333', fontWeight: 800 }}>{jobs_count}</span>
              <span style={{ color: '#888888', fontWeight: 500 }}> trabajos</span>
            </span>
          </div>
        </div>

        {/* Rating + favorito */}
        <div className="flex flex-col items-end justify-between flex-shrink-0 self-stretch py-0.5">
          {/* Favorito — cuadrado redondeado */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggle(id) }}
            aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            className="flex items-center justify-center active:scale-90 transition-transform"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: favorite ? '#FEF2F2' : '#F5F0E8',
              border: `1.5px solid ${favorite ? '#FECACA' : '#E8E0D4'}`,
              flexShrink: 0,
            }}
          >
            <Heart
              size={14}
              style={{ color: favorite ? '#EF4444' : '#CCCCCC' }}
              fill={favorite ? '#EF4444' : 'none'}
            />
          </button>

          {/* Rating */}
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
    </motion.button>
  )
}

export default ProfessionalCard
