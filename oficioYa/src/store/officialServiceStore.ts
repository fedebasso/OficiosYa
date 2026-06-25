import { create } from 'zustand'
import type { OfficialService, ServiceSlot, PendingBooking, ServicePlan } from '../types/officialServices'
import { MOCK_SERVICES, generateMockSlots } from '../data/officialServicesMock'

interface Filters {
  category?: string
  brand?: string
  zone?: string
}

interface OfficialServiceState {
  services: OfficialService[]
  slots: Record<string, ServiceSlot[]>   // key: `${serviceId}_${date}`
  pendingBooking: PendingBooking | null
  loading: boolean
  error: string | null
  // acciones
  fetchServices: (filters?: Filters) => Promise<void>
  fetchSlots: (serviceId: string, dates: string[]) => Promise<void>
  getSlotsForDate: (serviceId: string, date: string) => ServiceSlot[]
  isDateAvailable: (serviceId: string, date: string) => boolean
  getNextSlots: (serviceId: string, count?: number) => ServiceSlot[]
  confirmBooking: (serviceId: string, date: string, time: string) => void
  clearPendingBooking: () => void
}

const PLAN_ORDER: Record<ServicePlan, number> = { destacado: 0, agenda: 1, presencia: 2 }

function sortServices(services: OfficialService[]): OfficialService[] {
  return [...services].sort((a, b) => {
    const planDiff = PLAN_ORDER[a.plan] - PLAN_ORDER[b.plan]
    if (planDiff !== 0) return planDiff
    return a.company_name.localeCompare(b.company_name)
  })
}

function getNext14Dates(): string[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export const useOfficialServiceStore = create<OfficialServiceState>((set, get) => ({
  services: [],
  slots: {},
  pendingBooking: null,
  loading: false,
  error: null,

  fetchServices: async (filters) => {
    set({ loading: true, error: null })
    // MVP: mock data — reemplazar cuerpo aquí para integración real
    await new Promise((r) => setTimeout(r, 200))  // simula latencia
    let results = MOCK_SERVICES.filter((s) => s.active)
    if (filters?.category) results = results.filter((s) => s.categories.includes(filters.category!))
    if (filters?.brand) results = results.filter((s) => s.brands.some((b) => b.toLowerCase().includes(filters.brand!.toLowerCase())))
    if (filters?.zone) results = results.filter((s) => s.zones.includes(filters.zone!))
    set({ services: sortServices(results), loading: false })
  },

  fetchSlots: async (serviceId, dates) => {
    // MVP: mock data — reemplazar cuerpo aquí según integration_type para integración real
    const service = MOCK_SERVICES.find((s) => s.id === serviceId)
    if (!service || service.plan === 'presencia') return
    const newSlots = generateMockSlots(serviceId, dates)
    const slotMap: Record<string, ServiceSlot[]> = {}
    for (const slot of newSlots) {
      const key = `${serviceId}_${slot.date}`
      if (!slotMap[key]) slotMap[key] = []
      slotMap[key].push(slot)
    }
    set((state) => ({ slots: { ...state.slots, ...slotMap } }))
  },

  getSlotsForDate: (serviceId, date) => {
    return get().slots[`${serviceId}_${date}`] ?? []
  },

  isDateAvailable: (serviceId, date) => {
    const slots = get().slots[`${serviceId}_${date}`] ?? []
    return slots.some((s) => s.available)
  },

  getNextSlots: (serviceId, count = 2) => {
    const dates = getNext14Dates()
    const all: ServiceSlot[] = []
    for (const date of dates) {
      const daySlots = get().slots[`${serviceId}_${date}`] ?? []
      all.push(...daySlots.filter((s) => s.available))
      if (all.length >= count) break
    }
    return all.slice(0, count)
  },

  confirmBooking: (serviceId, date, time) => {
    const booking: PendingBooking = { serviceId, date, time, createdAt: new Date().toISOString() }
    // Persiste para fase 2 (oficial_bookings en Supabase)
    try { localStorage.setItem('ofix_pending_booking', JSON.stringify(booking)) } catch {}
    set({ pendingBooking: booking })
  },

  clearPendingBooking: () => {
    try { localStorage.removeItem('ofix_pending_booking') } catch {}
    set({ pendingBooking: null })
  },
}))
