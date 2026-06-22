import { create } from 'zustand'
import { requestService } from '../services/requestService'
import { useAvailabilityStore } from './availabilityStore'

export type WorkType = 'reparacion' | 'instalacion' | 'mantenimiento' | 'otro'
export type UrgencyLevel = 'ahora' | 'hoy' | 'esta_semana' | 'sin_apuro'
export type RequestType = 'presupuesto' | 'visita'

export interface ServiceRequest {
  id: string
  client_id: string | null
  professional_id: string
  category: string
  description: string
  urgency: boolean
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  contact_phone?: string
  work_type?: WorkType
  urgency_level?: UrgencyLevel
  request_type?: RequestType
  location?: string
  address?: string
  scheduled_date?: string
}

interface RequestStore {
  requests: ServiceRequest[]
  loading: boolean
  error: string | null
  addRequest: (req: Omit<ServiceRequest, 'id' | 'client_id' | 'created_at' | 'status'>) => Promise<ServiceRequest>
  loadRequests: () => Promise<void>
  updateStatus: (id: string, status: ServiceRequest['status']) => Promise<void>
  submitReview: (requestId: string, rating: number, comment: string) => Promise<void>
}

export const useRequestStore = create<RequestStore>((set) => ({
  requests: [],
  loading: false,
  error: null,

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

  loadRequests: async () => {
    set({ loading: true, error: null })
    try {
      set({ requests: await requestService.getAll(), loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error', loading: false })
    }
  },

  updateStatus: async (id, status) => {
    await requestService.updateStatus(id, status)
    set((s) => ({ requests: s.requests.map((r) => r.id === id ? { ...r, status } : r) }))
  },

  submitReview: async (requestId, rating, comment) => {
    await requestService.submitReview(requestId, rating, comment)
  },
}))
