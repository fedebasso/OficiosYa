# Aceptar/Rechazar Solicitudes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completar el flujo de aceptación/rechazo: el pro rechaza con confirmación mínima, el cliente ve un banner cuando su solicitud es aceptada, y puede re-enviar a otro profesional cuando es rechazada.

**Architecture:** Cuatro cambios independientes: (1) modal de confirmación de rechazo en `ProRequests`, (2) banner de aceptación + CTA post-rechazo en `MisSolicitudes`, (3) CTA post-rechazo en `SolicitudDetail`, (4) nueva página `BuscarOtroProfesional` con lista filtrada de pros y ruta en `App.tsx`. No se modifica el store ni el backend — todo usa `updateStatus` existente.

**Tech Stack:** React + TypeScript, Zustand (`requestStore`), Framer Motion, React Router v6, `useProfessionals` hook, `scoreProfessional` + `isInRadius` de `lib/`

## Global Constraints

- Naranja primario: `#E8683A`, fondo página: `#F9F6F2`, fondo cards: `#FFFFFF`, border: `#E8E0D4`
- `font-black` para títulos h1/h2, `font-bold` para labels y CTAs
- `rounded-2xl` contenedores/botones principales, `rounded-xl` chips
- Animaciones con `framer-motion` — usar `SPRING_SOFT` de `src/lib/motion.ts` para sheets, `fadeUp` para cards
- TypeScript estricto — `npx tsc -b` debe dar 0 errores antes de cada commit
- Git commits desde `C:\Users\fede8\OficiosYa` (root del repo, no desde `oficioYa/`)
- Comandos TypeScript desde `C:\Users\fede8\OficiosYa\oficioYa`

---

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|----------------|
| `src/pages/pro/ProRequests.tsx` | Modificar | Agregar modal de confirmación antes de rechazar |
| `src/pages/MisSolicitudes.tsx` | Modificar | Banner de aceptación + CTA "Buscar otro" en cards canceladas |
| `src/pages/SolicitudDetail.tsx` | Modificar | CTA "Buscar otro" en estado cancelado |
| `src/pages/BuscarOtroProfesional.tsx` | Crear | Lista de pros filtrada para re-envío |
| `src/App.tsx` | Modificar | Agregar ruta `/buscar-profesional/:requestId` |

---

## Task 1: Modal de confirmación de rechazo en `ProRequests.tsx`

**Files:**
- Modify: `src/pages/pro/ProRequests.tsx`

**Interfaces:**
- Produces: comportamiento de rechazo con confirmación (sin cambios de firma — mismo `updateStatus`)

- [ ] **Step 1: Agregar estado `rejectingId` y handler en el componente `ProRequests`**

Dentro de `export default function ProRequests()`, agregar después de `const [historyOpen, setHistoryOpen] = useState(true)`:

```tsx
const [rejectingId, setRejectingId] = useState<string | null>(null)

function handleConfirmReject() {
  if (!rejectingId) return
  updateStatus(rejectingId, 'cancelled')
  setRejectingId(null)
}
```

- [ ] **Step 2: Cambiar el `onReject` de las cards para abrir el modal en vez de rechazar directamente**

Buscar en `ProRequests` la línea:
```tsx
onReject={() => updateStatus(req.id, 'cancelled')}
```
Reemplazarla por:
```tsx
onReject={() => setRejectingId(req.id)}
```

- [ ] **Step 3: Agregar el bottom sheet de confirmación al final del JSX, antes del `</div>` final**

Insertar antes del cierre del `return` (antes del `<style>` existente):

