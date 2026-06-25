import { useRef, useEffect, useMemo } from 'react'

interface Props {
  selected: string | null   // 'YYYY-MM-DD'
  onSelect: (date: string) => void
  isDateAvailable: (date: string) => boolean
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

export function DateStripGeneric({ selected, onSelect, isDateAvailable }: Props) {
  const days = useMemo(() => getNext14Days(), [])
  const scrollRef = useRef<HTMLDivElement>(null)

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
        const available = isDateAvailable(date)
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
              background: isSelected
                ? '#E8683A'
                : available
                  ? '#FFFFFF'
                  : '#F5F0E8',
              border: isSelected
                ? '1.5px solid #E8683A'
                : '1.5px solid #EDE8DE',
              boxShadow: isSelected ? '0 2px 8px rgba(232,104,58,.3)' : undefined,
              opacity: available ? 1 : 0.4,
              cursor: available ? 'pointer' : 'not-allowed',
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: isSelected ? '#FFFFFF' : '#888888',
                letterSpacing: 0.5,
              }}
            >
              {letter}
            </span>
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: isSelected ? '#FFFFFF' : available ? '#111111' : '#AAAAAA',
              }}
            >
              {num}
            </span>
          </button>
        )
      })}
    </div>
  )
}
