import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'
import { getCategoryMeta } from '../../lib/categories'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, verified, avg_rating, zone, jobs_count, available_now, categories } = professional
  const { label, emoji, coverThumb, accent } = getCategoryMeta(categories[0] ?? '')
  const isTopPro = jobs_count >= 50 && avg_rating != null && avg_rating >= 4.8

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden active:scale-[0.97] transition-[transform,opacity] duration-200 flex items-stretch"
      style={{ background: '#141414', border: '1px solid #1e1e1e' }}
    >
      {/* Barra de color lateral por categoría */}
      <div className="w-1 flex-shrink-0" style={{ background: accent }} />

      {/* Foto cuadrada */}
      <div className="w-[72px] h-[72px] flex-shrink-0 overflow-hidden rounded-xl m-3" style={{ background: '#1a1a1a' }}>
        {profiles.avatar_url ? (
          <img src={profiles.avatar_url} alt={profiles.full_name} className="w-full h-full object-cover" />
        ) : (
          <img src={coverThumb} alt={label} className="w-full h-full object-cover" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 py-3 pr-2 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-semibold text-text-main text-sm truncate">{profiles.full_name}</span>
          {verified && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(232,104,58,.15)', color: '#e8683a' }}
            >✓</span>
          )}
          {isTopPro && (
            <span
              className="text-[8px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wide"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff' }}
            >★ Top</span>
          )}
        </div>
        <div className="text-[11px] font-medium mb-1.5" style={{ color: accent }}>
          {emoji} {label}
        </div>
        <div className="flex gap-3">
          {jobs_count > 0 && (
            <span className="text-[10px] text-text-muted">
              <span className="text-text-secondary font-semibold">{jobs_count}</span> trabajos
            </span>
          )}
          <span className="text-[10px] text-text-muted">{zone}</span>
        </div>
      </div>

      {/* Rating + badge */}
      <div className="flex flex-col items-end justify-between py-3 pr-3 flex-shrink-0">
        {available_now ? (
          <span
            className="text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide"
            style={{ background: 'rgba(232,104,58,.12)', color: '#e8683a', border: '1px solid rgba(232,104,58,.2)' }}
          >● Online</span>
        ) : (
          <span
            className="text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide"
            style={{ background: 'rgba(255,255,255,.04)', color: '#555', border: '1px solid #222' }}
          >Ocupado</span>
        )}
        {avg_rating != null && (
          <span className="text-sm font-bold text-text-main">
            <span className="text-star">★</span> {avg_rating}
          </span>
        )}
      </div>
    </button>
  )
}
