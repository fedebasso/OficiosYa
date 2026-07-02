# Onboarding Premium Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar el onboarding (cliente + profesional) con look premium (íconos lucide, composición cuidada, progreso segmentado, micro-interacciones) y quitar el onboarding redundante del Home.

**Architecture:** Reescritura de `OnboardingSlide.tsx` (ícono lucide + tile con degradé/blobs + textos staggered) y `OnboardingFlow.tsx` (slides con íconos lucide, barra de progreso segmentada, botón premium). Edición de `Home.tsx` para quitar `HowItWorks`. Sin cambios de lógica.

**Tech Stack:** React + TypeScript + framer-motion + lucide-react (ya instalados)

## Global Constraints

- No agregar dependencias
- Base crema `#F5F0E8`, texto `#1A1712`/`#7A6E5E`, degradé naranja `linear-gradient(135deg, #E8683A 0%, #F28C4A 100%)`
- Sin emojis (solo lucide)
- No tocar lógica: localStorage `onboarding_done_<userId>`, roles, montaje en App.tsx
- Correr `npm run lint` y `npm run build` antes del push

---

### Task 1: Rediseñar OnboardingSlide

**Files:**
- Modify (reescritura completa): `src/components/onboarding/OnboardingSlide.tsx`

**Interfaces:**
- Produces: `OnboardingSlide({ Icon, title, description }: { Icon: LucideIcon; title: string; description: string })`

- [ ] **Step 1: Reemplazar el contenido completo de `src/components/onboarding/OnboardingSlide.tsx`**

(Leer el archivo primero, luego sobrescribir con:)

```tsx
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface OnboardingSlideProps {
  Icon: LucideIcon
  title: string
  description: string
}

export function OnboardingSlide({ Icon, title, description }: OnboardingSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-7 gap-7 h-full">
      {/* Composición del ícono */}
      <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
        <div style={{ position: 'absolute', width: 90, height: 90, borderRadius: '50%', background: '#F28C4A', opacity: 0.25, filter: 'blur(28px)', top: 8, left: 18 }} />
        <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: '#E8683A', opacity: 0.22, filter: 'blur(30px)', bottom: 6, right: 16 }} />
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="relative flex items-center justify-center"
          style={{
            width: 120,
            height: 120,
            borderRadius: 32,
            background: 'linear-gradient(135deg, #E8683A 0%, #F28C4A 100%)',
            boxShadow: '0 12px 32px -8px rgba(232,104,58,.45)',
          }}
        >
          <Icon size={52} color="#FFFFFF" strokeWidth={2} />
        </motion.div>
      </div>

      <div className="flex flex-col gap-3">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="font-black"
          style={{ fontSize: 30, letterSpacing: '-0.8px', color: '#1A1712', lineHeight: 1.1 }}
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
          className="font-medium mx-auto"
          style={{ fontSize: 15.5, color: '#7A6E5E', lineHeight: 1.5, maxWidth: 300 }}
        >
          {description}
        </motion.p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

Run: `npx tsc --noEmit`
Expected: sin errores. (Nota: `OnboardingFlow` aún pasa props viejas hasta Task 2 — si aparece un error de tipos en OnboardingFlow.tsx por el cambio de props, es esperado y se resuelve en Task 2. Para verificación limpia, ejecutar tsc recién al final de Task 2.)

- [ ] **Step 3: Commit**

```bash
git add src/components/onboarding/OnboardingSlide.tsx
git commit -m "feat: redesign OnboardingSlide with lucide icon composition"
```

---

### Task 2: Rediseñar OnboardingFlow

**Files:**
- Modify (reescritura completa): `src/components/onboarding/OnboardingFlow.tsx`

**Interfaces:**
- Consumes: `OnboardingSlide` de Task 1 (props `Icon`, `title`, `description`)
- Produces: `OnboardingFlow({ role, userId, onDone })` (misma firma que antes)

- [ ] **Step 1: Reemplazar el contenido completo de `src/components/onboarding/OnboardingFlow.tsx`**

(Leer el archivo primero, luego sobrescribir con:)

```tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, MessageCircle, Briefcase, ClipboardList, CalendarClock, Star, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { OnboardingSlide } from './OnboardingSlide'

interface OnboardingFlowProps {
  role: 'client' | 'professional'
  userId: string
  onDone: () => void
}

interface Slide { Icon: LucideIcon; title: string; description: string }

const CLIENT_SLIDES: Slide[] = [
  { Icon: Sparkles,      title: 'Bienvenido a OFIX',     description: 'Encontrá profesionales de confianza en Montevideo para cualquier trabajo del hogar' },
  { Icon: Zap,           title: 'Servicios y Urgencias', description: '¿Es urgente? Activá el modo urgencia y recibí respuesta en minutos. Electricistas, plomeros, pintores y más' },
  { Icon: MessageCircle, title: 'Chateá y coordiná',     description: 'Hablá directo con el profesional, revisá sus reseñas y coordiná todo sin salir de la app' },
]

