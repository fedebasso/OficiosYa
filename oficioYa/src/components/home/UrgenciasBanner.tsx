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
      className="w-full text-left rounded-2xl p-4 shadow-lg active:scale-[.99] transition-transform duration-150"
      style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', boxShadow: '0 6px 20px rgba(220,38,38,.3)' }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white/85 text-[10px] font-bold tracking-[.6px] uppercase">
          {count > 0 ? `${count} disponibles ahora` : 'Servicio activo'}
        </span>
      </div>
      <div className="text-white text-lg font-black mb-1">🚨 Urgencias 24H</div>
      <div className="text-white/75 text-xs mb-3 leading-snug">
        Profesionales verificados que responden en menos de 30 minutos
      </div>
      <div className="bg-white rounded-xl py-2.5 text-center text-[13px] font-extrabold text-danger">
        Ver profesionales disponibles →
      </div>
    </button>
  )
}

export default UrgenciasBanner
