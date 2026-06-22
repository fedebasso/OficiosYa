# Calendario y Disponibilidad — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sistema de disponibilidad en modo demo: el cliente elige fecha y horario al contratar un profesional; el profesional gestiona su agenda desde `/pro/disponibilidad`.

**Architecture:** Zustand store central (`availabilityStore`) con lógica de generación de slots. Componentes UI reutilizables en `src/components/availability/`. El wizard de solicitud añade un paso 4 que consume los componentes de disponibilidad del profesional. Al confirmar, se registra un booking automático.

**Tech Stack:** React 18, TypeScript, Zustand, Framer Motion, Tailwind CSS + inline styles, Lucide React, Vite.

## Global Constraints

- Colores de marca: primario `#E8683A`, fondo `#F5F0E8`, borde `#E8E0D4`, texto `#111111`.
- Todos los bottom sheets siguen el patrón `AnimatePresence` + `motion.div` con `y: '100%'` → `y: 0`, igual que `ZoneSheet` en `TicketFlow.tsx`.
- Sin librerías de calendario externas — todo custom.
- Intervalos de horario: 30 min, constante `INTERVAL_MIN = 30` en el store.
- Duración default de una reserva: 60 min.
- Solo modo demo (`IS_DEMO_MODE`): no hay llamadas a Supabase.
- TypeScript strict — correr `npx tsc --noEmit` como verificación tras cada tarea.
- Commit tras cada tarea completada.

---

## File Map

| Acción | Archivo | Responsabilidad |
|--------|---------|-----------------|
| Crear | `src/store/availabilityStore.ts` | Tipos, lógica de slots, datos demo |
| Crear | `src/components/availability/TimeSlotPill.tsx` | Píldora individual con estados visuales |
| Crear | `src/components/availability/TimeSlotGrid.tsx` | Grilla 4 columnas de píldoras |
| Crear | `src/components/availability/DateStrip.tsx` | Strip horizontal de 14 días |
| Crear | `src/components/availability/BlockSlotSheet.tsx` | Bottom sheet para bloquear horario |
| Crear | `src/components/availability/VacationSheet.tsx` | Bottom sheet para vacaciones |
| Crear | `src/pages/pro/ProAvailability.tsx` | Página completa de disponibilidad pro |
| Modificar | `src/components/layout/ProBottomNav.tsx` | Agregar tab "Agenda" |
| Modificar | `src/App.tsx` | Agregar ruta `/pro/disponibilidad` |
| Modificar | `src/components/requests/RequestWizard.tsx` | Paso 4 + nuevos campos en WizardData |
| Modificar | `src/pages/RequestService.tsx` | Pasar `proId` al wizard |
| Modificar | `src/store/requestStore.ts` | Auto-booking al crear solicitud |

---

## Task 1: availabilityStore

**Files:**
- Create: `src/store/availabilityStore.ts`

**Interfaces:**
- Produces:
  - `useAvailabilityStore` — hook Zustand
  - `TimeSlot`, `SlotStatus`, `WorkingSchedule`, `BlockedSlot`, `Vacation`, `Booking`, `DayOfWeek` — tipos exportados
  - `getSlots(proId, date): TimeSlot[]`
  - `isDateAvailable(proId, date): boolean`
  - `setSchedule`, `addBlockedSlot`, `removeBlockedSlot`, `addVacation`, `removeVacation`, `addBooking`

- [ ] **Step 1: Crear el archivo con tipos y store**

