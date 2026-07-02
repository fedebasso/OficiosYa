# Dashboard del profesional — pulido + funcionalidad — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar el toggle "Disponible ahora", stats reales, y unificar la card de trabajo en curso entre Dashboard y Solicitudes, con pulido premium.

**Architecture:** `professionalStore` gana `availableNow` (localStorage en demo) y `avg_rating` en el mock. Se extrae `ActiveJobCard` compartido y helpers a `proFormat.ts`. `ProDashboard` suma el toggle + rating real + usa `ActiveJobCard`. `ProRequests` usa `ActiveJobCard` en la sección activa.

**Tech Stack:** React + TypeScript + zustand + framer-motion + lucide-react

## Global Constraints

- Lenguaje premium: card `#FFFFFF` borde `1px solid #ECE6DC` sombra `0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)` radios 16-20; naranja `#E8683A`/`#D4571F`, verde `#22A559`/`#16A34A`, estrella `#F5A623`; íconos lucide
- `availableNow` persiste en `localStorage` clave `pro_available_now` en demo
- No tocar el registro del profesional
- Correr `npm run lint` y `npm run build` antes del push

---

### Task 1: professionalStore — availableNow + avg_rating

**Files:**
- Modify: `src/store/professionalStore.ts`
- Modify: `src/types/registration.ts`

**Interfaces:**
- Produces: `availableNow: boolean`, `setAvailableNow(v: boolean): void` en `useProfessionalStore`; `avg_rating?: number` en `RegistrationState`.

- [ ] **Step 1: Agregar `avg_rating` a `RegistrationState`**

En `src/types/registration.ts`, dentro de la interface `RegistrationState`, agregar el campo (leer el archivo primero; agregar junto a los otros campos opcionales):
```ts
  avg_rating?: number
```

- [ ] **Step 2: Setear `avg_rating` en el mock y agregar el estado/acción de disponibilidad**

En `src/store/professionalStore.ts`:

1. En `MOCK_PROFILE`, agregar `avg_rating: 4.8,` (junto a los otros campos).

2. En la interface `ProfessionalStore`, agregar:
```ts
  availableNow: boolean
  setAvailableNow: (v: boolean) => void
```

3. En el `create(...)`, agregar el estado inicial y la acción (leyendo/persistiendo en localStorage):
```ts
  availableNow: (typeof localStorage !== 'undefined' ? localStorage.getItem('pro_available_now') : null) !== '0',
  setAvailableNow: (v: boolean) => {
    try { localStorage.setItem('pro_available_now', v ? '1' : '0') } catch { /* no-op */ }
    set({ availableNow: v })
  },
```
(Ubicarlo junto a `profile`, `loading`, etc. en el objeto del store.)

- [ ] **Step 3: Verificar TypeScript**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/store/professionalStore.ts src/types/registration.ts
git commit -m "feat: pro availableNow state (localStorage) and avg_rating in profile"
```

---

### Task 2: Helpers compartidos `proFormat.ts`

**Files:**
- Create: `src/lib/proFormat.ts`

**Interfaces:**
- Produces: `timeAgo(iso: string): string`, `formatScheduled(iso: string): string`

- [ ] **Step 1: Crear `src/lib/proFormat.ts`**

```ts
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Ahora'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export function formatScheduled(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })
  const hasTime = iso.includes('T') && !iso.endsWith('T00:00:00')
  const time = hasTime ? d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : null
  return time ? `${date} · ${time}hs` : date
}
```

- [ ] **Step 2: Verificar TypeScript**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/proFormat.ts
git commit -m "chore: shared pro date/time formatters"
```

---

### Task 3: Componente compartido `ActiveJobCard`

**Files:**
- Create: `src/components/pro/ActiveJobCard.tsx`

**Interfaces:**
- Consumes: `timeAgo`, `formatScheduled` (Task 2), `getCategoryMeta`, `getCategoryIcon`
- Produces:
  ```ts
  interface ActiveJobCardProps { req: ServiceRequest; onProgress: (s: ServiceRequest['status']) => void; onChat: () => void; sentProgress?: boolean }
  export function ActiveJobCard(props: ActiveJobCardProps): JSX.Element
  ```

- [ ] **Step 1: Crear `src/components/pro/ActiveJobCard.tsx`**

