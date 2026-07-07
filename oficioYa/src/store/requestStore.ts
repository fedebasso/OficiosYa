import { create } from 'zustand'
import { requestService } from '../services/requestService'
import { useAvailabilityStore } from './availabilityStore'
import { useNotificationStore } from './notificationStore'
import type { NotifPayload } from '../types/notifications'
import { MOCK_PROFESSIONALS } from '../data/mockProfessionals'

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
  final_amount?: number | null
  completed_at?: string | null
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

export const useRequestStore = create<RequestStore>((set, get) => ({
  requests: [],
  loading: false,
  error: null,

  addRequest: async (req) => {
    const newReq = await requestService.create(req)
    set((s) => ({ requests: [newReq, ...s.requests] }))

    // Notificar al profesional sobre la nueva solicitud
    const { category, location } = req
    const notifPayload: NotifPayload = {
      eventId: 'nueva_solicitud',
      title: 'Nueva solicitud 🔧',
      body: `Nueva solicitud de ${category}${location ? ` en ${location}` : ''}`,
      url: '/pro/solicitudes',
    }
    useNotificationStore.getState().sendLocalNotification(notifPayload)

    // Auto-bloquear slot si la solicitud tiene fecha y hora
    if (req.scheduled_date) {
      const parts = req.scheduled_date.split('T')
      const dateStr = parts[0]   // 'YYYY-MM-DD'
      const timeStr = parts[1]   // 'HH:MM:SS' or undefined
      if (timeStr) {
        const fromTime = timeStr.slice(0, 5)  // 'HH:MM'
        const [hh, mm] = fromTime.split(':').map(Number)
        const schedules = useAvailabilityStore.getState().schedules
        const proSchedule = schedules[req.professional_id]
        const durationMin = proSchedule?.serviceDurationMin ?? proSchedule?.intervalMin ?? 60
        const toMin = hh * 60 + mm + durationMin
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

    // Leer el request ANTES del set, con get()
    const currentReq = get().requests.find((r) => r.id === id)

    set((s) => ({ requests: s.requests.map((r) => r.id === id ? { ...r, status } : r) }))

    if (!currentReq) return

    const pro = MOCK_PROFESSIONALS.find((p) => p.id === currentReq.professional_id)
    const proName = pro?.profiles?.full_name ?? 'El profesional'

    if (status === 'confirmed') {
      useNotificationStore.getState().sendLocalNotification({
        eventId: 'solicitud_aceptada',
        title: 'Solicitud aceptada ✅',
        body: `${proName} aceptó tu solicitud`,
        url: '/mis-solicitudes',
      })
    }

    if (status === 'in_progress') {
      useNotificationStore.getState().sendLocalNotification({
        eventId: 'pro_en_camino',
        title: 'El pro está en camino 🚗',
        body: `${proName} está en camino a tu domicilio`,
        url: `/solicitud/${id}`,
      })
    }
  },

  submitReview: async (requestId, rating, comment) => {
    await requestService.submitReview(requestId, rating, comment)
  },
}))
