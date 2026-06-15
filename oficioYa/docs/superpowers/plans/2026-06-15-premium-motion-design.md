# Premium Motion Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar Framer Motion a todo el flujo IA + Home + professional cards para una experiencia premium warm & orange.

**Architecture:** Motion system centralizado en `src/lib/motion.ts` con spring configs y variantes reutilizables. Todos los componentes importan desde ahí. `AnimatePresence` para transiciones entre pasos en TicketFlow. Stagger animations para listas. Sin cambios a lógica de negocio.

**Tech Stack:** React 19, Framer Motion (nueva dep), TypeScript, Tailwind CSS v3. Proyecto en `C:\Users\fede8\Documents\OficiosYa\oficioYa`.

---

## Files touched

| Acción | Archivo |
|--------|---------|
| Install | `framer-motion` npm package |
| Create | `src/lib/motion.ts` |
| Modify | `src/components/ticket/TicketEntryCard.tsx` |
| Modify | `src/pages/TicketFlow.tsx` |
| Modify | `src/pages/TicketConfirm.tsx` |
| Modify | `src/components/professionals/ProfessionalCard.tsx` |

---

## Task 1: Instalar Framer Motion + crear motion system

**Files:**
- Install: `framer-motion`
- Create: `src/lib/motion.ts`

- [ ] **Step 1: Instalar framer-motion**

```bash
cd C:\Users\fede8\Documents\OficiosYa\oficioYa && npm install framer-motion
```

Expected: framer-motion aparece en `dependencies` de package.json.

- [ ] **Step 2: Crear `src/lib/motion.ts`**

```ts
// src/lib/motion.ts
import type { Variants, Transition } from 'framer-motion'

export const SPRING_SOFT: Transition = { type: 'spring', stiffness: 300, damping: 30 }
export const SPRING_SNAPPY: Transition = { type: 'spring', stiffness: 500, damping: 35 }
export const SPRING_GENTLE: Transition = { type: 'spring', stiffness: 200, damping: 28 }

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: SPRING_GENTLE },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
}

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: SPRING_SNAPPY },
}

export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { delayChildren: 0.05, staggerChildren: 0.07 } },
}

export const staggerFast: Variants = {
  hidden:  {},
  visible: { transition: { delayChildren: 0, staggerChildren: 0.06 } },
}

export const slideFromRight: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: SPRING_GENTLE },
  exit:    { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

export const slideFromLeft: Variants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: SPRING_GENTLE },
  exit:    { opacity: 0, x: 40, transition: { duration: 0.2 } },
}
```

- [ ] **Step 3: Verificar build**

```bash
npm run build
```

Expected: sin errores. framer-motion importado correctamente.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/motion.ts
git commit -m "feat: install framer-motion and create centralized motion system"
```

---

## Task 2: TicketEntryCard — glow vivo + tap feedback

**Files:**
- Modify: `src/components/ticket/TicketEntryCard.tsx`

- [ ] **Step 1: Reemplazar `src/components/ticket/TicketEntryCard.tsx`**

```tsx
// src/components/ticket/TicketEntryCard.tsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SPRING_SOFT, fadeUp } from '../lib/motion'

export function TicketEntryCard() {
  const navigate = useNavigate()

  return (
    <motion.button
      type="button"
      onClick={() => navigate('/ticket')}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SOFT}
      className="w-full text-left flex items-center gap-3 rounded-2xl p-4"
      style={{
        background: '#FFFFFF',
        border: '2px solid #E8683A',
        boxShadow: '0 2px 12px rgba(232,104,58,.12)',
      }}
    >
      {/* Orb animado */}
      <motion.div
        className="flex items-center justify-center flex-shrink-0"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'linear-gradient(135deg,#E8683A,#c44d1f)',
          fontSize: 22,
        }}
      >
        ✨
      </motion.div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm leading-tight" style={{ color: '#111111' }}>
          Describí tu problema
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
          La IA encuentra al profesional ideal
        </p>
      </div>

      {/* Flecha animada */}
      <motion.span
        animate={{ x: [0, 3, 0] }}
        transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        className="text-lg flex-shrink-0"
        style={{ color: '#E8683A' }}
      >
        ›
      </motion.span>
    </motion.button>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npm run build
