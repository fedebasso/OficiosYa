import { supabase } from '../lib/supabase'
import { IS_DEMO_MODE } from '../lib/env'
import { MOCK_PROFESSIONALS } from '../data/mockProfessionals'
import type { ProfessionalWithProfile, WorkPhoto } from '../hooks/useProfessionals'

export const professionalService = {
  async getAll(categoria?: string): Promise<ProfessionalWithProfile[]> {
    if (IS_DEMO_MODE) {
      return categoria
        ? MOCK_PROFESSIONALS.filter((p) => p.categories.includes(categoria))
        : MOCK_PROFESSIONALS
    }
    let query = supabase.from('professionals').select('*, profiles(*)')
    if (categoria) query = query.contains('categories', [categoria])
    const { data, error } = await query
    if (error) throw error
    return (data as ProfessionalWithProfile[]) ?? []
  },

  async getById(id: string): Promise<ProfessionalWithProfile | null> {
    if (IS_DEMO_MODE) {
      return MOCK_PROFESSIONALS.find((p) => p.id === id) ?? null
    }
    const { data, error } = await supabase
      .from('professionals')
      .select('*, profiles(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as ProfessionalWithProfile
  },

  async getUrgent(): Promise<ProfessionalWithProfile[]> {
    if (IS_DEMO_MODE) {
      return MOCK_PROFESSIONALS.filter((p) => p.available_now)
    }
    const { data, error } = await supabase
      .from('professionals')
      .select('*, profiles(*)')
      .eq('available_now', true)
    if (error) throw error
    return (data as ProfessionalWithProfile[]) ?? []
  },

  async getPhotos(professionalId: string): Promise<WorkPhoto[]> {
    if (IS_DEMO_MODE) return []
    const { data, error } = await supabase
      .from('work_photos')
      .select('*')
      .eq('professional_id', professionalId)
      .order('uploaded_at', { ascending: false })
    if (error) throw error
    return (data as WorkPhoto[]) ?? []
  },
}
