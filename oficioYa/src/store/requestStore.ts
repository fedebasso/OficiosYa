import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface ServiceRequest {
  id: string
  client_id: string | null
  professional_id: string
  category: string
  description: string
  urgency: boolean
  status: 'pending' | 'accepted' | 'completed' | 'rejected'
  created_at: string
  contact_phone?: string
}

interface RequestStore {
  requests: ServiceRequest[]
  loading: boolean
  error: string | null
  addRequest: (req: Omit<ServiceRequest, 'id' | 'client_id' | 'created_at' | 'status'>) => Promise<ServiceRequest>
  loadRequests: () => Promise<void>
}

// Mock storage para demo (cuando Supabase no está configurado)
let mockRequests: ServiceRequest[] = []
let mockIdCounter = 100

const isPlaceholder = () =>
  (import.meta.env.VITE_SUPABASE_URL ?? '').includes('placeholder')

export const useRequestStore = create<RequestStore>((set, _get) => ({
  requests: [],
  loading: false,
  error: null,

  addRequest: async (req) => {
    if (isPlaceholder()) {
      const newReq: ServiceRequest = {
        ...req,
        id: String(++mockIdCounter),
        client_id: null,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
      mockRequests = [...mockRequests, newReq]
      set({ requests: mockRequests })
      return newReq
    }
    const { data, error } = await supabase
      .from('requests')
      .insert({ ...req, status: 'pending' })
      .select()
      .single()
    if (error) throw error
    const newReq = data as ServiceRequest
    set((s) => ({ requests: [...s.requests, newReq] }))
    return newReq
  },

  loadRequests: async () => {
    set({ loading: true, error: null })
    try {
      if (isPlaceholder()) {
        set({ requests: mockRequests, loading: false })
        return
      }
      const { data, error } = await supabase.from('requests').select('*').order('created_at', { ascending: false })
      if (error) throw error
      set({ requests: (data as ServiceRequest[]) ?? [], loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error', loading: false })
    }
  },
}))
