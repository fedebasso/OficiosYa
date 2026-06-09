import { useState, useEffect } from 'react'
import { professionalService } from '../services/professionalService'

export interface Profile {
  id: string
  role: 'client' | 'professional'
  full_name: string
  phone: string | null
  avatar_url: string | null
  city: string
  created_at: string
}

export interface Professional {
  id: string
  bio: string
  categories: string[]
  avg_rating: number | null
  verified: boolean
  whatsapp: string
  zone: string
  featured: boolean
  jobs_count: number
  response_time_min: number
  available_now: boolean
}

export interface WorkPhoto {
  id: string
  professional_id: string
  url: string
  caption: string
  uploaded_at: string
}

export interface ProfessionalWithProfile extends Professional {
  profiles: Profile
}

export function useProfessionals(categoria?: string) {
  const [professionals, setProfessionals] = useState<ProfessionalWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await professionalService.getAll(categoria)
      setProfessionals(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar profesionales')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [categoria])

  return { professionals, loading, error, refresh: load }
}

export function useProfessionalById(id: string) {
  const [professional, setProfessional] = useState<ProfessionalWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        setProfessional(await professionalService.getById(id))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar profesional')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  return { professional, loading, error }
}

export function useProfessionalPhotos(professionalId: string) {
  const [photos, setPhotos] = useState<WorkPhoto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!professionalId) return
    setLoading(true)
    professionalService.getPhotos(professionalId)
      .then(setPhotos)
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false))
  }, [professionalId])

  return { photos, loading }
}

export function useUrgentProfessionals() {
  const [professionals, setProfessionals] = useState<ProfessionalWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        setProfessionals(await professionalService.getUrgent())
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar urgencias')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { professionals, loading, error }
}
