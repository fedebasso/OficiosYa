import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUrgentProfessionals } from '../../hooks/useProfessionals'

export function UrgenciasFAB() {
  const navigate = useNavigate()
  const { professionals } = useUrgentProfessionals()
  const count = professionals.length
  const [expanded, setExpanded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTap = () => {
    if (expanded) {
      navigate('/urgencias')
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    setExpanded(true)
    timerRef.current = setTimeout(() => setExpanded(false), 4000)
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label={expanded ? 'Ir a emergencias' : 'Emergencias 24hs'}
      aria-expanded={expanded}
      className="fixed z-40 flex items-center overflow-hidden active:opacity-80 transition-opacity"
      style={{
        bottom: 'calc(72px + var(--safe-bottom))',
        right: 16,
        height: 48,
        width: expanded ? 210 : 48,
        borderRadius: expanded ? 24 : '50%',
        background: '#EF4444',
        boxShadow: '0 4px 16px rgba(239,68,68,.45)',
        transition: 'width 280ms var(--ease-spring), border-radius 280ms var(--ease-spring)',
        flexDirection: 'row-reverse',
        paddingRight: expanded ? 4 : 0,
        paddingLeft: expanded ? 12 : 0,
        animation: expanded ? 'none' : 'urgency-pulse 2s ease-in-out infinite',
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0, width: 40, textAlign: 'center' }}>🚨</span>
      {expanded && (
        <div className="flex-1 text-left min-w-0">
          <div className="font-bold text-white truncate" style={{ fontSize: 'var(--text-sm)' }}>
            Emergencias 24hs
          </div>
          <div className="text-white truncate" style={{ fontSize: 'var(--text-xs)', opacity: 0.85 }}>
            {count > 0 ? `${count} disponibles ahora` : 'Disponibles ahora'}
          </div>
        </div>
      )}
    </button>
  )
}

export default UrgenciasFAB
