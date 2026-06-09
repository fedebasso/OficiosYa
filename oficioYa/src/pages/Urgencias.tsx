import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { UrgentProfessionalCard } from '../components/professionals/UrgentProfessionalCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useUrgentProfessionals } from '../hooks/useProfessionals'

export default function Urgencias() {
  const navigate = useNavigate()
  const { professionals, loading } = useUrgentProfessionals()

  const header = (
    <div
      className="px-4 pt-10 pb-5 sticky top-0 z-50"
      style={{ background: 'linear-gradient(160deg, #dc2626 0%, #991b1b 100%)' }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Volver atrás"
        className="flex items-center gap-1.5 text-white/80 text-sm mb-4 active:opacity-60 transition-opacity"
      >
        <ArrowLeft size={16} />
        Volver
      </button>
      <h1 className="text-2xl font-black text-white mb-1">🚨 Urgencias 24H</h1>
      <p className="text-white/75 text-sm mb-3">Profesionales disponibles ahora mismo</p>
      {!loading && (
        <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-[11px] font-bold">
            {professionals.length} disponibles ahora
          </span>
        </div>
      )}
    </div>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      <div className="p-4 flex flex-col gap-3">
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}
        {!loading && professionals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">😴</div>
            <p className="text-text-secondary font-medium">No hay profesionales disponibles ahora</p>
            <p className="text-text-muted text-sm mt-1">Intentá de nuevo en unos minutos</p>
          </div>
        )}
        {professionals.map((pro) => (
          <UrgentProfessionalCard key={pro.id} professional={pro} />
        ))}
      </div>
    </PageShell>
  )
}