```tsx
import { createElement } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Clock, Calendar, Navigation, Flag, CheckCircle2, Siren } from 'lucide-react'
import type { ServiceRequest } from '../../store/requestStore'
import { getCategoryMeta, getCategoryIcon } from '../../lib/categories'
import { timeAgo, formatScheduled } from '../../lib/proFormat'

interface ActiveJobCardProps {
  req: ServiceRequest
  onProgress: (s: ServiceRequest['status']) => void
  onChat: () => void
  sentProgress?: boolean
}

export function ActiveJobCard({ req, onProgress, onChat, sentProgress = false }: ActiveJobCardProps) {
  const { label } = getCategoryMeta(req.category)
  const isInProgress = req.status === 'in_progress'

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: '1px solid #ECE6DC',
        borderRadius: 20,
        boxShadow: '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-3.5 py-2"
        style={{
          background: isInProgress ? 'rgba(139,92,246,.06)' : 'rgba(34,197,94,.06)',
          borderBottom: `1px solid ${isInProgress ? 'rgba(139,92,246,.12)' : 'rgba(34,197,94,.12)'}`,
        }}
      >
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest" style={{ color: isInProgress ? '#7C3AED' : '#16A34A' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: isInProgress ? '#8B5CF6' : '#22C55E' }} />
          {isInProgress
            ? createElement(Navigation, { size: 9, style: { color: '#7C3AED' } })
            : createElement(CheckCircle2, { size: 9, style: { color: '#16A34A' } })}
          {isInProgress ? 'En camino' : 'Confirmado'}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: '#B3A794' }}>
          <Clock size={9} /> {timeAgo(req.created_at)}
        </span>
      </div>

      <div className="px-3.5 pt-3 pb-3.5 flex flex-col gap-2.5">
        <div className="flex gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(232,104,58,.1)', color: '#E8683A' }}>
            {createElement(getCategoryIcon(req.category), { size: 9, style: { color: '#D4571F' } })}
            {label}
          </span>
          {req.urgency && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(239,68,68,.1)', color: '#DC2626' }}>
              <Siren size={9} style={{ color: '#DC2626' }} /> Urgente
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#333' }}>{req.description}</p>

        {req.scheduled_date && (
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-2" style={{ background: 'rgba(232,104,58,.08)', border: '1px solid rgba(232,104,58,.2)' }}>
            <Calendar size={11} style={{ color: '#E8683A', flexShrink: 0 }} />
            <span className="text-xs font-bold" style={{ color: '#E8683A' }}>{formatScheduled(req.scheduled_date)}</span>
          </div>
        )}

        {req.contact_phone && (
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: '#F5F0E8', border: '1px solid #ECE4D8' }}>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#B3A794' }}>Tel</span>
            <span className="text-sm font-semibold" style={{ color: '#111111' }}>{req.contact_phone}</span>
          </div>
        )}

        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={() => onProgress(isInProgress ? 'completed' : 'in_progress')}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold"
            style={{
              background: sentProgress ? '#DCFCE7' : isInProgress ? '#DCFCE7' : '#EEF2FF',
              color: sentProgress ? '#16A34A' : isInProgress ? '#16A34A' : '#4F46E5',
              border: `1px solid ${sentProgress || isInProgress ? '#BBF7D0' : '#C7D2FE'}`,
            }}
          >
            {sentProgress
              ? <><CheckCircle2 size={13} /> Cliente notificado</>
              : isInProgress
                ? <><Flag size={13} /> Completado</>
                : <><Navigation size={13} /> En camino</>}
          </motion.button>
          <motion.button
            type="button"
            onClick={onChat}
            whileTap={{ scale: 0.97 }}
            className="w-12 flex items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: 'rgba(232,104,58,.1)', color: '#E8683A', border: '1px solid rgba(232,104,58,.2)' }}
          >
            <MessageCircle size={15} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/pro/ActiveJobCard.tsx
git commit -m "feat: shared ActiveJobCard for pro dashboard and requests"
```

---

### Task 4: ProDashboard — toggle disponible + rating real + ActiveJobCard

**Files:**
- Modify: `src/pages/pro/ProDashboard.tsx`

**Interfaces:**
- Consumes: `useProfessionalStore` (availableNow, setAvailableNow, profile.avg_rating), `ActiveJobCard` (Task 3)

**IMPORTANTE:** leer `src/pages/pro/ProDashboard.tsx` completo antes de editar.

- [ ] **Step 1: Imports y estado**

Agregar:
```tsx
import { useProfessionalStore } from '../../store/professionalStore'
import { ActiveJobCard } from '../../components/pro/ActiveJobCard'
```
Dentro del componente, tomar del store:
```tsx
const availableNow = useProfessionalStore((s) => s.availableNow)
const setAvailableNow = useProfessionalStore((s) => s.setAvailableNow)
const profile = useProfessionalStore((s) => s.profile)
const loadProfile = useProfessionalStore((s) => s.load)
```
Y cargar el perfil en el `useEffect` existente (junto a `load(user.id)`):
```tsx
useEffect(() => { if (user?.id) { load(user.id); loadProfile(user.id) } }, [user?.id, load, loadProfile])
```

- [ ] **Step 2: Rating real en los stats**

En el array de stats del header, cambiar el objeto de Rating:
```tsx
{ label: 'Rating', count: '4.7', icon: Star },
```
por:
```tsx
{ label: 'Rating', count: profile?.avg_rating != null ? profile.avg_rating.toFixed(1) : '—', icon: Star },
```

- [ ] **Step 3: Card de toggle "Disponible ahora"**

