import { getSupabase } from '../lib/supabase'
import { IS_DEMO_MODE } from '../lib/env'
import type {
  RegistrationState,
  PortfolioItem,
  CertificationItem,
  IdentityVerification,
} from '../types/registration'
import { SCORE_WEIGHTS as SW } from '../types/registration'

function calcScore(
  state: Partial<RegistrationState>,
  portfolioCount: number,
  certCount: number,
  identityDone: boolean
): number {
  let score = 0

  // Paso 1: todos los campos personales presentes
  if (state.cedula && state.birth_date && state.address && state.department && state.city)
    score += SW.step1

  // Paso 2: oficio + al menos 1 especialidad
  if (state.trade && state.specialties && state.specialties.length > 0)
    score += SW.step2

  // Paso 3: experiencia + bio mín 50 chars
  if (state.years_experience != null && state.work_mode && state.bio && state.bio.length >= 50)
    score += SW.step3

  // Paso 4: mínimo 5 fotos de trabajos
  if (portfolioCount >= 5)
    score += SW.step4

  // Paso 5: al menos 1 certificación
  if (certCount >= 1)
    score += SW.step5

  // Paso 6: al menos 1 departamento o travels_anywhere
  if ((state.coverage_departments && state.coverage_departments.length > 0) || state.travels_anywhere)
    score += SW.step6

  // Paso 7: días configurados
  if (
    state.availability_days &&
    state.availability_days.length > 0 &&
    state.availability_from &&
    state.availability_to
  )
    score += SW.step7

  // Paso 8: whatsapp o teléfono
  if (state.whatsapp || state.contact_email)
    score += SW.step8

  // Paso 9: fotos de cédula + selfie subidas
  if (identityDone)
    score += SW.step9

  return score
}