```typescript
// src/store/availabilityStore.ts
import { create } from 'zustand'

export type DayOfWeek =
  | 'lunes' | 'martes' | 'miercoles' | 'jueves'
  | 'viernes' | 'sabado' | 'domingo'

export interface WorkingSchedule {
  proId: string
  days: DayOfWeek[]
  fromHour: string   // 'HH:MM'
  toHour: string     // 'HH:MM'
  intervalMin: number
}

export interface BlockedSlot {
  id: string
  proId: string
  date: string       // 'YYYY-MM-DD'
  fromTime: string   // 'HH:MM'
  toTime: string     // 'HH:MM'
  reason?: string
}

export interface Vacation {
  id: string
  proId: string
  fromDate: string   // 'YYYY-MM-DD'
  toDate: string     // 'YYYY-MM-DD'
}

export interface Booking {
  id: string
  proId: string
  requestId: string
  date: string       // 'YYYY-MM-DD'
  fromTime: string   // 'HH:MM'
  toTime: string     // 'HH:MM'
}

export type SlotStatus = 'available' | 'blocked' | 'booked'

export interface TimeSlot {
  time: string       // 'HH:MM'
  status: SlotStatus
}

// ── Helpers ────────────────────────────────────────────────────────────────

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function dateToDayOfWeek(dateStr: string): DayOfWeek {
  // Use noon to avoid timezone edge cases
  const d = new Date(dateStr + 'T12:00:00')
  const map: DayOfWeek[] = [
    'domingo', 'lunes', 'martes', 'miercoles',
    'jueves', 'viernes', 'sabado',
  ]
  return map[d.getDay()]
}

function datePlusDays(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

// ── Demo data ───────────────────────────────────────────────────────────────

const req201Date = datePlusDays(2) // matches mockRequests[0].scheduled_date

const DEMO_SCHEDULES: Record<string, WorkingSchedule> = {
  '1': {
    proId: '1',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
    fromHour: '08:00',
    toHour: '18:00',
    intervalMin: 30,
  },
  '2': {
    proId: '2',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    fromHour: '09:00',
    toHour: '17:00',
    intervalMin: 30,
  },
}

const DEMO_BLOCKED: BlockedSlot[] = [
  {
    id: 'b1',
    proId: '1',
    date: datePlusDays(3),
    fromTime: '13:00',
    toTime: '16:00',
    reason: 'Trabajo externo',
  },
]

const DEMO_BOOKINGS: Booking[] = [
  {
    id: 'bk1',
    proId: '1',
    requestId: '201',
    date: req201Date,
    fromTime: '10:00',
    toTime: '11:00',
  },
]

// ── Store ───────────────────────────────────────────────────────────────────

interface AvailabilityStore {
  schedules: Record<string, WorkingSchedule>
  blockedSlots: BlockedSlot[]
  vacations: Vacation[]
  bookings: Booking[]

  getSlots: (proId: string, date: string) => TimeSlot[]
  isDateAvailable: (proId: string, date: string) => boolean

  setSchedule: (proId: string, patch: Omit<WorkingSchedule, 'proId'>) => void
  addBlockedSlot: (slot: Omit<BlockedSlot, 'id'>) => void
  removeBlockedSlot: (id: string) => void
  addVacation: (v: Omit<Vacation, 'id'>) => void
  removeVacation: (id: string) => void
  addBooking: (b: Omit<Booking, 'id'>) => void
}

export const useAvailabilityStore = create<AvailabilityStore>((set, get) => ({
  schedules: DEMO_SCHEDULES,
  blockedSlots: DEMO_BLOCKED,
  vacations: [],
  bookings: DEMO_BOOKINGS,

  getSlots: (proId, date) => {
    const { schedules, blockedSlots, vacations, bookings } = get()
    const schedule = schedules[proId]
    if (!schedule) return []

    if (!schedule.days.includes(dateToDayOfWeek(date))) return []

    const inVacation = vacations.some(
      (v) => v.proId === proId && date >= v.fromDate && date <= v.toDate
    )
    if (inVacation) return []

    const fromMin = timeToMin(schedule.fromHour)
    const toMin = timeToMin(schedule.toHour)
    const slots: TimeSlot[] = []

    for (let min = fromMin; min < toMin; min += schedule.intervalMin) {
      const time = minToTime(min)
      const slotEnd = min + schedule.intervalMin

      const isBooked = bookings.some(
        (b) =>
          b.proId === proId &&
          b.date === date &&
          timeToMin(b.fromTime) < slotEnd &&
          timeToMin(b.toTime) > min
      )

      const isBlocked = blockedSlots.some(
        (bs) =>
          bs.proId === proId &&
          bs.date === date &&
          timeToMin(bs.fromTime) < slotEnd &&
          timeToMin(bs.toTime) > min
      )

      slots.push({
        time,
        status: isBooked ? 'booked' : isBlocked ? 'blocked' : 'available',
      })
    }

    return slots
  },

  isDateAvailable: (proId, date) => {
    const { schedules, vacations } = get()
    const schedule = schedules[proId]
    if (!schedule) return false
    if (!schedule.days.includes(dateToDayOfWeek(date))) return false
    return !vacations.some(
      (v) => v.proId === proId && date >= v.fromDate && date <= v.toDate
    )
  },

  setSchedule: (proId, patch) =>
    set((s) => ({
      schedules: { ...s.schedules, [proId]: { proId, ...patch } },
    })),

  addBlockedSlot: (slot) =>
    set((s) => ({
      blockedSlots: [
        ...s.blockedSlots,
        { ...slot, id: `b-${Date.now()}` },
      ],
    })),

  removeBlockedSlot: (id) =>
    set((s) => ({ blockedSlots: s.blockedSlots.filter((b) => b.id !== id) })),

  addVacation: (v) =>
    set((s) => ({
      vacations: [...s.vacations, { ...v, id: `vac-${Date.now()}` }],
    })),

  removeVacation: (id) =>
    set((s) => ({ vacations: s.vacations.filter((v) => v.id !== id) })),

  addBooking: (b) =>
    set((s) => ({
      bookings: [...s.bookings, { ...b, id: `bk-${Date.now()}` }],
    })),
}))
```

- [ ] **Step 2: Verificar tipos**

```bash
cd ~/OficiosYa/oficioYa && npx tsc --noEmit 2>&1
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
cd ~/OficiosYa/oficioYa
git add src/store/availabilityStore.ts
git commit -m "feat: agregar availabilityStore con lógica de slots demo"
```

---

## Task 2: TimeSlotPill + TimeSlotGrid

**Files:**
- Create: `src/components/availability/TimeSlotPill.tsx`
- Create: `src/components/availability/TimeSlotGrid.tsx`

**Interfaces:**
- Consumes: `SlotStatus`, `TimeSlot` de `availabilityStore`
- Produces:
  - `<TimeSlotPill time selected status onClick />` 
  - `<TimeSlotGrid slots selected onSelect />`

- [ ] **Step 1: Crear TimeSlotPill**

```tsx
// src/components/availability/TimeSlotPill.tsx
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
```

- [ ] **Step 2: Crear TimeSlotGrid**

```tsx
// src/components/availability/TimeSlotGrid.tsx
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
```

- [ ] **Step 3: Verificar tipos**

```bash
cd ~/OficiosYa/oficioYa && npx tsc --noEmit 2>&1
```

Esperado: sin errores.

- [ ] **Step 4: Commit**

```bash
cd ~/OficiosYa/oficioYa
git add src/components/availability/TimeSlotPill.tsx src/components/availability/TimeSlotGrid.tsx
git commit -m "feat: agregar TimeSlotPill y TimeSlotGrid"
```

---

## Task 3: DateStrip

**Files:**
- Create: `src/components/availability/DateStrip.tsx`

**Interfaces:**
- Consumes: `useAvailabilityStore.isDateAvailable`
- Produces: `<DateStrip proId selected onSelect />`

