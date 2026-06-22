# Estado "En Camino" Visible para el Cliente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cuando el pro se marca "En camino", el cliente ve un banner unificado en MisSolicitudes que también cubre el estado de aceptación — un solo banner por solicitud que refleja el estado más reciente.

**Architecture:** Dos cambios independientes: (1) refactorizar el sistema de banners en `MisSolicitudes.tsx` — reemplazar `seenConfirmed/acceptedBanners` por `seenStatuses/notifBanners` que detectan tanto `confirmed` como `in_progress`; (2) agregar feedback visual momentáneo al pro en `ProRequests.tsx` cuando marca "En camino".

**Tech Stack:** React + TypeScript, Zustand (`requestStore`), Framer Motion, `MOCK_PROFESSIONALS`

## Global Constraints

- Naranja primario: `#E8683A`, violeta: `#7C3AED`, fondo página: `#F5F0E8`, fondo cards: `#FFFFFF`
- `font-black` títulos, `font-bold` labels/CTAs, `text-white` en banners
- `rounded-2xl` contenedores
- Animaciones: `framer-motion` con spring (`stiffness: 400, damping: 35`)
- TypeScript estricto — `npx tsc -b` debe dar 0 errores antes de cada commit
- Git commits desde `C:\Users\fede8\OficiosYa` (root del repo)
- Comandos TypeScript desde `C:\Users\fede8\OficiosYa\oficioYa`

---

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|----------------|
| `src/pages/MisSolicitudes.tsx` | Modificar | Refactorizar banners para cubrir `confirmed` e `in_progress` |
| `src/pages/pro/ProRequests.tsx` | Modificar | Feedback visual momentáneo al marcar "En camino" |

---

## Task 1: Refactorizar banners en `MisSolicitudes.tsx`

**Files:**
- Modify: `src/pages/MisSolicitudes.tsx`

**Contexto del archivo actual:**
- Líneas 61-62: `const [seenConfirmed, setSeenConfirmed] = useState<Set<string>>(new Set())` y `const [acceptedBanners, setAcceptedBanners] = useState<string[]>([])`
- Líneas 64-78: `useEffect` que detecta `confirmed` y llena `acceptedBanners`
- Líneas 333-386: JSX que renderiza `acceptedBanners` con banner naranja

**Interfaces:**
- Produces: sistema de banners que detecta `confirmed` (naranja) e `in_progress` (violeta) unificado en `notifBanners: string[]`

- [ ] **Step 1: Reemplazar los dos estados de banner por los nuevos**

Buscar y reemplazar las líneas 61-62:
```tsx
const [seenConfirmed, setSeenConfirmed] = useState<Set<string>>(new Set())
const [acceptedBanners, setAcceptedBanners] = useState<string[]>([])
```
Por:
```tsx
const [seenStatuses, setSeenStatuses] = useState<Map<string, string>>(new Map())
const [notifBanners, setNotifBanners] = useState<string[]>([])
```

- [ ] **Step 2: Reemplazar el `useEffect` de detección de banners**

Buscar y reemplazar las líneas 64-78 (el `useEffect` que usa `seenConfirmed`):
```tsx
useEffect(() => {
  const NOTIFY_STATUSES = ['confirmed', 'in_progress']
  const toNotify = requests.filter(
    (r) => NOTIFY_STATUSES.includes(r.status) && seenStatuses.get(r.id) !== r.status
  )
  if (toNotify.length === 0) return
  setSeenStatuses((prev) => {
    const next = new Map(prev)
    toNotify.forEach((r) => next.set(r.id, r.status))
    return next
  })
  setNotifBanners((prev) => {
    const ids = new Set(prev)
    toNotify.forEach((r) => ids.add(r.id))
    return Array.from(ids)
  })
}, [requests])
```

- [ ] **Step 3: Reemplazar el JSX del banner**

Buscar y reemplazar todo el bloque `{/* ── Banners de aceptación ── */}` (líneas 333-386) por:

