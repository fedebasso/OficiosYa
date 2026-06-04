import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { ServiceRequest } from '../store/requestStore'

// Solicitudes mock que simulan lo que le llegaría al profesional
const MOCK_INCOMING: ServiceRequest[] = [
  {
    id: '201',
    client_id: 'client-1',
    professional_id: 'mock-pro-1',
    category: 'electricista',
    description: 'Tengo un cortocircuito en el panel eléctrico de mi departamento. La luz del living no enciende.',
    urgency: true,
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    contact_phone: '099 555 123',
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
  },
]

const isPlaceholder = () =>
  (import.meta.env.VITE_SUPABASE_URL ?? '').includes('placeholder')

export function useIncomingRequests(professionalId: string) {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isPlaceholder()) {
        // In mock mode return all mock requests (professional_id may differ from real id)
        setRequests(MOCK_INCOMING)
      } else {
        const { data, error: err } = await supabase
          .from('requests')
          .select('*')
          .eq('professional_id', professionalId)
          .order('created_at', { ascending: false })
        if (err) throw err
        setRequests((data as ServiceRequest[]) ?? [])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionalId])

  const updateStatus = async (requestId: string, status: ServiceRequest['status']) => {
    if (isPlaceholder()) {
      setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)))
      return
    }
    await supabase.from('requests').update({ status }).eq('id', requestId)
    setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status } : r)))
  }

  return { requests, loading, error, refresh: load, updateStatus }
}