- [ ] **Step 1: Crear DateStrip**

```tsx
// src/components/availability/DateStrip.tsx
import { useRef, useEffect } from 'react'
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
  const days = getNext14Days()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll selected day into view
  useEffect(() => {
    if (!selected || !scrollRef.current) return
    const idx = days.indexOf(selected)
    if (idx < 0) return
    const child = scrollRef.current.children[idx] as HTMLElement
    child?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [selected])

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
```

- [ ] **Step 2: Verificar tipos**

```bash
cd ~/OficiosYa/oficioYa && npx tsc --noEmit 2>&1
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
cd ~/OficiosYa/oficioYa
git add src/components/availability/DateStrip.tsx
git commit -m "feat: agregar DateStrip con 14 días scrollable"
```

---

## Task 4: BlockSlotSheet + VacationSheet

**Files:**
- Create: `src/components/availability/BlockSlotSheet.tsx`
- Create: `src/components/availability/VacationSheet.tsx`

**Interfaces:**
- Consumes: `useAvailabilityStore.addBlockedSlot`, `addVacation`
- Produces:
  - `<BlockSlotSheet proId open onClose />`
  - `<VacationSheet proId open onClose />`

- [ ] **Step 1: Crear helper TIME_OPTIONS compartido**

Añadir al tope de `BlockSlotSheet.tsx` (también se usa en `ProAvailability`):

```typescript
// Genera '00:00', '00:30', '01:00' ... '23:30'
export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0')
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})
```

- [ ] **Step 2: Crear BlockSlotSheet**

```tsx
// src/components/availability/BlockSlotSheet.tsx
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAvailabilityStore } from '../../store/availabilityStore'

export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0')
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})

const INPUT: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1.5px solid #E8E0D4',
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 14,
  color: '#111111',
  width: '100%',
  outline: 'none',
}

interface Props {
  proId: string
  open: boolean
  onClose: () => void
}

export function BlockSlotSheet({ proId, open, onClose }: Props) {
  const addBlockedSlot = useAvailabilityStore((s) => s.addBlockedSlot)
  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [fromTime, setFromTime] = useState('09:00')
  const [toTime, setToTime] = useState('10:00')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  function handleSave() {
    if (!date) { setError('Seleccioná una fecha'); return }
    if (fromTime >= toTime) { setError('La hora de inicio debe ser antes del fin'); return }
    setError('')
    addBlockedSlot({ proId, date, fromTime, toTime, reason: reason.trim() || undefined })
    setDate(today)
    setFromTime('09:00')
    setToTime('10:00')
    setReason('')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,.5)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
            style={{ background: '#FFFFFF', maxWidth: 480, margin: '0 auto', padding: '20px 16px 32px' }}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-base font-black" style={{ color: '#111111' }}>
                ➕ Bloquear horario
              </p>
              <button
                type="button" onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#F5F0E8', color: '#555', fontWeight: 900, fontSize: 16 }}
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: '#AAAAAA' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  style={INPUT}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: '#AAAAAA' }}>
                    Desde
                  </label>
                  <select value={fromTime} onChange={(e) => setFromTime(e.target.value)} style={INPUT}>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: '#AAAAAA' }}>
                    Hasta
                  </label>
                  <select value={toTime} onChange={(e) => setToTime(e.target.value)} style={INPUT}>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: '#AAAAAA' }}>
                  Motivo (opcional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Trabajo externo, dentista..."
                  style={INPUT}
                />
              </div>

              {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}

              <button
                type="button" onClick={handleSave}
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-white mt-1"
                style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
              >
                Guardar bloqueo
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Crear VacationSheet**

```tsx
// src/components/availability/VacationSheet.tsx
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAvailabilityStore } from '../../store/availabilityStore'

const INPUT: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1.5px solid #E8E0D4',
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 14,
  color: '#111111',
  width: '100%',
  outline: 'none',
}

interface Props {
  proId: string
  open: boolean
  onClose: () => void
}

