# App-Wide Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extender el motion system de Framer Motion al resto de la app — Login, Register, Search, Urgencias, MisSolicitudes, HowItWorks, FeaturedProfessionals y ProfessionalDetail.

**Architecture:** Patrón base uniforme: `staggerContainer` en el container principal, `fadeUp` en cada sección/bloque, `staggerFast` en listas, `whileTap` en botones interactivos. Importar siempre desde `src/lib/motion.ts`. Reemplazar las animaciones CSS existentes (`animate-fade-up`) con Framer Motion.

**Tech Stack:** React 19, Framer Motion (ya instalado), TypeScript, Tailwind CSS v3. Proyecto en `C:\Users\fede8\Documents\OficiosYa\oficioYa`.

---

## Files touched

| Acción | Archivo |
|--------|---------|
| Modify | `src/pages/Login.tsx` |
| Modify | `src/pages/Register.tsx` |
| Modify | `src/pages/Search.tsx` |
| Modify | `src/pages/Urgencias.tsx` |
| Modify | `src/pages/MisSolicitudes.tsx` |
| Modify | `src/components/home/HowItWorks.tsx` |
| Modify | `src/components/home/FeaturedProfessionals.tsx` |
| Modify | `src/pages/ProfessionalDetail.tsx` |

---

## Task 1: Login — stagger form + tap feedback

**Files:**
- Modify: `src/pages/Login.tsx`

- [ ] **Step 1: Agregar imports de Framer Motion**

Al inicio del archivo, después de los imports existentes, agregar:
```tsx
import { motion } from 'framer-motion'
import { fadeUp, scaleIn, staggerContainer, SPRING_SOFT } from '../lib/motion'
```

- [ ] **Step 2: Animar el hero naranja**

Encontrar el elemento `<h1>` con el logo "OficioYa" dentro del hero naranja. Reemplazar:
```tsx
<h1 className="text-[40px] font-black tracking-tight leading-none" style={{ color: '#FFFFFF', letterSpacing: '-2px' }}>
  Oficio<span style={{ color: 'rgba(255,255,255,.7)' }}>Ya</span>
</h1>
<p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,.8)' }}>
  Profesionales de confianza en Montevideo
</p>
```
Por:
```tsx
<motion.h1
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
  className="text-[40px] font-black tracking-tight leading-none"
  style={{ color: '#FFFFFF', letterSpacing: '-2px' }}
>
  Oficio<span style={{ color: 'rgba(255,255,255,.7)' }}>Ya</span>
</motion.h1>
<motion.p
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 28 }}
  className="text-sm font-medium"
  style={{ color: 'rgba(255,255,255,.8)' }}
>
  Profesionales de confianza en Montevideo
</motion.p>
```

- [ ] **Step 3: Animar el form container con stagger**

Encontrar el div del form: `<div className="flex flex-col gap-5 px-5 pt-6 pb-10">`. Reemplazar por:
```tsx
<motion.div
  className="flex flex-col gap-5 px-5 pt-6 pb-10"
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
```
Cerrar con `</motion.div>`.

- [ ] **Step 4: Wrappear cada sección del form con fadeUp**

Dentro del form container, wrappear cada bloque directo con `<motion.div variants={fadeUp}>...</motion.div>`:

1. El bloque del título (`<div>` con `<h2>Bienvenido de vuelta</h2>`)
2. El bloque del error (el `{error && ...}` — wrappear solo si hay error: `<AnimatePresence>` + `motion.div` condicional)
3. El `<form>` completo
4. El divider (`<div className="flex items-center gap-3">`)
5. El `<p>` del link "¿No tenés cuenta?"
6. La demo card (`<div className="rounded-2xl p-4" ...>`)

