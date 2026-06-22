import { useRef, useEffect, useMemo } from 'react'
import { useAvailabilityStore } from '../../store/availabilityStore'

interface Props {
  proId: string
  selected: string | null   // 'YYYY-MM-DD'
  onSelect: (date: string) => void
}

const DAY_LETTER = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

function getNext14Days(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function formatDay(dateStr: string): { letter: string; num: number } {
  const d = new Date(dateStr + 'T12:00:00')
  return { letter: DAY_LETTER[d.getDay()], num: d.getDate() }
}

export function DateStrip({ proId, selected, onSelect }: Props) {
  const isDateAvailable = useAvailabilityStore((s) => s.isDateAvailable)
  const days = useMemo(() => getNext14Days(), [])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll selected day into view
  useEffect(() => {
    if (!selected || !scrollRef.current) return
    const idx = days.indexOf(selected)
    if (idx < 0) return
    const child = scrollRef.current.children[idx] as HTMLElement
    child?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selected, days])

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
    >
      {days.map((date) => {
        const available = isDateAvailable(proId, date)
        const isSelected = selected === date
        const { letter, num } = formatDay(date)

        return (
          <button
            key={date}
            type="button"
            onClick={() => available ? onSelect(date) : undefined}
            disabled={!available}
            className="flex flex-col items-center gap-0.5 flex-shrink-0 transition-all duration-150 active:scale-95"
            style={{
              width: 44,
              padding: '8px 4px',
              borderRadius: 12,
              background: isSelected ? '#E8683A' : available ? '#FFFFFF' : '#F0EDEA',
              border: `1.5px solid ${isSelected ? '#E8683A' : available ? '#E8E0D4' : '#EDE8DE'}`,
              color: isSelected ? '#FFFFFF' : available ? '#111111' : '#C8C0B8',
              cursor: available ? 'pointer' : 'not-allowed',
              boxShadow: isSelected ? '0 2px 8px rgba(232,104,58,.3)' : 'none',
            }}
            aria-label={date}
            aria-pressed={isSelected}
          >
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>
              {letter}
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1 }}>
              {num}
            </span>
          </button>
        )
      })}
    </div>
  )
}
