import { getSupabase } from '../lib/supabase'
import { IS_DEMO_MODE } from '../lib/env'

export interface Review {
  id: string
  created_at: string
  request_id: string
  client_id: string
  professional_id: string
  rating: number
  comment: string | null
  photo_url: string | null
  profiles?: { full_name: string; avatar_url: string | null }
}

export const reviewService = {
  async submit({
    requestId,
    clientId,
    professionalId,
    rating,
    comment,
    photoFile,
  }: {
    requestId: string
    clientId: string
    professionalId: string
    rating: number
    comment: string
    photoFile: File | null
  }): Promise<void> {
    if (IS_DEMO_MODE) return // demo: no persistimos reseñas
    const supabase = await getSupabase()
    let photo_url: string | null = null

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${professionalId}/${requestId}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('review-photos')
        .upload(path, photoFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from('review-photos').getPublicUrl(path)
        photo_url = data.publicUrl
      }
    }

    const { error } = await supabase.from('reviews').insert({
      request_id: requestId,
      client_id: clientId,
      professional_id: professionalId,
      rating,
      comment: comment.trim() || null,
      photo_url,
    })
    if (error) throw error

    await reviewService.refreshProfessionalRating(professionalId)
  },

  async fetchByProfessional(professionalId: string): Promise<Review[]> {
    if (IS_DEMO_MODE) return [] // demo: sin reseñas mock
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(full_name, avatar_url)')
      .eq('professional_id', professionalId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as Review[]
  },

  async refreshProfessionalRating(professionalId: string): Promise<void> {
    if (IS_DEMO_MODE) return // demo: no hay backend que recalcular
    const supabase = await getSupabase()
    // ⚠️ Antes de activar Supabase: verificar que `professionals.id` == `profiles.id`.
    // Si no lo son, este RPC no actualiza el rating. Ver
    // docs/superpowers/notes/2026-07-01-reviewService-id-mismatch.md
    await supabase.rpc('refresh_professional_rating', { pro_id: professionalId })
  },
}