```tsx
{/* ── Modal confirmación de rechazo ── */}
<AnimatePresence>
  {rejectingId && (
    <>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,.45)' }}
        onClick={() => setRejectingId(null)}
      />
      <motion.div
        key="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-6 flex flex-col gap-4"
        style={{ background: '#FFFFFF', maxWidth: 480, margin: '0 auto' }}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-base font-black" style={{ color: '#111111' }}>
            ¿Rechazar esta solicitud?
          </p>
          <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            type="button"
            onClick={() => setRejectingId(null)}
            whileTap={{ scale: 0.97 }}
            className="flex-1 rounded-2xl py-3.5 text-sm font-bold"
            style={{ background: '#F5F0E8', color: '#555555', border: '1.5px solid #E8E0D4' }}
          >
            Cancelar
          </motion.button>
          <motion.button
            type="button"
            onClick={handleConfirmReject}
            whileTap={{ scale: 0.97 }}
            className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-white"
            style={{ background: '#DC2626', boxShadow: '0 4px 14px rgba(220,38,38,.3)' }}
          >
            Rechazar →
          </motion.button>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

- [ ] **Step 4: Verificar TypeScript**

```bash
cd C:\Users\fede8\OficiosYa\oficioYa && npx tsc -b 2>&1
```
Esperado: 0 errores.

- [ ] **Step 5: Verificar visualmente**

Correr `npm run dev` desde `C:\Users\fede8\OficiosYa\oficioYa`. Navegar a `/pro/solicitudes`. Tocar "Rechazar" en una solicitud pendiente. Verificar:
- Aparece el overlay oscuro y el sheet con animación spring ✓
- "Cancelar" cierra sin cambiar el estado ✓
- "Rechazar →" cambia el estado a `cancelled` y cierra el sheet ✓

- [ ] **Step 6: Commit**

```bash
cd C:\Users\fede8\OficiosYa && git add oficioYa/src/pages/pro/ProRequests.tsx
git commit -m "feat: modal de confirmación antes de rechazar solicitud"
```

---

## Task 2: Banner de aceptación + CTA "Buscar otro" en `MisSolicitudes.tsx`

**Files:**
- Modify: `src/pages/MisSolicitudes.tsx`

**Interfaces:**
- Produces: navegación a `/buscar-profesional/:requestId` al tocar "Buscar otro profesional" en cards canceladas

- [ ] **Step 1: Agregar estado `seenConfirmed` y lógica de detección de aceptación**

Dentro de `export default function MisSolicitudes()`, agregar después de `const [query, setQuery] = useState('')`:

```tsx
const [seenConfirmed, setSeenConfirmed] = useState<Set<string>>(new Set())
const [acceptedBanners, setAcceptedBanners] = useState<string[]>([])

useEffect(() => {
  const newlyConfirmed = requests.filter(
    (r) => r.status === 'confirmed' && !seenConfirmed.has(r.id)
  )
  if (newlyConfirmed.length === 0) return
  setSeenConfirmed((prev) => {
    const next = new Set(prev)
    newlyConfirmed.forEach((r) => next.add(r.id))
    return next
  })
  setAcceptedBanners((prev) => [
    ...prev,
    ...newlyConfirmed.map((r) => r.id).filter((id) => !prev.includes(id)),
  ])
}, [requests])
```

- [ ] **Step 2: Agregar el banner de aceptación debajo del header**

En el JSX del `return`, debajo de `{header}` y antes del contenido de las solicitudes, insertar:

```tsx
{/* ── Banners de aceptación ── */}
<AnimatePresence>
  {acceptedBanners.map((reqId) => {
    const req = requests.find((r) => r.id === reqId)
    if (!req) return null
    const pro = MOCK_PROFESSIONALS.find((p) => p.id === req.professional_id)
    const firstName = (pro?.profiles?.full_name ?? 'El profesional').split(' ')[0]
    return (
      <motion.div
        key={reqId}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="mx-3 mt-3 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, #E8683A, #c44d1f)',
          boxShadow: '0 4px 16px rgba(232,104,58,.35)',
        }}
      >
        <span style={{ fontSize: 22, flexShrink: 0 }}>🎉</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white leading-tight">
            ¡{firstName} aceptó tu trabajo!
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.75)' }}>
            Coordiná los detalles por chat
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAcceptedBanners((prev) => prev.filter((id) => id !== reqId))
              navigate(`/solicitud/${reqId}/chat`)
            }}
            className="rounded-xl px-3 py-1.5 text-xs font-bold"
            style={{ background: 'rgba(255,255,255,.2)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,.3)' }}
          >
            Chat →
          </motion.button>
          <button
            type="button"
            onClick={() => setAcceptedBanners((prev) => prev.filter((id) => id !== reqId))}
            style={{ color: 'rgba(255,255,255,.6)', fontSize: 18, lineHeight: 1, fontWeight: 900 }}
          >
            ×
          </button>
        </div>
      </motion.div>
    )
  })}
