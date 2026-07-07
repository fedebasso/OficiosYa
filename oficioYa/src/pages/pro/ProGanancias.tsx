import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageShell } from '../../components/layout/PageShell'
import { useAuthStore } from '../../store/authStore'
import { earningsService, type EarningsSummary, type DailyEarning, type EarningJobView } from '../../services/earningsService'
import { formatUYU } from '../../lib/money'
import { useCountUp } from '../../hooks/useCountUp'
import { EarningsBars } from '../../components/pro/EarningsBars'
import { EarningsJobList } from '../../components/pro/EarningsJobList'

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
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekSeries, setWeekSeries] = useState<DailyEarning[]>([])
  const [totalSeries, setTotalSeries] = useState<DailyEarning[]>([])
  const [jobsList, setJobsList] = useState<EarningJobView[]>([])
  const [todayJobs, setTodayJobs] = useState<EarningJobView[]>([])

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

  useEffect(() => {
    if (tab !== 'semana') return
    earningsService.getWeekSeries(proId, weekOffset).then(setWeekSeries)
  }, [tab, weekOffset, proId])

  useEffect(() => {
    if (tab !== 'total') return
    earningsService.getDailySeries(proId, 56).then((days) => {
      const weeks: DailyEarning[] = []
      for (let w = 0; w < 8; w++) {
        const chunk = days.slice(w * 7, w * 7 + 7)
        weeks.push({
          date: chunk[0]?.date ?? '',
          amount: chunk.reduce((a, d) => a + d.amount, 0),
          jobs: chunk.reduce((a, d) => a + d.jobs, 0),
        })
      }
      setTotalSeries(weeks)
    })
  }, [tab, proId])

  useEffect(() => {
    if (tab === 'hoy') return
    earningsService.getJobs(proId).then(setJobsList)
  }, [tab, proId, summary])

  useEffect(() => {
    if (tab !== 'hoy') return
    const ymd = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local
    earningsService.getJobs(proId, ymd, ymd).then(setTodayJobs)
  }, [tab, proId, summary])

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

        {tab === 'semana' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-5">
              <button type="button" onClick={() => setWeekOffset((o) => o - 1)}
                      aria-label="Semana anterior" className="p-1.5 rounded-lg active:opacity-60">
                <ChevronLeft size={20} style={{ color: '#7A6E5E' }} />
              </button>
              <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color: '#9C917E' }}>
                {weekOffset === 0 ? 'Esta semana' : weekOffset === -1 ? 'Semana pasada' : `Hace ${-weekOffset} semanas`}
              </span>
              <button type="button" onClick={() => setWeekOffset((o) => Math.min(0, o + 1))}
                      disabled={weekOffset === 0} aria-label="Semana siguiente"
                      className="p-1.5 rounded-lg active:opacity-60" style={{ opacity: weekOffset === 0 ? 0.3 : 1 }}>
                <ChevronRight size={20} style={{ color: '#7A6E5E' }} />
              </button>
            </div>
            <EarningsBars
              data={weekSeries}
              labels={['L', 'M', 'M', 'J', 'V', 'S', 'D']}
              highlightIndex={weekOffset === 0 ? (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) : undefined}
            />
          </div>
        )}

        {tab === 'total' && (
          <EarningsBars
            data={totalSeries}
            labels={totalSeries.map((_, i) => `S${i + 1}`)}
            highlightIndex={7}
          />
        )}

        {tab === 'hoy' && (
          todayJobs.length > 0
            ? <EarningsJobList jobs={todayJobs} />
            : (
              <div className="mx-5 rounded-2xl px-5 py-8 text-center"
                   style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8' }}>
                <p className="text-sm font-bold" style={{ color: '#1A1712' }}>Todavía no completaste trabajos hoy</p>
                <p className="text-xs mt-1" style={{ color: '#9C917E' }}>Cuando finalices uno, aparece acá al instante</p>
              </div>
            )
        )}

        {tab === 'total' && summary && summary.jobsTotal > 0 && (
          <div className="px-5 grid grid-cols-3 gap-2">
            {[
              { label: 'Trabajos', value: String(summary.jobsTotal) },
              { label: 'Promedio', value: formatUYU(summary.avgPerJob) },
              { label: 'Mejor día', value: summary.bestDay ? formatUYU(summary.bestDay.amount) : '—' },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl p-3 text-center"
                   style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8' }}>
                <div className="text-[15px] font-black" style={{ color: '#1A1712', fontVariantNumeric: 'tabular-nums' }}>
                  {c.value}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: '#B3A794' }}>
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab !== 'hoy' && <EarningsJobList jobs={jobsList} />}

        {summary && summary.jobsTotal === 0 && tab !== 'hoy' && (
          <div className="mx-5 rounded-2xl px-5 py-10 text-center"
               style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8' }}>
            <p className="text-sm font-bold" style={{ color: '#1A1712' }}>Todavía no tenés ganancias</p>
            <p className="text-xs mt-1" style={{ color: '#9C917E' }}>
              Completá tu primer trabajo y empezá a ver tus ingresos acá
            </p>
          </div>
        )}
      </div>
    </PageShell>
  )
}
