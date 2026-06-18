import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { registrationService } from '../services/registrationService'
import { supabase } from '../lib/supabase'
import type { RegistrationState } from '../types/registration'

export function useRegistration() {
  const user = useAuthStore((s) => s.user)
  const [state, setState] = useState<RegistrationState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    registrationService.load(user.id)
      .then(setState)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar registro'))
      .finally(() => setLoading(false))
  }, [user?.id])

  const saveStep = useCallback(async (step: number, data: Partial<RegistrationState>) => {
    if (!user?.id) return
    setLoading(true)
    try {
      const { quality_score } = await registrationService.saveStep(user.id, step, data)
      setState((prev) => prev ? { ...prev, ...data, quality_score, registration_step: Math.max(prev.registration_step, step + 1) } : prev)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
      throw e
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const goBack = useCallback(async () => {
    if (!user?.id || !state || state.registration_step <= 1) return
    const prevStep = state.registration_step - 1
    await supabase.from('professionals').update({ registration_step: prevStep }).eq('id', user.id)
    setState((prev) => prev ? { ...prev, registration_step: prevStep } : prev)
  }, [user?.id, state?.registration_step])

  return { state, loading, error, saveStep, goBack }
}