Para el error, importar `AnimatePresence` y reemplazar:
```tsx
{error && (
  <div role="alert" ...>
    ⚠️ {error}
  </div>
)}
```
Por:
```tsx
<AnimatePresence>
  {error && (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="rounded-2xl px-4 py-3 text-sm font-medium flex items-center gap-2"
      style={{ background: '#FEF2F2', border: '1.5px solid #FECACA', color: '#DC2626' }}
    >
      ⚠️ {error}
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 5: Agregar whileTap al botón submit**

Reemplazar `<button type="submit" disabled={loading} className="w-full rounded-2xl py-4...">` por `<motion.button>` agregando:
```tsx
whileTap={{ scale: 0.97 }}
transition={SPRING_SOFT}
```
Mantener todas las props existentes. Remover `active:scale-[0.97]` del className.

- [ ] **Step 6: Agregar whileTap a los botones demo**

A los dos `<button type="button" onClick={() => fillDemo(...)}` dentro de la demo card, reemplazar por `<motion.button>` con `whileTap={{ scale: 0.97 }}` y `transition={SPRING_SOFT}`. Remover `active:opacity-70 transition-opacity` del className.

- [ ] **Step 7: Build**
```bash
cd C:\Users\fede8\Documents\OficiosYa\oficioYa && npm run build
```
Expected: sin errores TypeScript.

- [ ] **Step 8: Commit**
```bash
git add src/pages/Login.tsx
git commit -m "feat(motion): stagger form + tap feedback in Login"
```

---

## Task 2: Register — stagger form + role selector animado

**Files:**
- Modify: `src/pages/Register.tsx`

- [ ] **Step 1: Agregar imports**
```tsx
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp, scaleIn, staggerContainer, SPRING_SOFT } from '../lib/motion'
```

- [ ] **Step 2: Animar hero (mismo patrón que Login)**

Reemplazar `<h1>` y `<p>` dentro del hero naranja por versiones `motion.*` con las mismas animaciones del Task 1 Step 2 (scaleIn + fadeUp con delay 0.15).

- [ ] **Step 3: Animar form container con stagger**

Reemplazar `<div className="flex flex-col gap-5 px-5 pt-6 pb-10">` por:
```tsx
<motion.div
  className="flex flex-col gap-5 px-5 pt-6 pb-10"
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
>
```

- [ ] **Step 4: Wrappear secciones con fadeUp**

Wrappear con `<motion.div variants={fadeUp}>` cada bloque directo:
1. El bloque del título (`<h2>Empezá ahora</h2>`)
2. El error (con `AnimatePresence` igual que Login Task 1 Step 4)
3. El selector de rol (`<div className="flex flex-col gap-2">` con label "Soy...")
4. El `<form>` completo
5. El divider
6. El `<p>` link "¿Ya tenés cuenta?"

- [ ] **Step 5: Animar role selector buttons**

Los dos `<button>` dentro del grid de roles (Cliente / Profesional), reemplazar por `<motion.button>` con:
```tsx
whileTap={{ scale: 0.95 }}
transition={SPRING_SOFT}
```
Remover `active:scale-[0.97]` del className.

- [ ] **Step 6: whileTap en submit**

Mismo patrón que Login Task 1 Step 5.

- [ ] **Step 7: Build**
```bash
npm run build
```
Expected: sin errores.

- [ ] **Step 8: Commit**
```bash
git add src/pages/Register.tsx
git commit -m "feat(motion): stagger form + animated role selector in Register"
```

---

## Task 3: Search — reemplazar CSS animations con Framer Motion

**Files:**
- Modify: `src/pages/Search.tsx`

Los profesionales ya usan `animate-fade-up` CSS. Reemplazar con Framer Motion.

- [ ] **Step 1: Agregar imports**
```tsx
import { motion } from 'framer-motion'
import { fadeUp, scaleIn, staggerFast, SPRING_SOFT } from '../lib/motion'
```

- [ ] **Step 2: Animar lista de profesionales**

Encontrar el bloque de cards al final del return:
```tsx
{filtered.map((pro, i) => (
  <div key={pro.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
    <ProfessionalCard ... />
  </div>
))}
```

Reemplazar por:
```tsx
<motion.div
  variants={staggerFast}
  initial="hidden"
  animate="visible"
  className="flex flex-col gap-3"
>
  {filtered.map((pro) => (
    <motion.div key={pro.id} variants={fadeUp}>
      <ProfessionalCard
        professional={pro}
        onClick={() => navigate(`/profesional/${pro.id}`)}
      />
    </motion.div>
  ))}
</motion.div>
```

- [ ] **Step 3: Animar estado vacío**

Reemplazar el bloque `{!loading && !error && filtered.length === 0 && ...}` — la div interior de `flex flex-col items-center gap-3 py-16`:
```tsx
{!loading && !error && filtered.length === 0 && (
  <motion.div
    variants={scaleIn}
    initial="hidden"
    animate="visible"
    className="flex flex-col items-center gap-3 py-16 text-center"
  >
    <div className="text-4xl">🔍</div>
    <p className="font-bold" style={{ color: '#111111' }}>No encontramos profesionales</p>
    <p className="text-sm" style={{ color: '#999999' }}>
      {activeFilters.size > 0 ? 'Probá quitando algún filtro' : 'Intentá con otra categoría'}
    </p>
    {activeFilters.size > 0 && (
      <motion.button
        type="button"
        onClick={() => setActiveFilters(new Set())}
        whileTap={{ scale: 0.97 }}
        transition={SPRING_SOFT}
        className="text-sm font-bold px-4 py-2 rounded-xl"
        style={{ background: 'rgba(232,104,58,.15)', color: '#e8683a' }}
      >
        Quitar filtros
      </motion.button>
    )}
  </motion.div>
)}
```

- [ ] **Step 4: whileTap en filter chips**

En los filter buttons dentro del header, reemplazar `<button>` por `<motion.button>` con `whileTap={{ scale: 0.94 }}` y `transition={SPRING_SOFT}`. Remover `active:scale-[.97]` del className.

- [ ] **Step 5: Build**
```bash
npm run build
```

- [ ] **Step 6: Commit**
```bash
git add src/pages/Search.tsx
git commit -m "feat(motion): replace CSS animations with Framer Motion stagger in Search"
```

---

## Task 4: Urgencias + MisSolicitudes — stagger de listas

**Files:**
- Modify: `src/pages/Urgencias.tsx`
- Modify: `src/pages/MisSolicitudes.tsx`

### Urgencias

- [ ] **Step 1: Agregar imports en Urgencias.tsx**
```tsx
import { motion } from 'framer-motion'
import { fadeUp, scaleIn, staggerFast } from '../lib/motion'
```

- [ ] **Step 2: Reemplazar CSS animations en la lista**

Encontrar:
```tsx
{professionals.map((pro, i) => (
  <div key={pro.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
    <UrgentProfessionalCard professional={pro} />
  </div>
))}
```

Reemplazar por:
```tsx
<motion.div
  variants={staggerFast}
  initial="hidden"
  animate="visible"
  className="flex flex-col gap-3"
>
  {professionals.map((pro) => (
    <motion.div key={pro.id} variants={fadeUp}>
      <UrgentProfessionalCard professional={pro} />
    </motion.div>
  ))}
</motion.div>
```

- [ ] **Step 3: Animar estado vacío en Urgencias**

Reemplazar `<div className="text-center py-12">` del estado vacío por:
```tsx
<motion.div
  variants={scaleIn}
  initial="hidden"
  animate="visible"
  className="text-center py-12"
>
  <div className="text-4xl mb-3">😴</div>
  <p className="font-medium" style={{ color: '#555555' }}>No hay profesionales disponibles ahora</p>
  <p className="text-sm mt-1" style={{ color: '#999999' }}>Intentá de nuevo en unos minutos</p>
</motion.div>
```

### MisSolicitudes

- [ ] **Step 4: Agregar imports en MisSolicitudes.tsx**
```tsx
import { motion } from 'framer-motion'
import { fadeUp, scaleIn, staggerFast, SPRING_SOFT } from '../lib/motion'
```

- [ ] **Step 5: Reemplazar CSS animations en lista de solicitudes**

Encontrar el `{requests.map((req) => (` block. La estructura actual es:
```tsx
{requests.map((req) => {
  ...
  return (
    <div key={req.id} className="animate-fade-up">
      <div className="rounded-2xl overflow-hidden" ...>
        ...
      </div>
    </div>
  )
})}
```

Wrappear el contenido completo en un container stagger y reemplazar el `<div key={req.id} className="animate-fade-up">` por `<motion.div key={req.id} variants={fadeUp}>`:

```tsx
<motion.div
  variants={staggerFast}
  initial="hidden"
  animate="visible"
  className="flex flex-col gap-3"
>
  {requests.map((req) => {
    const status = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending
    const date = new Date(req.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })
    const hasAction = req.status === 'completed' || req.status === 'pending'
    return (
      <motion.div key={req.id} variants={fadeUp}>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E8E0D4',
            boxShadow: '0 2px 8px rgba(0,0,0,.06)',
          }}
        >
          {/* ...contenido existente sin cambios... */}
        </div>
      </motion.div>
    )
  })}
</motion.div>
```

- [ ] **Step 6: Animar estado vacío de MisSolicitudes**

Reemplazar `<div className="flex flex-col items-center gap-4 py-16 text-center">` por:
```tsx
<motion.div
  variants={scaleIn}
  initial="hidden"
  animate="visible"
  className="flex flex-col items-center gap-4 py-16 text-center"
>
```
Y el botón "Buscar profesionales" al final del estado vacío reemplazar por `<motion.button>` con `whileTap={{ scale: 0.97 }}` y `transition={SPRING_SOFT}`.

- [ ] **Step 7: Build**
```bash
npm run build
```
Expected: sin errores TypeScript.

- [ ] **Step 8: Commit**
```bash
git add src/pages/Urgencias.tsx src/pages/MisSolicitudes.tsx
git commit -m "feat(motion): stagger lists + animated empty states in Urgencias and MisSolicitudes"
```

---

## Task 5: HowItWorks + FeaturedProfessionals — home components

**Files:**
- Modify: `src/components/home/HowItWorks.tsx`
- Modify: `src/components/home/FeaturedProfessionals.tsx`

### HowItWorks

- [ ] **Step 1: Agregar imports en HowItWorks.tsx**
```tsx
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, SPRING_SOFT } from '../../lib/motion'
```

Nota: HowItWorks está en `src/components/home/`, por lo que el path a lib es `../../lib/motion`.

- [ ] **Step 2: Animar el container principal**

El return del componente empieza con `<div className="rounded-2xl overflow-hidden" ...>`. Reemplazar por `<motion.div>` con stagger:
```tsx
<motion.div
  className="rounded-2xl overflow-hidden"
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  style={{
    background: '#FFFFFF',
    border: '1.5px solid #E8E0D4',
    boxShadow: '0 2px 10px rgba(0,0,0,.06)',
  }}
>
```

- [ ] **Step 3: Animar header y pasos con fadeUp**

El header section (div con "Bienvenido" y el h3) wrappear en `<motion.div variants={fadeUp}>`.

El map de pasos:
```tsx
{[...].map((step) => (
  <div key={step.n} className="flex items-start gap-3">
```
Reemplazar `<div key={step.n}` por `<motion.div key={step.n} variants={fadeUp}`.

- [ ] **Step 4: Animar botón CTA**

Reemplazar `<button type="button" onClick={dismiss}` por:
```tsx
<motion.button
  type="button"
  onClick={dismiss}
  variants={fadeUp}
  whileTap={{ scale: 0.97 }}
  transition={SPRING_SOFT}
  className="w-full rounded-xl py-2.5 text-sm font-bold"
  style={{ background: '#E8683A', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(232,104,58,.25)' }}
>
  Entendido, ¡empecemos! →
</motion.button>
```

### FeaturedProfessionals

- [ ] **Step 5: Agregar imports en FeaturedProfessionals.tsx**
```tsx
import { motion } from 'framer-motion'
import { fadeUp, scaleIn, staggerFast, SPRING_SOFT } from '../../lib/motion'
```

- [ ] **Step 6: Animar título**

Reemplazar `<h2 className="text-[11px] font-bold uppercase...">Más recomendados</h2>` por:
```tsx
<motion.h2
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
  className="text-[11px] font-bold uppercase tracking-[.7px] mb-2.5"
  style={{ color: '#999999' }}
>
  Más recomendados
</motion.h2>
```

- [ ] **Step 7: Animar chips de categoría**

Reemplazar el container de filtros `<div className="flex gap-2 overflow-x-auto mb-4" ...>` por `<motion.div>` y cada `<button>` chip por `<motion.button>` con `whileTap={{ scale: 0.94 }}` y `transition={SPRING_SOFT}`. Remover `active:scale-95 transition-all duration-150` del className.

- [ ] **Step 8: Reemplazar CSS animations en la lista de cards**

Encontrar:
```tsx
{visible.map((pro, i) => (
  <div key={pro.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
    <ProfessionalCard ... />
  </div>
))}
```

Reemplazar por:
```tsx
<motion.div
  variants={staggerFast}
  initial="hidden"
  animate="visible"
  className="flex flex-col gap-2"
>
  {visible.map((pro) => (
    <motion.div key={pro.id} variants={fadeUp}>
      <ProfessionalCard
        professional={pro}
        onClick={() => navigate(`/profesional/${pro.id}`)}
      />
    </motion.div>
  ))}
</motion.div>
```

- [ ] **Step 9: Build**
```bash
npm run build
```
Expected: sin errores.

- [ ] **Step 10: Commit**
```bash
git add src/components/home/HowItWorks.tsx src/components/home/FeaturedProfessionals.tsx
git commit -m "feat(motion): stagger steps and cards in HowItWorks and FeaturedProfessionals"
```

---

## Task 6: ProfessionalDetail — hero + secciones + CTA animado

**Files:**
- Modify: `src/pages/ProfessionalDetail.tsx`

- [ ] **Step 1: Leer el archivo actual**

Leer `src/pages/ProfessionalDetail.tsx` completo para entender la estructura antes de modificar.

- [ ] **Step 2: Agregar imports**
```tsx
import { motion } from 'framer-motion'
import { fadeUp, scaleIn, staggerContainer, staggerFast, SPRING_SOFT, SPRING_GENTLE } from '../lib/motion'
```

- [ ] **Step 3: Animar container principal con stagger**

Encontrar el div raíz dentro del return del PageShell. Reemplazarlo por `<motion.div variants={staggerContainer} initial="hidden" animate="visible">`.

- [ ] **Step 4: Animar hero section con fadeUp**

La sección hero (avatar + nombre + categoría) wrappearla en `<motion.div variants={fadeUp}>`.

- [ ] **Step 5: Animar stats row con scaleIn**

La fila de stats (rating, trabajos, zona) wrappearla en `<motion.div variants={scaleIn}>`.

- [ ] **Step 6: Animar secciones restantes con fadeUp**

Cada sección independiente (descripción/bio, fotos, reseñas, zonas) wrappear en `<motion.div variants={fadeUp}>`.

- [ ] **Step 7: Animar botón CTA fijo**

El botón "Solicitar trabajo" fijo al fondo reemplazar por:
```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.4, ...SPRING_GENTLE }}
  className="fixed bottom-0 left-0 right-0 p-4"
  style={{ background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #EDE8DE' }}
>
  <motion.button
    type="button"
    onClick={...}
    whileTap={{ scale: 0.97 }}
    transition={SPRING_SOFT}
    className="w-full rounded-2xl py-4 text-base font-bold text-white"
    style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
  >
    Solicitar trabajo
  </motion.button>
</motion.div>
```

Preservar toda la lógica existente (navigate, pro data, etc.).

- [ ] **Step 8: Build**
```bash
npm run build
```
Expected: BUILD EXITOSO sin errores TypeScript.

- [ ] **Step 9: Commit**
```bash
git add src/pages/ProfessionalDetail.tsx
git commit -m "feat(motion): hero stagger + animated CTA in ProfessionalDetail"
```

---

## Self-Review

**Spec coverage:**
- ✅ Login — hero scaleIn, form stagger, error AnimatePresence, whileTap → Task 1
- ✅ Register — mismo patrón + role selector animado → Task 2
- ✅ Search — CSS animations reemplazadas, lista stagger, empty state scaleIn, filter chips whileTap → Task 3
- ✅ Urgencias — lista stagger, empty state scaleIn → Task 4
- ✅ MisSolicitudes — lista stagger, empty state scaleIn + whileTap → Task 4
- ✅ HowItWorks — steps stagger, CTA whileTap → Task 5
- ✅ FeaturedProfessionals — título animado, chips whileTap, cards stagger → Task 5
- ✅ ProfessionalDetail — hero/stats/secciones stagger, CTA slide-up → Task 6

**Placeholder scan:** ninguno.

**Type consistency:**
- `SPRING_SOFT`, `SPRING_GENTLE` importados de `../lib/motion` o `../../lib/motion` según depth → consistente
- `staggerFast`, `staggerContainer`, `fadeUp`, `scaleIn` — todos exportados en `src/lib/motion.ts` → consistente
- Spread `...SPRING_GENTLE` en Task 6 Step 7 es válido porque `SPRING_GENTLE` es tipo `Transition` → correcto
