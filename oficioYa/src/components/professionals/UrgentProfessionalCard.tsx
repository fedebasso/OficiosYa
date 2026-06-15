import { useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'
import { getCategoryMeta } from '../../lib/categories'

interface Props {
  professional: ProfessionalWithProfile
}

export function UrgentProfessionalCard({ professional }: Props) {
  const navigate = useNavigate()
  const { profiles, avg_rating, zone, jobs_count, response_time_min, whatsapp, categories } = professional
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
      style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}
    >
      <div className="p-4 pb-0">
        {/* Disponibilidad + tiempo */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: '#ef4444', animation: 'urgency-pulse 2s ease-in-out infinite' }}
            />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#ef4444' }}>
              Disponible 24hs
            </span>
          </div>
          <span className="text-[10px] font-semibold" style={{ color: '#AAAAAA' }}>
            ⏱ ~{response_time_min} min
          </span>
        </div>

        {/* Perfil */}
        <button
          type="button"
          onClick={() => navigate(`/profesional/${professional.id}`)}
          className="w-full text-left flex items-center gap-3 mb-4 focus:outline-none active:opacity-80 transition-opacity"
        >
          <div
            className="flex-shrink-0 rounded-2xl overflow-hidden"
            style={{ width: 52, height: 52, border: '2px solid rgba(239,68,68,.2)' }}
          >
            <Avatar src={profiles.avatar_url} name={profiles.full_name} size="md" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate mb-1" style={{ color: '#111111' }}>
              {profiles.full_name}
            </div>
            <div className="text-[11px] font-semibold mb-1" style={{ color: '#E8683A' }}>
              {emoji} {specialty}
            </div>
            <div className="flex items-center gap-3 text-[11px]" style={{ color: '#888888' }}>
              <span>📍 {zone}</span>
              {avg_rating != null && (
                <span>
                  <span style={{ color: '#f59e0b' }}>★</span>
                  <span className="font-bold" style={{ color: '#111111' }}> {avg_rating}</span>
                </span>
              )}
              <span>{jobs_count} trabajos</span>
            </div>
          </div>
        </button>
      </div>

      {/* Botones con separador */}
      <div
        className="grid gap-2 p-3"
        style={{ borderTop: '1px solid #F0EBE1', gridTemplateColumns: '1fr 2fr' }}
      >
        <button
          type="button"
          onClick={handleCall}
          className="rounded-xl py-3 text-[12px] font-bold flex items-center justify-center gap-1.5 active:opacity-80 transition-opacity"
          style={{ background: '#F5F0E8', color: '#555555', border: '1.5px solid #E8E0D4' }}
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
  )
}

export default UrgentProfessionalCard