export const registrationService = {
  async load(proId: string): Promise<RegistrationState | null> {
    if (IS_DEMO_MODE) return null // demo: sin backend de registro
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', proId)
      .single()
    if (error || !data) return null
    return data as RegistrationState
  },

  async saveStep(
    proId: string,
    step: number,
    data: Partial<RegistrationState>
  ): Promise<{ quality_score: number }> {
    if (IS_DEMO_MODE) {
      // demo: calculamos el score con los datos ingresados, sin persistir
      return { quality_score: calcScore(data, 0, 0, false) }
    }
    const supabase = await getSupabase()
    const current = await this.load(proId)
    const merged = { ...current, ...data }

    const [portfolioRes, certRes, identityRes] = await Promise.all([
      supabase.from('work_portfolio').select('id').eq('professional_id', proId),
      supabase.from('certifications').select('id').eq('professional_id', proId),
      supabase
        .from('identity_verification')
        .select('cedula_front_url,cedula_back_url,selfie_url')
        .eq('professional_id', proId)
        .single(),
    ])

    const portfolioCount = portfolioRes.data?.length ?? 0
    const certCount = certRes.data?.length ?? 0
    const identity = identityRes.data
    const identityDone = !!(
      identity?.cedula_front_url &&
      identity?.cedula_back_url &&
      identity?.selfie_url
    )

    const quality_score = calcScore(merged, portfolioCount, certCount, identityDone)
    const nextStep = Math.max((current?.registration_step ?? 1), step + 1)

    await supabase
      .from('professionals')
      .update({ ...data, quality_score, registration_step: nextStep })
      .eq('id', proId)

    return { quality_score }
  },

  async submitForReview(proId: string): Promise<void> {
    if (IS_DEMO_MODE) return // demo: no hay revisión real
    const supabase = await getSupabase()
    await supabase
      .from('professionals')
      .update({ registration_completed: true, verification_status: 'pending' })
      .eq('id', proId)
  },

  async uploadFile(bucket: string, proId: string, file: File): Promise<string> {
    if (IS_DEMO_MODE) return URL.createObjectURL(file) // demo: preview local
    const supabase = await getSupabase()
    const ext = file.name.split('.').pop()
    const path = `${proId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },

  async uploadPrivateFile(bucket: string, proId: string, file: File): Promise<string> {
    if (IS_DEMO_MODE) return URL.createObjectURL(file) // demo: preview local
    const supabase = await getSupabase()
    const ext = file.name.split('.').pop()
    const path = `${proId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) throw error
    // Return the storage path, not a public URL — caller generates signed URLs on demand
    return path
  },

  async getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    if (IS_DEMO_MODE) return path // demo: el path ya es una URL/objeto local
    const supabase = await getSupabase()
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
    if (error) throw error
    return data.signedUrl
  },

  async getPortfolio(proId: string): Promise<PortfolioItem[]> {
    if (IS_DEMO_MODE) return [] // demo: sin portfolio persistido
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('work_portfolio')
      .select('*')
      .eq('professional_id', proId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as PortfolioItem[]) ?? []
  },

  async addPortfolioItem(
    proId: string,
    item: Omit<PortfolioItem, 'id' | 'professional_id' | 'created_at'>
  ): Promise<PortfolioItem> {
    if (IS_DEMO_MODE) {
      return { ...item, id: `demo-${Date.now()}`, professional_id: proId, created_at: new Date().toISOString() } as PortfolioItem
    }
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('work_portfolio')
      .insert({ ...item, professional_id: proId })
      .select()
      .single()
    if (error) throw error
    return data as PortfolioItem
  },

  async deletePortfolioItem(id: string): Promise<void> {
    if (IS_DEMO_MODE) return // demo: nada que borrar
    const supabase = await getSupabase()
    const { error } = await supabase.from('work_portfolio').delete().eq('id', id)
    if (error) throw error
  },

  async updatePortfolioItem(
    id: string,
    data: Partial<Omit<PortfolioItem, 'id' | 'professional_id' | 'created_at'>>
  ): Promise<PortfolioItem> {
    if (IS_DEMO_MODE) {
      return { ...data, id, professional_id: 'demo', created_at: new Date().toISOString() } as PortfolioItem
    }
    const supabase = await getSupabase()
    const { data: updated, error } = await supabase
      .from('work_portfolio')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return updated as PortfolioItem
  },

  async toggleFeatured(proId: string, itemId: string, featuredPhotoUrl: string): Promise<void> {
    if (IS_DEMO_MODE) return // demo: sin persistencia de destacado
    const supabase = await getSupabase()
    // 1. Limpiar is_featured de todos los trabajos del pro
    await supabase
      .from('work_portfolio')
      .update({ is_featured: false })
      .eq('professional_id', proId)

    // 2. Marcar el trabajo elegido como destacado
    await supabase
      .from('work_portfolio')
      .update({ is_featured: true })
      .eq('id', itemId)

    // 3. Actualizar featured_photo_url en professionals
    await supabase
      .from('professionals')
      .update({ featured_photo_url: featuredPhotoUrl })
      .eq('id', proId)
  },

  async getCertifications(proId: string): Promise<CertificationItem[]> {
    if (IS_DEMO_MODE) return [] // demo: sin certificaciones persistidas
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('professional_id', proId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as CertificationItem[]) ?? []
  },

  async addCertification(
    proId: string,
    item: Omit<
      CertificationItem,
      'id' | 'professional_id' | 'created_at' | 'verified' | 'ai_extracted_data'
    >
  ): Promise<CertificationItem> {
    if (IS_DEMO_MODE) {
      return { ...item, id: `demo-${Date.now()}`, professional_id: proId, created_at: new Date().toISOString(), verified: false, ai_extracted_data: null } as CertificationItem
    }
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('certifications')
      .insert({ ...item, professional_id: proId, verified: false, ai_extracted_data: null })
      .select()
      .single()
    if (error) throw error
    return data as CertificationItem
  },

  async getIdentity(proId: string): Promise<IdentityVerification | null> {
    if (IS_DEMO_MODE) return null // demo: sin verificación de identidad
    const supabase = await getSupabase()
    const { data } = await supabase
      .from('identity_verification')
      .select('*')
      .eq('professional_id', proId)
      .single()
    return (data as IdentityVerification) ?? null
  },

  async saveIdentity(proId: string, data: Partial<IdentityVerification>): Promise<void> {
    if (IS_DEMO_MODE) return // demo: sin persistencia de identidad
    const supabase = await getSupabase()
    await supabase
      .from('identity_verification')
      .upsert({ ...data, professional_id: proId }, { onConflict: 'professional_id' })
  },
}
