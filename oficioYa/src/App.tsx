import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useNotificationStore } from './store/notificationStore'
import { PageSkeleton } from './components/layout/PageSkeleton'
// Eager: el router siempre se necesita en el primer render; importarlo directo
// evita un hop extra en el waterfall (index → AnimatedRoutes → página).
import { AnimatedRoutes } from './components/layout/AnimatedRoutes'

// Lazy: sólo se descarga cuando hay onboarding para mostrar (arrastra framer-motion,
// fuera del bundle inicial).
const OnboardingFlow = lazy(() =>
  import('./components/onboarding/OnboardingFlow').then((m) => ({ default: m.OnboardingFlow }))
)

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
  const [onboardingDismissed, setOnboardingDismissed] = useState(false)

  const showOnboarding =
    !!user &&
    !onboardingDismissed &&
    !localStorage.getItem(`onboarding_done_${user.id}`)

  return (
    <BrowserRouter>
      {showOnboarding && user && (
        <Suspense fallback={null}>
          <OnboardingFlow
            role={user.role}
            userId={user.id}
            onDone={() => setOnboardingDismissed(true)}
          />
        </Suspense>
      )}
      <AppInner />
      <ScrollToTop />
      <Suspense fallback={<PageSkeleton />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  )
}

export default App
