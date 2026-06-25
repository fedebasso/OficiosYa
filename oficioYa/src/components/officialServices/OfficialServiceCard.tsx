import { motion } from 'framer-motion'
import type { OfficialService, ServiceSlot } from '../../types/officialServices'

interface Props {
  service: OfficialService
  nextSlots: ServiceSlot[]
  onClick: () => void
}

const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function formatSlotShort(slot: ServiceSlot): string {
  const d = new Date(slot.date + 'T12:00:00')
  return `${DAY_SHORT[d.getDay()]} ${slot.time}`
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export function OfficialServiceCard({ service, nextSlots, onClick }: Props) {
  const hasSlots = nextSlots.length > 0
  const isDestacado = service.plan === 'destacado'

  return (
    <motion.div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="w-full text-left cursor-pointer"
      whileTap={{ scale: 0.98, y: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{
        background: '#FFFFFF',
        border: `1.5px solid ${isDestacado ? '#F5D78E' : '#EDE8DE'}`,
        borderRadius: 16,
        boxShadow: isDestacado
          ? '0 2px 8px rgba(245,215,142,.35)'
          : '0 1px 3px rgba(0,0,0,.06)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Logo / Iniciales */}
      <div
        className="flex-shrink-0 flex items-center justify-center font-black rounded-xl overflow-hidden"
        style={{
          width: 44,
          height: 44,
          background: service.logo_url ? undefined : 'linear-gradient(135deg, #0F6E56, #0a5241)',
          fontSize: 14,
          color: '#FFFFFF',
        }}
      >
        {service.logo_url
          ? <img src={service.logo_url} alt={service.company_name} className="w-full h-full object-cover" />
          : getInitials(service.company_name)
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Nombre + badges */}
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-bold truncate" style={{ fontSize: 'var(--text-base)', color: '#111111' }}>
            {service.company_name}
          </span>
          {isDestacado && (
            <span style={{ fontSize: 12 }}>⭐</span>
          )}
          <span
            className="ml-auto flex-shrink-0 font-bold"
            style={{
              fontSize: 10,
              padding: '2px 7px',
              borderRadius: 6,
              background: hasSlots ? 'rgba(15,110,86,.12)' : '#F0F0F0',
              color: hasSlots ? '#0F6E56' : '#999999',
            }}
          >
            {hasSlots ? '● Disponible' : 'Sin turnos'}
          </span>
        </div>

        {/* Categorías */}
        <div className="truncate mb-0.5" style={{ fontSize: 'var(--text-xs)', color: '#777777' }}>
          {service.categories.map((c) => c.replace(/_/g, ' ')).join(' · ')}
        </div>

        {/* Zonas */}
        <div className="truncate mb-1" style={{ fontSize: 'var(--text-xs)', color: '#AAAAAA' }}>
          {service.zones.join(', ')}
        </div>

        {/* Próximos slots */}
        {hasSlots && (
          <div style={{ fontSize: 'var(--text-xs)', color: '#E8683A', fontWeight: 700 }}>
            Próx: {nextSlots.map(formatSlotShort).join(' · ')}
          </div>
        )}
      </div>
    </motion.div>
  )
}