</AnimatePresence>
```

- [ ] **Step 3: Agregar CTA "Buscar otro profesional" en cards canceladas dentro de `SolicitudCard`**

Dentro de la función `SolicitudCard`, en la sección de "Acciones" (donde está el botón "Ir al chat" para `confirmed`), agregar el caso para `cancelled`. Buscar el bloque:

```tsx
{(req.status === 'confirmed' || req.status === 'in_progress') && (
  <button
    type="button"
    onClick={() => navigate(`/solicitud/${req.id}/chat`)}
```

Agregar ANTES de ese bloque:

```tsx
{req.status === 'cancelled' && (
  <motion.button
    type="button"
    whileTap={{ scale: 0.97 }}
    onClick={() => navigate(`/buscar-profesional/${req.id}`)}
    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold"
    style={{ background: 'rgba(232,104,58,.08)', color: '#E8683A', border: '1.5px solid rgba(232,104,58,.25)' }}
  >
    🔍 Buscar otro profesional
  </motion.button>
)}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
cd C:\Users\fede8\OficiosYa\oficioYa && npx tsc -b 2>&1
```
Esperado: 0 errores.

- [ ] **Step 5: Verificar visualmente**

En la app, con una solicitud en estado `confirmed`: navegar a `/mis-solicitudes` y verificar que aparece el banner naranja con el nombre del profesional y el botón "Chat →". Tocar "×" descarta el banner. Tocar "Chat →" navega al chat.

Con una solicitud en estado `cancelled`: verificar que aparece el botón "🔍 Buscar otro profesional" en la card. (La navegación a `/buscar-profesional/:id` dará 404 hasta Task 4, eso es esperado.)

- [ ] **Step 6: Commit**

```bash
cd C:\Users\fede8\OficiosYa && git add oficioYa/src/pages/MisSolicitudes.tsx
git commit -m "feat: banner de aceptación y CTA buscar otro profesional en MisSolicitudes"
```

---

## Task 3: CTA "Buscar otro profesional" en `SolicitudDetail.tsx`

**Files:**
- Modify: `src/pages/SolicitudDetail.tsx`

**Interfaces:**
- Produces: navegación a `/buscar-profesional/:id` desde la pantalla de detalle

- [ ] **Step 1: Agregar el CTA al estado cancelado en el JSX**

En `SolicitudDetail.tsx`, buscar el bloque que renderiza cuando `isCancelled` (hay una condición `{!isCancelled && (` que muestra el stepper). Debajo del bloque de descripción del trabajo, hay acciones del cliente. Buscar la sección de acciones (donde está el botón de cancelar y el de chat). Localizar donde aparece el estado `cancelled` — en `STATUS_CONFIG.cancelled.desc` = `'La solicitud fue cancelada.'`.

Después del bloque `{isCancelled && (...)}` o al final de las acciones del cliente, agregar:

```tsx
{/* CTA buscar otro profesional (solo para solicitudes canceladas) */}
{isCancelled && (
  <motion.div variants={fadeUp}>
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'rgba(232,104,58,.06)', border: '1.5px solid rgba(232,104,58,.2)' }}
    >
      <div>
        <p className="text-sm font-black" style={{ color: '#111111' }}>
          El profesional no pudo tomar el trabajo
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>
          Podés enviar la misma solicitud a otro profesional.
        </p>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate(`/buscar-profesional/${req.id}`)}
        className="w-full rounded-2xl py-3.5 text-sm font-bold text-white"
        style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
      >
        🔍 Buscar otro profesional
      </motion.button>
    </div>
  </motion.div>
)}
```

Para ubicar exactamente dónde insertar: buscar en el archivo el texto `isCancelled` — hay una condición `{!isCancelled && (` que rodea el stepper. El bloque nuevo va dentro del `<motion.div variants={staggerContainer}>` principal, después de todos los demás bloques de información (descripción, datos del trabajo, etc.), antes del cierre del div principal.

- [ ] **Step 2: Verificar TypeScript**

```bash
cd C:\Users\fede8\OficiosYa\oficioYa && npx tsc -b 2>&1
```
Esperado: 0 errores.

- [ ] **Step 3: Verificar visualmente**

Navegar a una solicitud cancelada en `/solicitud/:id`. Verificar que aparece la card naranja con el botón "🔍 Buscar otro profesional". (Navegación dará 404 hasta Task 4.)

- [ ] **Step 4: Commit**

```bash
cd C:\Users\fede8\OficiosYa && git add oficioYa/src/pages/SolicitudDetail.tsx
git commit -m "feat: CTA buscar otro profesional en SolicitudDetail cuando cancelado"
```

---

## Task 4: Nueva página `BuscarOtroProfesional.tsx` + ruta en `App.tsx`

**Files:**
- Create: `src/pages/BuscarOtroProfesional.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes:
  - `useRequestStore` para obtener la solicitud original por `requestId`
  - `useProfessionals(category)` de `../hooks/useProfessionals`
  - `scoreProfessional(pro, clientZone)` de `../lib/scoring`
  - `isInRadius(proZone, radiusKm, clientZone)` de `../lib/barrio-coords`
  - `getCategoryMeta(category)` de `../lib/categories`
  - `SPRING_GENTLE` de `../lib/motion`
- Produces: navegación a `/ticket/confirmar` con state pre-cargado

- [ ] **Step 1: Crear `src/pages/BuscarOtroProfesional.tsx`**

```tsx
// src/pages/BuscarOtroProfesional.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageShell } from '../components/layout/PageShell'
import { useRequestStore } from '../store/requestStore'
import { useProfessionals } from '../hooks/useProfessionals'
import { scoreProfessional } from '../lib/scoring'
import { isInRadius } from '../lib/barrio-coords'
import { getCategoryMeta } from '../lib/categories'
import { SPRING_GENTLE, fadeUp, staggerFast } from '../lib/motion'
import type { ProfessionalWithProfile } from '../hooks/useProfessionals'

export default function BuscarOtroProfesional() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const { requests } = useRequestStore()

  const req = requests.find((r) => r.id === requestId)
  const category = req?.category ?? ''
  const clientZone = req?.location ?? ''

  const { professionals, loading } = useProfessionals(category)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sorted = professionals
    .filter((p) => isInRadius(p.zone, p.radius_km, clientZone))
    .map((p) => ({ pro: p, score: scoreProfessional(p, clientZone) }))
    .sort((a, b) => b.score - a.score)
    .map(({ pro }) => pro)

  useEffect(() => {
    if (sorted.length > 0 && selectedId === null) setSelectedId(sorted[0].id)
  }, [sorted.length])

  const selectedPro = sorted.find((p) => p.id === selectedId) ?? null

  function handleContinuar() {
    if (!selectedPro || !req) return
    navigate('/ticket/confirmar', {
      state: {
        ticket: {
          title: req.description,
          description: req.description,
          category: req.category,
          urgent: req.urgency,
          work_type: req.work_type ?? 'otro',
        },
        proId: selectedPro.id,
        proName: selectedPro.profiles.full_name,
        proAvatar: selectedPro.profiles.avatar_url ?? null,
        proRating: selectedPro.avg_rating ?? null,
        zone: clientZone,
      },
    })
  }

  const { emoji, label } = getCategoryMeta(category)

  const header = (
    <div
      className="px-4 pt-10 pb-4 sticky top-0 z-50 flex items-center gap-3"
      style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)' }}
    >
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0"
      >
        <ChevronLeft size={24} style={{ color: '#111111' }} />
      </button>
      <div>
        <h1 className="text-base font-black leading-tight" style={{ color: '#111111' }}>
          Buscar otro profesional
        </h1>
        <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>
          {emoji} {label}{clientZone ? ` · ${clientZone}` : ''}
        </p>
      </div>
    </div>
  )

  if (!req) {
    return (
      <PageShell showBottomNav={false} header={header}>
        <div className="flex flex-col items-center gap-4 py-24 text-center px-6">
          <div className="text-4xl">📋</div>
          <p className="font-black text-base" style={{ color: '#111' }}>Solicitud no encontrada</p>
          <button
            type="button"
            onClick={() => navigate('/mis-solicitudes')}
            className="rounded-2xl px-6 py-3 text-sm font-bold text-white"
            style={{ background: '#E8683A' }}
          >
            Volver a mis solicitudes
          </button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell showBottomNav={false} header={header}>
      <div className="flex flex-col pb-28" style={{ background: '#F9F6F2', minHeight: '100%' }}>

        {/* Descripción original */}
        <div className="p-4 pb-3" style={{ background: '#FFFFFF', borderBottom: '1px solid #F0EBE1' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#AAAAAA' }}>
            Tu solicitud original
          </p>
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#555555' }}>
            {req.description}
          </p>
        </div>

        {/* Lista de profesionales */}
        <div className="flex-1 p-4 flex flex-col gap-3">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#AAAAAA' }}>
            Tocá para elegir un profesional
          </p>

          {loading && (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl"
                  style={{
                    background: 'linear-gradient(90deg,#EDE8DE 25%,#F5F0E8 50%,#EDE8DE 75%)',
                    backgroundSize: '200% 100%',
                    animation: `shimmer 1.4s ease-in-out ${i * 0.15}s infinite`,
                    border: '1.5px solid #E8E0D4',
                  }}
                />
              ))}
            </div>
          )}

          {!loading && sorted.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="text-4xl">😔</div>
              <p className="font-black text-base" style={{ color: '#111' }}>
                Sin profesionales disponibles
              </p>
              <p className="text-sm" style={{ color: '#AAA' }}>
                No encontramos profesionales para esta categoría en tu zona.
              </p>
            </div>
          )}

          {!loading && (
            <motion.div
              variants={staggerFast}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3"
            >
              {sorted.slice(0, 8).map((pro) => {
                const selected = pro.id === selectedId
                return (
                  <motion.button
                    key={pro.id}
                    type="button"
                    variants={fadeUp}
                    onClick={() => setSelectedId(pro.id)}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-2xl text-left w-full"
                    style={{
                      background: '#FFFFFF',
                      border: `2px solid ${selected ? '#E8683A' : '#EDE8DE'}`,
                      boxShadow: selected ? '0 2px 12px rgba(232,104,58,.18)' : '0 1px 3px rgba(0,0,0,.04)',
                    }}
                  >
                    <div className="flex items-center gap-3 p-3">
                      {pro.profiles.avatar_url ? (
                        <img
                          src={pro.profiles.avatar_url}
                          alt={pro.profiles.full_name}
                          className="rounded-xl object-cover flex-shrink-0"
                          style={{ width: 44, height: 44 }}
                        />
                      ) : (
                        <div
                          className="rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white"
                          style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#E8683A,#c44d1f)', fontSize: 17 }}
                        >
                          {pro.profiles.full_name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate" style={{ color: '#111' }}>
                          {pro.profiles.full_name}
                        </div>
                        <div className="text-[10px]" style={{ color: '#AAAAAA' }}>
                          {pro.avg_rating != null && (
                            <><span style={{ color: '#f59e0b' }}>★</span> {pro.avg_rating} · </>
                          )}
                          {pro.jobs_count} trabajos
                          {pro.response_time_min > 0 && ` · ~${pro.response_time_min}min`}
                        </div>
                        <span className="text-[9px] font-bold" style={{ color: '#AAAAAA' }}>
                          {pro.radius_km === null ? '🌍 Toda la ciudad' : `📍 ${pro.zone} · ${pro.radius_km} km`}
                        </span>
                      </div>
                      <div className="relative flex-shrink-0" style={{ width: 22, height: 22 }}>
                        <AnimatePresence mode="wait">
                          {selected ? (
                            <motion.div
                              key="selected"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              className="absolute inset-0 rounded-full flex items-center justify-center font-black text-white"
                              style={{ background: '#E8683A', fontSize: 11 }}
                            >
                              ✓
                            </motion.div>
                          ) : (
                            <motion.div
                              key="unselected"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                              className="absolute inset-0 rounded-full"
                              style={{ border: '1.5px solid #DDD' }}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* CTA fijo */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, ...SPRING_GENTLE }}
        className="fixed bottom-0 left-0 right-0 p-4"
        style={{ background: 'rgba(249,246,242,.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #EDE8DE', maxWidth: 480, margin: '0 auto' }}
      >
        <motion.button
          type="button"
          onClick={handleContinuar}
          disabled={!selectedPro}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-2xl py-4 text-base font-bold text-white disabled:opacity-40"
          style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
        >
          {selectedPro
            ? `Continuar con ${selectedPro.profiles.full_name.split(' ')[0]} →`
            : 'Elegí un profesional'}
        </motion.button>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </PageShell>
  )
}
```

- [ ] **Step 2: Agregar la ruta en `App.tsx`**

En `src/App.tsx`, agregar el import:
```tsx
import BuscarOtroProfesional from './pages/BuscarOtroProfesional'
```

Y agregar la ruta dentro del bloque `<Routes>` de clientes (junto a las rutas de `/mis-solicitudes`, `/ticket`, etc.):
```tsx
<Route path="/buscar-profesional/:requestId" element={<ProtectedRoute><BuscarOtroProfesional /></ProtectedRoute>} />
```

La ruta va después de la línea `<Route path="/ticket/confirmar" element={<TicketConfirm />} />`.

- [ ] **Step 3: Verificar TypeScript**

```bash
cd C:\Users\fede8\OficiosYa\oficioYa && npx tsc -b 2>&1
```
Esperado: 0 errores.

- [ ] **Step 4: Verificar visualmente el flujo completo**

1. Ir a `/mis-solicitudes` — tocar "Buscar otro profesional" en una solicitud cancelada → navega a `/buscar-profesional/:id` ✓
2. La lista muestra profesionales de la misma categoría ordenados por score ✓
3. Primer profesional preseleccionado ✓
4. Tocar otro profesional lo selecciona ✓
5. CTA dice "Continuar con [Nombre] →" ✓
6. Tocar CTA navega a `/ticket/confirmar` con datos pre-cargados ✓
7. `TicketConfirm` muestra el resumen del ticket original + el nuevo profesional ✓

- [ ] **Step 5: Commit**

```bash
cd C:\Users\fede8\OficiosYa && git add oficioYa/src/pages/BuscarOtroProfesional.tsx oficioYa/src/App.tsx
git commit -m "feat: página BuscarOtroProfesional y ruta /buscar-profesional/:requestId"
```

---

## Self-Review

**Spec coverage:**
- ✅ Modal de confirmación de rechazo (sin motivo) — Task 1
- ✅ Banner de aceptación con nombre del pro y botón Chat → — Task 2
- ✅ CTA "Buscar otro profesional" en cards canceladas de MisSolicitudes — Task 2
- ✅ CTA "Buscar otro profesional" en SolicitudDetail cancelado — Task 3
- ✅ Nueva página con lista de pros filtrada por categoría y zona — Task 4
- ✅ Al elegir pro → navega a TicketConfirm con datos pre-cargados — Task 4
- ✅ `requestStore` y `TicketConfirm` sin modificaciones — verificado en diseño de tasks

**Placeholder scan:** Sin TBDs, sin "implement later". Código completo en todos los steps.

**Type consistency:**
- `req.work_type ?? 'otro'` — `work_type` es `WorkType | undefined` en `ServiceRequest`, el fallback es necesario y `'otro'` es un valor válido de `WorkType` ✓
- `pro.profiles.avatar_url ?? null` — `TicketConfirm` espera `proAvatar: string | null` ✓
- `pro.avg_rating ?? null` — `TicketConfirm` espera `proRating: number | null` ✓
- `scoreProfessional(p, clientZone)` — firma actual acepta solo dos argumentos (opts es opcional) ✓
