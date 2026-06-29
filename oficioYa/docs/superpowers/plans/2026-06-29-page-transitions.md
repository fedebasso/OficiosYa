# Page Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar transiciones de slide horizontal estilo iOS entre todas las páginas usando framer-motion y AnimatePresence, sin modificar cada página individualmente.

**Architecture:** Se crea un hook `useNavDirection` que detecta forward/back comparando `window.history.state?.idx`. Un componente `AnimatedRoutes` envuelve todas las rutas con `AnimatePresence mode="wait"` y un `motion.div` keyed por `location.key`. El bloque `<Routes>` en `App.tsx` se reemplaza por `<AnimatedRoutes />`.

**Tech Stack:** React Router v7 + framer-motion (ya instalado)

## Global Constraints

- No agregar dependencias nuevas — framer-motion ya instalado
- `AnimatePresence mode="wait"` — no `mode="sync"`
- Transition: `{ type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }`
- Forward: entrada desde `x: '100%'`, salida a `x: '-30%'`
- Back: entrada desde `x: '-30%'`, salida a `x: '100%'`
- El wrapper `motion.div` tiene `position: absolute, inset: 0, overflow: hidden` para no romper el layout
- Login y Register NO se excluyen — la animación se aplica a todas las rutas igual
- No tocar páginas individuales — el cambio es solo en App.tsx + 2 archivos nuevos

---

### Task 1: Crear useNavDirection hook y AnimatedRoutes

**Files:**
- Create: `src/hooks/useNavDirection.ts`
- Create: `src/components/layout/AnimatedRoutes.tsx`

**Interfaces:**
- Produces:
  ```ts
  // useNavDirection
  export function useNavDirection(): 'forward' | 'back'

  // AnimatedRoutes — contiene TODAS las rutas de App.tsx
  export function AnimatedRoutes(): JSX.Element
  ```

- [ ] **Step 1: Crear `src/hooks/useNavDirection.ts`**

```ts
import { useRef, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useNavDirection(): 'forward' | 'back' {
  const location = useLocation()
  const prevIdx = useRef<number>(window.history.state?.idx ?? 0)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  useEffect(() => {
    const currentIdx = window.history.state?.idx ?? 0
    setDirection(currentIdx >= prevIdx.current ? 'forward' : 'back')
    prevIdx.current = currentIdx
  }, [location.key])

  return direction
}
```

- [ ] **Step 2: Crear `src/components/layout/AnimatedRoutes.tsx`**

Este archivo contiene TODAS las rutas que actualmente están en `App.tsx` dentro del bloque `<Routes>...</Routes>`, envueltas en AnimatePresence. Copiar las rutas exactamente del App.tsx actual.

