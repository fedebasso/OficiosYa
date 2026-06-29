import { useEffect, useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useNotificationStore } from './store/notificationStore'
import { SplashScreen } from './components/SplashScreen'
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
import { AnimatedRoutes } from './components/layout/AnimatedRoutes'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppInner() {
  const initNotifications = useNotificationStore((s) => s.init)
  useEffect(() => { initNotifications() }, [initNotifications])
  return null
}

function App() {
  const user = useAuthStore((s) => s.user)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (user && !localStorage.getItem(`onboarding_done_${user.id}`)) {
      setShowOnboarding(true)
    }
  }, [user?.id])

  return (
    <BrowserRouter>
      <SplashScreen />
      {showOnboarding && user && (
        <OnboardingFlow
          role={user.role}
          userId={user.id}
          onDone={() => setShowOnboarding(false)}
        />
      )}
      <AppInner />
      <ScrollToTop />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
