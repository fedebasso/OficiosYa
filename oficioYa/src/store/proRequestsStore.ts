import { create } from 'zustand'
import { getSupabase } from '../lib/supabase'
import { IS_DEMO_MODE } from '../lib/env'
import type { ServiceRequest } from './requestStore'

import { requestService, demoProfessionalId } from '../services/requestService'

interface ProRequestsStore {
  requests: ServiceRequest[]
  loading: boolean
  error: string | null
  loadedForId: string | null  // evita re-fetch si ya cargamos para este pro
  load: (professionalId: string) => Promise<void>
  updateStatus: (requestId: string, status: ServiceRequest['status']) => Promise<void>
}

export const useProRequestsStore = create<ProRequestsStore>((set) => ({
  requests: [],
  loading: false,
  error: null,
  loadedForId: null,

  load: async (professionalId: string) => {

    set({ loading: true, error: null })
    try {
      if (IS_DEMO_MODE) {
        const requests = (await requestService.getAll()).filter((r) =>
          demoProfessionalId(r.professional_id) === demoProfessionalId(professionalId))
        set({ requests, loading: false, loadedForId: professionalId })
      } else {
        const supabase = await getSupabase()
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
    await requestService.updateStatus(requestId, status)
    set((s) => ({ requests: s.requests.map((r) => r.id === requestId ? { ...r, status } : r) }))
  },
}))
