import { useNavigate } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { WorkPhotoGallery } from './WorkPhotoGallery'
import type { ProfessionalWithProfile, WorkPhoto } from '../../hooks/useProfessionals'

interface Props {
  professional: ProfessionalWithProfile
  photos: WorkPhoto[]
}

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricista',
  plomero: 'Sanitario',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero: 'Cerrajero/a',
  albanil: 'Albañil',
}

export function ProfessionalProfile({ professional, photos }: Props) {
  const navigate = useNavigate()
  const {
    profiles, bio, avg_rating, verified, zone, categories,
    whatsapp, id, jobs_count, response_time_min, available_now,
  } = professional

  const specialty = CATEGORY_LABELS[categories[0]] ?? categories[0]

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Header verde */}
      <div className="bg-primary px-4 pt-10 pb-14 relative">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="flex items-center gap-1.5 text-white/70 text-sm mb-2 active:opacity-60 transition-opacity focus:outline-none"
        >
          ← Volver
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[32px]" />
      </div>

      {/* Avatar flotante */}
      <div className="flex justify-center mt-[-40px] mb-3 relative z-10">
        <div className="rounded-full border-4 border-white shadow-lg overflow-hidden w-20 h-20 flex-shrink-0">
          <Avatar src={profiles.avatar_url} name={profiles.full_name} size="lg" />
        </div>
      </div>

      {/* Nombre + especialidad + zona */}
      <div className="text-center px-6 mb-3">
        <h1 className="text-xl font-black text-text-main">{profiles.full_name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{specialty}</p>
        <p className="text-xs text-gray-400">📍 {zone}</p>
      </div>

      {/* Badges */}
      <div className="flex justify-center gap-2 mb-4 px-4 flex-wrap">
        {verified && (
          <span className="bg-green-50 text-primary border border-green-200 rounded-full text-[10px] font-bold px-3 py-1">
            ✓ Verificado
          </span>
        )}
        {available_now && (
          <span className="bg-red-50 text-danger border border-red-200 rounded-full text-[10px] font-bold px-3 py-1">
            ⚡ Urgencias 24H
          </span>
        )}
      </div>

      {/* Stats en 3 cards */}
      <div className="grid grid-cols-3 gap-3 px-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
          <div className="text-lg font-black text-text-main">
            {avg_rating != null ? avg_rating : '–'}
          </div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Rating</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
          <div className="text-lg font-black text-text-main">{jobs_count}</div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Trabajos</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-3 text-center">
          <div className="text-lg font-black text-text-main">
            {available_now ? `~${response_time_min}m` : '–'}
          </div>
          <div className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Respuesta</div>
        </div>
      </div>

      {/* CTAs en grid — ARRIBA del bio */}
      <div className="grid grid-cols-2 gap-3 px-4 mb-4">
        <button
          type="button"
          onClick={() => navigate(`/solicitar/${id}`)}
          className="w-full bg-primary text-white rounded-2xl py-3 text-sm font-bold active:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          style={{ boxShadow: '0 4px 12px rgba(15,110,86,.25)' }}
        >
          📋 Solicitar
        </button>
        <button
          type="button"
          onClick={() => window.open(`https://wa.me/${whatsapp}`, '_blank', 'noopener,noreferrer')}
          className="w-full bg-whatsapp text-white rounded-2xl py-3 text-sm font-bold active:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
        >
          💬 WhatsApp
        </button>
      </div>

      {/* Sobre mí */}
      <div className="bg-white rounded-2xl shadow-sm mx-4 mb-3 p-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sobre mí</h3>
        <p className="text-sm text-text-main leading-relaxed">{bio}</p>
      </div>

      {/* Servicios */}
      <div className="bg-white rounded-2xl shadow-sm mx-4 mb-3 p-4">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Servicios</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="bg-green-50 text-primary border border-green-200 text-xs font-semibold px-3 py-1 rounded-full"
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </span>
          ))}
        </div>
      </div>

      {/* Fotos de trabajos */}
      {photos.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm mx-4 mb-6 p-4">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Trabajos anteriores</h3>
          <WorkPhotoGallery photos={photos} />
        </div>
      )}

    </div>
  )
}
