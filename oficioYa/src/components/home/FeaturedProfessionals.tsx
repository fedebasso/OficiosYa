import { useNavigate } from 'react-router-dom'
import { ProfessionalCard } from '../professionals/ProfessionalCard'
import { FeaturedSkeleton } from '../ui/Skeleton'
import { useProfessionals } from '../../hooks/useProfessionals'

export function FeaturedProfessionals() {
  const navigate = useNavigate()
  const { professionals, loading } = useProfessionals()

  const featured = professionals.filter((p) => p.featured)

  if (loading) return (
    <section>
      <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-[.6px] mb-2.5">
        Más recomendados
      </h2>
      <FeaturedSkeleton />
    </section>
  )

  if (featured.length === 0) return null

  return (
    <section>
      <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-[.6px] mb-2.5">
        Más recomendados
      </h2>
      <div className="flex flex-col gap-2">
        {featured.map((pro, i) => (
          <div key={pro.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <ProfessionalCard
              professional={pro}
              onClick={() => navigate(`/profesional/${pro.id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeaturedProfessionals
