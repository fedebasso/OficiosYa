import { useNavigate } from 'react-router-dom'
import { ProfessionalCard } from '../professionals/ProfessionalCard'
import { useProfessionals } from '../../hooks/useProfessionals'

export function FeaturedProfessionals() {
  const navigate = useNavigate()
  const { professionals, loading } = useProfessionals()

  const featured = professionals.filter((p) => p.featured)

  if (loading || featured.length === 0) return null

  return (
    <section>
      <h2 className="text-[11px] font-bold text-text-secondary uppercase tracking-[.6px] mb-2.5">
        Más recomendados
      </h2>
      <div className="flex flex-col gap-2">
        {featured.map((pro) => (
          <ProfessionalCard
            key={pro.id}
            professional={pro}
            onClick={() => navigate(`/profesional/${pro.id}`)}
          />
        ))}
      </div>
    </section>
  )
}

export default FeaturedProfessionals
