# Onboarding Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar un onboarding de bienvenida diferenciado por rol (3 slides para clientes, 4 para profesionales) la primera vez que el usuario entra tras registrarse.

**Architecture:** Se crean dos componentes (`OnboardingSlide` y `OnboardingFlow`) montados como overlay fixed en `App.tsx`. La visibilidad se controla con `localStorage` usando la key `onboarding_done_<userId>`. framer-motion maneja las animaciones de slide horizontal.

**Tech Stack:** React + TypeScript + framer-motion (ya instalado)

## Global Constraints

- No agregar dependencias nuevas
- localStorage key: `onboarding_done_<userId>` — se guarda al finalizar O al saltar
- Overlay z-index: `9998` (el SplashScreen usa `9999` — el onboarding aparece después)
- Slide 1: `background: linear-gradient(160deg, #E8683A 0%, #c44d1f 100%)`, texto blanco
- Slides 2+: `background: #FFFFFF`, texto `#111111`
- Animación: slide horizontal con framer-motion AnimatePresence
- Botón primario: naranja `#E8683A` en slides blancos, blanco en slide naranja
- Botón "Saltar": texto gris `#999999`, esquina superior derecha, visible en todos los slides

---

### Task 1: Crear OnboardingSlide y OnboardingFlow

**Files:**
- Create: `src/components/onboarding/OnboardingSlide.tsx`
- Create: `src/components/onboarding/OnboardingFlow.tsx`

**Interfaces:**
- Produces:
  ```ts
  // OnboardingSlide
  interface OnboardingSlideProps {
    icon: string
    title: string
    description: string
    gradient?: boolean
  }
  export function OnboardingSlide(props: OnboardingSlideProps): JSX.Element

  // OnboardingFlow
  interface OnboardingFlowProps {
    role: 'client' | 'professional'
    userId: string
    onDone: () => void
  }
  export function OnboardingFlow(props: OnboardingFlowProps): JSX.Element
  ```

- [ ] **Step 1: Crear `src/components/onboarding/OnboardingSlide.tsx`**

```tsx
interface OnboardingSlideProps {
  icon: string
  title: string
  description: string
  gradient?: boolean
}

export function OnboardingSlide({ icon, title, description, gradient = false }: OnboardingSlideProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center px-8 gap-6 h-full"
      style={{
        background: gradient
          ? 'linear-gradient(160deg, #E8683A 0%, #c44d1f 100%)'
          : '#FFFFFF',
      }}
    >
      <div style={{ fontSize: 72, lineHeight: 1 }}>{icon}</div>
      <div className="flex flex-col gap-3">
        <h2
          className="font-black leading-tight"
          style={{
            fontSize: 28,
            letterSpacing: '-0.5px',
            color: gradient ? '#FFFFFF' : '#111111',
          }}
        >
          {title}
        </h2>
        <p
          className="text-base leading-relaxed font-medium"
          style={{ color: gradient ? 'rgba(255,255,255,0.85)' : '#555555' }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Crear `src/components/onboarding/OnboardingFlow.tsx`**

```tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OnboardingSlide } from './OnboardingSlide'

interface OnboardingFlowProps {
  role: 'client' | 'professional'
  userId: string
  onDone: () => void
}

const CLIENT_SLIDES = [
  {
    icon: '🏠',
    title: 'Bienvenido a OFIX',
    description: 'Encontrá profesionales de confianza en Montevideo para cualquier trabajo del hogar',
    gradient: true,
  },
  {
    icon: '⚡',
    title: 'Servicios y Urgencias',
    description: '¿Es urgente? Activá el modo urgencia y recibís respuesta en minutos. Electricistas, plomeros, pintores y más',
    gradient: false,
  },
  {
    icon: '💬',
    title: 'Chateá y coordiná',
    description: 'Hablá directo con el profesional, revisá sus reseñas y coordiná todo sin salir de la app',
    gradient: false,
  },
]

const PRO_SLIDES = [
  {
    icon: '👷',
    title: 'Bienvenido a OFIX',
    description: 'Tu plataforma para conseguir más clientes en Montevideo',
    gradient: true,
  },
  {
    icon: '📋',
    title: 'Recibí solicitudes',
    description: 'Los clientes te contactan directamente según tu categoría y zona de trabajo',
    gradient: false,
  },
  {
    icon: '⚡',
    title: 'Urgencias y disponibilidad',
    description: 'Activá tu disponibilidad y aparecé primero cuando hay urgencias cerca tuyo',
    gradient: false,
  },
  {
    icon: '⭐',
    title: 'Construí tu reputación',
    description: 'Acumulá reseñas reales, subí fotos de tus trabajos y destacate del resto',
    gradient: false,
  },
]

