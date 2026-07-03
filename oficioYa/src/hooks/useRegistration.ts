import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { registrationService } from '../services/registrationService'
import { getSupabase } from '../lib/supabase'
import { IS_DEMO_MODE } from '../lib/env'
import type { RegistrationState } from '../types/registration'

export function useRegistration() {
  const user = useAuthStore((s) => s.user)
  const [state, setState] = useState<RegistrationState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    const run = async () => {
      setLoading(true)
      try {
        setState(await registrationService.load(user.id))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al cargar registro')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [user?.id])

  const saveStep = async (step: number, data: Partial<RegistrationState>) => {
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
  }

  const goBack = async () => {
    if (!user?.id || !state || state.registration_step <= 1) return
    const prevStep = state.registration_step - 1
    if (!IS_DEMO_MODE) {
      const supabase = await getSupabase()
      await supabase.from('professionals').update({ registration_step: prevStep }).eq('id', user.id)
    }
    setState((prev) => prev ? { ...prev, registration_step: prevStep } : prev)
  }

  return { state, loading, error, saveStep, goBack }
}
