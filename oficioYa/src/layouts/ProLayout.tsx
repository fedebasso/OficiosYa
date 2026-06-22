import { type ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProBottomNav } from '../components/layout/ProBottomNav'
import { useProfessionalStore } from '../store/professionalStore'
import { useAuthStore } from '../store/authStore'

export function ProLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { profile, load } = useProfessionalStore()

  useEffect(() => {
    if (user?.id) load(user.id)
  }, [user?.id, load])

  useEffect(() => {
    if (profile?.registration_completed === false) {
      navigate('/pro/onboarding', { replace: true })
    }
  }, [profile?.registration_completed, navigate])

  return (
    <>
      {children}
      <ProBottomNav />
    </>
  )
}
