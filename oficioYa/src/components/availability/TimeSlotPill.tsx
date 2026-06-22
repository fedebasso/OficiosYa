import type { SlotStatus } from '../../store/availabilityStore'

interface Props {
  time: string
  status: SlotStatus
  selected: boolean
  onClick: () => void
}

const BASE: React.CSSProperties = {
  borderRadius: 10,
  padding: '8px 4px',
  fontSize: 12,
  fontWeight: 700,
  textAlign: 'center',
  transition: 'transform 150ms, box-shadow 150ms, opacity 150ms',
  border: 'none',
  cursor: 'pointer',
  userSelect: 'none',
}

const STYLES: Record<SlotStatus | 'selected', React.CSSProperties> = {
  available: {
    background: 'linear-gradient(135deg, #16A34A, #15803D)',
    color: '#FFFFFF',
    boxShadow: '0 2px 6px rgba(22,163,74,.25)',
  },
  blocked: {
    background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
    color: '#FFFFFF',
    opacity: 0.65,
    cursor: 'not-allowed',
  },
  booked: {
    background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
    color: '#FFFFFF',
    opacity: 0.65,
    cursor: 'not-allowed',
  },
  selected: {
    background: 'linear-gradient(135deg, #E8683A, #c44d1f)',
    color: '#FFFFFF',
    boxShadow: '0 4px 14px rgba(232,104,58,.4)',
    transform: 'scale(1.06)',
    outline: '2px solid rgba(255,255,255,0.4)',
    outlineOffset: 1,
  },
}

export function TimeSlotPill({ time, status, selected, onClick }: Props) {
  const style: React.CSSProperties = {
    ...BASE,
    ...(selected ? STYLES.selected : STYLES[status]),
  }

  return (
    <button
      type="button"
      onClick={status === 'available' ? onClick : undefined}
      disabled={status !== 'available'}
      style={style}
      aria-pressed={selected}
      aria-label={`${time} — ${status}`}
    >
      {time}
    </button>
  )
}