```tsx
import { useRef } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavDirection } from '../../hooks/useNavDirection'
import { FEATURES } from '../../lib/featureFlags'
import { ClientLayout } from '../../layouts/ClientLayout'
import { ProLayout } from '../../layouts/ProLayout'
import { useAuthStore } from '../../store/authStore'
import { lazy, Suspense, type ReactNode } from 'react'
import { PageSkeleton } from '../layout/PageSkeleton'

import Login from '../../pages/Login'
import Register from '../../pages/Register'
import NotFound from '../../pages/NotFound'

const Home               = lazy(() => import('../../pages/Home'))
const Search             = lazy(() => import('../../pages/Search'))
const ProfessionalDetail = lazy(() => import('../../pages/ProfessionalDetail'))
const RequestService     = lazy(() => import('../../pages/RequestService'))
const TicketFlow         = lazy(() => import('../../pages/TicketFlow'))
const TicketConfirm      = lazy(() => import('../../pages/TicketConfirm'))
const Urgencias          = lazy(() => import('../../pages/Urgencias'))
const Favoritos          = lazy(() => import('../../pages/Favoritos'))
const MisSolicitudes     = lazy(() => import('../../pages/MisSolicitudes'))
const SolicitudDetail    = lazy(() => import('../../pages/SolicitudDetail'))
const Chat               = lazy(() => import('../../pages/Chat'))
const ClientProfile      = lazy(() => import('../../pages/ClientProfile'))
const Mensajes           = lazy(() => import('../../pages/Mensajes'))
const BuscarOtroProfesional = lazy(() => import('../../pages/BuscarOtroProfesional'))
const OfficialServicesPage  = lazy(() => import('../../pages/OfficialServicesPage'))
const OfficialServiceDetail = lazy(() => import('../../pages/OfficialServiceDetail'))
const ProDashboard    = lazy(() => import('../../pages/pro/ProDashboard'))
const ProRequests     = lazy(() => import('../../pages/pro/ProRequests'))
const ProProfile      = lazy(() => import('../../pages/pro/ProProfile'))
const ProProfileEdit  = lazy(() => import('../../pages/pro/ProProfileEdit'))
const ProOnboarding   = lazy(() => import('../../pages/pro/ProOnboarding'))
const ProWorkHistory  = lazy(() => import('../../pages/pro/ProWorkHistory'))
const ProRegistration = lazy(() => import('../../pages/pro/ProRegistration'))
const ProAvailability = lazy(() => import('../../pages/pro/ProAvailability'))
const AdminVerificaciones = lazy(() => import('../../pages/admin/AdminVerificaciones'))

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode
  requiredRole?: 'client' | 'professional'
}) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />
  return <>{children}</>
}

const TRANSITION = { type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } as const

export function AnimatedRoutes() {
  const location = useLocation()
  const direction = useNavDirection()
  const user = useAuthStore((s) => s.user)
  const isPro = user?.role === 'professional'

  const variants = {
    initial:  { x: direction === 'forward' ? '100%' : '-30%', opacity: 0 },
    animate:  { x: 0, opacity: 1 },
    exit:     { x: direction === 'forward' ? '-30%' : '100%', opacity: 0 },
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.key}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={TRANSITION}
          style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}
        >
          <Suspense fallback={<PageSkeleton />}>
            <Routes location={location}>
              {/* ── Rutas compartidas sin layout */}
              <Route path="/login"    element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/profesional/:id" element={<ProfessionalDetail />} />
              <Route path="/urgencias"       element={<Urgencias />} />
              <Route path="/ticket"          element={<TicketFlow />} />
              <Route path="/ticket/confirmar" element={<TicketConfirm />} />
              <Route path="/buscar-profesional/:requestId" element={<ProtectedRoute><BuscarOtroProfesional /></ProtectedRoute>} />
              <Route path="/solicitar/:id"   element={<RequestService />} />
              <Route path="/admin/verificaciones" element={<ProtectedRoute><AdminVerificaciones /></ProtectedRoute>} />
              <Route path="/pro/registro"   element={<ProtectedRoute requiredRole="professional"><ProRegistration /></ProtectedRoute>} />
              <Route path="/pro/onboarding" element={<ProtectedRoute><ProOnboarding /></ProtectedRoute>} />
              <Route path="/solicitud/:id/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/mensajes"           element={<ProtectedRoute><Mensajes /></ProtectedRoute>} />
              {FEATURES.SERVICIOS_OFICIALES && <Route path="/servicios-oficiales"     element={<OfficialServicesPage />} />}
              {FEATURES.SERVICIOS_OFICIALES && <Route path="/servicios-oficiales/:id" element={<OfficialServiceDetail />} />}

              {/* ── Rutas profesional */}
              <Route
                path="/pro/*"
                element={
                  <ProtectedRoute requiredRole="professional">
                    <ProLayout>
                      <Routes>
                        <Route path="dashboard"      element={<ProDashboard />} />
                        <Route path="solicitudes"    element={<ProRequests />} />
                        <Route path="perfil"         element={<ProProfile />} />
                        <Route path="perfil/editar"  element={<ProProfileEdit />} />
                        <Route path="trabajos"       element={<ProWorkHistory />} />
                        <Route path="disponibilidad" element={<ProAvailability />} />
                        <Route path="*"              element={<Navigate to="/pro/dashboard" replace />} />
                      </Routes>
                    </ProLayout>
                  </ProtectedRoute>
                }
              />

              {/* ── Rutas cliente */}
              <Route
                path="/*"
                element={
                  isPro
                    ? <Navigate to="/pro/dashboard" replace />
                    : (
                      <ClientLayout>
                        <Routes>
                          <Route path="/"                  element={<Home />} />
                          <Route path="/buscar"            element={<Search />} />
                          <Route path="/buscar/:categoria" element={<Search />} />
                          <Route path="/favoritos"         element={<Favoritos />} />
                          <Route path="/mis-solicitudes"   element={<ProtectedRoute requiredRole="client"><MisSolicitudes /></ProtectedRoute>} />
                          <Route path="/solicitud/:id"     element={<ProtectedRoute requiredRole="client"><SolicitudDetail /></ProtectedRoute>} />
                          <Route path="/perfil"            element={<ProtectedRoute requiredRole="client"><ClientProfile /></ProtectedRoute>} />
                          <Route path="*"                  element={<NotFound />} />
                        </Routes>
                      </ClientLayout>
                    )
                }
              />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useNavDirection.ts src/components/layout/AnimatedRoutes.tsx
git commit -m "feat: add useNavDirection hook and AnimatedRoutes with slide transitions"
```

---

### Task 2: Actualizar App.tsx para usar AnimatedRoutes

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `AnimatedRoutes` de Task 1

- [ ] **Step 1: Simplificar App.tsx**

Reemplazar el contenido completo de `src/App.tsx` con:

```tsx
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
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 3: Verificar en browser**

Abrir `http://localhost:5173`. Navegar entre páginas — debe haber un slide horizontal suave. Usar el botón back del browser — debe deslizar en sentido contrario.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: replace Routes with AnimatedRoutes for slide page transitions"
```

---

### Task 3: Build, push y deploy

- [ ] **Step 1: Build**

```bash
npm run build
```

Expected: `✓ built in X.XXs` sin errores.

- [ ] **Step 2: Push**

```bash
git push origin main
```

- [ ] **Step 3: Deploy**

```bash
vercel --prod
```

Expected: `▲ Aliased https://oficios-ya-8112.vercel.app`
