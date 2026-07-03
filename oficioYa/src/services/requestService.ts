import { getSupabase } from '../lib/supabase'
import { IS_DEMO_MODE } from '../lib/env'
import type { ServiceRequest } from '../store/requestStore'

// Estado local para el modo demo (persiste durante la sesión)
let mockRequests: ServiceRequest[] = [
  {
    id: '201',
    client_id: 'mock-client-1',
    professional_id: '1',
    category: 'electricista',
    description: 'Tengo un cortocircuito en el panel eléctrico de mi departamento. La luz del living no enciende.',
    urgency: true,
    status: 'confirmed',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    contact_phone: '099 555 123',
    address: 'Av. Brasil 2340, Pocitos',
    scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '202',
    client_id: 'mock-client-1',
    professional_id: '2',
    category: 'sanitario',
    description: 'Pérdida de agua bajo el lavatorio del baño principal.',
    urgency: false,
    status: 'pending',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    contact_phone: '099 555 123',
    address: 'Av. Brasil 2340, Pocitos',
    scheduled_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
let mockIdCounter = 300

export const requestService = {
  async getAll(): Promise<ServiceRequest[]> {
    if (IS_DEMO_MODE) return mockRequests
    const supabase = await getSupabase()
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
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('requests')
      .insert({ ...req, status: 'pending' })
      .select()
      .single()
    if (error) throw error
    return data as ServiceRequest
  },

  async updateStatus(id: string, status: ServiceRequest['status']): Promise<void> {
    if (IS_DEMO_MODE) {
      mockRequests = mockRequests.map((r) => r.id === id ? { ...r, status } : r)
      return
    }
    const supabase = await getSupabase()
    const { error } = await supabase.from('requests').update({ status }).eq('id', id)
    if (error) throw error
  },

  async submitReview(requestId: string, rating: number, comment: string): Promise<void> {
    if (IS_DEMO_MODE) {
      mockRequests = mockRequests.map((r) => r.id === requestId ? { ...r, status: 'completed' } : r)
      return
    }
    const supabase = await getSupabase()
    const { error } = await supabase.from('reviews').insert({ request_id: requestId, rating, comment })
    if (error) throw error
  },
}
