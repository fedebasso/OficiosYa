import { useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import type { ProfessionalWithProfile } from '../../hooks/useProfessionals'

interface Props {
  professional: ProfessionalWithProfile
}

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricista',
  plomero: 'Sanitario',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero: 'Cerrajero/a',
  albanil: 'Albañil',
}

export function UrgentProfessionalCard({ professional }: Props) {
  const navigate = useNavigate()
  const { profiles, verified, avg_rating, zone, jobs_count, response_time_min, whatsapp, categories } = professional
  const specialty = CATEGORY_LABELS[categories[0]] ?? categories[0]

  function handleCall(e: React.MouseEvent) {
    e.stopPropagation()
    if (profiles.phone) window.location.href = `tel:${profiles.phone}`
  }

  function handleWhatsApp(e: React.MouseEvent) {
    e.stopPropagation()
    window.open(`https://wa.me/${whatsapp}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md">
      {/* Header rojo */}
      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{ background: 'linear-gradient(90deg, #dc2626, #b91c1c)' }}
      >
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
        <span className="text-white text-[9px] font-bold tracking-[.5px] uppercase">
          Disponible ahora · 24H
        </span>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Perfil — toca aquí para ir al perfil */}
        <button
          type="button"
          onClick={() => navigate(`/profesional/${professional.id}`)}
          className="w-full text-left flex items-center gap-2.5 mb-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 rounded-lg"
        >
          <Avatar src={profiles.avatar_url} name={profiles.full_name} size="md" />
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-extrabold text-text-main leading-tight">
              {profiles.full_name}
            </div>
            <div className="text-[11px] text-primary font-semibold mt-0.5">
              {specialty}{verified && ' · ✓ Verificado/a'}
            </div>
          </div>
        </button>

        {/* Stats */}
        <div className="flex gap-3 text-[11px] text-gray-500 mb-2">
          {avg_rating != null && <span>⭐ {avg_rating}</span>}
          <span>📍 {zone}</span>
          <span>🔧 {jobs_count} trabajos</span>
        </div>

        {/* Tiempo respuesta */}
        <div className="bg-red-50 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-danger mb-3">
          ⏱ Responde en ~{response_time_min} minutos
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCall}
            className="bg-primary text-white rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-1.5 active:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          >
            📞 Llamar
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="bg-whatsapp text-white rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-1.5 active:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-1"
          >
            💬 WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}

export default UrgentProfessionalCard