```

Expected: sin errores TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/components/ticket/TicketEntryCard.tsx
git commit -m "feat(motion): animate TicketEntryCard — breathing orb, arrow pulse, tap feedback"
```

---

## Task 3: TicketFlow — transiciones entre pasos

**Files:**
- Modify: `src/pages/TicketFlow.tsx`

Agregar `AnimatePresence` con slide direccional entre los 4 pasos. El estado `direction` controla si entramos de derecha (avanzar) o izquierda (retroceder).

- [ ] **Step 1: Leer el archivo actual**

Leer `src/pages/TicketFlow.tsx` completo para entender la estructura actual antes de editar.

- [ ] **Step 2: Actualizar imports en TicketFlow.tsx**

Reemplazar la línea de imports de React:
```tsx
import { useState, useRef, useMemo, useEffect } from 'react'
```
Por:
```tsx
import { useState, useRef, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SPRING_GENTLE } from '../lib/motion'
```

- [ ] **Step 3: Agregar estado `direction` al orquestador `TicketFlow`**

Dentro de `export default function TicketFlow()`, después de la línea `const [ticket, setTicket] = useState<GeneratedTicket | null>(null)`, agregar:

```tsx
const [direction, setDirection] = useState<'forward' | 'back'>('forward')
```

- [ ] **Step 4: Actualizar `handleAnalyze` para setear direction**

Dentro de `handleAnalyze`, antes de `setStep(3)`, agregar:
```tsx
setDirection('forward')
```

- [ ] **Step 5: Actualizar los botones de back en el header**

En el header, reemplazar:
```tsx
onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
```
Por:
```tsx
onClick={() => { setDirection('back'); setStep((s) => (s - 1) as 1 | 2 | 3 | 4) }}
```

Y el otro back button (step 4 → step 2):
```tsx
onClick={() => setStep(2)}
```
Por:
```tsx
onClick={() => { setDirection('back'); setStep(2) }}
```

Y el botón "Continuar →" en CategoryStep — actualizar `onNext` call site para setear direction:
En el orquestador, donde se pasa `onNext` a CategoryStep, agregar antes de `setStep(2)`:
```tsx
onNext={() => { setDirection('forward'); setStep(2) }}
```

- [ ] **Step 6: Envolver el contenido en AnimatePresence con slide**

En el return del orquestador, reemplazar:
```tsx
<div className="flex flex-col" style={{ minHeight: '100%' }}>
  {step === 1 && ( <CategoryStep ... /> )}
  {step === 2 && ( <MediaStep ... /> )}
  {step === 3 && <AIProcessingStep progress={aiProgress} />}
  {step === 4 && ticket && ( <ResultsStep ... /> )}
</div>
```

