import { useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'
import { getCategoryMeta } from '../../lib/categories'

interface Props {
  professional: ProfessionalWithProfile
}

export function UrgentProfessionalCard({ professional }: Props) {
  const navigate = useNavigate()
  const { profiles, verified, avg_rating, zone, jobs_count, response_time_min, whatsapp, categories } = professional
  const { label: specialty, emoji } = getCategoryMeta(categories[0] ?? '')

  function handleCall(e: React.MouseEvent) {
    e.stopPropagation()
    if (profiles.phone) window.location.href = `tel:${profiles.phone}`
  }

  function handleWhatsApp(e: React.MouseEvent) {
    e.stopPropagation()
    window.open(`https://wa.me/${whatsapp}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#141414', border: '1px solid #1e1e1e' }}
    >
      {/* Franja de urgencia — sutil, oscura con acento rojo */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: 'linear-gradient(90deg, #1a0505, #2a0808)', borderBottom: '1px solid rgba(239,68,68,.15)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: '#ef4444', animation: 'urgency-pulse 2s ease-in-out infinite' }}
          />
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#ef4444' }}>
            Disponible ahora · 24hs
          </span>
        </div>
        <span className="text-[9px] font-bold" style={{ color: '#555' }}>
          ⏱ ~{response_time_min} min
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Perfil */}
        <button
          type="button"
          onClick={() => navigate(`/profesional/${professional.id}`)}
          className="w-full text-left flex items-center gap-3 mb-4 focus:outline-none"
        >
          <Avatar src={profiles.avatar_url} name={profiles.full_name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-bold truncate" style={{ color: '#f5f0e8' }}>
                {profiles.full_name}
              </span>
              {verified && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: 'rgba(232,104,58,.15)', color: '#e8683a' }}
                >✓</span>
              )}
            </div>
            <div className="text-[11px] font-semibold" style={{ color: '#e8683a' }}>
              {emoji} {specialty}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            {avg_rating != null && (
              <div className="text-sm font-bold" style={{ color: '#f5f0e8' }}>
                <span style={{ color: '#f59e0b' }}>★</span> {avg_rating}
              </div>
            )}
            <div className="text-[10px]" style={{ color: '#555' }}>{jobs_count} trabajos</div>
          </div>
        </button>

        {/* Zona */}
        <div className="flex items-center gap-1.5 mb-4 text-[11px]" style={{ color: '#666' }}>
          <span>📍</span>
          <span>{zone}</span>
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCall}
            className="rounded-xl py-3 text-[12px] font-bold flex items-center justify-center gap-1.5 active:opacity-80 transition-opacity text-white"
            style={{ background: '#e8683a', boxShadow: '0 4px 12px rgba(232,104,58,.25)' }}
          >
            📞 Llamar
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="rounded-xl py-3 text-[12px] font-bold flex items-center justify-center gap-1.5 active:opacity-80 transition-opacity text-white"
            style={{ background: '#25D366', boxShadow: '0 4px 12px rgba(37,211,102,.2)' }}
          >
            💬 WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}

export default UrgentProfessionalCard
