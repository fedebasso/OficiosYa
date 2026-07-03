import { create } from 'zustand'
import { registrationService } from '../services/registrationService'
import { IS_DEMO_MODE } from '../lib/env'
import type { RegistrationState } from '../types/registration'

const MOCK_PROFILE: RegistrationState = {
  registration_step: 10,
  registration_completed: true,
  verification_status: 'verified',
  quality_score: 85,
  avg_rating: 4.8,
  cedula: '1.234.567-8',
  birth_date: '1990-05-15',
  address: 'Av. Brasil 2340',
  department: 'Montevideo',
  city: 'Montevideo',
  trade: 'electricista',
  specialties: ['electricista', 'cerrajero'],
  years_experience: 8,
  work_mode: 'independiente',
  bio: 'Electricista matriculado con 8 años de experiencia en instalaciones residenciales y comerciales. Trabajo con presupuesto sin cargo.',
  coverage_departments: ['Pocitos', 'Malvín', 'Punta Carretas'],
  coverage_radius_km: 10,
  travels_anywhere: false,
  availability_days: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  availability_from: '08:00',
  availability_to: '18:00',
  emergency_24h: false,
  whatsapp: '59899555123',
  contact_email: 'carlos@demo.com',
}

interface ProfessionalStore {
  profile: RegistrationState | null
  loading: boolean
  error: string | null
  loadedForId: string | null
  availableNow: boolean
  setAvailableNow: (v: boolean) => void
  load: (proId: string) => Promise<void>
  save: (proId: string, data: Partial<RegistrationState>) => Promise<void>
  uploadAvatar: (proId: string, file: File) => Promise<string>
}

export const useProfessionalStore = create<ProfessionalStore>((set, get) => ({
  profile: null,
  loading: false,
  error: null,
  loadedForId: null,

  availableNow: (typeof localStorage !== 'undefined' ? localStorage.getItem('pro_available_now') : null) !== '0',
  setAvailableNow: (v: boolean) => {
    try { localStorage.setItem('pro_available_now', v ? '1' : '0') } catch { /* no-op */ }
    set({ availableNow: v })
  },

  load: async (proId: string) => {
    if (get().loadedForId === proId && get().profile) return
    set({ loading: true, error: null })
    try {
      if (IS_DEMO_MODE) {
        set({ profile: MOCK_PROFILE, loading: false, loadedForId: proId })
      } else {
        const profile = await registrationService.load(proId)
        set({ profile, loading: false, loadedForId: proId })
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error al cargar perfil', loading: false })
    }
  },

  save: async (proId: string, data: Partial<RegistrationState>) => {
    set({ loading: true, error: null })
    try {
      if (IS_DEMO_MODE) {
        set((s) => ({ profile: s.profile ? { ...s.profile, ...data } : null, loading: false }))
      } else {
        await registrationService.saveStep(proId, 0, data)
        set((s) => ({ profile: s.profile ? { ...s.profile, ...data } : null, loading: false }))
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Error al guardar', loading: false })
    }
  },

  uploadAvatar: async (proId: string, file: File) => {
    if (IS_DEMO_MODE) return URL.createObjectURL(file)
    return registrationService.uploadFile('pro-avatars', proId, file)
  },
}))