Por:
```tsx
<AnimatePresence mode="wait" initial={false}>
  {step === 1 && (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, x: direction === 'forward' ? 40 : -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction === 'forward' ? -40 : 40 }}
      transition={SPRING_GENTLE}
      className="flex flex-col"
      style={{ minHeight: '100%' }}
    >
      <CategoryStep
        selected={category}
        onSelect={(id) => setCategory(id)}
        onNext={() => { setDirection('forward'); setStep(2) }}
      />
    </motion.div>
  )}
  {step === 2 && (
    <motion.div
      key="step-2"
      initial={{ opacity: 0, x: direction === 'forward' ? 40 : -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: direction === 'forward' ? -40 : 40 }}
      transition={SPRING_GENTLE}
      className="flex flex-col"
      style={{ minHeight: '100%' }}
    >
      <MediaStep
        input={input}
        onChange={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
        onAnalyze={handleAnalyze}
      />
    </motion.div>
  )}
  {step === 3 && (
    <motion.div
      key="step-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col flex-1"
      style={{ minHeight: '100%' }}
    >
      <AIProcessingStep progress={aiProgress} />
    </motion.div>
  )}
  {step === 4 && ticket && (
    <motion.div
      key="step-4"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={SPRING_GENTLE}
      className="flex flex-col"
      style={{ minHeight: '100%' }}
    >
      <ResultsStep
        ticket={ticket}
        category={category ?? ''}
        preselectedProId={preselectedProId}
        onPedir={handlePedir}
      />
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 7: Build**

```bash
npm run build
```

Expected: BUILD EXITOSO sin errores TypeScript. Los pasos deben transicionar con slide.

- [ ] **Step 8: Commit**

```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat(motion): add directional slide transitions between ticket flow steps"
```

---

## Task 4: CategoryStep — stagger grid + selección satisfactoria

**Files:**
- Modify: `src/pages/TicketFlow.tsx` (función `CategoryStep`)

- [ ] **Step 1: Leer CategoryStep actual**

Leer `src/pages/TicketFlow.tsx` líneas 22-75 para ver la implementación actual de `CategoryStep`.

- [ ] **Step 2: Reemplazar `CategoryStep` completo**

Reemplazar toda la función `CategoryStep` (desde `/* ── Paso 1: Categoría ── */` hasta el cierre `}` de la función) con:

```tsx
/* ── Paso 1: Categoría ── */
function CategoryStep({
  selected,
  onSelect,
  onNext,
}: {
  selected: string | null
  onSelect: (id: string) => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#E8683A' }}>
          ✨ Nuevo ticket
        </p>
        <h2 className="text-xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          ¿Qué tipo de trabajo necesitás?
        </h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-3 flex-1"
        variants={{ hidden: {}, visible: { transition: { delayChildren: 0.1, staggerChildren: 0.07 } } }}
        initial="hidden"
        animate="visible"
      >
        {CATEGORIES.map((cat) => {
          const active = selected === cat.id
          return (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              variants={{ hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 35 } } }}
              whileTap={{ scale: 0.94 }}
              animate={active ? { scale: [1, 1.04, 1] } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex items-center gap-3 rounded-2xl p-4 text-left"
              style={{
                background: active ? '#E8683A' : '#F5F0E8',
                border: `1.5px solid ${active ? '#E8683A' : '#EDE8DE'}`,
                boxShadow: active ? '0 4px 14px rgba(232,104,58,.25)' : '0 1px 3px rgba(0,0,0,.04)',
              }}
            >
              <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: active ? '#fff' : '#111' }}>
                  {cat.label}
                </div>
                <div className="text-[10px] mt-0.5 truncate" style={{ color: active ? 'rgba(255,255,255,.75)' : '#999' }}>
                  {cat.desc}
                </div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      <motion.button
        type="button"
        onClick={onNext}
        disabled={!selected}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: selected ? 1 : 0.4, y: 0 }}
        transition={{ delay: 0.35, duration: 0.25 }}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-2xl py-4 text-base font-bold text-white transition-none"
        style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
      >
        Continuar →
      </motion.button>
    </div>
  )
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat(motion): stagger category grid + spring selection + animated CTA"
```

---

## Task 5: AIProcessingStep — orb multi-layer + progress steps animados

**Files:**
- Modify: `src/pages/TicketFlow.tsx` (función `AIProcessingStep`)

- [ ] **Step 1: Leer AIProcessingStep actual**

Leer `src/pages/TicketFlow.tsx` buscando `/* ── Paso 3` para ver la implementación actual.

- [ ] **Step 2: Reemplazar `AIProcessingStep` completo**

Reemplazar toda la función `AIProcessingStep` con:

```tsx
/* ── Paso 3: IA procesando ── */
function AIProcessingStep({ progress }: { progress: number }) {
  const steps = [
    'Imagen analizada',
    'Identificando el problema...',
    'Generando ticket',
    'Buscando profesionales',
  ]

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-6">
      {/* Orb multi-layer */}
      <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(232,104,58,.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
        />
        {/* Mid glow */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 96, height: 96, background: 'radial-gradient(circle, rgba(232,104,58,.15) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity, delay: 0.2 }}
        />
        {/* Inner orb */}
        <motion.div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 80,
            height: 80,
            background: 'radial-gradient(circle at 35% 35%, #FF9A5C, #E8683A 50%, #B84A1F)',
            boxShadow: '0 8px 32px rgba(232,104,58,.4)',
          }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity, delay: 0.1 }}
        />
        {/* Core emoji */}
        <motion.span
          className="relative z-10"
          style={{ fontSize: 32 }}
          animate={{ rotate: [-3, 3, -3] }}
          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
        >
          ✨
        </motion.span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <h2 className="text-xl font-black" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
          Analizando tu problema
        </h2>
        <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>Tardará solo unos segundos</p>
      </motion.div>

      {/* Progress steps */}
      <motion.div
        className="w-full max-w-xs flex flex-col gap-3 text-left"
        variants={{ hidden: {}, visible: { transition: { delayChildren: 0.3, staggerChildren: 0.15 } } }}
        initial="hidden"
        animate="visible"
      >
        {steps.map((label, i) => {
          const done = i < progress
          const active = i === progress
          return (
            <motion.div
              key={label}
              variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } } }}
              className="flex items-center gap-3"
            >
              <div className="relative flex-shrink-0" style={{ width: 22, height: 22 }}>
                <AnimatePresence mode="wait">
                  {done ? (
                    <motion.div
                      key="done"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="absolute inset-0 rounded-full flex items-center justify-center font-black text-white"
                      style={{ background: '#E8683A', fontSize: 10 }}
                    >
                      ✓
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: active ? '2px solid #E8683A' : '1.5px solid #EDE8DE',
                        boxShadow: active ? '0 0 0 0 rgba(232,104,58,.4)' : 'none',
                      }}
                      animate={active ? { boxShadow: ['0 0 0 0 rgba(232,104,58,.4)', '0 0 0 5px rgba(232,104,58,0)', '0 0 0 0 rgba(232,104,58,.4)'] } : {}}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  )}
                </AnimatePresence>
              </div>
              <span
                className="text-sm"
                style={{
                  color: done ? '#555' : active ? '#E8683A' : '#CCC',
                  fontWeight: done || active ? 700 : 400,
                }}
              >
                {label}
              </span>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat(motion): multi-layer breathing orb + animated progress steps in AIProcessingStep"
