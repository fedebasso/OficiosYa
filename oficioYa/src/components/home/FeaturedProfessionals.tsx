import { useNavigate } from 'react-router-dom'
import { ProfessionalCard } from '../professionals/ProfessionalCard'
import { FeaturedSkeleton } from '../ui/Skeleton'
import { useProfessionals } from '../../hooks/useProfessionals'
import { motion } from 'framer-motion'
import { fadeUp, staggerFast } from '../../lib/motion'

export function FeaturedProfessionals() {
  const navigate = useNavigate()
  const { professionals, loading } = useProfessionals()

  const featured = professionals.filter((p) => p.featured)

  if (loading) return (
    <section>
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="text-[11px] font-bold uppercase tracking-[.7px] mb-2.5"
        style={{ color: '#999999' }}
      >
        Más recomendados
      </motion.h2>
      <FeaturedSkeleton />
    </section>
  )

  if (featured.length === 0) return null

  return (
    <section>
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="text-[11px] font-bold uppercase tracking-[.7px] mb-2.5"
        style={{ color: '#999999' }}
      >
        Más recomendados
      </motion.h2>

      <motion.div
        variants={staggerFast}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2"
      >
        {featured.map((pro) => (
          <motion.div key={pro.id} variants={fadeUp}>
            <ProfessionalCard
              professional={pro}
              onClick={() => navigate(`/profesional/${pro.id}`)}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

export default FeaturedProfessionals
