import { TimeSlotPill } from './TimeSlotPill'
import type { TimeSlot } from '../../store/availabilityStore'

interface Props {
  slots: TimeSlot[]
  selected: string | null
  onSelect: (time: string) => void
}

export function TimeSlotGrid({ slots, selected, onSelect }: Props) {
  if (slots.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-2 py-8 text-center"
        style={{ background: '#F5F0E8', borderRadius: 16 }}
      >
        <span style={{ fontSize: 32 }}>😴</span>
        <p className="text-sm font-bold" style={{ color: '#555555' }}>
          No hay horarios disponibles
        </p>
        <p className="text-xs" style={{ color: '#AAAAAA' }}>
          Elegí otro día o coordiná por chat
        </p>
      </div>
    )
  }

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
    >
      {slots.map((slot) => (
        <TimeSlotPill
          key={slot.time}
          time={slot.time}
          status={slot.status}
          selected={selected === slot.time}
          onClick={() => onSelect(slot.time)}
        />
      ))}
    </div>
  )
}
