import { useParams, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Avatar } from '../components/ui/Avatar'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useProfessionals } from '../hooks/useProfessionals'
import type { ProfessionalWithProfile } from '../hooks/useProfessionals'

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricistas',
  plomero: 'Sanitarios',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero: 'Cerrajeros',
  albanil: 'Albañiles',
}

interface CardProps {
  professional: ProfessionalWithProfile
  onClick: () => void
}

function ExpandedProCard({ professional, onClick }: CardProps) {
  const { profiles, verified, avg_rating, zone, jobs_count, response_time_min, available_now } = professional
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm px-3.5 py-3 active:scale-[.99] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <Avatar src={profiles.avatar_url} name={profiles.full_name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-sm text-text-main truncate">{profiles.full_name}</span>
            {verified && (
              <span className="bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">✓</span>
            )}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">📍 {zone}</div>
        </div>
        {avg_rating != null && (
          <span className="text-sm font-bold text-text-main flex-shrink-0">⭐ {avg_rating}</span>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap border-t border-gray-50 pt-2.5">
        {jobs_count > 0 && (
          <span className="bg-gray-50 rounded-lg px-2 py-1 text-[10px] font-semibold text-gray-500">
            🔧 {jobs_count} trabajos
          </span>
        )}
        {available_now && (
          <>
            <span className="bg-red-50 rounded-lg px-2 py-1 text-[10px] font-semibold text-danger">
              ⚡ Urgencias
            </span>
            {response_time_min > 0 && (
              <span className="bg-green-50 rounded-lg px-2 py-1 text-[10px] font-semibold text-primary">
                ⏱ ~{response_time_min} min
              </span>
            )}
          </>
        )}
      </div>
    </button>
  )
}

export default function Search() {
  const { categoria } = useParams<{ categoria: string }>()
  const navigate = useNavigate()
  const { professionals, loading, error } = useProfessionals(categoria)

  const label = categoria ? CATEGORY_LABELS[categoria] ?? categoria : 'Profesionales'

  const header = (
    <div className="bg-background border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-text-main text-sm flex-shrink-0 active:opacity-70 transition-opacity"
        >
          ←
        </button>
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm">
          <span className="text-primary text-sm">🔍</span>
          <span className="text-sm text-gray-400 truncate">{label}...</span>
        </div>
        <button
          type="button"
          className="bg-primary text-white text-[11px] font-bold px-3 py-2 rounded-xl flex-shrink-0"
          aria-label="Ordenar por rating"
        >
          ↕ Rating
        </button>
      </div>
      {!loading && !error && (
        <p className="text-[11px] text-gray-400">
          <strong className="text-text-main">{professionals.length}</strong> profesionales en Montevideo
        </p>
      )}
    </div>
  )

  return (
    <PageShell header={header}>
      <div className="p-4 flex flex-col gap-3">
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}
        {error && (
          <p className="text-center text-red-500 py-8 text-sm">{error}</p>
        )}
        {!loading && !error && professionals.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="text-4xl">🔍</div>
            <p className="font-bold text-text-main">No encontramos profesionales</p>
            <p className="text-sm text-gray-400">Intentá con otra categoría</p>
          </div>
        )}
        {professionals.map((pro) => (
          <ExpandedProCard
            key={pro.id}
            professional={pro}
            onClick={() => navigate(`/profesional/${pro.id}`)}
          />
        ))}
      </div>
    </PageShell>
  )
}
