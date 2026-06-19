import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { IS_DEMO_MODE } from '../lib/env'
import type { ServiceRequest } from './requestStore'

const MOCK_INCOMING: ServiceRequest[] = [
  {
    id: '201',
    client_id: 'client-1',
    professional_id: 'mock-pro-1',
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
    client_id: 'client-2',
    professional_id: 'mock-pro-1',
    category: 'electricista',
    description: 'Necesito instalar dos tomacorrientes nuevos en la cocina. La casa es de los 80s.',
    urgency: false,
    status: 'pending',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    contact_phone: '098 777 456',
    address: 'Bulevar Artigas 1560, Montevideo',
    scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const isPlaceholder = () => IS_DEMO_MODE

interface ProRequestsStore {
  requests: ServiceRequest[]
  loading: boolean
  error: string | null
  loadedForId: string | null  // evita re-fetch si ya cargamos para este pro
  load: (professionalId: string) => Promise<void>
  updateStatus: (requestId: string, status: ServiceRequest['status']) => Promise<void>
}

export const useProRequestsStore = create<ProRequestsStore>((set, get) => ({
  requests: [],
  loading: false,
  error: null,
  loadedForId: null,

  load: async (professionalId: string) => {
    // Si ya tenemos datos para este pro, no re-fetcheamos
    if (get().loadedForId === professionalId && get().requests.length > 0) return

    set({ loading: true, error: null })
    try {
      if (isPlaceholder()) {
        set({ requests: MOCK_INCOMING, loading: false, loadedForId: professionalId })
      } else {
        const { data, error: err } = await supabase
          .from('requests')
          .select('*')
          .eq('professional_id', professionalId)
          .order('created_at', { ascending: false })
        if (err) throw err
        set({ requests: (data as ServiceRequest[]) ?? [], loading: false, loadedForId: professionalId })
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error al cargar solicitudes', loading: false })
    }
  },

  updateStatus: async (requestId: string, status: ServiceRequest['status']) => {
    if (!isPlaceholder()) {
      await supabase.from('requests').update({ status }).eq('id', requestId)
    }
    set((s) => ({ requests: s.requests.map((r) => r.id === requestId ? { ...r, status } : r) }))
  },
}))