export function OnboardingFlow({ role, userId, onDone }: OnboardingFlowProps) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const slides = role === 'client' ? CLIENT_SLIDES : PRO_SLIDES
  const isLast = index === slides.length - 1
  const current = slides[index]

  const finish = () => {
    localStorage.setItem(`onboarding_done_${userId}`, '1')
    onDone()
  }

  const next = () => {
    if (isLast) { finish(); return }
    setDirection(1)
    setIndex((i) => i + 1)
  }

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 9998, maxWidth: 480, margin: '0 auto' }}
    >
      {/* Botón saltar */}
      <div className="absolute top-12 right-5 z-10">
        <button
          type="button"
          onClick={finish}
          className="text-sm font-bold px-3 py-1.5 rounded-full"
          style={{
            color: current.gradient ? 'rgba(255,255,255,0.8)' : '#999999',
            background: current.gradient ? 'rgba(255,255,255,0.15)' : 'transparent',
          }}
        >
          Saltar
        </button>
      </div>

      {/* Slide */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <OnboardingSlide
              icon={current.icon}
              title={current.title}
              description={current.description}
              gradient={current.gradient}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer: dots + botón */}
      <div
        className="flex flex-col items-center gap-5 px-6 pb-12 pt-6"
        style={{ background: current.gradient ? 'linear-gradient(160deg, #E8683A 0%, #c44d1f 100%)' : '#FFFFFF' }}
      >
        {/* Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: current.gradient
                  ? i === index ? '#FFFFFF' : 'rgba(255,255,255,0.35)'
                  : i === index ? '#E8683A' : '#E8E0D4',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Botón siguiente / empezar */}
        <button
          type="button"
          onClick={next}
          className="w-full rounded-2xl py-4 text-base font-black transition-opacity active:opacity-80"
          style={{
            background: current.gradient ? '#FFFFFF' : '#E8683A',
            color: current.gradient ? '#E8683A' : '#FFFFFF',
            boxShadow: current.gradient ? 'none' : '0 4px 14px rgba(232,104,58,0.3)',
          }}
        >
          {isLast ? '¡Empezar!' : index === 0 ? 'Empezar' : 'Siguiente'}
        </button>
      </div>
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
git add src/components/onboarding/OnboardingSlide.tsx src/components/onboarding/OnboardingFlow.tsx
git commit -m "feat: add OnboardingSlide and OnboardingFlow components"
```

---

### Task 2: Integrar OnboardingFlow en App.tsx

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `OnboardingFlow` de Task 1

- [ ] **Step 1: Agregar import en App.tsx**

En `src/App.tsx`, agregar el import junto a los otros imports estáticos:

```tsx
import { OnboardingFlow } from './components/onboarding/OnboardingFlow'
```

- [ ] **Step 2: Agregar estado showOnboarding en la función App**

Dentro de `function App()`, después de las líneas existentes `const user = ...` y `const isPro = ...`, agregar:

```tsx
const [showOnboarding, setShowOnboarding] = useState(() => {
  if (!user) return false
  return !localStorage.getItem(`onboarding_done_${user.id}`)
})
```

Agregar también el import de `useState` si no está — verificar que `useState` ya está en el import de React. Si no, agregar:
```tsx
import { lazy, Suspense, type ReactNode, useEffect, useState } from 'react'
```

- [ ] **Step 3: Montar OnboardingFlow en el JSX**

En la función `App`, dentro del `<BrowserRouter>`, agregar el overlay DESPUÉS de `<SplashScreen />` y ANTES de `<AppInner />`:

```tsx
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
  {/* resto igual */}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: sin errores.

- [ ] **Step 5: Verificar en browser**

Abrir `http://localhost:5173`. Si no hay usuario logueado, no debe aparecer nada. Loguear con un usuario — el onboarding debe aparecer. Completarlo y recargar — no debe aparecer de nuevo.

Para testear de nuevo: en DevTools → Application → Local Storage → eliminar la key `onboarding_done_<userId>` y recargar.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate OnboardingFlow in App with localStorage persistence"
```

---

### Task 3: Build, push y deploy

- [ ] **Step 1: Build**

```bash
npm run build
```

Expected: `✓ built in X.XXs` sin errores TypeScript.

- [ ] **Step 2: Push**

```bash
git push origin main
```

- [ ] **Step 3: Deploy**

```bash
vercel --prod
```

Expected: `▲ Aliased https://oficios-ya-8112.vercel.app`