Agregar como PRIMER hijo del body (`<div className="flex flex-col gap-4 py-4">`), antes del `<NotificationBanner ...>`:
```tsx
<div
  className="mx-4 flex items-center justify-between rounded-2xl px-4 py-3.5"
  style={{
    background: availableNow ? 'rgba(34,197,94,.08)' : '#FFFFFF',
    border: `1.5px solid ${availableNow ? 'rgba(34,197,94,.3)' : '#ECE4D8'}`,
    boxShadow: '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)',
  }}
>
  <div className="flex items-center gap-3">
    <span
      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ background: availableNow ? '#22C55E' : '#CBBFAF', animation: availableNow ? 'pro-pulse 2s ease-in-out infinite' : 'none' }}
    />
    <div>
      <p className="text-sm font-black" style={{ color: '#1A1712' }}>
        {availableNow ? 'Disponible ahora' : 'No disponible'}
      </p>
      <p className="text-xs" style={{ color: '#7A6E5E' }}>
        {availableNow ? 'Aparecés primero en urgencias' : 'No recibís solicitudes nuevas'}
      </p>
    </div>
  </div>
  <button
    type="button"
    onClick={() => setAvailableNow(!availableNow)}
    aria-label={availableNow ? 'Ponerte no disponible' : 'Ponerte disponible'}
    className="relative flex-shrink-0"
    style={{ width: 48, height: 28, borderRadius: 14, background: availableNow ? '#22C55E' : '#D6CBBB', transition: 'background .2s ease' }}
  >
    <motion.span
      className="absolute top-0.5"
      animate={{ left: availableNow ? 22 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      style={{ width: 24, height: 24, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }}
    />
  </button>
</div>
```
Agregar `import { motion } from 'framer-motion'` si no está. Agregar el keyframe al final del archivo (o en un `<style>` como hace ProRequests):
```tsx
<style>{`@keyframes pro-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }`}</style>
```
(Podés colocarlo dentro del `PageShell`, al final del contenido.)

- [ ] **Step 4: Reemplazar la card inline de "en curso" por `ActiveJobCard`**

En la sección "Trabajos en curso", reemplazar el bloque `active.map((req) => { ... <div key={req.id} ...> ... </div> ... })` por:
```tsx
{active.map((req) => {
  const isInProgress = req.status === 'in_progress'
  return (
    <ActiveJobCard
      key={req.id}
      req={req}
      onProgress={() => updateStatus(req.id, isInProgress ? 'completed' : 'in_progress')}
      onChat={() => navigate(`/solicitud/${req.id}/chat`)}
    />
  )
})}
```
Eliminar los imports que queden sin uso tras el reemplazo (ej. `getCategoryMeta`, `Calendar`, `Navigation`, `Flag`, `CheckCircle2`, `Siren`, `createElement` si ya no se usan en el archivo — verificar con lint).

- [ ] **Step 5: Verificar TypeScript, lint parcial y browser**

Run: `npx tsc --noEmit` → sin errores.
Abrir `/pro/dashboard` (logueado como pro demo): ver el toggle funcionando (persiste al recargar), rating "4.8", y la card de en curso con el estilo unificado.

- [ ] **Step 6: Commit**

```bash
git add src/pages/pro/ProDashboard.tsx
git commit -m "feat: availability toggle, real rating and shared ActiveJobCard in pro dashboard"
```

---

### Task 5: ProRequests — usar ActiveJobCard + proFormat

**Files:**
- Modify: `src/pages/pro/ProRequests.tsx`

- [ ] **Step 1: Usar los helpers compartidos**

Eliminar las funciones locales `timeAgo` y `formatScheduled` de `ProRequests.tsx` y en su lugar:
```tsx
import { timeAgo, formatScheduled } from '../../lib/proFormat'
```
(El `RequestCard` local sigue usando `timeAgo`/`formatScheduled` — ahora importados.)

- [ ] **Step 2: Usar `ActiveJobCard` en la sección "En curso"**

Importar: `import { ActiveJobCard } from '../../components/pro/ActiveJobCard'`.
Reemplazar el `active.map(...)` que renderiza `<RequestCard ... />` por:
```tsx
{active.map((req) => (
  <ActiveJobCard
    key={req.id}
    req={req}
    onProgress={(s) => { if (s === 'in_progress') handleInProgress(req.id); else updateStatus(req.id, s) }}
    onChat={() => navigate(`/solicitud/${req.id}/chat`)}
    sentProgress={sentProgress === req.id}
  />
))}
```
El `RequestCard` sigue usándose solo para la sección `pending` (Aceptar/Rechazar). Si tras esto `RequestCard` deja de recibir props `onProgress`/`onChat`/`sentProgressId`, se pueden simplificar, pero NO es obligatorio; dejar `RequestCard` funcionando para pending.

- [ ] **Step 3: Verificar TypeScript y lint**

Run: `npx tsc --noEmit` → sin errores.
Nota: si quedan imports sin uso en `ProRequests` (ej. algún ícono que solo usaba la rama activa de `RequestCard`), quitarlos para que pase lint.

- [ ] **Step 4: Commit**

```bash
git add src/pages/pro/ProRequests.tsx
git commit -m "refactor: pro requests uses shared ActiveJobCard and proFormat helpers"
```

---

### Task 6: Lint, build, deploy

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: sin errores. (Quitar cualquier import sin uso que aparezca.)

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `✓ built` sin errores.

- [ ] **Step 3: Push y deploy**

```bash
git push origin main
vercel --prod
```
Expected: deployment `Ready` en `https://oficios-ya-8112.vercel.app`.
