import { create } from 'zustand'
import { requestService } from '../services/requestService'

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
