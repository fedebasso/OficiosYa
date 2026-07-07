# Dashboard de Ganancias del Profesional — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el profesional vea sus ganancias por trabajo/día/semana/total con gráficas estilo Uber, en modo demo, actualizándose al completar un trabajo.

**Architecture:** Dataset propio persistido en localStorage (`ofix_earnings`) como fuente de ganancias, con upsert por `requestId`. Un `earningsService` async concentra toda la agregación. El acceso es una 5ª pestaña del bottom nav del pro hacia una página nueva `/pro/ganancias`. Completar un trabajo (2 puntos existentes) abre un modal de monto y escribe la ganancia.

**Tech Stack:** React + Vite + TypeScript, zustand, framer-motion, lucide-react. Sin librerías nuevas.

## Global Constraints

- **Sin dependencias nuevas.** Gráficas propias con divs + framer-motion. `recharts` solo último recurso.
- **No conectar Supabase.** Dejar ramas escritas gated por `IS_DEMO_MODE`, sin probar.
- **Paleta fija:** primario `#E8683A`, crema fondo `#F5F0E8`. No inventar colores ni gradientes nuevos.
- **No tocar el chat** salvo enviar un mensaje `type: 'system'` al completar.
- **No agregar cards al Dashboard.** El acceso es la 5ª tab del bottom nav.
- **Moneda:** `Intl.NumberFormat('es-UY', { style:'currency', currency:'UYU', maximumFractionDigits: 0 })`. Enteros, sin decimales.
- **Semana = lunes a domingo**, timezone del dispositivo. `getDay()` domingo = 0.
- **Verificación** (no hay test runner): cada tarea cierra con `npm run build` y `npm run lint` en verde; las tareas con UI se verifican además con playwright-cli contra `npm run dev`.
- **Commit al terminar cada tarea** (build en verde) — evitar perder trabajo.
- **Layout `100dvh`**, nunca `100vh`.

### Desvío documentado
`/solicitud/:id` está protegido con `requiredRole="client"`; un pro es redirigido. Por eso las filas de "Últimos trabajos" en ganancias **NO navegan** (son informativas). Se deja anotado; si más adelante hay un detalle de trabajo del lado pro, se enlaza ahí.

### IDs y datos de referencia
- Pro demo: `mock-pro-1` (Carlos Méndez). Pro nuevo: `mock-${timestamp}` → sin seed.
- `ServiceRequest` tiene `client_id`, `professional_id`, `category`, `id`.

---

## Task 1: Utilidades base (moneda, semana, count-up)

**Files:**
- Create: `src/lib/money.ts`
- Create: `src/lib/week.ts`
- Create: `src/hooks/useCountUp.ts`

**Interfaces:**
- Produces:
  - `formatUYU(n: number): string`
  - `startOfWeek(d: Date): Date` (lunes 00:00 local)
  - `addDays(d: Date, n: number): Date`
  - `toYMD(d: Date): string` (`YYYY-MM-DD` local)
  - `weekDatesFor(weekOffset: number): string[]` (7 `YYYY-MM-DD`, L→D)
  - `useCountUp(target: number, ms?: number): number`

- [ ] **Step 1: Crear `src/lib/money.ts`**

```ts
const UYU = new Intl.NumberFormat('es-UY', {
  style: 'currency',
  currency: 'UYU',
  maximumFractionDigits: 0,
})

/** Formatea pesos uruguayos sin decimales. Entradas inválidas → $ 0. */
export function formatUYU(n: number): string {
  const safe = Number.isFinite(n) ? Math.round(n) : 0
  return UYU.format(safe)
}
```

- [ ] **Step 2: Crear `src/lib/week.ts`**

```ts
/** Lunes 00:00 (hora local) de la semana que contiene a `d`. */
export function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = x.getDay()            // domingo = 0
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  return x
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

/** Fecha local en formato YYYY-MM-DD (no usa toISOString para evitar el corrimiento por UTC). */
export function toYMD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 7 fechas L→D para la semana con el offset dado (0 = actual, -1 = anterior). */
export function weekDatesFor(weekOffset: number): string[] {
  const monday = addDays(startOfWeek(new Date()), weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => toYMD(addDays(monday, i)))
}
```

- [ ] **Step 3: Crear `src/hooks/useCountUp.ts`**

```ts
import { useEffect, useRef, useState } from 'react'

/** Anima un número desde su valor previo hasta `target` en `ms` (ease-out). */
export function useCountUp(target: number, ms = 600): number {
  const [value, setValue] = useState(target)
  const fromRef = useRef(target)
  const rafRef = useRef<number>()

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else fromRef.current = target
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, ms])

  return value
}
```

