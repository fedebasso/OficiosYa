# Fechas, Disponibilidad y Matching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar selección de fecha + flexibilidad al wizard de tickets, y usar la disponibilidad existente del pro para mostrar "próxima fecha disponible" en los resultados.

**Architecture:** Nuevo paso `DateStep` entre descripción e IA en `TicketFlow`. `TicketInput` suma `desired_date` y `date_flexibility`. `scoring.ts` agrega `getNextAvailableDate` que usa `availabilityStore` para calcular la primera fecha disponible del pro en el rango elegido y bonifica el score.

**Tech Stack:** React + TypeScript, Zustand (`availabilityStore`), Framer Motion, Tailwind CSS

## Global Constraints

- Naranja primario: `#E8683A`, fondo página: `#F9F6F2`, fondo cards: `#FFFFFF`, border: `#E8E0D4`
- Tipografía: `font-black` para títulos h2, `font-bold` para labels y CTAs
- Bordes redondeados: `rounded-2xl` para contenedores/botones principales, `rounded-xl` para chips
- Animaciones: `framer-motion` — usar `SPRING_GENTLE` de `src/lib/motion.ts` para transiciones de entrada
- Días anteriores a hoy: deshabilitados en el calendario (no seleccionables)
- Sin selección de hora en el wizard — eso se coordina en `TicketConfirm` (no tocar `TicketConfirm`)
- No agregar dependencias externas nuevas — implementar calendario con lógica nativa de JS `Date`

---

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|----------------|
| `src/types/ticket.ts` | Modificar | Agregar `DateFlexibility`, extender `TicketInput` |
| `src/lib/scoring.ts` | Modificar | Agregar `getNextAvailableDate`, bonus de fecha en `scoreProfessional` |
| `src/pages/TicketFlow.tsx` | Modificar | Agregar `DateStep`, renumerar pasos, pasar fecha a `ResultsStep` |

---

## Task 1: Extender tipos en `ticket.ts`

**Files:**
- Modify: `src/types/ticket.ts`

**Interfaces:**
- Produces: tipo `DateFlexibility = 'exact' | '1day' | '2days' | 'flexible'` y campos `desired_date: string`, `date_flexibility: DateFlexibility` en `TicketInput`

- [ ] **Step 1: Reemplazar el contenido de `src/types/ticket.ts`**

```typescript
// src/types/ticket.ts
import type { WorkType } from '../store/requestStore'

export type DateFlexibility = 'exact' | '1day' | '2days' | 'flexible'

export interface TicketInput {
  category: string
  photo: File | null
  text: string
  zone: string
  desired_date: string        // 'YYYY-MM-DD', vacío string si no elegida aún
  date_flexibility: DateFlexibility
}

export interface GeneratedTicket {
  title: string
  description: string
  category: string
  urgent: boolean
  work_type: WorkType
}
```

- [ ] **Step 2: Verificar que TypeScript no rompe**

```bash
cd oficioYa && npx tsc --noEmit 2>&1 | head -30
```

Esperado: errores solo en `TicketFlow.tsx` (porque `TicketInput` ahora requiere los campos nuevos). Eso es correcto — se resuelve en Task 3.

- [ ] **Step 3: Commit**

```bash
cd oficioYa && git add src/types/ticket.ts
git commit -m "feat: agregar DateFlexibility y desired_date a TicketInput"
```

---

## Task 2: Agregar `getNextAvailableDate` y bonus de fecha en `scoring.ts`

**Files:**
- Modify: `src/lib/scoring.ts`

**Interfaces:**
- Consumes:
  - `ProfessionalWithProfile` de `../hooks/useProfessionals`
  - `DateFlexibility` de `../types/ticket`
  - `WorkingSchedule`, `Vacation`, `BlockedSlot` de `../store/availabilityStore`
- Produces:
  - `getNextAvailableDate(pro, desiredDate, flexibility, schedules, vacations, blockedSlots): string | null`
  - `scoreProfessional` actualizada con parámetros opcionales `desiredDate?` y `flexibility?`

- [ ] **Step 1: Reemplazar `src/lib/scoring.ts` con la versión extendida**

