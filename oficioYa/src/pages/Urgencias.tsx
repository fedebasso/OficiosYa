import { useBack } from '../hooks/useBack'
import { ChevronLeft, Siren } from 'lucide-react'
import { PageShell } from '../components/layout/PageShell'
import { UrgentProfessionalCard } from '../components/professionals/UrgentProfessionalCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useUrgentProfessionals } from '../hooks/useProfessionals'
import { motion } from 'framer-motion'
import { fadeUp, scaleIn, staggerFast } from '../lib/motion'

export default function Urgencias() {
  const goBack = useBack('/') 
  const { professionals, loading } = useUrgentProfessionals()

  const header = (
    <div className="px-4 pt-10 pb-5 sticky top-0 z-50" style={{ background: '#F5F0E8', borderBottom: '1px solid #ECE4D8' }}>
      <button
        type="button"
        onClick={goBack}
        aria-label="Volver"
        className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity mb-4"
      >
        <ChevronLeft size={24} style={{ color: '#111111' }} />
      </button>

      <div className="flex items-start justify-between gap-3">
        <div>
          {/* Badge urgencias — acento rojo sutil */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(239,68,68,.12)',
                color: '#ef4444',
                border: '1px solid rgba(239,68,68,.25)',
              }}
            >
              <Siren size={11} />
              Emergencias
            </span>
            {!loading && (
              <span className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: '#555555' }}>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#ef4444', animation: 'urgency-pulse 2s ease-in-out infinite' }}
                />
                {professionals.length} disponibles
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
            Servicio 24hs
          </h1>
          <p className="text-sm mt-1" style={{ color: '#555555' }}>
            Profesionales que responden en menos de 30 min
          </p>
        </div>

        {/* Ícono decorativo */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #1a0505, #2d0a0a)',
            border: '1px solid rgba(239,68,68,.2)',
          }}
        >
          <Siren size={28} style={{ color: '#DC2626' }} />
        </div>
      </div>
    </div>
  )

  return (
    <PageShell header={header}>
      <div className="p-4 flex flex-col gap-3" style={{ minHeight: '100%' }}>
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}
        {!loading && professionals.length === 0 && (
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="text-center py-12"
          >
            <div className="text-4xl mb-3">😴</div>
            <p className="font-medium" style={{ color: '#555555' }}>No hay profesionales disponibles ahora</p>
            <p className="text-sm mt-1" style={{ color: '#999999' }}>Intentá de nuevo en unos minutos</p>
          </motion.div>
        )}
        <motion.div
          variants={staggerFast}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          {professionals.map((pro) => (
            <motion.div key={pro.id} variants={fadeUp}>
              <UrgentProfessionalCard professional={pro} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageShell>
  )
}