const PRO_SLIDES: Slide[] = [
  { Icon: Briefcase,     title: 'Bienvenido a OFIX',          description: 'Tu plataforma para conseguir más clientes en Montevideo' },
  { Icon: ClipboardList, title: 'Recibí solicitudes',         description: 'Los clientes te contactan directamente según tu categoría y zona de trabajo' },
  { Icon: CalendarClock, title: 'Urgencias y disponibilidad', description: 'Activá tu disponibilidad y aparecé primero cuando hay urgencias cerca tuyo' },
  { Icon: Star,          title: 'Construí tu reputación',     description: 'Acumulá reseñas reales, subí fotos de tus trabajos y destacate del resto' },
]

export function OnboardingFlow({ role, userId, onDone }: OnboardingFlowProps) {
  const [index, setIndex] = useState(0)
  const slides = role === 'client' ? CLIENT_SLIDES : PRO_SLIDES
  const isLast = index === slides.length - 1
  const current = slides[index]

  const finish = () => {
    localStorage.setItem(`onboarding_done_${userId}`, '1')
    onDone()
  }

  const next = () => {
    if (isLast) { finish(); return }
    setIndex((i) => i + 1)
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ zIndex: 9998, maxWidth: 480, margin: '0 auto', background: '#F5F0E8' }}>
      {/* Saltar */}
      <div className="flex justify-end" style={{ padding: '48px 20px 0' }}>
        <button type="button" onClick={finish} className="text-sm font-bold px-2 py-1" style={{ color: '#9C917E' }}>
          Saltar
        </button>
      </div>

      {/* Slide */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <OnboardingSlide Icon={current.Icon} title={current.title} description={current.description} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer: progreso + botón */}
      <div className="flex flex-col gap-5" style={{ padding: '0 28px 40px' }}>
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <div key={i} className="flex-1 overflow-hidden" style={{ height: 4, borderRadius: 2, background: '#E7DFD2' }}>
              <div style={{ height: '100%', borderRadius: 2, background: '#E8683A', width: i <= index ? '100%' : '0%', transition: 'width 0.4s ease' }} />
            </div>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={next}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2 font-black text-white"
          style={{ height: 54, borderRadius: 16, background: '#E8683A', boxShadow: '0 8px 20px -6px rgba(232,104,58,.5)', fontSize: 16 }}
        >
          {isLast ? '¡Empezar!' : 'Continuar'}
          {!isLast && <ArrowRight size={18} />}
        </motion.button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Verificar en browser**

Abrir `http://localhost:5173`. Para forzar el onboarding: en DevTools → Application → Local Storage, borrar `onboarding_done_<userId>` y recargar. Debe verse el nuevo diseño (tile con degradé + ícono lucide, barra de progreso segmentada, botón "Continuar" con flecha, "¡Empezar!" en el último).

- [ ] **Step 4: Commit**

```bash
git add src/components/onboarding/OnboardingFlow.tsx
git commit -m "feat: premium OnboardingFlow with lucide slides, segmented progress and animated button"
```

---

### Task 3: Quitar HowItWorks del Home

**Files:**
- Modify: `src/pages/Home.tsx`

- [ ] **Step 1: Quitar el import de HowItWorks**

En `src/pages/Home.tsx`, eliminar la línea:
```tsx
import { HowItWorks } from '../components/home/HowItWorks'
```

- [ ] **Step 2: Quitar el render de `<HowItWorks />`**

En el body del Home, eliminar la línea `<HowItWorks />` (queda `<CategoryIcons />` seguido de `<TopRated />`):
```tsx
      <div className="flex flex-col gap-4 pt-4 pb-4">
        <CategoryIcons />
        <TopRated />
        <TicketEntryCard />
```

- [ ] **Step 3: Verificar TypeScript**

Run: `npx tsc --noEmit`
Expected: sin errores (sin import sin usar).

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "refactor: remove redundant HowItWorks onboarding card from Home"
```

---

### Task 4: Lint, build, deploy

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: sin errores. (Si ESLint marca `react-hooks/static-components` por `<Icon />` desde prop, envolver el render del ícono en OnboardingSlide con `createElement(Icon, { size: 52, color: '#FFFFFF', strokeWidth: 2 })` e importar `createElement` de 'react'.)

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `✓ built` sin errores.

- [ ] **Step 3: Push y deploy**

```bash
git push origin main
vercel --prod
```
Expected: `▲ Aliased https://oficios-ya-8112.vercel.app`

- [ ] **Step 4: Verificación final de consistencia (grep de emojis)**

Run: `grep -rn "🏠\|👷\|📋\|⭐\|👋" src/components/onboarding src/components/home/HowItWorks.tsx`
Nota: `HowItWorks.tsx` queda huérfano (no se renderiza); sus emojis internos no afectan. Confirmar que `src/components/onboarding/` no tiene emojis.