```tsx
{/* ── Banners de notificación ── */}
<AnimatePresence>
  {notifBanners.map((reqId) => {
    const req = requests.find((r) => r.id === reqId)
    if (!req) return null
    const pro = MOCK_PROFESSIONALS.find((p) => p.id === req.professional_id)
    const firstName = (pro?.profiles?.full_name ?? 'El profesional').split(' ')[0]
    const isInProgress = req.status === 'in_progress'
    const bg = isInProgress
      ? 'linear-gradient(135deg, #7C3AED, #5B21B6)'
      : 'linear-gradient(135deg, #E8683A, #c44d1f)'
    const shadow = isInProgress
      ? '0 4px 16px rgba(124,58,237,.35)'
      : '0 4px 16px rgba(232,104,58,.35)'
    const icon = isInProgress ? '🚗' : '🎉'
    const text = isInProgress
      ? `¡${firstName} está en camino!`
      : `¡${firstName} aceptó tu trabajo!`
    return (
      <motion.div
        key={reqId}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="mx-3 mt-3 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ background: bg, boxShadow: shadow }}
      >
        <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white leading-tight">
            {text}
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
              setNotifBanners((prev) => prev.filter((id) => id !== reqId))
              navigate(`/solicitud/${reqId}/chat`)
            }}
            className="rounded-xl px-3 py-1.5 text-xs font-bold"
            style={{ background: 'rgba(255,255,255,.2)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,.3)' }}
          >
            Chat →
          </motion.button>
          <button
            type="button"
            onClick={() => setNotifBanners((prev) => prev.filter((id) => id !== reqId))}
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

- [ ] **Step 4: Verificar TypeScript**

```bash
cd C:\Users\fede8\OficiosYa\oficioYa && npx tsc -b 2>&1
```
Esperado: 0 errores. `Map<string, string>` es nativo de TypeScript — no necesita imports adicionales.

- [ ] **Step 5: Verificar visualmente**

Correr `npm run dev` desde `C:\Users\fede8\OficiosYa\oficioYa`. Navegar a `/mis-solicitudes`. Verificar:
- Una solicitud con `status === 'confirmed'` muestra banner naranja con "¡[Nombre] aceptó tu trabajo!" ✓
- Una solicitud con `status === 'in_progress'` muestra banner violeta con "¡[Nombre] está en camino!" ✓
- Botón "Chat →" navega al chat y descarta el banner ✓
- Botón "×" descarta el banner sin navegar ✓
- Solo un banner por solicitud (no se duplican) ✓

- [ ] **Step 6: Commit**

```bash
cd C:\Users\fede8\OficiosYa && git add oficioYa/src/pages/MisSolicitudes.tsx
git commit -m "feat: banner unificado confirmed/in_progress en MisSolicitudes"
```

---

## Task 2: Feedback visual al marcar "En camino" en `ProRequests.tsx`

**Files:**
- Modify: `src/pages/pro/ProRequests.tsx`

**Contexto del archivo actual:**
- Línea ~216: `const [rejectingId, setRejectingId] = useState<string | null>(null)` — patrón a seguir
- Línea ~182: `onClick={() => onProgress(isInProgress ? 'completed' : 'in_progress')}` — botón actual "En camino"
- La prop `onProgress` en `RequestCard` recibe `(s: ServiceRequest['status']) => void`

**Interfaces:**
- Produce: feedback visual momentáneo de 1.5s cuando el pro marca "En camino"

- [ ] **Step 1: Agregar estado `sentProgress` en el componente `ProRequests`**

Dentro de `export default function ProRequests()`, agregar después de `const [rejectingId, setRejectingId] = useState<string | null>(null)`:

```tsx
const [sentProgress, setSentProgress] = useState<string | null>(null)

