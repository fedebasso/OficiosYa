import { useEffect } from 'react'
import { useProRequestsStore } from '../store/proRequestsStore'

export function useIncomingRequests(professionalId: string) {
  const requests = useProRequestsStore((s) => s.requests)
  const loading = useProRequestsStore((s) => s.loading)
  const error = useProRequestsStore((s) => s.error)
  const load = useProRequestsStore((s) => s.load)
  const updateStatus = useProRequestsStore((s) => s.updateStatus)

  useEffect(() => {
    if (professionalId) load(professionalId)
  }, [professionalId, load])

  const refresh = () => {
    // Fuerza re-fetch limpiando el caché
    useProRequestsStore.setState({ loadedForId: null })
    load(professionalId)
  }

  return { requests, loading, error, refresh, updateStatus }
}
