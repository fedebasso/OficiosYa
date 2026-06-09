import { supabase } from '../lib/supabase'
import { IS_DEMO_MODE } from '../lib/env'
import type { ServiceRequest } from '../store/requestStore'

// Estado local para el modo demo (persiste durante la sesión)
let mockRequests: ServiceRequest[] = []
let mockIdCounter = 100

export const requestService = {
  async getAll(): Promise<ServiceRequest[]> {
    if (IS_DEMO_MODE) return mockRequests
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as ServiceRequest[]) ?? []
  },

  async create(req: Omit<ServiceRequest, 'id' | 'client_id' | 'created_at' | 'status'>): Promise<ServiceRequest> {
    if (IS_DEMO_MODE) {
      const newReq: ServiceRequest = {
        ...req,
        id: String(++mockIdCounter),
        client_id: null,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
      mockRequests = [newReq, ...mockRequests]
      return newReq
    }
    const { data, error } = await supabase
      .from('requests')
      .insert({ ...req, status: 'pending' })
      .select()
      .single()
    if (error) throw error
    return data as ServiceRequest
  },
}
