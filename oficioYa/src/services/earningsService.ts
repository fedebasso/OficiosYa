// Servicio de ganancias del profesional (modo demo).
// Fuente de verdad: dataset propio persistido en localStorage `ofix_earnings`.
// El único que escribe es recordJob (al completar un trabajo), idempotente por requestId.
// Con Supabase: getSummary/... agregan sobre la tabla `requests` (status='completed', final_amount).
import { IS_DEMO_MODE } from '../lib/env'
import { getSupabase } from '../lib/supabase'
import { startOfWeek, addDays, toYMD, weekDatesFor } from '../lib/week'

const LS_KEY = 'ofix_earnings'
const DEMO_PRO = 'mock-pro-1'

export interface EarningJob {
  requestId: string
  proId: string
  clientName: string
  category: string
  amount: number       // > 0 entero
  completedAt: string  // ISO
}

export interface EarningsSummary {
  today: number; thisWeek: number; total: number
  jobsToday: number; jobsThisWeek: number; jobsTotal: number
  avgPerJob: number
  bestDay: { date: string; amount: number } | null
}
export interface DailyEarning { date: string; amount: number; jobs: number }
export interface EarningJobView {
  requestId: string; clientName: string; category: string; amount: number; completedAt: string
}

// ── Persistencia ─────────────────────────────────────────────────────────────
function isValid(j: unknown): j is EarningJob {
  const x = j as EarningJob
  return !!x && typeof x.requestId === 'string' && typeof x.proId === 'string'
    && typeof x.completedAt === 'string' && typeof x.amount === 'number'
    && Number.isFinite(x.amount) && x.amount > 0
}

function read(): EarningJob[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isValid) : []
  } catch { return [] }
}

function write(jobs: EarningJob[]) {
  if (typeof localStorage === 'undefined') return
  try { localStorage.setItem(LS_KEY, JSON.stringify(jobs)) } catch { /* lleno/no disp. */ }
}

// ── Seed demo (solo mock-pro-1) ──────────────────────────────────────────────
const SEED_CLIENTS = ['María González', 'Roberto Silva', 'Ana Rodríguez', 'Diego Pérez',
  'Lucía Fernández', 'Martín Suárez', 'Valeria Castro', 'Gonzalo Núñez', 'Carla Méndez', 'Pablo Techera']
const SEED_CATS = ['electricista', 'sanitario', 'aire', 'cerrajero', 'pintor', 'albañil']