export function VacationSheet({ proId, open, onClose }: Props) {
  const addVacation = useAvailabilityStore((s) => s.addVacation)
  const today = new Date().toISOString().split('T')[0]

  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [error, setError] = useState('')

  function handleSave() {
    if (!fromDate || !toDate) { setError('Completá ambas fechas'); return }
    if (fromDate > toDate) { setError('La fecha de inicio debe ser antes del fin'); return }
    setError('')
    addVacation({ proId, fromDate, toDate })
    setFromDate(today)
    setToDate(today)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,.5)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
            style={{ background: '#FFFFFF', maxWidth: 480, margin: '0 auto', padding: '20px 16px 32px' }}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-base font-black" style={{ color: '#111111' }}>
                🏖️ Agregar período
              </p>
              <button
                type="button" onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: '#F5F0E8', color: '#555', fontWeight: 900, fontSize: 16 }}
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: '#AAAAAA' }}>
                    Desde
                  </label>
                  <input
                    type="date" value={fromDate} min={today}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={INPUT}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider mb-1 block" style={{ color: '#AAAAAA' }}>
                    Hasta
                  </label>
                  <input
                    type="date" value={toDate} min={fromDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={INPUT}
                  />
                </div>
              </div>

              {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}

              <button
                type="button" onClick={handleSave}
                className="w-full rounded-2xl py-3.5 text-sm font-bold text-white mt-1"
                style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
              >
                Guardar período
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 4: Verificar tipos**

```bash
cd ~/OficiosYa/oficioYa && npx tsc --noEmit 2>&1
```

Esperado: sin errores.

- [ ] **Step 5: Commit**

```bash
cd ~/OficiosYa/oficioYa
git add src/components/availability/BlockSlotSheet.tsx src/components/availability/VacationSheet.tsx
git commit -m "feat: agregar BlockSlotSheet y VacationSheet"
```

---

## Task 5: ProAvailability page + nav + ruta

**Files:**
- Create: `src/pages/pro/ProAvailability.tsx`
- Modify: `src/components/layout/ProBottomNav.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useAvailabilityStore`, `useAuthStore`, `DateStrip`, `TimeSlotGrid`, `BlockSlotSheet`, `VacationSheet`, `TIME_OPTIONS`
- Produces: Página accesible en `/pro/disponibilidad`

- [ ] **Step 1: Crear ProAvailability.tsx**

```tsx
// src/pages/pro/ProAvailability.tsx
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { DateStrip } from '../../components/availability/DateStrip'
import { TimeSlotGrid } from '../../components/availability/TimeSlotGrid'
import { BlockSlotSheet } from '../../components/availability/BlockSlotSheet'
import { VacationSheet } from '../../components/availability/VacationSheet'
import { TIME_OPTIONS } from '../../components/availability/BlockSlotSheet'
import { useAvailabilityStore, type DayOfWeek } from '../../store/availabilityStore'
import { useAuthStore } from '../../store/authStore'

const DAYS_CONFIG: { value: DayOfWeek; label: string }[] = [
  { value: 'lunes',     label: 'Lunes' },
  { value: 'martes',    label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves',    label: 'Jueves' },
  { value: 'viernes',   label: 'Viernes' },
  { value: 'sabado',    label: 'Sábado' },
  { value: 'domingo',   label: 'Domingo' },
]

const CARD: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1.5px solid #E8E0D4',
  borderRadius: 20,
  padding: '16px',
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.5,
  color: '#AAAAAA',
  textTransform: 'uppercase',
  marginBottom: 10,
}

export default function ProAvailability() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const proId = user?.id ?? '1'

  const { schedules, blockedSlots, vacations, setSchedule, removeBlockedSlot, removeVacation, getSlots } =
    useAvailabilityStore()

  const schedule = schedules[proId]

  // Local schedule editor state
  const [localDays, setLocalDays] = useState<DayOfWeek[]>(schedule?.days ?? [])
  const [fromHour, setFromHour] = useState(schedule?.fromHour ?? '08:00')
  const [toHour, setToHour] = useState(schedule?.toHour ?? '18:00')
  const [scheduleSaved, setScheduleSaved] = useState(false)

  // Preview state
  const today = new Date().toISOString().split('T')[0]
  const [previewDate, setPreviewDate] = useState<string | null>(today)
  const previewSlots = previewDate ? getSlots(proId, previewDate) : []

  // Sheet state
  const [blockOpen, setBlockOpen] = useState(false)
  const [vacOpen, setVacOpen] = useState(false)

  function toggleDay(d: DayOfWeek) {
    setLocalDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    )
    setScheduleSaved(false)
  }

  function handleSaveSchedule() {
    setSchedule(proId, { days: localDays, fromHour, toHour, intervalMin: 30 })
    setScheduleSaved(true)
    setTimeout(() => setScheduleSaved(false), 2000)
  }

  function formatVacation(from: string, to: string) {
    const fmt = (d: string) => {
      const [, m, day] = d.split('-')
      return `${day}/${m}`
    }
    return `${fmt(from)} → ${fmt(to)}`
  }

  const SELECT: React.CSSProperties = {
    background: '#F5F0E8',
    border: '1.5px solid #E8E0D4',
    borderRadius: 10,
    padding: '8px 10px',
    fontSize: 13,
    fontWeight: 700,
    color: '#111111',
    outline: 'none',
    flex: 1,
  }

  const proBlocks = blockedSlots.filter((b) => b.proId === proId)
  const proVacations = vacations.filter((v) => v.proId === proId)

  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50 flex items-center gap-3"
      style={{ background: '#F5F0E8', borderBottom: '1px solid #E8E0D4' }}
    >
      <button
        type="button" onClick={() => navigate(-1)}
        className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity"
      >
        <ChevronLeft size={24} style={{ color: '#111111' }} />
      </button>
      <div>
        <h1 className="text-xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          Mi Disponibilidad
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>
          Gestioná tu agenda
        </p>
      </div>
    </div>
  )

  return (
    <PageShell header={header} showBottomNav={false}>
      <div className="p-4 flex flex-col gap-5 pb-10">

        {/* ── Sección 1: Horario laboral ── */}
        <div>
          <p style={SECTION_LABEL}>Horario laboral</p>
          <div style={CARD}>
            {/* Días */}
            <p className="text-xs font-bold mb-2" style={{ color: '#555555' }}>Días que trabajás</p>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {DAYS_CONFIG.map(({ value, label }) => {
                const active = localDays.includes(value)
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDay(value)}
                    className="flex flex-col items-center py-2 rounded-xl transition-all active:scale-95"
                    style={{
                      background: active ? '#E8683A' : '#F5F0E8',
                      border: `1.5px solid ${active ? '#E8683A' : '#E8E0D4'}`,
                      color: active ? '#FFFFFF' : '#888888',
                    }}
                  >
                    <span style={{ fontSize: 9, fontWeight: 800 }}>
                      {label.slice(0, 3)}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Horario */}
            <p className="text-xs font-bold mb-2" style={{ color: '#555555' }}>Horario</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs" style={{ color: '#888' }}>Desde</span>
              <select value={fromHour} onChange={(e) => { setFromHour(e.target.value); setScheduleSaved(false) }} style={SELECT}>
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className="text-xs" style={{ color: '#888' }}>Hasta</span>
              <select value={toHour} onChange={(e) => { setToHour(e.target.value); setScheduleSaved(false) }} style={SELECT}>
                {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <button
              type="button" onClick={handleSaveSchedule}
              className="w-full rounded-xl py-3 text-sm font-bold transition-all"
              style={{
                background: scheduleSaved ? '#16A34A' : '#E8683A',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(232,104,58,.25)',
              }}
            >
              {scheduleSaved ? '✓ Guardado' : 'Guardar horario'}
            </button>
          </div>
        </div>

        {/* ── Sección 2: Bloqueos manuales ── */}
        <div>
          <p style={SECTION_LABEL}>Bloqueos manuales</p>
          <button
            type="button" onClick={() => setBlockOpen(true)}
            className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 mb-3"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', color: '#555555' }}
          >
            ➕ Bloquear horario
          </button>

          {proBlocks.length > 0 && (
            <div className="flex flex-col gap-2">
              {proBlocks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ background: '#FFFFFF', border: '1px solid #EDE8DE' }}
                >
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#111111' }}>
                      {b.date} · {b.fromTime}–{b.toTime}
                    </p>
                    {b.reason && (
                      <p className="text-[10px]" style={{ color: '#AAAAAA' }}>{b.reason}</p>
                    )}
                  </div>
                  <button
                    type="button" onClick={() => removeBlockedSlot(b.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: '#FEF0EA', color: '#E8683A', fontWeight: 900, fontSize: 16 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sección 3: Vacaciones ── */}
        <div>
          <p style={SECTION_LABEL}>Vacaciones y días no laborables</p>
          <button
            type="button" onClick={() => setVacOpen(true)}
            className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 mb-3"
            style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4', color: '#555555' }}
          >
            🏖️ Agregar período
          </button>

          {proVacations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {proVacations.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{ background: '#FEF0EA', border: '1px solid #FDDCC8' }}
                >
                  <span className="text-xs font-bold" style={{ color: '#E8683A' }}>
                    {formatVacation(v.fromDate, v.toDate)}
                  </span>
                  <button
                    type="button" onClick={() => removeVacation(v.id)}
                    style={{ color: '#E8683A', fontWeight: 900, fontSize: 14, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sección 4: Preview del día ── */}
        <div>
          <p style={SECTION_LABEL}>Vista previa</p>
          <div style={CARD}>
            <p className="text-xs font-bold mb-3" style={{ color: '#555555' }}>
              Elegí un día para ver la disponibilidad
            </p>
            <DateStrip proId={proId} selected={previewDate} onSelect={setPreviewDate} />
            {previewDate && (
              <div className="mt-4">
                <div className="flex gap-3 text-[10px] font-bold mb-3">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)' }} />
                    Disponible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)' }} />
                    Ocupado
                  </span>
                </div>
                <TimeSlotGrid slots={previewSlots} selected={null} onSelect={() => {}} />
              </div>
            )}
          </div>
        </div>

      </div>

      <BlockSlotSheet proId={proId} open={blockOpen} onClose={() => setBlockOpen(false)} />
      <VacationSheet proId={proId} open={vacOpen} onClose={() => setVacOpen(false)} />
    </PageShell>
  )
}
```

- [ ] **Step 2: Modificar ProBottomNav — agregar tab "Agenda"**

Reemplazar el contenido completo de `src/components/layout/ProBottomNav.tsx`:

```tsx
// src/components/layout/ProBottomNav.tsx
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, UserCircle, Calendar } from 'lucide-react'
import { useProRequestsStore } from '../../store/proRequestsStore'

export function ProBottomNav() {
  const { pathname } = useLocation()
  const requests = useProRequestsStore((s) => s.requests)
  const pendingCount = requests.filter((r) => r.status === 'pending').length

  const TABS = [
    { label: 'Dashboard',   to: '/pro/dashboard',      icon: LayoutDashboard, badge: pendingCount > 0 ? pendingCount : null },
    { label: 'Solicitudes', to: '/pro/solicitudes',     icon: FileText, badge: null },
    { label: 'Agenda',      to: '/pro/disponibilidad',  icon: Calendar, badge: null },
    { label: 'Perfil',      to: '/pro/perfil',          icon: UserCircle, badge: null },
  ]

  function isActive(to: string) {
    return pathname.startsWith(to)
  }

  return (
    <nav
      className="fixed bottom-0 z-50 flex"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: '#FFFFFF',
        borderTop: '1px solid #E8E0D4',
        paddingBottom: 'var(--safe-bottom)',
        minHeight: 'calc(60px + var(--safe-bottom))',
      }}
    >
      {TABS.map(({ label, to, icon: Icon, badge }) => {
        const active = isActive(to)
        return (
          <Link
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-opacity active:opacity-60"
            style={{ color: active ? '#E8683A' : '#AAAAAA', paddingTop: 10, paddingBottom: 10 }}
            aria-current={active ? 'page' : undefined}
          >
            <div className="relative">
              <Icon size={20} />
              {badge !== null && (
                <span
                  className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-black text-white"
                  style={{ background: '#EF4444', fontSize: 9 }}
                >
                  {badge}
                </span>
              )}
            </div>
            <span style={{ fontWeight: 700, fontSize: 9 }}>{label}</span>
            {active && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                style={{ background: '#E8683A' }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 3: Modificar App.tsx — agregar import y ruta**

Agregar import lazy al bloque de imports existentes (buscar el bloque de `lazy(() => import`):

```tsx
const ProAvailability = lazy(() => import('./pages/pro/ProAvailability'))
```

Agregar ruta dentro del bloque `/pro/*` (junto a `dashboard`, `solicitudes`, `perfil`):

```tsx
<Route path="disponibilidad" element={<ProAvailability />} />
```

El bloque `/pro/*` completo quedará así:

```tsx
<Route
  path="/pro/*"
  element={
    <ProtectedRoute requiredRole="professional">
      <ProLayout>
        <Routes>
          <Route path="dashboard"    element={<ProDashboard />} />
          <Route path="solicitudes"  element={<ProRequests />} />
          <Route path="perfil"        element={<ProProfile />} />
          <Route path="perfil/editar" element={<ProProfileEdit />} />
          <Route path="trabajos"     element={<ProWorkHistory />} />
          <Route path="disponibilidad" element={<ProAvailability />} />
          <Route path="*"            element={<Navigate to="/pro/dashboard" replace />} />
        </Routes>
      </ProLayout>
    </ProtectedRoute>
  }
/>
```

- [ ] **Step 4: Verificar tipos**

```bash
cd ~/OficiosYa/oficioYa && npx tsc --noEmit 2>&1
```

Esperado: sin errores.

- [ ] **Step 5: Commit**

```bash
cd ~/OficiosYa/oficioYa
git add src/pages/pro/ProAvailability.tsx src/components/layout/ProBottomNav.tsx src/App.tsx
git commit -m "feat: agregar página ProAvailability, tab Agenda en nav y ruta /pro/disponibilidad"
```

---

## Task 6: RequestWizard — paso 4 de fecha y horario

**Files:**
- Modify: `src/components/requests/RequestWizard.tsx`
- Modify: `src/pages/RequestService.tsx`

**Interfaces:**
- Consumes: `DateStrip`, `TimeSlotGrid`, `useAvailabilityStore.getSlots`
- Produces:
  - `WizardData` ampliado con `scheduled_date: string | null`, `scheduled_time: string | null`
  - Prop `proId: string` en `RequestWizard`

- [ ] **Step 1: Reemplazar RequestWizard.tsx completo**

```tsx
// src/components/requests/RequestWizard.tsx
import { useState } from 'react'
import { DateStrip } from '../availability/DateStrip'
import { TimeSlotGrid } from '../availability/TimeSlotGrid'
import { useAvailabilityStore } from '../../store/availabilityStore'
import type { WorkType } from '../../store/requestStore'

export interface WizardData {
  work_type: WorkType | null
  description: string
  urgent: boolean
  contact_phone: string
  scheduled_date: string | null
  scheduled_time: string | null
}

interface Props {
  onSubmit: (data: WizardData) => Promise<void>
  loading?: boolean
  step: number
  onStep: (n: number) => void
  proId: string
}

const WORK_TYPES: { value: WorkType; label: string; subtitle: string; emoji: string }[] = [
  { value: 'reparacion',    label: 'Reparación',    subtitle: 'Arreglar algo que se rompió',  emoji: '🔧' },
  { value: 'instalacion',   label: 'Instalación',   subtitle: 'Instalar algo nuevo',           emoji: '⚙️' },
  { value: 'mantenimiento', label: 'Mantenimiento', subtitle: 'Revisión o mantenimiento',      emoji: '🛠️' },
  { value: 'otro',          label: 'Otro',          subtitle: 'Cualquier otro trabajo',        emoji: '📋' },
]

const TOTAL_STEPS = 5

const INPUT_STYLE: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1.5px solid #E8E0D4',
  color: '#111111',
  borderRadius: 14,
  padding: '14px 16px',
  fontSize: 16,
  width: '100%',
  outline: 'none',
  resize: 'none',
  caretColor: '#E8683A',
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 py-3">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-300"
          style={{ background: i < step ? '#E8683A' : '#E8E0D4' }}
        />
      ))}
    </div>
  )
}

export function RequestWizard({ onSubmit, loading, step, onStep, proId }: Props) {
  const getSlots = useAvailabilityStore((s) => s.getSlots)

  const [data, setData] = useState<WizardData>({
    work_type: null,
    description: '',
    urgent: false,
    contact_phone: '',
    scheduled_date: null,
    scheduled_time: null,
  })
  const [descError, setDescError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const slots = data.scheduled_date ? getSlots(proId, data.scheduled_date) : []

  const canNext = (): boolean => {
    if (step === 1) return data.work_type !== null
    if (step === 2) return data.description.length >= 20
    if (step === 4) {
      // Optional: si no hay slots disponibles para ese pro, puede continuar sin seleccionar
      const hasAvailableSlots = slots.some((s) => s.status === 'available')
      if (!hasAvailableSlots) return true
      return data.scheduled_date !== null && data.scheduled_time !== null
    }
    return true
  }

  const handleNext = () => {
    if (step === 2 && data.description.length < 20) {
      setDescError('Describí el trabajo (mín. 20 caracteres)')
      return
    }
    setDescError('')
    onStep(Math.min(step + 1, TOTAL_STEPS))
  }

  const handleSubmit = async () => {
    if (data.contact_phone.length < 8) {
      setPhoneError('Ingresá tu teléfono de contacto')
      return
    }
    setPhoneError('')
    await onSubmit(data)
  }

  const stepTitles = [
    '¿Qué tipo de trabajo?',
    'Contanos qué necesitás',
    '¿Es urgente?',
    '¿Cuándo lo necesitás?',
    'Confirmá tu solicitud',
  ]

  return (
    <div className="flex flex-col gap-4">
      <ProgressBar step={step} />

      <div className="px-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#AAAAAA' }}>
          Paso {step} de {TOTAL_STEPS}
        </p>
        <h2 className="text-xl font-black" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          {stepTitles[step - 1]}
        </h2>
      </div>

      {/* Paso 1: Tipo de trabajo */}
      {step === 1 && (
        <div className="flex flex-col gap-3">
          {WORK_TYPES.map((w) => {
            const selected = data.work_type === w.value
            return (
              <button
                key={w.value}
                type="button"
                onClick={() => setData((d) => ({ ...d, work_type: w.value }))}
                className="w-full text-left rounded-2xl p-4 flex items-center gap-3 active:opacity-80 transition-all"
                style={{
                  background: selected ? '#FEF0EA' : '#FFFFFF',
                  border: `1.5px solid ${selected ? '#E8683A' : '#E8E0D4'}`,
                  boxShadow: selected ? '0 2px 8px rgba(232,104,58,.12)' : '0 1px 3px rgba(0,0,0,.04)',
                }}
              >
                <span className="text-2xl flex-shrink-0">{w.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold" style={{ color: '#111111' }}>{w.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#999999' }}>{w.subtitle}</div>
                </div>
                {selected && (
                  <span className="font-black text-lg flex-shrink-0" style={{ color: '#E8683A' }}>✓</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Paso 2: Descripción */}
      {step === 2 && (
        <div className="flex flex-col gap-2">
          <textarea
            value={data.description}
            onChange={(e) => { setData((d) => ({ ...d, description: e.target.value })); setDescError('') }}
            rows={5}
            placeholder="Ej: Se me rompió el caño bajo el lavatorio, hay agua en el piso..."
            style={{ ...INPUT_STYLE, paddingTop: 14, paddingBottom: 14 }}
            autoFocus
          />
          <div className="flex justify-between items-center">
            {descError
              ? <p className="text-xs" style={{ color: '#ef4444' }}>{descError}</p>
              : <span />
            }
            <p className="text-xs" style={{ color: data.description.length >= 20 ? '#16A34A' : '#AAAAAA' }}>
              {data.description.length}/20 mín.
            </p>
          </div>
        </div>
      )}

      {/* Paso 3: Urgencia */}
      {step === 3 && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            role="switch"
            aria-pressed={data.urgent}
            onClick={() => setData((d) => ({ ...d, urgent: !d.urgent }))}
            className="w-full text-left rounded-2xl p-4 flex items-center gap-3 active:opacity-80 transition-all"
            style={{
              background: data.urgent ? '#FFF5F5' : '#FFFFFF',
              border: `2px solid ${data.urgent ? '#EF4444' : '#E8E0D4'}`,
              boxShadow: data.urgent ? '0 2px 12px rgba(239,68,68,.1)' : '0 1px 3px rgba(0,0,0,.04)',
            }}
          >
            <span className="text-3xl flex-shrink-0">🚨</span>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold" style={{ color: data.urgent ? '#DC2626' : '#111111' }}>
                Es urgente
              </div>
            </div>
            <div
              className="flex-shrink-0 transition-all duration-200"
              style={{ width: 44, height: 24, borderRadius: 12, background: data.urgent ? '#EF4444' : '#E8E0D4', position: 'relative' }}
            >
              <div
                className="absolute top-1 transition-all duration-200"
                style={{ width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF', left: data.urgent ? 24 : 4, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}
              />
            </div>
          </button>
        </div>
      )}

      {/* Paso 4: Fecha y horario */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: '#555555' }}>
            Seleccioná el día y horario más conveniente para vos
          </p>

          <DateStrip
            proId={proId}
            selected={data.scheduled_date}
            onSelect={(date) => setData((d) => ({ ...d, scheduled_date: date, scheduled_time: null }))}
          />

          {data.scheduled_date ? (
            <div>
              <div className="flex gap-3 text-[10px] font-bold mb-3" style={{ color: '#888' }}>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)' }} />
                  Disponible
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'linear-gradient(135deg,#DC2626,#B91C1C)' }} />
                  Ocupado
                </span>
              </div>
              <TimeSlotGrid
                slots={slots}
                selected={data.scheduled_time}
                onSelect={(time) => setData((d) => ({ ...d, scheduled_time: time }))}
              />
            </div>
          ) : (
            <p className="text-sm text-center py-4" style={{ color: '#AAAAAA' }}>
              Seleccioná un día para ver los horarios disponibles
            </p>
          )}
        </div>
      )}

      {/* Paso 5: Confirmación */}
      {step === 5 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #E8E0D4' }}>
            {[
              { label: 'Tipo',        value: WORK_TYPES.find((w) => w.value === data.work_type)?.label ?? '' },
              { label: 'Descripción', value: data.description },
              { label: 'Urgencia',    value: data.urgent ? '🚨 Urgente' : 'Pedido normal' },
              {
                label: 'Horario',
                value: data.scheduled_date && data.scheduled_time
                  ? `📅 ${data.scheduled_date} · ${data.scheduled_time}hs`
                  : 'A coordinar por chat',
              },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className="flex gap-3 px-4 py-3"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid #E8E0D4' : undefined, background: '#FFFFFF' }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-wider flex-shrink-0 pt-0.5"
                  style={{ color: '#AAAAAA', width: 80 }}
                >
                  {item.label}
                </span>
                <span className="text-sm font-semibold flex-1" style={{ color: '#111111' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
              Teléfono de contacto
            </label>
            <input
              type="tel"
              value={data.contact_phone}
              onChange={(e) => { setData((d) => ({ ...d, contact_phone: e.target.value })); setPhoneError('') }}
              placeholder="Ej: 099 123 456"
              style={INPUT_STYLE}
            />
            {phoneError && <p className="text-xs" style={{ color: '#ef4444' }}>{phoneError}</p>}
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="flex gap-3 pt-2">
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext()}
            className="flex-1 rounded-2xl py-3.5 text-base font-bold text-white active:opacity-80 disabled:opacity-40 transition-opacity"
            style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-2xl py-3.5 text-base font-bold text-white active:opacity-80 disabled:opacity-50 transition-opacity"
            style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Enviando...
              </span>
            ) : 'Enviar solicitud'}
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Modificar RequestService.tsx — pasar proId al wizard**

Localizar la línea:
```tsx
<RequestWizard onSubmit={handleSubmit} loading={loading} step={wizardStep} onStep={setWizardStep} />
```

Reemplazar por:
```tsx
<RequestWizard onSubmit={handleSubmit} loading={loading} step={wizardStep} onStep={setWizardStep} proId={id ?? ''} />
```

- [ ] **Step 3: Verificar tipos**

```bash
cd ~/OficiosYa/oficioYa && npx tsc --noEmit 2>&1
```

Esperado: sin errores.

- [ ] **Step 4: Commit**

```bash
cd ~/OficiosYa/oficioYa
git add src/components/requests/RequestWizard.tsx src/pages/RequestService.tsx
git commit -m "feat: agregar paso 4 de fecha y horario en RequestWizard"
```

---

## Task 7: Auto-booking al confirmar solicitud

**Files:**
- Modify: `src/store/requestStore.ts`

**Interfaces:**
- Consumes: `useAvailabilityStore.addBooking`, `WizardData.scheduled_date`, `WizardData.scheduled_time`
- Produces: booking creado automáticamente cuando `addRequest` recibe `scheduled_date` con hora

- [ ] **Step 1: Modificar addRequest en requestStore.ts**

Agregar import al tope del archivo (junto al import existente de `requestService`):

```typescript
import { useAvailabilityStore } from './availabilityStore'
```

Localizar la función `addRequest` en el store y reemplazarla:

```typescript
addRequest: async (req) => {
  const newReq = await requestService.create(req)
  set((s) => ({ requests: [newReq, ...s.requests] }))

  // Auto-bloquear slot si la solicitud tiene fecha y hora
  if (req.scheduled_date) {
    const parts = req.scheduled_date.split('T')
    const dateStr = parts[0]   // 'YYYY-MM-DD'
    const timeStr = parts[1]   // 'HH:MM:SS' or undefined
    if (timeStr) {
      const fromTime = timeStr.slice(0, 5)  // 'HH:MM'
      const [hh, mm] = fromTime.split(':').map(Number)
      const toMin = hh * 60 + mm + 60       // +60 min de duración
      const toTime = `${Math.floor(toMin / 60).toString().padStart(2, '0')}:${(toMin % 60).toString().padStart(2, '0')}`
      useAvailabilityStore.getState().addBooking({
        proId: req.professional_id,
        requestId: newReq.id,
        date: dateStr,
        fromTime,
        toTime,
      })
    }
  }

  return newReq
},
```

- [ ] **Step 2: Actualizar handleSubmit en RequestService.tsx**

Localizar `handleSubmit` y reemplazar para combinar fecha+hora en `scheduled_date`:

```typescript
const handleSubmit = async (data: WizardData) => {
  if (!professional) return
  setLoading(true)
  try {
    const scheduledDate =
      data.scheduled_date && data.scheduled_time
        ? `${data.scheduled_date}T${data.scheduled_time}:00`
        : data.scheduled_date ?? undefined

    await addRequest({
      professional_id: professional.id,
      category: professional.categories[0] ?? '',
      description: data.description,
      urgency: data.urgent,
      contact_phone: data.contact_phone,
      work_type: data.work_type || undefined,
      scheduled_date: scheduledDate,
    })
    setSent(true)
  } finally {
    setLoading(false)
  }
}
```

- [ ] **Step 3: Verificar tipos**

```bash
cd ~/OficiosYa/oficioYa && npx tsc --noEmit 2>&1
```

Esperado: sin errores.

- [ ] **Step 4: Commit final**

```bash
cd ~/OficiosYa/oficioYa
git add src/store/requestStore.ts src/pages/RequestService.tsx
git commit -m "feat: auto-booking en availabilityStore al confirmar solicitud"
```

---

## Self-Review

**Spec coverage:**
- ✅ Selector de fecha tipo strip (DateStrip)
- ✅ Píldoras de horario con estados verde/rojo (TimeSlotPill + TimeSlotGrid)
- ✅ Intervalo configurable (`intervalMin` en WorkingSchedule)
- ✅ Horario laboral por pro (WorkingSchedule en store)
- ✅ Bloqueo manual (BlockSlotSheet → addBlockedSlot)
- ✅ Vacaciones (VacationSheet → addVacation)
- ✅ Auto-booking al confirmar solicitud (Task 7)
- ✅ Página "Mi Disponibilidad" con 4 secciones (ProAvailability)
- ✅ Tab "Agenda" en ProBottomNav
- ✅ Paso 4 en RequestWizard (Fecha y horario)
- ⬜ Estado "pendiente" (amarillo) en píldoras — los mocks no generan solicitudes pending con slot, pero la infraestructura de `SlotStatus` soporta expandirlo fácilmente en el futuro

**Placeholder scan:** ninguno encontrado.

**Type consistency:**
- `getSlots(proId, date)` definido en Task 1, consumido en Tasks 5 y 6 ✅
- `addBooking(Omit<Booking,'id'>)` definido en Task 1, llamado en Task 7 ✅
- `WizardData.scheduled_date / scheduled_time` definidos en Task 6, usados en Task 7 ✅
- `TimeSlot` y `SlotStatus` exportados desde `availabilityStore`, importados en Tasks 2 y 6 ✅
- `TIME_OPTIONS` exportado desde `BlockSlotSheet`, importado en `ProAvailability` ✅
