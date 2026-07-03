export type VerificationStatus = 'pending' | 'verified' | 'rejected'
export type WorkMode = 'independiente' | 'empresa'
export type CertType = 'titulo' | 'certificado' | 'curso' | 'carnet'
export type PhotoType = 'before' | 'after' | 'general'

export interface RegistrationState {
  registration_step: number
  registration_completed: boolean
  verification_status: VerificationStatus
  quality_score: number
  avg_rating?: number
  // Paso 1
  cedula: string | null
  birth_date: string | null
  address: string | null
  department: string | null
  city: string | null
  // Paso 2
  trade: string | null
  specialties: string[]
  // Paso 3
  years_experience: number | null
  work_mode: WorkMode | null
  bio: string | null
  // Paso 6
  coverage_departments: string[]
  coverage_radius_km: number | null
  travels_anywhere: boolean
  // Paso 7
  availability_days: string[]
  availability_from: string | null
  availability_to: string | null
  emergency_24h: boolean
  // Paso 8
  whatsapp: string | null
  contact_email: string | null
}

export interface WorkPhoto {
  url: string
  type: PhotoType
}

export interface PortfolioItem {
  id: string
  professional_id: string
  title: string
  description: string | null
  work_date: string | null
  category: string | null
  photo_urls: string[]       // legacy — mantener para no romper Step4Portfolio.tsx
  photos: WorkPhoto[]       // nuevo formato con tipo de foto
  location: string | null
  request_id: string | null
  is_featured: boolean
  created_at: string
}

export interface CertificationItem {
  id: string
  professional_id: string
  type: CertType
  title: string | null
  institution: string | null
  issue_date: string | null
  file_url: string | null
  ai_extracted_data: Record<string, unknown> | null
  verified: boolean
  created_at: string
}

export interface IdentityVerification {
  id: string
  professional_id: string
  cedula_front_url: string | null
  cedula_back_url: string | null
  selfie_url: string | null
  status: VerificationStatus
  admin_notes: string | null
  reviewed_at: string | null
  created_at: string
}

export const SCORE_WEIGHTS = {
  step1: 15,  // datos personales
  step2: 10,  // oficio + especialidades
  step3: 10,  // experiencia + bio
  step4: 20,  // portfolio mín 5 fotos
  step5: 10,  // al menos 1 certificación
  step6: 5,   // zona
  step7: 5,   // disponibilidad
  step8: 5,   // contacto
  step9: 20,  // verificación identidad
} as const