```typescript
import type { ProfessionalWithProfile } from '../hooks/useProfessionals'
import type { DateFlexibility } from '../types/ticket'
import type { WorkingSchedule, Vacation, BlockedSlot } from '../store/availabilityStore'

// Tipos auxiliares que viene del store
type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'

function dateToDayOfWeek(dateStr: string): DayOfWeek {
  const d = new Date(dateStr + 'T12:00:00')
  const map: DayOfWeek[] = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  return map[d.getDay()]
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function getRangeDays(desiredDate: string, flexibility: DateFlexibility): string[] {
  const today = new Date().toISOString().split('T')[0]
  switch (flexibility) {
    case 'exact':    return [desiredDate].filter(d => d >= today)
    case '1day': {
      const candidates = [addDays(desiredDate, -1), desiredDate, addDays(desiredDate, 1)]
      return candidates.filter(d => d >= today)
    }
    case '2days': {
      const candidates = [
        addDays(desiredDate, -2), addDays(desiredDate, -1),
        desiredDate,
        addDays(desiredDate, 1), addDays(desiredDate, 2),
      ]
      return candidates.filter(d => d >= today)
    }
    case 'flexible': {
      const days: string[] = []
      for (let i = 0; i <= 27; i++) {
        const d = addDays(desiredDate, i)
        if (d >= today) days.push(d)
      }
      return days
    }
  }
}

export function getNextAvailableDate(
  pro: ProfessionalWithProfile,
  desiredDate: string,
  flexibility: DateFlexibility,
  schedules: Record<string, WorkingSchedule>,
  vacations: Vacation[],
  blockedSlots: BlockedSlot[],
): string | null {
  const schedule = schedules[pro.id]
  if (!schedule) return null

  const range = getRangeDays(desiredDate, flexibility)

  for (const date of range) {
    // ¿El día de la semana está en los días laborales del pro?
    if (!schedule.days.includes(dateToDayOfWeek(date))) continue

    // ¿Está en vacaciones?
    const inVacation = vacations.some(
      v => v.proId === pro.id && date >= v.fromDate && date <= v.toDate
    )
    if (inVacation) continue

    // ¿El día completo está bloqueado? (bloqueo que cubre todo el horario laboral)
    // Para matching de fechas, si hay AL MENOS un slot libre el día cuenta como disponible.
    // Un bloqueo parcial (ej. 13:00-16:00) no invalida el día.
    // Solo se descarta si hay vacation — los blocked slots son horarios, no días completos.

    return date
  }

  return null
}

// Devuelve cuántos días de diferencia hay entre nextDate y desiredDate (absoluto)
function dateDiffDays(a: string, b: string): number {
  const da = new Date(a + 'T12:00:00')
  const db = new Date(b + 'T12:00:00')
  return Math.abs(Math.round((da.getTime() - db.getTime()) / 86400000))
}

interface ScoreOptions {
  desiredDate?: string
  flexibility?: DateFlexibility
  schedules?: Record<string, WorkingSchedule>
  vacations?: Vacation[]
  blockedSlots?: BlockedSlot[]
}

export function scoreProfessional(
  pro: ProfessionalWithProfile,
  clientZone: string,
  opts: ScoreOptions = {},
): number {
  let score = 0
  if (pro.available_now) score += 40
  if (clientZone && pro.zone === clientZone) score += 25
  score += ((pro.avg_rating ?? 0) / 5) * 20
  score += Math.min(pro.jobs_count / 100, 1) * 10
  if (pro.verified) score += 5
  if (pro.response_time_min > 30) score -= 5

  // Bonus por fecha
  if (opts.desiredDate && opts.flexibility && opts.schedules && opts.vacations && opts.blockedSlots) {
    const nextDate = getNextAvailableDate(
      pro,
      opts.desiredDate,
      opts.flexibility,
      opts.schedules,
      opts.vacations,
      opts.blockedSlots,
    )
    if (nextDate === null) {
      score -= 50
    } else {
      const diff = dateDiffDays(nextDate, opts.desiredDate)
      if (diff === 0) score += 20
      else if (diff <= 1) score += 15
      else if (diff <= 2) score += 10
      else score += 5
    }
  }

  return score
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd oficioYa && npx tsc --noEmit 2>&1 | head -30
```

