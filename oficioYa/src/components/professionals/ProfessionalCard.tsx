import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'

interface Props {
  professional: ProfessionalWithProfile
  onClick: () => void
}

const CATEGORY_COVER: Record<string, string> = {
  electricista: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=75',
  plomero: 'https://images.unsplash.com/photo-1621905251189-08b45249a5c5?w=400&q=75',
  albanil: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=75',
  cerrajero: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=75',
  aire_acondicionado: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=75',
}

const CATEGORY_EMOJI: Record<string, string> = {
  electricista: '⚡',
  plomero: '🔧',
  albanil: '🏗️',
  cerrajero: '🔑',
  aire_acondicionado: '❄️',
}

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricista',
  plomero: 'Plomero',
  albanil: 'Albañil',
  cerrajero: 'Cerrajero',
  aire_acondicionado: 'Aire Acondicionado',
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

export function ProfessionalCard({ professional, onClick }: Props) {
  const { profiles, verified, avg_rating, zone, jobs_count, available_now, categories } = professional
  const cat = categories[0] ?? ''
  const cover = CATEGORY_COVER[cat] ?? 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=75'
  const emoji = CATEGORY_EMOJI[cat] ?? '🛠️'
  const label = CATEGORY_LABELS[cat] ?? cat
  const initials = getInitials(profiles.full_name)

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl overflow-hidden active:scale-[.99] transition-all duration-150 text-left"
      style={{ background: '#141414', border: '1px solid #1e1e1e' }}
    >
      {/* Foto de trabajo */}
      <div className="relative h-36 overflow-hidden">
        <img src={cover} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {available_now && (
          <span className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            Disponible
          </span>
        )}
      </div>

      {/* Avatar flotante */}
      <div className="flex justify-center -mt-8 relative z-10">
        {profiles.avatar_url ? (
          <img
            src={profiles.avatar_url}
            alt={profiles.full_name}
            className="w-16 h-16 rounded-full border-[3px] border-bg-elevated shadow-md object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full border-[3px] border-bg-elevated shadow-md bg-primary flex items-center justify-center text-white text-lg font-bold">
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 pt-2 pb-4 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <span className="font-bold text-text-main text-base leading-tight">{profiles.full_name}</span>
          {verified && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,.15)', color: '#60a5fa' }}>✓</span>
          )}
        </div>
        <p className="text-xs font-semibold text-primary mb-3">{emoji} {label}</p>

        {/* Stats */}
        <div className="flex justify-center gap-0 border border-border-dark rounded-xl overflow-hidden mb-3">
          <div className="flex-1 py-2 text-center border-r border-border-dark">
            <div className="text-sm font-bold text-text-main">
              {avg_rating != null ? `⭐ ${avg_rating}` : '–'}
            </div>
            <div className="text-[9px] text-text-muted mt-0.5">Rating</div>
          </div>
          <div className="flex-1 py-2 text-center border-r border-border-dark">
            <div className="text-sm font-bold text-text-main">{jobs_count}</div>
            <div className="text-[9px] text-text-muted mt-0.5">Trabajos</div>
          </div>
          <div className="flex-1 py-2 text-center">
            <div className="text-sm font-bold text-text-main">📍 {zone}</div>
            <div className="text-[9px] text-text-muted mt-0.5">Zona</div>
          </div>
        </div>

        <div className="bg-primary text-white rounded-xl py-2.5 text-sm font-bold">
          Solicitar trabajo
        </div>
      </div>
    </button>
  )
}
