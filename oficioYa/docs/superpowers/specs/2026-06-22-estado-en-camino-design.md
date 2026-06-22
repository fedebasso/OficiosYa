# Diseño: Estado "En Camino" Visible para el Cliente

**Fecha:** 2026-06-22  
**Estado:** Aprobado

---

## Objetivo

Cuando el profesional se marca "En camino", el cliente lo ve proactivamente mediante un banner en `MisSolicitudes` — sin necesidad de entrar al detalle de la solicitud. El banner es unificado: muestra el estado más reciente relevante (aceptación o en camino), fusionado en un solo banner por solicitud.

---

## Contexto del código existente

- `MisSolicitudes.tsx` — ya tiene `seenConfirmed: Set<string>` y `acceptedBanners: string[]` que detectan `confirmed` y muestran un banner naranja
- `ProRequests.tsx` — ya tiene el botón "🚗 En camino" que llama `updateStatus(req.id, 'in_progress')`
- `requestStore.ts` — `ServiceRequest.status` ya incluye `'in_progress'`
- `SolicitudDetail.tsx` — ya muestra `in_progress` como "El profesional está en camino a tu domicilio."

---

## Arquitectura

Dos cambios independientes:

| Archivo | Cambio |
|---------|--------|
| `MisSolicitudes.tsx` | Refactorizar sistema de banners para detectar `confirmed` e `in_progress` en un solo banner unificado |
| `ProRequests.tsx` | Agregar feedback visual momentáneo al marcar "En camino" |

---

## 1. Sistema de banners unificado (`MisSolicitudes.tsx`)

### Estado nuevo

Reemplaza `seenConfirmed: Set<string>` y `acceptedBanners: string[]` por:

```ts
const [seenStatuses, setSeenStatuses] = useState<Map<string, string>>(new Map())
const [notifBanners, setNotifBanners] = useState<string[]>([])
```

- `seenStatuses`: mapea `requestId → último status procesado por el sistema de banners`
- `notifBanners`: array de `requestId` con banner activo (uno por solicitud máximo)

### Lógica del `useEffect`

```ts
useEffect(() => {
  const NOTIFY_STATUSES = ['confirmed', 'in_progress']
  const toNotify = requests.filter((r) =>
    NOTIFY_STATUSES.includes(r.status) &&
    seenStatuses.get(r.id) !== r.status
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

Esto hace que:
- `pending → confirmed` → banner aparece por primera vez
- `confirmed → in_progress` → banner se actualiza (el `requestId` ya estaba en `notifBanners`, el contenido cambia porque `seenStatuses` refleja el nuevo status)

### Contenido del banner según estado

El banner toma los datos del `request` con `status` actual (no el de `seenStatuses`):

| Status | Fondo | Texto | Ícono |
|--------|-------|-------|-------|
| `confirmed` | `linear-gradient(135deg, #E8683A, #c44d1f)` | "¡[Nombre] aceptó tu trabajo!" | ✅ |
| `in_progress` | `linear-gradient(135deg, #7C3AED, #5B21B6)` | "¡[Nombre] está en camino!" | 🚗 |

Ambos muestran:
- Subtexto: "Coordiná los detalles por chat"
- Botón "Chat →" → navega a `/solicitud/:id/chat` y descarta banner
- Botón "×" → descarta banner sin navegar

### Animación de transición

Cuando el banner pasa de `confirmed` a `in_progress`, el cambio de contenido ocurre naturalmente porque el componente re-renderiza con el nuevo `req.status`. La animación de entrada/salida del `AnimatePresence` no se dispara (el `key={reqId}` no cambia), por lo que se ve como una actualización suave del texto y color — sin flash.

---

## 2. Feedback visual al pro (`ProRequests.tsx`)

Cuando el pro toca "🚗 En camino":

1. Se llama `updateStatus(req.id, 'in_progress')` como siempre
2. Se setea `sentProgress = req.id`
3. El botón muestra "✓ Cliente notificado" con fondo verde por 1.5 segundos
4. Después de 1.5s, `sentProgress` vuelve a `null` y el botón regresa a su estado normal (que ya mostrará "🏁 Completado" porque el status cambió)

```ts
const [sentProgress, setSentProgress] = useState<string | null>(null)

function handleInProgress(reqId: string) {
  updateStatus(reqId, 'in_progress')
  setSentProgress(reqId)
  setTimeout(() => setSentProgress(null), 1500)
}
```

El botón en la card activa pasa de:
```tsx
onClick={() => onProgress(isInProgress ? 'completed' : 'in_progress')}
```
a usar `handleInProgress` cuando va a `in_progress`.

El texto del botón cuando `sentProgress === req.id`:
```
✓ Cliente notificado
```
con `background: '#DCFCE7', color: '#16A34A'`.

---

## Lo que NO cambia

- `requestStore.ts` — sin cambios
- `SolicitudDetail.tsx` — sin cambios (ya muestra el estado correctamente)
- `ProRequests.tsx` — solo se agrega el feedback; la lógica de `updateStatus` permanece igual
- Chat, urgencias, TicketFlow — sin cambios