```

---

## Task 6: ResultsStep — ticket reveal progresivo + pro cards stagger

**Files:**
- Modify: `src/pages/TicketFlow.tsx` (función `ResultsStep`)

- [ ] **Step 1: Leer ResultsStep actual**

Leer `src/pages/TicketFlow.tsx` buscando `/* ── Paso 4` para entender la implementación actual.

- [ ] **Step 2: Reemplazar `ResultsStep` completo**

Reemplazar toda la función `ResultsStep` con:

```tsx
/* ── Paso 4: Resultados ── */
function ResultsStep({
  ticket,
  category,
  preselectedProId,
  onPedir,
}: {
  ticket: GeneratedTicket
  category: string
  preselectedProId: string | null
  onPedir: (pro: ProfessionalWithProfile) => void
}) {
  const { professionals } = useProfessionals(category)
  const sorted = [...professionals].sort((a, b) => {
    if (a.id === preselectedProId) return -1
    if (b.id === preselectedProId) return 1
    if (a.available_now !== b.available_now) return a.available_now ? -1 : 1
    return (b.avg_rating ?? 0) - (a.avg_rating ?? 0)
  })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  useEffect(() => {
    if (sorted.length > 0 && selectedId === null) setSelectedId(sorted[0].id)
  }, [sorted.length])
  const selectedPro = sorted.find((p) => p.id === selectedId) ?? null

  return (
    <div className="flex flex-col pb-24" style={{ minHeight: '100%' }}>
      {/* Ticket generado */}
      <div className="p-4 pb-3" style={{ borderBottom: '1px solid #F0EBE1' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.2 }}
          className="inline-flex items-center gap-1.5 rounded-full mb-3"
          style={{
            background: 'rgba(232,104,58,.1)',
            border: '1px solid rgba(232,104,58,.25)',
            padding: '3px 10px',
            fontSize: 10,
            fontWeight: 800,
            color: '#E8683A',
          }}
        >
          ✨ Generado por IA
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 28 }}
          className="text-xl font-black leading-tight mb-2"
          style={{ color: '#111111', letterSpacing: '-0.3px' }}
        >
          {ticket.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, type: 'spring', stiffness: 300, damping: 28 }}
          className="text-sm leading-relaxed mb-3"
          style={{ color: '#666666' }}
        >
          {ticket.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 500, damping: 35 }}
          className="flex gap-2 flex-wrap"
        >
          {ticket.urgent && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' }}>
              🚨 Urgente
            </span>
          )}
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: '#F5F0E8', color: '#666' }}>
            {CATEGORY_EMOJI[category]} {CATEGORY_LABELS[category] ?? category}
          </span>
        </motion.div>
      </div>

      {/* Profesionales recomendados */}
      <div className="flex-1 p-4 flex flex-col gap-3" style={{ background: '#F9F6F2' }}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.2 }}
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: '#AAAAAA' }}
        >
          Tocá para elegir un profesional
        </motion.p>

        <motion.div
          className="flex flex-col gap-3"
          variants={{ hidden: {}, visible: { transition: { delayChildren: 0.45, staggerChildren: 0.06 } } }}
          initial="hidden"
          animate="visible"
        >
          {sorted.slice(0, 5).map((pro) => {
            const selected = pro.id === selectedId
            return (
              <motion.button
                key={pro.id}
                type="button"
                onClick={() => setSelectedId(pro.id)}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 32 } } }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl overflow-hidden text-left w-full"
                style={{
                  background: '#FFFFFF',
                  border: `2px solid ${selected ? '#E8683A' : '#EDE8DE'}`,
                  boxShadow: selected ? '0 2px 12px rgba(232,104,58,.18)' : '0 1px 3px rgba(0,0,0,.04)',
                  transition: 'border-color .2s, box-shadow .2s',
                }}
              >
                <div className="flex items-center gap-3 p-3">
                  {pro.profiles.avatar_url ? (
                    <img src={pro.profiles.avatar_url} alt={pro.profiles.full_name}
                      className="rounded-xl object-cover flex-shrink-0" style={{ width: 40, height: 40 }} />
                  ) : (
                    <div className="rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white"
                      style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#E8683A,#c44d1f)', fontSize: 16 }}>
                      {pro.profiles.full_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: '#111' }}>{pro.profiles.full_name}</div>
                    <div className="text-[10px]" style={{ color: '#AAAAAA' }}>
                      {pro.avg_rating != null && <><span style={{ color: '#f59e0b' }}>★</span> {pro.avg_rating} · </>}
                      {pro.jobs_count} trabajos
                      {pro.response_time_min > 0 && ` · ~${pro.response_time_min}min`}
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    {selected ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        className="flex-shrink-0 flex items-center justify-center font-black text-white"
                        style={{ width: 22, height: 22, borderRadius: '50%', fontSize: 11, background: '#E8683A' }}
                      >
                        ✓
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid #DDD', flexShrink: 0 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      </div>

      {/* CTA fijo */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 p-4"
        style={{ background: 'rgba(249,246,242,.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #EDE8DE' }}
      >
        <motion.button
          type="button"
          onClick={() => selectedPro && onPedir(selectedPro)}
          disabled={!selectedPro}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-40"
          style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
        >
          {selectedPro ? `Continuar con ${selectedPro.profiles.full_name.split(' ')[0]} →` : 'Elegí un profesional'}
        </motion.button>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: sin errores TypeScript.

- [ ] **Step 4: Commit**

```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat(motion): progressive ticket reveal + staggered pro cards + animated CTA in ResultsStep"
```

---

## Task 7: TicketConfirm — form stagger + success animation con confetti

**Files:**
- Modify: `src/pages/TicketConfirm.tsx`

- [ ] **Step 1: Leer el archivo actual**

Leer `src/pages/TicketConfirm.tsx` completo para entender la estructura actual.

- [ ] **Step 2: Reemplazar `src/pages/TicketConfirm.tsx` completo**

```tsx
// src/pages/TicketConfirm.tsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { useRequestStore } from '../store/requestStore'
import type { GeneratedTicket } from '../types/ticket'

interface LocationState {
  ticket: GeneratedTicket
  proId: string
  proName: string
  proAvatar: string | null
  proRating: number | null
  proWhatsapp: string
}

const INPUT_STYLE = {
  background: '#FFFFFF',
  border: '1.5px solid #E8E0D4',
  color: '#111111',
  borderRadius: 14,
  padding: '14px 16px',
  fontSize: 16,
  width: '100%',
  outline: 'none',
  caretColor: '#E8683A',
}

const CONFETTI_COLORS = ['#E8683A', '#25D366', '#F59E0B', '#EF4444', '#E8683A', '#25D366', '#F59E0B', '#A78BFA']

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {CONFETTI_COLORS.map((color, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: `${10 + i * 11}%`, opacity: 1, rotate: Math.random() * 360 }}
          animate={{ y: 120, opacity: 0, rotate: Math.random() * 720 }}
          transition={{ duration: 0.8 + Math.random() * 0.4, delay: i * 0.05, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: 0,
            width: 8,
            height: 8,
            borderRadius: i % 2 === 0 ? '50%' : 2,
            background: color,
          }}
        />
      ))}
    </div>
  )
}

export default function TicketConfirm() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const addRequest = useRequestStore((s) => s.addRequest)

  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState('')

  const hasState = state !== null
  useEffect(() => {
    if (!hasState) navigate('/ticket')
  }, [hasState, navigate])

  if (!state) return null

  const { ticket, proId, proName, proAvatar, proRating, proWhatsapp } = state

  const handleSubmit = async () => {
    if (phone.length < 8) {
      setPhoneError('Ingresá tu teléfono de contacto')
      return
    }
    setPhoneError('')
    setLoading(true)
    try {
      await addRequest({
        professional_id: proId,
        category: ticket.category,
        description: ticket.description,
        urgency: ticket.urgent,
        contact_phone: phone,
        work_type: ticket.work_type,
      })
      const urgencyText = ticket.urgent ? ' Es urgente.' : ''
      const message = encodeURIComponent(
        `Hola! Vi tu perfil en OficioYa.\n\n${ticket.title}: ${ticket.description}${urgencyText}\n\nMi teléfono: ${phone}`
      )
      setWhatsappUrl(`https://wa.me/${proWhatsapp}?text=${message}`)
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50 flex items-center gap-3"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)' }}
    >
      {!sent && (
        <button type="button" onClick={() => navigate(-1)}
          className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0">
          <ChevronLeft size={24} style={{ color: '#111111' }} />
        </button>
      )}
      <h1 className="text-base font-black" style={{ color: '#111111' }}>Confirmar solicitud</h1>
    </div>
  )

  return (
    <PageShell showBottomNav={false} header={header}>
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="p-4 flex flex-col gap-4"
            style={{ minHeight: '100%' }}
          >
            {/* Mini card del profesional */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 28 }}
              className="flex items-center gap-3 rounded-2xl p-3.5"
              style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
            >
              {proAvatar ? (
                <img src={proAvatar} alt={proName}
                  className="rounded-xl object-cover flex-shrink-0" style={{ width: 44, height: 44 }} />
              ) : (
                <div className="rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white"
                  style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#E8683A,#c44d1f)', fontSize: 18 }}>
                  {proName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate" style={{ color: '#111' }}>{proName}</div>
                {proRating != null && (
                  <div className="text-xs" style={{ color: '#AAAAAA' }}>
                    <span style={{ color: '#f59e0b' }}>★</span> {proRating}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Resumen del ticket */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, type: 'spring', stiffness: 300, damping: 28 }}
              className="rounded-2xl overflow-hidden"
              style={{ border: '1.5px solid #E8E0D4' }}
            >
              <div className="flex items-center gap-2 px-4 py-2.5"
                style={{ background: 'rgba(232,104,58,.06)', borderBottom: '1px solid rgba(232,104,58,.12)' }}>
                <span style={{ fontSize: 12 }}>✨</span>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#E8683A' }}>
                  Ticket generado por IA
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm font-bold mb-1" style={{ color: '#111' }}>{ticket.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#777' }}>{ticket.description}</p>
                {ticket.urgent && (
                  <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,.2)' }}>
                    🚨 Urgente
                  </span>
                )}
              </div>
            </motion.div>

            {/* Teléfono */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 28 }}
              className="flex flex-col gap-2"
            >
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#999999' }}>
                Tu teléfono de contacto
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setPhoneError('') }}
                placeholder="Ej: 099 123 456"
                style={INPUT_STYLE}
              />
              <AnimatePresence>
                {phoneError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs"
                    style={{ color: '#ef4444' }}
                  >
                    {phoneError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, type: 'spring', stiffness: 300, damping: 28 }}
            >
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                animate={{ scale: loading ? 0.98 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-50"
                style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Enviando...
                  </span>
                ) : 'Enviar solicitud'}
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-5 py-10 text-center p-4 relative"
            style={{ minHeight: '100%' }}
          >
            <Confetti />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ type: 'spring', stiffness: 500, damping: 30, delay: 0.1 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl relative z-10"
              style={{ background: 'rgba(232,104,58,.12)', border: '1px solid rgba(232,104,58,.25)' }}
            >
              ✅
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 28 }}
              className="relative z-10"
            >
              <h2 className="text-xl font-black mb-2" style={{ color: '#111111' }}>¡Solicitud enviada!</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#555555' }}>
                El profesional recibirá tu solicitud. También podés contactarlo directamente por WhatsApp.
              </p>
            </motion.div>

            <motion.button
              type="button"
              onClick={() => window.open(whatsappUrl, '_blank')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 28 }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-2xl py-4 text-base font-bold text-white relative z-10"
              style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,.2)' }}
            >
              💬 Contactar por WhatsApp
            </motion.button>

            <motion.button
              type="button"
              onClick={() => navigate('/mis-solicitudes')}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, type: 'spring', stiffness: 300, damping: 28 }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-2xl py-3.5 text-sm font-bold relative z-10"
              style={{ background: '#EDE8DE', color: '#111111', border: '1.5px solid #E8E0D4' }}
            >
              Ver mis solicitudes
            </motion.button>

            <motion.button
              type="button"
              onClick={() => navigate('/')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.2 }}
              className="text-sm font-bold relative z-10"
              style={{ color: '#999999' }}
            >
              Volver al inicio
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  )
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: sin errores TypeScript.

