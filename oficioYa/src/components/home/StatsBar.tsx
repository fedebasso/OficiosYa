import { useEffect, useRef, useState } from 'react'

interface StatItem {
  value: number
  suffix: string
  label: string
  icon: string
}

const STATS: StatItem[] = [
  { value: 1200, suffix: '+', label: 'Trabajos', icon: '🔧' },
  { value: 98,   suffix: '%', label: 'Satisfacción', icon: '⭐' },
  { value: 30,   suffix: 'min', label: 'Respuesta', icon: '⚡' },
]

function useCountUp(target: number, duration = 1200, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, start])
  return count
}

function StatCount({ item, active }: { item: StatItem; active: boolean }) {
  const count = useCountUp(item.value, 1400, active)
  return (
    <div className="flex-1 text-center px-2">
      <div className="mb-1" style={{ color: '#AAAAAA', fontSize: 'var(--text-sm)' }}>{item.icon}</div>
      <div className="font-black leading-none" style={{ color: '#111111', fontSize: 'var(--text-xl)' }}>
        {count.toLocaleString()}<span style={{ color: '#E8683A' }}>{item.suffix}</span>
      </div>
      <div className="font-semibold uppercase tracking-wide mt-1" style={{ color: '#999999', fontSize: 'var(--text-xs)' }}>
        {item.label}
      </div>
    </div>
  )
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); obs.disconnect() } },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className="rounded-2xl flex items-stretch overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #E8E0D4',
        boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
      }}
    >
      {STATS.map((stat, i) => (
        <div key={stat.label} className="flex-1 flex items-center" style={i > 0 ? { borderLeft: '1px solid #E8E0D4' } : {}}>
          <StatCount item={stat} active={active} />
        </div>
      ))}
    </div>
  )
}

export default StatsBar