function seededJobs(): EarningJob[] {
  const jobs: EarningJob[] = []
  const monday0 = startOfWeek(new Date())         // lunes de esta semana
  const start = addDays(monday0, -4 * 7)          // 5 semanas atrás (incluye actual)
  let id = 900000
  let rng = 12345
  const rand = () => (rng = (rng * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
  for (let day = 0; day < 5 * 7; day++) {
    const date = addDays(start, day)
    if (date.getTime() > Date.now()) continue      // nunca en el futuro
    // ~30% de los días sin trabajos; el resto 1-2 trabajos (apunta a ~25-35 en 5 semanas)
    const r = rand()
    const n = r < 0.30 ? 0 : r < 0.75 ? 1 : 2
    for (let k = 0; k < n; k++) {
      // montos: mayoría 1500-6000, algunos hasta 15000, mínimo 800
      const roll = rand()
      const base = roll < 0.75 ? 1500 + rand() * 4500
        : roll < 0.95 ? 6000 + rand() * 6000
        : 800 + rand() * 700
      const hour = 8 + Math.floor(rand() * 11)
      const at = new Date(date); at.setHours(hour, Math.floor(rand() * 60), 0, 0)
      jobs.push({
        requestId: `seed-${id++}`,
        proId: DEMO_PRO,
        clientName: SEED_CLIENTS[Math.floor(rand() * SEED_CLIENTS.length)],
        category: SEED_CATS[Math.floor(rand() * SEED_CATS.length)],
        amount: Math.round(base),
        completedAt: at.toISOString(),
      })
    }
  }
  return jobs
}

/** Carga (y siembra si corresponde) el dataset para un pro. */
function ensureLoaded(proId: string): EarningJob[] {
  const existing = read()
  if (existing.length > 0) return existing
  if (proId === DEMO_PRO) {
    const seed = seededJobs()
    write(seed)
    return seed
  }
  return []
}

// ── Agregación ───────────────────────────────────────────────────────────────
function jobsFor(proId: string): EarningJob[] {
  return ensureLoaded(proId).filter((j) => j.proId === proId)
}
const sum = (arr: EarningJob[]) => arr.reduce((a, j) => a + j.amount, 0)

// ── API ──────────────────────────────────────────────────────────────────────
export const earningsService = {
  async getSummary(proId: string): Promise<EarningsSummary> {
    if (!IS_DEMO_MODE) {
      const supabase = await getSupabase()
      await supabase.from('requests').select('final_amount, completed_at')
        .eq('professional_id', proId).eq('status', 'completed')
      // (agregación real pendiente para Supabase)
    }
    const all = jobsFor(proId)
    const todayYMD = toYMD(new Date())
    const weekSet = new Set(weekDatesFor(0))
    const today = all.filter((j) => toYMD(new Date(j.completedAt)) === todayYMD)
    const week = all.filter((j) => weekSet.has(toYMD(new Date(j.completedAt))))
    const byDay = new Map<string, number>()
    for (const j of all) {
      const d = toYMD(new Date(j.completedAt))
      byDay.set(d, (byDay.get(d) ?? 0) + j.amount)
    }
    let bestDay: EarningsSummary['bestDay'] = null
    for (const [date, amount] of byDay) {
      if (!bestDay || amount > bestDay.amount) bestDay = { date, amount }
    }
    return {
      today: sum(today), thisWeek: sum(week), total: sum(all),
      jobsToday: today.length, jobsThisWeek: week.length, jobsTotal: all.length,
      avgPerJob: all.length ? Math.round(sum(all) / all.length) : 0,
      bestDay,
    }
  },

  async getDailySeries(proId: string, days: number): Promise<DailyEarning[]> {
    const all = jobsFor(proId)
    const today = new Date()
    const out: DailyEarning[] = []
    for (let i = days - 1; i >= 0; i--) {
      const ymd = toYMD(addDays(today, -i))
      const dayJobs = all.filter((j) => toYMD(new Date(j.completedAt)) === ymd)
      out.push({ date: ymd, amount: sum(dayJobs), jobs: dayJobs.length })
    }
    return out
  },

  async getWeekSeries(proId: string, weekOffset: number): Promise<DailyEarning[]> {
    const all = jobsFor(proId)
    return weekDatesFor(weekOffset).map((ymd) => {
      const dayJobs = all.filter((j) => toYMD(new Date(j.completedAt)) === ymd)
      return { date: ymd, amount: sum(dayJobs), jobs: dayJobs.length }
    })
  },

  async getJobs(proId: string, from?: string, to?: string): Promise<EarningJobView[]> {
    let all = jobsFor(proId)
    if (from) all = all.filter((j) => toYMD(new Date(j.completedAt)) >= from)
    if (to) all = all.filter((j) => toYMD(new Date(j.completedAt)) <= to)
    return all
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .map(({ requestId, clientName, category, amount, completedAt }) =>
        ({ requestId, clientName, category, amount, completedAt }))
  },

  async recordJob(job: EarningJob): Promise<void> {
    if (!isValid(job)) return
    if (!IS_DEMO_MODE) {
      const supabase = await getSupabase()
      await supabase.from('requests')
        .update({ final_amount: job.amount, completed_at: job.completedAt, status: 'completed' })
        .eq('id', job.requestId)
    }
    // ensureLoaded siembra la historia demo si aún no existía (evita perder el seed
    // cuando el pro completa un trabajo antes de abrir la pantalla de Ganancias).
    const all = ensureLoaded(job.proId).filter((j) => j.requestId !== job.requestId)  // upsert
    all.push(job)
    write(all)
  },

  clearDemo(): void {
    if (typeof localStorage === 'undefined') return
    try { localStorage.removeItem(LS_KEY) } catch { /* noop */ }
  },
}
