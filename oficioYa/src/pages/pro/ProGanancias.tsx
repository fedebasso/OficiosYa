import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { PageShell } from '../../components/layout/PageShell'
import { useAuthStore } from '../../store/authStore'
import { earningsService, type EarningsSummary } from '../../services/earningsService'
import { formatUYU } from '../../lib/money'
import { useCountUp } from '../../hooks/useCountUp'

type Tab = 'hoy' | 'semana' | 'total'

const TABS: { id: Tab; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Semana' },
  { id: 'total', label: 'Total' },
]

export default function ProGanancias() {
  const user = useAuthStore((s) => s.user)
  const proId = user?.id ?? ''
  const [tab, setTab] = useState<Tab>('semana')
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [prevWeek, setPrevWeek] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([
      earningsService.getSummary(proId),
      earningsService.getWeekSeries(proId, -1),
    ]).then(([s, prev]) => {
      if (!alive) return
      setSummary(s)
      setPrevWeek(prev.reduce((a, d) => a + d.amount, 0))
      setLoading(false)
    })
    return () => { alive = false }
  }, [proId])

  const amount = !summary ? 0
    : tab === 'hoy' ? summary.today
    : tab === 'semana' ? summary.thisWeek
    : summary.total
  const jobs = !summary ? 0
    : tab === 'hoy' ? summary.jobsToday
    : tab === 'semana' ? summary.jobsThisWeek
    : summary.jobsTotal
  const animated = useCountUp(amount)

  const header = (
    <div className="px-5 pt-12 pb-4" style={{ background: 'linear-gradient(160deg, #E8683A 0%, #c9542a 100%)' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70" style={{ color: '#fff' }}>
        Ganancias
      </p>
      <h1 className="text-2xl font-black" style={{ color: '#fff', letterSpacing: '-0.5px' }}>Tus ingresos</h1>
      <div className="flex gap-1.5 mt-4 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,.15)' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="relative flex-1 py-2 text-[13px] font-black rounded-xl"
            style={{ color: tab === t.id ? '#E8683A' : '#fff' }}
          >
            {tab === t.id && (
              <motion.span layoutId="ganancias-tab" className="absolute inset-0 rounded-xl"
                style={{ background: '#fff' }} transition={{ type: 'spring', stiffness: 500, damping: 36 }} />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <PageShell header={header} showBottomNav>
        <div className="p-5 flex flex-col gap-3">
          <div className="h-12 w-40 rounded-xl" style={{ background: '#ECE4D8' }} />
          <div className="h-4 w-28 rounded-md" style={{ background: '#ECE4D8' }} />
          <div className="h-40 rounded-2xl mt-3" style={{ background: '#F0EAE0' }} />
        </div>
      </PageShell>
    )
  }

  const subtitle = tab === 'hoy'
    ? `${jobs} trabajo${jobs !== 1 ? 's' : ''} hoy`
    : tab === 'semana'
    ? `${jobs} trabajo${jobs !== 1 ? 's' : ''} esta semana`
    : `${jobs} trabajo${jobs !== 1 ? 's' : ''} en total`

  // Comparativa solo en vista Semana
  const showCompare = tab === 'semana' && prevWeek !== null
  const delta = showCompare && prevWeek! > 0
    ? Math.round(((summary!.thisWeek - prevWeek!) / prevWeek!) * 100)
    : null

  return (
    <PageShell header={header} showBottomNav>
      <div className="flex flex-col gap-4 py-5">
        <div className="px-5">
          <div className="text-[40px] font-black leading-none"
               style={{ color: '#1A1712', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px' }}>
            {formatUYU(animated)}
          </div>
          <p className="text-sm font-semibold mt-1.5" style={{ color: '#7A6E5E' }}>{subtitle}</p>

          {showCompare && (
            <div className="flex items-center gap-1.5 mt-2 text-[13px] font-bold">
              {delta === null ? (
                <span style={{ color: '#9C917E' }}>Primera semana con actividad</span>
              ) : delta > 0 ? (
                <span className="flex items-center gap-1" style={{ color: '#16A34A' }}>
                  <TrendingUp size={15} /> {delta}% vs semana pasada
                </span>
              ) : delta < 0 ? (
                <span className="flex items-center gap-1" style={{ color: '#DC7B6B' }}>
                  <TrendingDown size={15} /> {Math.abs(delta)}% vs semana pasada
                </span>
              ) : (
                <span className="flex items-center gap-1" style={{ color: '#9C917E' }}>
                  <Minus size={15} /> igual que la semana pasada
                </span>
              )}
            </div>
          )}
        </div>

        {/* Gráfica (Task 10) y lista (Task 11) se insertan aquí */}
      </div>
    </PageShell>
  )
}