- [ ] **Step 4: Verificar lógica de semana con node**

Run:
```bash
cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && node -e "
function startOfWeek(d){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());const day=x.getDay();const diff=day===0?-6:1-day;x.setDate(x.getDate()+diff);return x}
// domingo 2026-07-05 debe caer en la semana que empieza lunes 2026-06-29
console.log(startOfWeek(new Date(2026,6,5)).toDateString());
// lunes 2026-07-06 debe empezar en sí mismo
console.log(startOfWeek(new Date(2026,6,6)).toDateString());
"
```
Expected: `Mon Jun 29 2026` y `Mon Jul 06 2026`.

- [ ] **Step 5: build + lint**

Run: `cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npm run build && npm run lint`
Expected: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/lib/money.ts src/lib/week.ts src/hooks/useCountUp.ts
git commit -m "feat(ganancias): utilidades base (formatUYU, semana L-D, useCountUp)"
```

---

## Task 2: earningsService (dataset persistido + seed + agregación)

**Files:**
- Create: `src/services/earningsService.ts`
- Test manual: playwright eval contra dev (Step 6)

**Interfaces:**
- Consumes: `IS_DEMO_MODE` de `src/lib/env`; `getSupabase` de `src/lib/supabase`; `startOfWeek/addDays/toYMD/weekDatesFor` de `src/lib/week`.
- Produces:
  - `interface EarningJob { requestId; proId; clientName; category; amount; completedAt }`
  - `interface EarningsSummary { today; thisWeek; total; jobsToday; jobsThisWeek; jobsTotal; avgPerJob; bestDay }`
  - `interface DailyEarning { date; amount; jobs }`
  - `interface EarningJobView { requestId; clientName; category; amount; completedAt }`
  - `earningsService.getSummary/getDailySeries/getWeekSeries/getJobs/recordJob/clearDemo`

- [ ] **Step 1: Crear `src/services/earningsService.ts`**

```ts
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
    // ~45% de los días sin trabajos; el resto 1-2 trabajos
    const r = rand()
    const n = r < 0.45 ? 0 : r < 0.85 ? 1 : 2
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
    const all = read().filter((j) => j.requestId !== job.requestId)  // upsert
    all.push(job)
    write(all)
  },

  clearDemo(): void {
    if (typeof localStorage === 'undefined') return
    try { localStorage.removeItem(LS_KEY) } catch { /* noop */ }
  },
}
```

- [ ] **Step 2: build + lint**

Run: `cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npm run build && npm run lint`
Expected: sin errores.

- [ ] **Step 3: Verificar agregación en el navegador (dev + playwright)**

Levantar dev si no está corriendo: `npm run dev` (background). Luego:
```bash
cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npx --no-install playwright-cli open http://localhost:5173/ && npx --no-install playwright-cli --raw run-code "async page => {
  const mod = await page.evaluate(async () => {
    localStorage.removeItem('ofix_earnings')
    const m = await import('/src/services/earningsService.ts')
    const s = await m.earningsService.getSummary('mock-pro-1')
    const wk = await m.earningsService.getWeekSeries('mock-pro-1', 0)
    const empty = await m.earningsService.getSummary('mock-nuevo-999')
    return { total: s.total, jobsTotal: s.jobsTotal, weekLen: wk.length, bestDay: !!s.bestDay, emptyTotal: empty.total, emptyJobs: empty.jobsTotal }
  })
  return JSON.stringify(mod)
}"
```
Expected: `jobsTotal` entre 25 y 35, `total` > 0, `weekLen` = 7, `bestDay` = true, `emptyTotal` = 0, `emptyJobs` = 0.

- [ ] **Step 4: Commit**

```bash
git add src/services/earningsService.ts
git commit -m "feat(ganancias): earningsService con dataset persistido, seed demo y agregación"
```

---

## Task 3: Extender el tipo ServiceRequest

**Files:**
- Modify: `src/store/requestStore.ts` (interface `ServiceRequest`, ~línea 12-28)

**Interfaces:**
- Produces: `ServiceRequest.final_amount?: number | null`, `ServiceRequest.completed_at?: string | null`

- [ ] **Step 1: Agregar los campos opcionales**

En `src/store/requestStore.ts`, dentro de `interface ServiceRequest`, después de `scheduled_date?: string`:

```ts
  scheduled_date?: string
  final_amount?: number | null
  completed_at?: string | null