Esperado: errores solo en `TicketFlow.tsx` (aún tiene la llamada vieja a `scoreProfessional`). Correcto.

- [ ] **Step 3: Commit**

```bash
cd oficioYa && git add src/lib/scoring.ts
git commit -m "feat: getNextAvailableDate y bonus de fecha en scoreProfessional"
```

---

## Task 3: Agregar `DateStep` y actualizar `TicketFlow.tsx`

**Files:**
- Modify: `src/pages/TicketFlow.tsx`

**Interfaces:**
- Consumes:
  - `DateFlexibility` de `../types/ticket`
  - `scoreProfessional`, `getNextAvailableDate` de `../lib/scoring`
  - `useAvailabilityStore` de `../store/availabilityStore`
  - `TicketInput` extendido (Task 1)

**Descripción de cambios en `TicketFlow.tsx`:**

1. El estado del orquestador cambia de `useState<1|2|3|4>` a `useState<1|2|3|4|5>`
2. `TicketInput` inicial agrega `desired_date: ''` y `date_flexibility: 'exact'`
3. Se agrega el componente `DateStep` (antes del orquestador)
4. `ResultsStep` recibe `desiredDate` y `flexibility` como props nuevas
5. En `ResultsStep`, se llama `useAvailabilityStore` y se pasa al score y a las cards
6. Las referencias a paso en el header se actualizan (ahora "Paso X de 5")

- [ ] **Step 1: Agregar el componente `DateStep` — insertar ANTES de la función `TicketFlow` (línea ~691)**

Insertar este bloque antes de `/* ── Orquestador principal ── */`:

