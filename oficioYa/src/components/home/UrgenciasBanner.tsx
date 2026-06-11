import { useNavigate } from 'react-router-dom'
import { useUrgentProfessionals } from '../../hooks/useProfessionals'

export function UrgenciasBanner() {
  const navigate = useNavigate()
  const { professionals } = useUrgentProfessionals()
  const count = professionals.length

  return (
    <button
      type="button"
      onClick={() => navigate('/urgencias')}
      aria-label="Ver profesionales de urgencias 24H"
      className="w-full text-left rounded-2xl flex items-center gap-3 p-3.5 active:scale-[0.98] transition-transform duration-150"
      style={{
        background: '#FFF5F5',
        border: '1.5px solid #FECACA',
        boxShadow: '0 2px 8px rgba(239,68,68,.06)',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: '#FEE2E2' }}
      >
        🚨
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-black" style={{ color: '#991B1B' }}>
          Emergencias 24hs
        </div>
        <div className="text-[12px] mt-0.5" style={{ color: '#B91C1C' }}>
          {count > 0 ? `${count} profesionales disponibles ahora` : 'Profesionales disponibles ahora'}
        </div>
      </div>
      <div
        className="text-[9px] font-black uppercase tracking-wide px-2.5 py-1.5 rounded-full flex-shrink-0"
        style={{ background: '#EF4444', color: '#FFFFFF', animation: 'urgency-pulse 2s ease-in-out infinite' }}
      >
        ● En vivo
      </div>
    </button>
  )
}

export default UrgenciasBanner