```

- [ ] **Step 2: build + lint**

Run: `cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npm run build && npm run lint`
Expected: sin errores (campos opcionales, nada existente se rompe).

- [ ] **Step 3: Commit**

```bash
git add src/store/requestStore.ts
git commit -m "feat(ganancias): final_amount y completed_at en ServiceRequest"
```

---

## Task 4: Toast global del pro

**Files:**
- Create: `src/store/toastStore.ts`
- Create: `src/components/ui/ToastHost.tsx`
- Modify: `src/layouts/ProLayout.tsx` (montar `<ToastHost/>`)

**Interfaces:**
- Produces:
  - `useToastStore` con `show(msg: string, action?: { label: string; to: string }): void`
  - `<ToastHost />` (se monta una vez en ProLayout)

- [ ] **Step 1: Crear `src/store/toastStore.ts`**

```ts
import { create } from 'zustand'

export interface ToastAction { label: string; to: string }
interface ToastState {
  message: string | null
  action: ToastAction | null
  show: (message: string, action?: ToastAction) => void
  hide: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  action: null,
  show: (message, action) => set({ message, action: action ?? null }),
  hide: () => set({ message: null, action: null }),
}))
```

- [ ] **Step 2: Crear `src/components/ui/ToastHost.tsx`**

```tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useToastStore } from '../../store/toastStore'