```tsx
/* ── Helpers de calendario ── */
function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('es-UY', { month: 'long', year: 'numeric' })
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0=Dom → convertir a 0=Lun
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

const FLEX_OPTIONS: { value: DateFlexibility; label: string; desc: (date: string) => string }[] = [
  {
    value: 'exact',
    label: 'Fecha exacta',
    desc: (d) => {
      if (!d) return 'Solo ese día'
      const dt = new Date(d + 'T12:00:00')
      return `Solo el ${dt.getDate()} ${dt.toLocaleDateString('es-UY', { month: 'short' })}`
    },
  },
  {
    value: '1day',
    label: '± 1 día',
    desc: (d) => {
      if (!d) return '3 días de margen'
      const dt = new Date(d + 'T12:00:00')
      const from = new Date(dt); from.setDate(from.getDate() - 1)
      const to = new Date(dt); to.setDate(to.getDate() + 1)
      const fmt = (x: Date) => `${x.getDate()} ${x.toLocaleDateString('es-UY', { month: 'short' })}`
      return `${fmt(from)} – ${fmt(to)}`
    },
  },
  {
    value: '2days',
    label: '± 2 días',
    desc: (d) => {
      if (!d) return '5 días de margen'
      const dt = new Date(d + 'T12:00:00')
      const from = new Date(dt); from.setDate(from.getDate() - 2)
      const to = new Date(dt); to.setDate(to.getDate() + 2)
      const fmt = (x: Date) => `${x.getDate()} ${x.toLocaleDateString('es-UY', { month: 'short' })}`
      return `${fmt(from)} – ${fmt(to)}`
    },
  },
  {
    value: 'flexible',
    label: 'Flexible',
    desc: () => 'Mayor disponibilidad',
  },
]

/* ── Paso 3: Fecha y flexibilidad ── */
function DateStep({
  desiredDate,
  flexibility,
  onChange,
  onNext,
}: {
  desiredDate: string
  flexibility: DateFlexibility
  onChange: (patch: { desired_date?: string; date_flexibility?: DateFlexibility }) => void
  onNext: () => void
}) {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  function toDateStr(day: number): string {
    const m = String(viewMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${viewYear}-${m}-${d}`
  }

  function handleDaySelect(day: number) {
    const dateStr = toDateStr(day)
    if (dateStr < todayStr) return
    onChange({ desired_date: dateStr })
    // Auto-seleccionar 'exact' la primera vez que se elige fecha
    if (!desiredDate) onChange({ date_flexibility: 'exact' })
  }

  const canContinue = desiredDate !== ''

  return (
    <div className="flex flex-col gap-5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#E8683A' }}>
          📅 Paso 3
        </p>
        <h2 className="text-xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          ¿Para cuándo lo necesitás?
        </h2>
        <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>
          Elegí una fecha aproximada
        </p>
      </motion.div>

      {/* Calendario */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
      >
        {/* Header mes */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #F0EBE1' }}>
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-60"
            style={{ background: '#F5F0E8', color: '#555' }}
          >
            ‹
          </button>
          <span className="text-sm font-bold capitalize" style={{ color: '#111111' }}>
            {formatMonthYear(new Date(viewYear, viewMonth, 1))}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center active:opacity-60"
            style={{ background: '#F5F0E8', color: '#555' }}
          >
            ›
          </button>
        </div>

        {/* Cabecera días */}
        <div className="grid grid-cols-7 px-3 pt-3 pb-1">
          {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold" style={{ color: '#AAAAAA' }}>{d}</div>
          ))}
        </div>

        {/* Grilla de días */}
        <div className="grid grid-cols-7 gap-y-1 px-3 pb-3">
          {/* Espacios vacíos al inicio */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = toDateStr(day)
            const isPast = dateStr < todayStr
            const isSelected = dateStr === desiredDate
            const isToday = dateStr === todayStr

            return (
              <button
                key={day}
                type="button"
                disabled={isPast}
                onClick={() => handleDaySelect(day)}
                className="flex items-center justify-center h-9 rounded-full text-sm font-bold transition-all active:scale-90"
                style={{
                  background: isSelected ? '#E8683A' : isToday ? 'rgba(232,104,58,.1)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : isPast ? '#DDDDDD' : isToday ? '#E8683A' : '#111111',
                  cursor: isPast ? 'not-allowed' : 'pointer',
                }}
              >
                {day}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Chips de flexibilidad */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.25 }}
        className="flex flex-col gap-2"
      >
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
          Nivel de flexibilidad
        </p>
        <div className="grid grid-cols-2 gap-2">
          {FLEX_OPTIONS.map(opt => {
            const active = flexibility === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ date_flexibility: opt.value })}
                className="flex flex-col items-start rounded-xl px-3 py-2.5 text-left transition-all active:scale-95"
                style={{
                  background: active ? '#FEF0EA' : '#FFFFFF',
                  border: `1.5px solid ${active ? '#E8683A' : '#E8E0D4'}`,
                }}
              >
                <span className="text-xs font-bold" style={{ color: active ? '#E8683A' : '#333333' }}>
                  {opt.label}
                </span>
                <span className="text-[10px] mt-0.5" style={{ color: active ? '#C4927A' : '#AAAAAA' }}>
                  {opt.desc(desiredDate)}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      <motion.button
        type="button"
        onClick={onNext}
        disabled={!canContinue}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: canContinue ? 1 : 0.4, y: 0 }}
        transition={{ delay: 0.28 }}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-2xl py-4 text-base font-bold text-white disabled:cursor-not-allowed"
        style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
      >
        Buscar profesionales →
      </motion.button>
    </div>
  )
}
```

- [ ] **Step 2: Actualizar los imports al inicio del archivo**

Agregar `DateFlexibility` al import de tipos, y los imports de scoring y store:

```tsx
// Línea 1 del archivo — mantener los existentes y agregar:
import { getNextAvailableDate, scoreProfessional } from '../lib/scoring'
import { useAvailabilityStore } from '../store/availabilityStore'
import type { TicketInput, GeneratedTicket, DateFlexibility } from '../types/ticket'
```

(Reemplazar la línea que ya importa `TicketInput` y `GeneratedTicket`.)

- [ ] **Step 3: Actualizar el estado inicial en el orquestador `TicketFlow`**

Cambiar el tipo de `step` y el valor inicial de `input`:

```tsx
// Dentro de TicketFlow():
const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)