function handleInProgress(reqId: string) {
  updateStatus(reqId, 'in_progress')
  setSentProgress(reqId)
  setTimeout(() => setSentProgress(null), 1500)
}
```

- [ ] **Step 2: Pasar `sentProgress` y `handleInProgress` a las cards activas**

En el bloque donde se renderizan las cards activas (`active.map`), las cards tienen:
```tsx
onProgress={(s) => updateStatus(req.id, s)}
```

Reemplazar por:
```tsx
onProgress={(s) => {
  if (s === 'in_progress') {
    handleInProgress(req.id)
  } else {
    updateStatus(req.id, s)
  }
}}
```

- [ ] **Step 3: Actualizar el botón "En camino" en `RequestCard` para mostrar feedback**

En `RequestCard`, la prop `onProgress` se usa en el botón "🚗 En camino". Agregar la prop `sentProgressId?: string` a la interfaz de `RequestCard`:

```tsx
function RequestCard({
  req,
  onAccept,
  onReject,
  onProgress,
  onChat,
  sentProgressId,
}: {
  req: ServiceRequest
  onAccept?: () => void
  onReject?: () => void
  onProgress?: (s: ServiceRequest['status']) => void
  onChat?: () => void
  sentProgressId?: string
}) {
```

En el botón "🚗 En camino" / "🏁 Completado" (cuando `!isInProgress`), reemplazar:
```tsx
<motion.button
  type="button"
  onClick={() => onProgress(isInProgress ? 'completed' : 'in_progress')}
  whileTap={{ scale: 0.97 }}
  className="flex-1 rounded-xl py-3 text-sm font-bold"
  style={{
    background: isInProgress ? '#DCFCE7' : '#EEF2FF',
    color: isInProgress ? '#16A34A' : '#4F46E5',
    border: `1px solid ${isInProgress ? '#BBF7D0' : '#C7D2FE'}`,
  }}
>
  {isInProgress ? '🏁 Completado' : '🚗 En camino'}
</motion.button>
```

Por:
```tsx
<motion.button
  type="button"
  onClick={() => onProgress(isInProgress ? 'completed' : 'in_progress')}
  whileTap={{ scale: 0.97 }}
  className="flex-1 rounded-xl py-3 text-sm font-bold"
  style={{
    background: sentProgressId === req.id
      ? '#DCFCE7'
      : isInProgress ? '#DCFCE7' : '#EEF2FF',
    color: sentProgressId === req.id
      ? '#16A34A'
      : isInProgress ? '#16A34A' : '#4F46E5',
    border: `1px solid ${sentProgressId === req.id || isInProgress ? '#BBF7D0' : '#C7D2FE'}`,
  }}
>
  {sentProgressId === req.id
    ? '✓ Cliente notificado'
    : isInProgress ? '🏁 Completado' : '🚗 En camino'}
</motion.button>
```

- [ ] **Step 4: Pasar `sentProgressId` a las cards activas**

En el bloque `active.map`, agregar la prop `sentProgressId`:
```tsx
<RequestCard
  key={req.id}
  req={req}
  onProgress={(s) => {
    if (s === 'in_progress') {
      handleInProgress(req.id)
    } else {
      updateStatus(req.id, s)
    }
  }}
  onChat={() => navigate(`/solicitud/${req.id}/chat`)}
  sentProgressId={sentProgress ?? undefined}
/>
```

- [ ] **Step 5: Verificar TypeScript**

```bash
cd C:\Users\fede8\OficiosYa\oficioYa && npx tsc -b 2>&1
```
Esperado: 0 errores.

- [ ] **Step 6: Verificar visualmente**

En la app como profesional, navegar a `/pro/solicitudes`. Tocar "🚗 En camino" en una solicitud activa. Verificar:
- El botón cambia a "✓ Cliente notificado" con fondo verde por 1.5 segundos ✓
- Después de 1.5s el botón vuelve a su estado (ahora muestra "🏁 Completado" porque el status ya es `in_progress`) ✓

- [ ] **Step 7: Commit**

```bash
cd C:\Users\fede8\OficiosYa && git add oficioYa/src/pages/pro/ProRequests.tsx
git commit -m "feat: feedback visual al marcar en camino en ProRequests"
```

---

## Self-Review

**Spec coverage:**
- ✅ Banner unificado para `confirmed` e `in_progress` — Task 1
- ✅ Banner naranja para `confirmed`, violeta para `in_progress` — Task 1
- ✅ Mismo botón "Chat →" y "×" en ambos estados — Task 1
- ✅ `seenStatuses` reemplaza `seenConfirmed` — Task 1
- ✅ `notifBanners` reemplaza `acceptedBanners` — Task 1
- ✅ Feedback visual "✓ Cliente notificado" por 1.5s — Task 2
- ✅ `handleInProgress` llama `updateStatus` y `setSentProgress` — Task 2
- ✅ `requestStore.ts` sin cambios — verificado (no aparece en files)

**Placeholder scan:** Sin TBDs. Código completo en todos los steps.

**Type consistency:**
- `seenStatuses: Map<string, string>` — nativo TypeScript, consistente en Step 1 y Step 2 de Task 1 ✓
- `sentProgressId?: string` — prop opcional en `RequestCard`, recibe `sentProgress ?? undefined` en Task 2 Step 4 ✓
- `handleInProgress(reqId: string)` — definido en Step 1, usado en Steps 2 y 4 de Task 2 ✓
