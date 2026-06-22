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
  // Demo pro user (mock-pro-1 = Carlos Méndez)
  'mock-pro-1': {
    proId: 'mock-pro-1',
    days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
    fromHour: '08:00',
    toHour: '18:00',
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