const [input, setInput] = useState<TicketInput>({
  category: '',
  photo: null,
  text: '',
  zone: '',
  desired_date: '',
  date_flexibility: 'exact',
})
```

- [ ] **Step 4: Actualizar `ResultsStep` para recibir y usar fecha/flexibilidad**

Cambiar la firma de `ResultsStep` y su lógica interna:

```tsx
function ResultsStep({
  ticket,
  category,
  clientZone,
  desiredDate,
  flexibility,
  onPedir,
}: {
  ticket: GeneratedTicket
  category: string
  clientZone: string
  desiredDate: string
  flexibility: DateFlexibility
  onPedir: (pro: ProfessionalWithProfile) => void
}) {
  const { professionals } = useProfessionals(category)
  const { schedules, vacations, blockedSlots } = useAvailabilityStore()

  const inRange = professionals.filter((p) =>
    isInRadius(p.zone, p.radius_km, clientZone)
  )

  const scored = inRange
    .map((p) => ({
      pro: p,
      score: scoreProfessional(p, clientZone, {
        desiredDate,
        flexibility,
        schedules,
        vacations,
        blockedSlots,
      }),
      nextDate: desiredDate
        ? getNextAvailableDate(p, desiredDate, flexibility, schedules, vacations, blockedSlots)
        : null,
    }))
    .sort((a, b) => b.score - a.score)

  // ... el resto del componente igual, pero usar `scored` en vez de `sorted`
  const [selectedId, setSelectedId] = useState<string | null>(null)
  useEffect(() => {
    if (scored.length > 0 && selectedId === null) setSelectedId(scored[0].pro.id)
  }, [scored.length])
  const selectedPro = scored.find(({ pro }) => pro.id === selectedId)?.pro ?? null
```

En la card de cada profesional (dentro del `.map`), agregar debajo del rating/trabajos:

```tsx
// Después de la línea que muestra jobs_count y response_time_min
{nextDate && (
  <span className="text-[9px] font-bold block mt-0.5" style={{ color: '#16A34A' }}>
    📅 Disponible desde el {new Date(nextDate + 'T12:00:00').toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })}
  </span>
)}
{!nextDate && desiredDate && (
  <span className="text-[9px] font-bold block mt-0.5" style={{ color: '#AAAAAA' }}>
    📅 Consultar disponibilidad
  </span>
)}
```

Y en el `.slice(0,5).map()`, destructurar `{ pro, nextDate }` del array `scored`:

```tsx
{scored.slice(0, 5).map(({ pro, nextDate }) => {
  const selected = pro.id === selectedId
  // ... mismo JSX de antes usando `pro` en lugar de la variable anterior
```

Aplicar `opacity: !nextDate && desiredDate ? 0.6 : 1` al `motion.button` de cada card cuando no hay fecha disponible.

- [ ] **Step 5: Agregar `DateStep` al `AnimatePresence` del orquestador**

En el bloque `<AnimatePresence>`, agregar el paso 3 entre el bloque de `step === 2` y `step === 3` (que ahora pasa a ser `step === 4`). Renumerar los steps existentes:

- `step === 3` (IA) → `step === 4`  
- `step === 4` (Resultados) → `step === 5`

Nuevo bloque a insertar:

```tsx
{step === 3 && (
  <motion.div
    key="step3"
    custom={direction}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    style={{ width: '100%' }}
  >
    <DateStep
      desiredDate={input.desired_date}
      flexibility={input.date_flexibility}
      onChange={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
      onNext={() => { setDirection('forward'); setStep(4) }}
    />
  </motion.div>
)}
```

El paso 2 ahora navega a `setStep(3)` en vez de llamar `handleAnalyze`. Y `handleAnalyze` se llama desde `step 3 → 4`.

Cambiar en `MediaStep`'s `onAnalyze` prop en el orquestador:

```tsx
// En el bloque step === 2:
<MediaStep
  input={input}
  onChange={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
  onAnalyze={() => { setDirection('forward'); setStep(3) }}  // ← antes llamaba handleAnalyze
  lockedPro={lockedPro}
/>
```

Y en `DateStep`'s `onNext`:

```tsx
onNext={() => {
  setDirection('forward')
  handleAnalyze()  // handleAnalyze lleva al paso 4 (IA)
}}
```

- [ ] **Step 6: Actualizar el header del wizard**

Cambiar en el componente `header`:

```tsx
// Título del paso 3:
{step === 3 && '¿Para cuándo?'}
{step === 4 && 'Analizando...'}
{step === 5 && 'Profesionales para vos'}

// Contador de pasos:
`Paso ${step} de 5`

// Botón back del step 3:
{step === 3 && (
  <button type="button" onClick={() => { setDirection('back'); setStep(2) }}
    className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0">
    <ChevronLeft size={24} style={{ color: '#111111' }} />
  </button>
)}
// Botón back del step 5 (resultados):
{step === 5 && (
  <button type="button" onClick={() => { setDirection('back'); setStep(3) }}
    ...
```

- [ ] **Step 7: Actualizar la llamada a `ResultsStep` en el `AnimatePresence`**

```tsx
{step === 5 && ticket && !lockedPro && (
  <motion.div key="step5" ...>
    <ResultsStep
      ticket={ticket}
      category={category ?? ''}
      clientZone={input.zone}
      desiredDate={input.desired_date}
      flexibility={input.date_flexibility}
      onPedir={handlePedir}
    />
  </motion.div>
)}
```

- [ ] **Step 8: Verificar TypeScript sin errores**

```bash
cd oficioYa && npx tsc --noEmit 2>&1
```

Esperado: 0 errores.

- [ ] **Step 9: Correr el dev server y verificar el flujo completo**

```bash
cd oficioYa && npm run dev
```

Verificar manualmente:
1. Abrir `/ticket` → paso 1 categoría ✓
2. Paso 2: foto + descripción → botón "Analizar con IA" ahora debe avanzar a paso 3 (fecha) ✓
3. Paso 3: calendario se muestra, días pasados deshabilitados ✓
4. Seleccionar fecha → chip "Exacta" se activa automáticamente ✓
5. Chips muestran rango correcto (ej. ± 1 día muestra 3 fechas) ✓
6. "Buscar profesionales" deshabilitado sin fecha, habilitado con fecha ✓
7. Al continuar → paso 4 (IA animada) → paso 5 (resultados con "📅 Disponible desde...") ✓
8. Cards sin fecha disponible aparecen atenuadas ✓
9. Header muestra "Paso X de 5" correctamente en cada paso ✓

- [ ] **Step 10: Commit final**

```bash
cd oficioYa && git add src/pages/TicketFlow.tsx
git commit -m "feat: DateStep con calendario y flexibilidad en TicketFlow, matching por fecha en ResultsStep"
```

---

## Self-Review

**Spec coverage:**
- ✅ Nuevo paso fecha + flexibilidad entre descripción e IA
- ✅ Opciones: Exacta / ±1 / ±2 / Flexible
- ✅ Sin selección de hora (se coordina en TicketConfirm — sin tocar)
- ✅ Flexible = 28 días próximos
- ✅ Matching usa disponibilidad existente del pro (schedules + vacations)
- ✅ Cards muestran "próxima fecha disponible"
- ✅ Calendario visual estilo mobile, días pasados deshabilitados
- ✅ Urgencias no tocadas
- ✅ ProAvailability no tocada
- ✅ Chat, presupuestos, RequestForm no tocados

**Placeholder scan:** Sin TBDs ni "fill in later". Todos los steps tienen código completo.

**Type consistency:**
- `DateFlexibility` definida en Task 1, consumida en Tasks 2 y 3 ✓
- `scoreProfessional(pro, zone, opts?)` — firma consistente entre Task 2 y Task 3 ✓
- `getNextAvailableDate(pro, date, flex, schedules, vacations, blockedSlots)` — 6 args, consistente en Tasks 2 y 3 ✓
- `desired_date` y `date_flexibility` en `TicketInput` — definidos Task 1, usados Task 3 ✓