export function ToastHost() {
  const message = useToastStore((s) => s.message)
  const action = useToastStore((s) => s.action)
  const hide = useToastStore((s) => s.hide)
  const navigate = useNavigate()

  useEffect(() => {
    if (!message) return
    const t = setTimeout(hide, 4000)
    return () => clearTimeout(t)
  }, [message, hide])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 34 }}
          className="fixed left-1/2 z-[60] flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            bottom: 'calc(72px + var(--safe-bottom, 0px))',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)', maxWidth: 448,
            background: '#1A1712', color: '#fff',
            boxShadow: '0 8px 28px -8px rgba(0,0,0,.4)',
          }}
        >
          <span className="text-sm font-semibold flex-1">{message}</span>
          {action && (
            <button
              type="button"
              onClick={() => { const to = action.to; hide(); navigate(to) }}
              className="text-sm font-black flex-shrink-0"
              style={{ color: '#E8683A' }}
            >
              {action.label}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Montar en `src/layouts/ProLayout.tsx`**

Importar y renderizar junto al bottom nav:

```tsx
import { ProBottomNav } from '../components/layout/ProBottomNav'
import { ToastHost } from '../components/ui/ToastHost'
// ...
  return (
    <>
      {children}
      <ProBottomNav />
      <ToastHost />
    </>
  )
```

- [ ] **Step 4: build + lint**

Run: `cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npm run build && npm run lint`
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/store/toastStore.ts src/components/ui/ToastHost.tsx src/layouts/ProLayout.tsx
git commit -m "feat(ganancias): toast global del pro (store + host en ProLayout)"
```

---

## Task 5: Modal de monto + handler de completado

**Files:**
- Create: `src/components/pro/CompleteJobSheet.tsx`
- Create: `src/hooks/useCompleteJob.ts`

**Interfaces:**
- Consumes: `earningsService.recordJob` (Task 2); `useToastStore.show` (Task 4); `chatService` (`getOrCreateConversation`, `sendMessage`); `formatUYU` (Task 1); `ServiceRequest` (Task 3).
- Produces:
  - `useCompleteJob(): { completing: ServiceRequest | null; open(req): void; close(): void; confirm(amount: number): Promise<void> }`
  - `<CompleteJobSheet req onConfirm onClose />`

Nota: `useCompleteJob` recibe un callback `onCompleted(reqId, amount)` para que cada pantalla haga su `updateStatus` con su propio store.

- [ ] **Step 1: Crear `src/hooks/useCompleteJob.ts`**

```ts
import { useState, useCallback } from 'react'
import type { ServiceRequest } from '../store/requestStore'
import { earningsService } from '../services/earningsService'
import { chatService } from '../services/chatService'
import { useToastStore } from '../store/toastStore'
import { formatUYU } from '../lib/money'

/**
 * Orquesta el completado de un trabajo con monto.
 * @param onCompleted  la pantalla marca el request como 'completed' en SU store.
 */
export function useCompleteJob(onCompleted: (reqId: string, amount: number) => void) {
  const [completing, setCompleting] = useState<ServiceRequest | null>(null)
  const showToast = useToastStore((s) => s.show)

  const open = useCallback((req: ServiceRequest) => setCompleting(req), [])
  const close = useCallback(() => setCompleting(null), [])

  const confirm = useCallback(async (amount: number) => {
    const req = completing
    if (!req) return
    const completedAt = new Date().toISOString()
    onCompleted(req.id, amount)  // optimista

    await earningsService.recordJob({
      requestId: req.id,
      proId: req.professional_id,
      clientName: 'Cliente',
      category: req.category || 'Servicio',
      amount,
      completedAt,
    })

    // Mensaje de sistema en el chat de la solicitud (no bloquea si falla)
    try {
      if (req.client_id) {
        const conv = await chatService.getOrCreateConversation({
          clientId: req.client_id,
          professionalId: req.professional_id,
          serviceRequestId: req.id,
        })
        await chatService.sendMessage(conv.id, {
          sender_id: req.professional_id,
          type: 'system',
          content: `Trabajo finalizado — ${formatUYU(amount)}`,
        })
      }
    } catch { /* demo: el chat es best-effort */ }

    setCompleting(null)
    showToast(`Sumaste ${formatUYU(amount)}`, { label: 'Ver ganancias', to: '/pro/ganancias' })
  }, [completing, onCompleted, showToast])

  return { completing, open, close, confirm }
}
```

- [ ] **Step 2: Crear `src/components/pro/CompleteJobSheet.tsx`**

```tsx
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ServiceRequest } from '../../store/requestStore'

const MAX_AMOUNT = 500000

interface Props {
  req: ServiceRequest | null
  onConfirm: (amount: number) => void
  onClose: () => void
}

export function CompleteJobSheet({ req, onConfirm, onClose }: Props) {
  const [raw, setRaw] = useState('')
  const amount = Number(raw.replace(/[^\d]/g, ''))
  const valid = amount > 0 && amount <= MAX_AMOUNT

  function handleConfirm() {
    if (!valid) return
    onConfirm(amount)
    setRaw('')
  }

  return (
    <AnimatePresence>
      {req && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70]" style={{ background: 'rgba(20,15,10,.45)' }}
            onClick={() => { setRaw(''); onClose() }}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className="fixed left-1/2 bottom-0 z-[71] w-full"
            style={{
              transform: 'translateX(-50%)', maxWidth: 480,
              background: '#FFFFFF', borderRadius: '22px 22px 0 0',
              paddingBottom: 'calc(20px + var(--safe-bottom, 0px))',
            }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-1">
              <p className="text-[15px] font-black" style={{ color: '#1A1712' }}>
                ¿Cuánto cobraste por este trabajo?
              </p>
              <button type="button" onClick={() => { setRaw(''); onClose() }} aria-label="Cerrar">
                <X size={20} style={{ color: '#9C917E' }} />
              </button>
            </div>
            <div className="px-5 pt-3">
              <div className="flex items-center gap-2 rounded-2xl px-4 py-3"
                   style={{ background: '#F5F0E8', border: '1.5px solid #ECE4D8' }}>
                <span className="text-2xl font-black" style={{ color: '#9C917E' }}>$</span>
                <input
                  autoFocus
                  inputMode="decimal"
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-transparent outline-none text-3xl font-black"
                  style={{ color: '#1A1712', fontVariantNumeric: 'tabular-nums' }}
                />
              </div>
              {amount > MAX_AMOUNT && (
                <p className="text-xs font-semibold mt-2" style={{ color: '#DC2626' }}>
                  El monto máximo es $ 500.000
                </p>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!valid}
                className="w-full mt-4 rounded-2xl py-3.5 text-[15px] font-black"
                style={{
                  background: valid ? '#E8683A' : '#E7DFD3',
                  color: valid ? '#fff' : '#B3A794',
                  transition: 'background .15s ease',
                }}
              >
                Finalizar trabajo
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: build + lint**

Run: `cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npm run build && npm run lint`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCompleteJob.ts src/components/pro/CompleteJobSheet.tsx
git commit -m "feat(ganancias): modal de monto (CompleteJobSheet) + hook useCompleteJob"
```

---

## Task 6: Enganchar completado en ProRequests

**Files:**
- Modify: `src/pages/pro/ProRequests.tsx` (línea ~236 el componente lista; ~436-441 el handler `onProgress`)

**Interfaces:**
- Consumes: `useCompleteJob` (Task 5), `CompleteJobSheet` (Task 5), store del pro (`updateStatus`) ya presente vía `useIncomingRequests`.

- [ ] **Step 1: Importar y montar el modal en el componente de página de ProRequests**

Añadir imports arriba:

```tsx
import { useCompleteJob } from '../../hooks/useCompleteJob'
import { CompleteJobSheet } from '../../components/pro/CompleteJobSheet'
```

Dentro del componente de página (donde está `const { requests, loading, error, updateStatus } = useIncomingRequests(...)`), agregar:

```tsx
  const complete = useCompleteJob((reqId) => updateStatus(reqId, 'completed'))
```

- [ ] **Step 2: Interceptar el paso a 'completed'**

Reemplazar el handler que hoy hace (líneas ~436-441):

```tsx
                  onProgress={(s) => {
                    if (s === 'in_progress') {
                      handleInProgress(req.id)
                    } else {
                      updateStatus(req.id, s)
                    }
                  }}
```

por:

```tsx
                  onProgress={(s) => {
                    if (s === 'in_progress') {
                      handleInProgress(req.id)
                    } else {
                      complete.open(req)   // abre modal de monto en vez de completar directo
                    }
                  }}
```

- [ ] **Step 3: Renderizar el sheet antes del cierre del JSX de la página**

Justo antes del último tag de cierre del componente de página, agregar:

```tsx
      <CompleteJobSheet req={complete.completing} onConfirm={complete.confirm} onClose={complete.close} />
```

- [ ] **Step 4: build + lint**

Run: `cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npm run build && npm run lint`
Expected: sin errores.

- [ ] **Step 5: Verificar con playwright (login pro → completar con monto)**

```bash
cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npx --no-install playwright-cli open http://localhost:5173/login
# login pro@demo.com (botón demo Profesional), ir a /pro/solicitudes,
# poner una solicitud 'confirmed' → 'en camino' → 'completar' → aparece el sheet, ingresar 3500 → Finalizar.
```
Expected: aparece el bottom sheet, al finalizar aparece el toast "Sumaste $ 3.500 · Ver ganancias" y `localStorage['ofix_earnings']` incluye la entrada nueva (verificar con `npx playwright-cli --raw eval "localStorage.getItem('ofix_earnings')"`).

- [ ] **Step 6: Commit**

```bash
git add src/pages/pro/ProRequests.tsx
git commit -m "feat(ganancias): ProRequests abre modal de monto al completar"
```

---

## Task 7: Enganchar completado en ProDashboard (ActiveJobCard)

**Files:**
- Modify: `src/pages/pro/ProDashboard.tsx` (~línea 168-174, uso de `ActiveJobCard`)

**Interfaces:**
- Consumes: `useCompleteJob`, `CompleteJobSheet`, `updateStatus` del `useProRequestsStore` ya presente.

- [ ] **Step 1: Imports**

```tsx
import { useCompleteJob } from '../../hooks/useCompleteJob'
import { CompleteJobSheet } from '../../components/pro/CompleteJobSheet'
```

- [ ] **Step 2: Hook dentro del componente**

Después de `const updateStatus = useProRequestsStore((s) => s.updateStatus)`:

```tsx
  const complete = useCompleteJob((reqId) => updateStatus(reqId, 'completed'))
```

- [ ] **Step 3: Interceptar el completado en ActiveJobCard**

Reemplazar (líneas ~165-175):

```tsx
            {active.map((req) => {
              const isInProgress = req.status === 'in_progress'
              return (
                <ActiveJobCard
                  key={req.id}
                  req={req}
                  onProgress={() => updateStatus(req.id, isInProgress ? 'completed' : 'in_progress')}
                  onChat={() => navigate(`/solicitud/${req.id}/chat`)}
                />
              )
            })}
```

por:

```tsx
            {active.map((req) => {
              const isInProgress = req.status === 'in_progress'
              return (
                <ActiveJobCard
                  key={req.id}
                  req={req}
                  onProgress={() => isInProgress ? complete.open(req) : updateStatus(req.id, 'in_progress')}
                  onChat={() => navigate(`/solicitud/${req.id}/chat`)}
                />
              )
            })}
```

- [ ] **Step 4: Renderizar el sheet dentro del `PageShell`**

Antes de cerrar el `</div>` final dentro de `<PageShell>`, agregar:

```tsx
        <CompleteJobSheet req={complete.completing} onConfirm={complete.confirm} onClose={complete.close} />
```

- [ ] **Step 5: build + lint**

Run: `cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npm run build && npm run lint`
Expected: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/pages/pro/ProDashboard.tsx
git commit -m "feat(ganancias): ProDashboard abre modal de monto al finalizar trabajo en curso"
```

---

## Task 8: Limpiar ganancias al cerrar sesión

**Files:**
- Modify: `src/store/authStore.ts` (~línea 56-59, `signOut`)

**Interfaces:**
- Consumes: `earningsService.clearDemo` (Task 2).

- [ ] **Step 1: Llamar clearDemo en signOut**

Importar arriba: `import { earningsService } from '../services/earningsService'`

Modificar:

```ts
  signOut: async () => {
    await authService.signOut()
    earningsService.clearDemo()
    set({ user: null })
  },
```

- [ ] **Step 2: build + lint**

Run: `cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npm run build && npm run lint`
Expected: sin errores.

- [ ] **Step 3: Verificar limpieza con playwright**

Con sesión pro abierta y `ofix_earnings` presente: cerrar sesión desde ProProfile, luego:
```bash
npx --no-install playwright-cli --raw eval "localStorage.getItem('ofix_earnings')"
```
Expected: `null`. Al reentrar como pro y abrir ganancias, el seed se regenera.

- [ ] **Step 4: Commit**

```bash
git add src/store/authStore.ts
git commit -m "feat(ganancias): cerrar sesión limpia ofix_earnings (reinicia demo)"
```

---

## Task 9: Ruta + 5ª tab + página base de Ganancias (tabs, número, comparativa, skeleton)

**Files:**
- Create: `src/pages/pro/ProGanancias.tsx`
- Modify: `src/components/layout/AnimatedRoutes.tsx` (lazy import + route en `/pro/*`)
- Modify: `src/components/layout/ProBottomNav.tsx` (5ª tab)

**Interfaces:**
- Consumes: `earningsService` (Task 2), `formatUYU` (Task 1), `useCountUp` (Task 1), `PageShell`.
- Produces: página `/pro/ganancias` con tabs Hoy/Semana/Total, número count-up, comparativa. (Gráfica y lista llegan en Tasks 10-11.)

- [ ] **Step 1: Registrar la ruta lazy en AnimatedRoutes**

Añadir junto a los otros lazy del pro (~línea 34):

```tsx
const ProGanancias = lazy(() => import('../../pages/pro/ProGanancias'))
```

Y dentro del `<Routes>` anidado de `/pro/*` (después de la línea de `trabajos`):

```tsx
                        <Route path="ganancias"     element={<ProGanancias />} />
```

- [ ] **Step 2: Agregar 5ª tab en ProBottomNav**

Importar `Wallet` de lucide-react (añadir al import existente) y agregar al array `TABS` (después de "Agenda"):

```tsx
    { label: 'Ganancias',   to: '/pro/ganancias',       icon: Wallet, badge: null },
```

- [ ] **Step 3: Crear `src/pages/pro/ProGanancias.tsx` (base con tabs + número + comparativa + skeleton)**

```tsx
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
    setLoading(true)
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
```

- [ ] **Step 4: build + lint**

Run: `cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npm run build && npm run lint`
Expected: sin errores.

- [ ] **Step 5: Verificar con playwright**

Login pro, tap tab "Ganancias" del bottom nav → ver número grande animado, subtítulo, comparativa; alternar Hoy/Semana/Total.

- [ ] **Step 6: Commit**

```bash
git add src/pages/pro/ProGanancias.tsx src/components/layout/AnimatedRoutes.tsx src/components/layout/ProBottomNav.tsx
git commit -m "feat(ganancias): ruta /pro/ganancias, 5ª tab y página base (tabs, número, comparativa)"
```

---

## Task 10: Gráfica de barras (Semana con navegación + Total por semanas)

**Files:**
- Create: `src/components/pro/EarningsBars.tsx`
- Modify: `src/pages/pro/ProGanancias.tsx` (insertar la gráfica según tab)

**Interfaces:**
- Consumes: `earningsService.getWeekSeries`, `getDailySeries` (Task 2), `formatUYU`, `DailyEarning`.
- Produces: `<EarningsBars data={DailyEarning[]} labels={string[]} highlightIndex={number} />`

- [ ] **Step 1: Crear `src/components/pro/EarningsBars.tsx`**

```tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatUYU } from '../../lib/money'
import type { DailyEarning } from '../../services/earningsService'

interface Props {
  data: DailyEarning[]
  labels: string[]          // etiqueta por barra (ej. 'L','M',... o 'S1')
  highlightIndex?: number   // barra resaltada (día/semana actual)
}

export function EarningsBars({ data, labels, highlightIndex }: Props) {
  const [sel, setSel] = useState<number | null>(null)
  const max = Math.max(1, ...data.map((d) => d.amount))
  const selected = sel !== null ? data[sel] : null

  return (
    <div className="px-5">
      <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8' }}>
        <div className="h-10 mb-3">
          {selected ? (
            <div>
              <p className="text-lg font-black" style={{ color: '#1A1712', fontVariantNumeric: 'tabular-nums' }}>
                {formatUYU(selected.amount)}
              </p>
              <p className="text-[11px] font-semibold" style={{ color: '#9C917E' }}>
                {selected.jobs} trabajo{selected.jobs !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#C4B8A6' }}>
              Tocá una barra para ver el detalle
            </p>
          )}
        </div>
        <div className="flex items-end justify-between gap-1.5" style={{ height: 140 }}>
          {data.map((d, i) => {
            const isHi = i === highlightIndex
            const isSel = i === sel
            const h = Math.round((d.amount / max) * 120)
            return (
              <button
                key={d.date + i}
                type="button"
                onClick={() => setSel(isSel ? null : i)}
                className="flex-1 flex flex-col items-center justify-end gap-1.5"
                style={{ height: '100%' }}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: Math.max(3, h) }}
                  transition={{ delay: i * 0.03, type: 'spring', stiffness: 320, damping: 30 }}
                  style={{
                    width: '100%', maxWidth: 30, borderRadius: 6,
                    background: isHi ? '#E8683A' : '#F0C3AE',
                    opacity: isSel ? 1 : isHi ? 1 : 0.9,
                    outline: isSel ? '2px solid #E8683A' : 'none',
                    outlineOffset: 2,
                  }}
                />
                <span className="text-[10px] font-bold" style={{ color: isHi ? '#E8683A' : '#B3A794' }}>
                  {labels[i]}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Insertar la gráfica en ProGanancias**

Agregar estado e imports en `ProGanancias.tsx`:

```tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EarningsBars } from '../../components/pro/EarningsBars'
import type { DailyEarning } from '../../services/earningsService'
```

Estado para semana y series (junto a los otros `useState`):

```tsx
  const [weekOffset, setWeekOffset] = useState(0)
  const [weekSeries, setWeekSeries] = useState<DailyEarning[]>([])
  const [totalSeries, setTotalSeries] = useState<DailyEarning[]>([])
```

Efecto para la semana visible (vista Semana):

```tsx
  useEffect(() => {
    if (tab !== 'semana') return
    earningsService.getWeekSeries(proId, weekOffset).then(setWeekSeries)
  }, [tab, weekOffset, proId])
```

Efecto para las 8 semanas (vista Total) — agrupa `getDailySeries(56)` en 8 bloques de 7:

```tsx
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
```

Reemplazar el comentario `{/* Gráfica (Task 10) ... */}` por:

```tsx
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
```

- [ ] **Step 3: build + lint**

Run: `cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npm run build && npm run lint`
Expected: sin errores.

- [ ] **Step 4: Verificar con playwright**

En Ganancias → Semana: barras L-D, día actual naranja, tap muestra detalle, ‹ navega a semanas previas y › se deshabilita en la actual. En Total: 8 barras semanales.

- [ ] **Step 5: Commit**

```bash
git add src/components/pro/EarningsBars.tsx src/pages/pro/ProGanancias.tsx
git commit -m "feat(ganancias): gráfica de barras (semana con navegación + total 8 semanas)"
```

---

## Task 11: Lista de últimos trabajos + cards de Total + estados vacíos

**Files:**
- Create: `src/components/pro/EarningsJobList.tsx`
- Modify: `src/pages/pro/ProGanancias.tsx`

**Interfaces:**
- Consumes: `earningsService.getJobs` (Task 2), `formatUYU`, `EarningJobView`.
- Produces: `<EarningsJobList jobs={EarningJobView[]} />`

- [ ] **Step 1: Crear `src/components/pro/EarningsJobList.tsx`**

```tsx
import { useState } from 'react'
import { formatUYU } from '../../lib/money'
import type { EarningJobView } from '../../services/earningsService'

function relativeDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const that = new Date(d); that.setHours(0, 0, 0, 0)
  const diffDays = Math.round((today.getTime() - that.getTime()) / 86400000)
  const hhmm = d.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 0) return `hoy ${hhmm}`
  if (diffDays === 1) return 'ayer'
  const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
  return `${dias[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`
}

export function EarningsJobList({ jobs }: { jobs: EarningJobView[] }) {
  const [showAll, setShowAll] = useState(false)
  if (jobs.length === 0) return null
  const visible = showAll ? jobs : jobs.slice(0, 10)

  return (
    <div className="px-5">
      <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#AAAAAA' }}>
        Últimos trabajos
      </p>
      <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1.5px solid #ECE4D8' }}>
        {visible.map((j, i) => (
          <div key={j.requestId} className="flex items-center justify-between px-4 py-3"
               style={{ borderTop: i === 0 ? 'none' : '1px solid #F0EAE0' }}>
            <div className="min-w-0">
              <p className="text-sm font-bold capitalize truncate" style={{ color: '#1A1712' }}>
                {j.category || 'Servicio'}
              </p>
              <p className="text-xs truncate" style={{ color: '#9C917E' }}>
                {j.clientName || 'Cliente'} · {relativeDate(j.completedAt)}
              </p>
            </div>
            <span className="text-sm font-black flex-shrink-0 ml-3"
                  style={{ color: '#1A1712', fontVariantNumeric: 'tabular-nums' }}>
              {formatUYU(j.amount)}
            </span>
          </div>
        ))}
      </div>
      {jobs.length > 10 && !showAll && (
        <button type="button" onClick={() => setShowAll(true)}
                className="w-full text-center text-[13px] font-bold py-2.5 mt-1" style={{ color: '#E8683A' }}>
          Ver todos ({jobs.length})
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Cargar jobs y cards de Total en ProGanancias**

Imports:

```tsx
import { EarningsJobList } from '../../components/pro/EarningsJobList'
import type { EarningJobView } from '../../services/earningsService'
```

Estado + efecto:

```tsx
  const [jobsList, setJobsList] = useState<EarningJobView[]>([])
  useEffect(() => {
    if (tab === 'hoy') return
    earningsService.getJobs(proId).then(setJobsList)
  }, [tab, proId, summary])
```

Para vista Hoy, jobs de hoy:

```tsx
  const [todayJobs, setTodayJobs] = useState<EarningJobView[]>([])
  useEffect(() => {
    if (tab !== 'hoy') return
    const ymd = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD local
    earningsService.getJobs(proId, ymd, ymd).then(setTodayJobs)
  }, [tab, proId, summary])
```

Insertar, después del bloque de gráfica:

```tsx
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
```

- [ ] **Step 3: build + lint**

Run: `cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npm run build && npm run lint`
Expected: sin errores.

- [ ] **Step 4: Verificar con playwright**

Semana/Total muestran lista de trabajos (máx 10 + "Ver todos"); Total muestra las 3 cards; Hoy sin trabajos muestra el estado vacío; pro nuevo (registrar uno) → estados vacíos, sin NaN.

- [ ] **Step 5: Commit**

```bash
git add src/components/pro/EarningsJobList.tsx src/pages/pro/ProGanancias.tsx
git commit -m "feat(ganancias): lista de trabajos, cards de total y estados vacíos"
```

---

## Task 12: Verificación end-to-end + pulido responsive

**Files:** ninguno nuevo (solo verificación y ajustes menores si aparecen)

- [ ] **Step 1: Flujo completo con playwright a 360px**

```bash
cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npx --no-install playwright-cli resize 360 780
```
Recorrer: login pro → completar un trabajo con monto (modal con teclado) → toast → tap "Ver ganancias" → el número sube con count-up y el trabajo aparece en Hoy/Semana/Total → navegar semanas → refrescar (persiste) → cerrar sesión (se limpia) → reentrar (seed fresco).

- [ ] **Step 2: Verificar persistencia y anti-NaN**

```bash
npx --no-install playwright-cli --raw eval "(() => { const r = JSON.parse(localStorage.getItem('ofix_earnings')||'[]'); return JSON.stringify({count:r.length, anyBad: r.some(j=>!(j.amount>0))}); })()"
```
Expected: `count` ≥ 25, `anyBad` = false. En la UI, ningún `NaN`/`$ NaN`.

- [ ] **Step 3: build + lint finales**

Run: `cd "C:/Users/fede8/Documents/OficiosYa/oficioYa" && npm run build && npm run lint`
Expected: sin errores.

- [ ] **Step 4: Cerrar navegador y limpiar**

```bash
npx --no-install playwright-cli close
```

- [ ] **Step 5: Commit (si hubo ajustes)**

```bash
git add -A
git commit -m "test(ganancias): verificación e2e a 360px y pulido responsive"
```

---

## Self-Review (cobertura del spec)

- **A. Modelo de datos** → Task 3 (campos) + Task 2 (`EarningJob`, `ofix_earnings`, upsert). ✓
- **B. earningsService** (interfaz, agregación, sanitización, seed, ramas Supabase, clearDemo) → Task 2. ✓
- **C. Modal de monto** (validación, 2 puntos, updateStatus+recordJob+system+toast) → Tasks 5,6,7. ✓
- **D. Pantalla** (tabs, número count-up, comparativa anti-NaN, barras, navegación semanas, lista, vacíos, skeleton, ErrorBoundary global existente, 100dvh vía PageShell) → Tasks 9,10,11. ✓
- **E. 5ª tab bottom nav / Dashboard intacto** → Task 9. ✓
- **F. Utilidades** (formatUYU, semana L-D, useCountUp) → Task 1. ✓
- **Robustez** (vacíos, inválidos ignorados, fallbacks) → Tasks 2,11. ✓
- **Reiniciar demo = limpiar en signOut** → Task 8. ✓
- **Criterios de aceptación** → Task 12. ✓

Desvío: filas de trabajos no navegan a `/solicitud/:id` (ruta client-gated). Documentado arriba.
