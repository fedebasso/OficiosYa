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
    profiles: { id: '3', role: 'professional', full_name: 'Diego Fernández', phone: '598934567890', avatar_url: null, city: 'Montevideo', created_at: '' },
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
