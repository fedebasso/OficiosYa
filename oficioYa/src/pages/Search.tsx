import { useParams, useNavigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import { Header } from '../components/layout/Header'
import { ProfessionalCard } from '../components/professionals/ProfessionalCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
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

  return (
    <PageShell
      header={<Header title={label} showBack onBack={() => navigate(-1)} />}
    >
      <div className="p-4 flex flex-col gap-3">
        {loading && <div className="flex justify-center py-8"><LoadingSpinner /></div>}
        {error && <p className="text-center text-red-500 py-8">{error}</p>}
        {!loading && !error && professionals.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No hay profesionales en esta categoría
          </p>
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
