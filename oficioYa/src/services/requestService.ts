import { getSupabase } from '../lib/supabase'
import { IS_DEMO_MODE } from '../lib/env'
import { authService } from './authService'
import { useAvailabilityStore } from '../store/availabilityStore'
import type { ServiceRequest } from '../store/requestStore'

// Datos iniciales de la demo; después se conservan en el navegador.
const initialRequests: ServiceRequest[] = [
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
const STORAGE_KEY = 'ofix_demo_requests_v1'

// The demo login and public profile represent the same professional.
export function demoProfessionalId(id: string): string {
  return id === 'mock-pro-1' ? '1' : id
}

function readRequests(): ServiceRequest[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    saveRequests(initialRequests)
    return initialRequests
  }
  try {
    const parsed: unknown = JSON.parse(stored)
    if (Array.isArray(parsed) && parsed.every((r) =>
      r && typeof r.id === 'string' && typeof r.professional_id === 'string' &&
      typeof r.status === 'string'
    )) return parsed as ServiceRequest[]
  } catch { /* Report damaged data without overwriting it. */ }
  throw new Error('No pudimos leer las solicitudes guardadas de la demo.')
}

function saveRequests(requests: ServiceRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
  } catch {
    throw new Error('No se pudo guardar la solicitud en este navegador. Liberá espacio y reintentá.')
  }
}

export const requestService = {
  async getAll(): Promise<ServiceRequest[]> {
    if (IS_DEMO_MODE) {
      const user = await authService.getSession()
      if (!user) return []
      return readRequests().filter((r) => user.role === 'professional'
        ? demoProfessionalId(r.professional_id) === demoProfessionalId(user.id)
        : r.client_id === user.id)
    }
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
      const user = await authService.getSession()
      if (!user || user.role !== 'client') throw new Error('Iniciá sesión como cliente para enviar la solicitud.')
      if (req.scheduled_date?.includes('T')) {
        const [date, time] = req.scheduled_date.split('T')
        const availability = useAvailabilityStore.getState()
        const proId = demoProfessionalId(req.professional_id)
        if (availability.schedules[proId] &&
          !availability.getSlots(proId, date).some((slot) =>
            slot.time === time.slice(0, 5) && slot.status === 'available')) {
          throw new Error('Ese horario ya no está disponible. Elegí otro antes de enviar.')
        }
        if (readRequests().some((r) =>
          demoProfessionalId(r.professional_id) === proId &&
          r.scheduled_date === req.scheduled_date &&
          r.status !== 'cancelled' && r.status !== 'completed')) {
          throw new Error('Ya existe una solicitud para ese horario. Elegí otro.')
        }
      }
      const newReq: ServiceRequest = {
        ...req,
        id: crypto.randomUUID(),
        client_id: user.id,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
      saveRequests([newReq, ...readRequests()])
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
      const requests = readRequests()
      if (!requests.some((r) => r.id === id)) throw new Error('La solicitud ya no está disponible.')
      saveRequests(requests.map((r) => r.id === id ? { ...r, status } : r))
      if (status === 'cancelled') useAvailabilityStore.getState().removeBooking(id)
      return
    }
    const supabase = await getSupabase()
    const { error } = await supabase.from('requests').update({ status }).eq('id', id)
    if (error) throw error
  },

  async submitReview(requestId: string, rating: number, comment: string): Promise<void> {
    if (IS_DEMO_MODE) {
      saveRequests(readRequests().map((r) => r.id === requestId ? { ...r, status: 'completed' } : r))
      return
    }
    const supabase = await getSupabase()
    const { error } = await supabase.from('reviews').insert({ request_id: requestId, rating, comment })
    if (error) throw error
  },
}