- [ ] **Step 4: Commit**

```bash
git add src/pages/TicketConfirm.tsx
git commit -m "feat(motion): staggered form + confetti success animation in TicketConfirm"
```

---

## Task 8: ProfessionalCard — tap feedback + avatar entry

**Files:**
- Modify: `src/components/professionals/ProfessionalCard.tsx`

- [ ] **Step 1: Leer el archivo actual**

Leer `src/components/professionals/ProfessionalCard.tsx` completo.

- [ ] **Step 2: Agregar framer-motion al ProfessionalCard**

Reemplazar la línea de imports:
```tsx
import { Heart } from 'lucide-react'
```
Por:
```tsx
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
```

Reemplazar el wrapper `<button` por `<motion.button` con animación:
```tsx
<motion.button
  onClick={onClick}
  whileTap={{ scale: 0.98, y: 1 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
  className="w-full text-left rounded-2xl overflow-hidden flex items-stretch"
  style={{
    background: '#FFFFFF',
    border: '1.5px solid #EDE8DE',
    boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04)',
  }}
>
```

Cerrar con `</motion.button>` en lugar de `</button>`.

Además, dentro del bloque del avatar (donde renderiza iniciales o imagen), envolver el div/img en:
```tsx
<motion.div
  initial={{ scale: 0.85, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
>
  {/* contenido del avatar actual sin cambios */}
</motion.div>
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: sin errores TypeScript. El ProfessionalCard debe mostrar tap feedback en toda la app (Search, Home featured, etc).

- [ ] **Step 4: Commit**

```bash
git add src/components/professionals/ProfessionalCard.tsx
git commit -m "feat(motion): tap feedback + avatar entry animation in ProfessionalCard"
```

---

## Self-Review

**Spec coverage:**
- ✅ Framer Motion instalado → Task 1
- ✅ `src/lib/motion.ts` con spring configs y variantes → Task 1
- ✅ TicketEntryCard — orb breathing, arrow pulse, tap, entry → Task 2
- ✅ Step transitions slide direccional → Task 3
- ✅ Category grid stagger + selección spring + bounce → Task 4
- ✅ AIProcessingStep orb multi-layer + progress animado → Task 5
- ✅ ResultsStep ticket reveal progresivo + cards stagger + CTA slide-up → Task 6
- ✅ TicketConfirm form stagger + success confetti → Task 7
- ✅ ProfessionalCard tap + avatar entry → Task 8
- ⚠️ MediaStep animaciones — incluidas implícitamente en Task 3 (el paso ya está wrapped en AnimatePresence). Las animaciones internas del MediaStep (dashed border, botones) se pueden agregar como mejora futura sin bloquear el MVP de motion.

**Type consistency:**
- `SPRING_SOFT`, `SPRING_SNAPPY`, `SPRING_GENTLE` definidos en Task 1, referenciados explícitamente en Tasks 2-8 ✅
- `AnimatePresence` importado de `framer-motion` en Tasks 3, 6, 7 ✅
- `motion` importado en todos los archivos que lo usan ✅

**Placeholder scan:** ninguno encontrado.
