import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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

const MOCK_PROFESSIONALS: ProfessionalWithProfile[] = [
  {
    id: '1',
    bio: 'Electricista matriculado con 10 años de experiencia. Instalaciones residenciales y comerciales.',
    categories: ['electricista'],
    avg_rating: 4.8,
    verified: true,
    whatsapp: '598912345678',
    zone: 'Pocitos',
    featured: true,
    jobs_count: 127,
    response_time_min: 15,
    available_now: true,
    profiles: { id: '1', role: 'professional', full_name: 'Carlos Méndez', phone: '598912345678', avatar_url: null, city: 'Montevideo', created_at: '' },
  },
  {
    id: '2',
    bio: 'Sanitarista con experiencia en destapes, pérdidas y remodelaciones de baños.',
    categories: ['plomero'],
    avg_rating: 4.5,
    verified: true,
    whatsapp: '598923456789',
    zone: 'Malvín',
    featured: true,
    jobs_count: 83,
    response_time_min: 20,
    available_now: true,
    profiles: { id: '2', role: 'professional', full_name: 'Roberto Silva', phone: '598923456789', avatar_url: null, city: 'Montevideo', created_at: '' },
  },
  {
    id: '3',
    bio: 'Técnico en aire acondicionado, instalación y mantenimiento de equipos split.',
    categories: ['aire_acondicionado'],
    avg_rating: 4.2,
    verified: false,
    whatsapp: '598934567890',
    zone: 'Centro',
    featured: false,
    jobs_count: 41,
    response_time_min: 45,
    available_now: false,
    profiles: { id: '3', role: 'professional', full_name: 'Diego Fernández', phone: '598934567890', avatar_url: null, city: 'Montevideo', created_at: '' },
  },
  {
    id: '4',
    bio: 'Cerrajera con disponibilidad 24 horas. Apertura de puertas, cambio de cerraduras, duplicado de llaves.',
    categories: ['cerrajero'],
    avg_rating: 4.9,
    verified: true,
    whatsapp: '598945678901',
    zone: 'Centro',
    featured: true,
    jobs_count: 89,
    response_time_min: 10,
    available_now: true,
    profiles: { id: '4', role: 'professional', full_name: 'Ana Rodríguez', phone: '598945678901', avatar_url: null, city: 'Montevideo', created_at: '' },
  },
  {
    id: '5',
    bio: 'Albañil con más de 15 años en obras civiles, reparaciones y remodelaciones.',
    categories: ['albanil'],
    avg_rating: 4.6,
    verified: true,
    whatsapp: '598956789012',
    zone: 'Punta Carretas',
    featured: false,
    jobs_count: 64,
    response_time_min: 30,
    available_now: false,
    profiles: { id: '5', role: 'professional', full_name: 'Pablo Torres', phone: '598956789012', avatar_url: null, city: 'Montevideo', created_at: '' },
  },
]

const isPlaceholderConfig = () =>
  import.meta.env.VITE_SUPABASE_URL?.includes('placeholder') ?? true

export function useProfessionals(categoria?: string) {
  const [professionals, setProfessionals] = useState<ProfessionalWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isPlaceholderConfig()) {
        const filtered = categoria
          ? MOCK_PROFESSIONALS.filter((p) => p.categories.includes(categoria))
          : MOCK_PROFESSIONALS
        setProfessionals(filtered)
      } else {
        let query = supabase.from('professionals').select('*, profiles(*)')
        if (categoria) query = query.contains('categories', [categoria])
        const { data, error: err } = await query
        if (err) throw err
        setProfessionals((data as ProfessionalWithProfile[]) ?? [])
      }
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
        if (isPlaceholderConfig()) {
          const found = MOCK_PROFESSIONALS.find((p) => p.id === id) ?? null
          setProfessional(found)
        } else {
          const { data, error: err } = await supabase
            .from('professionals')
            .select('*, profiles(*)')
            .eq('id', id)
            .single()
          if (err) throw err
          setProfessional(data as ProfessionalWithProfile)
        }
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

export function useUrgentProfessionals() {
  const [professionals, setProfessionals] = useState<ProfessionalWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        if (isPlaceholderConfig()) {
          const urgent = MOCK_PROFESSIONALS.filter((p) => p.available_now)
          setProfessionals(urgent)
        } else {
          const { data, error: err } = await supabase
            .from('professionals')
            .select('*, profiles(*)')
            .eq('available_now', true)
          if (err) throw err
          setProfessionals((data as ProfessionalWithProfile[]) ?? [])
        }
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
