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
      className="w-full text-left rounded-2xl active:scale-[.99] transition-transform duration-150 flex items-center gap-3 p-3.5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a0505 0%, #2d0a0a 100%)',
        border: '1px solid rgba(239,68,68,.25)',
        boxShadow: '0 4px 20px rgba(239,68,68,.1)',
      }}
    >
      {/* Glow decorativo */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(239,68,68,.12) 0%, transparent 70%)' }}
      />

      {/* Ícono */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.25)' }}
      >
        🚨
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-black" style={{ color: '#f5f0e8' }}>
            Emergencias 24hs
          </span>
        </div>
        <p className="text-xs" style={{ color: '#888' }}>
          {count > 0 ? `${count} profesionales disponibles ahora mismo` : 'Profesionales disponibles ahora mismo'}
        </p>
      </div>

      {/* Badge pulsante */}
      <div
        className="flex-shrink-0 text-[9px] font-black uppercase tracking-wide px-2.5 py-1.5 rounded-full"
        style={{
          background: '#ef4444',
          color: '#fff',
          animation: 'urgency-pulse 2s ease-in-out infinite',
        }}
      >
        ● En vivo
      </div>
    </button>
  )
}

export default UrgenciasBanner
