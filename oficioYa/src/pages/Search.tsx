import { useParams, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ProfessionalCard } from '../components/professionals/ProfessionalCard'
import { useProfessionals } from '../hooks/useProfessionals'

const CATEGORY_LABELS: Record<string, string> = {
  electricista: 'Electricistas',
  plomero: 'Sanitarios',
  aire_acondicionado: 'Aire Acondicionado',
  cerrajero: 'Cerrajeros',
  albanil: 'Albañiles',
}

export default function Search() {
  const { categoria } = useParams<{ categoria: string }>()
  const navigate = useNavigate()
  const { professionals, loading, error } = useProfessionals(categoria)

  const label = categoria ? CATEGORY_LABELS[categoria] ?? categoria : 'Profesionales'

  const header = (
    <div className="bg-background border-b border-border-dark px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="w-8 h-8 rounded-full flex items-center justify-center text-text-main text-sm flex-shrink-0 active:opacity-70 transition-opacity"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
        >
          ←
        </button>
        <div
          className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
        >
          <span className="text-primary text-sm">🔍</span>
          <span className="text-sm text-text-muted truncate">{label}...</span>
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
        <p className="text-[11px] text-text-muted">
          <strong className="text-text-main">{professionals.length}</strong> profesionales en Montevideo
        </p>
      )}
    </div>
  )

  return (
    <PageShell header={header}>
      <div className="p-4 flex flex-col gap-3" style={{ background: '#0f0f0f', minHeight: '100%' }}>
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
            <p className="text-sm text-text-muted">Intentá con otra categoría</p>
          </div>
        )}
        {professionals.map((pro) => (
          <ProfessionalCard
            key={pro.id}
            professional={pro}
            onClick={() => navigate(`/profesional/${pro.id}`)}
          />
        ))}
      </div>
    </PageShell>
  )
}
