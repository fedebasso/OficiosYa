# Notificaciones Push — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar notificaciones push nativas (Web Push API + VAPID) para alertar a profesionales y clientes sobre cambios de estado en solicitudes, con notificaciones locales de prueba en MVP y preparación para backend real en fase 2.

**Architecture:** `notificationStore` centraliza permisos y envío. `public/sw-push.js` extiende el service worker existente con handlers de `push` y `notificationclick`. `NotificationBanner` pide permisos contextualmente. `requestStore` dispara notificaciones locales en 3 eventos. `App.tsx` escucha mensajes del SW para navegar al tocar una notificación.

**Tech Stack:** Web Push API (nativa del browser), vite-plugin-pwa (SW existente), Zustand, React 19 + TypeScript. Sin dependencias nuevas.

## Global Constraints

- TypeScript estricto (no `any`)
- No instalar dependencias nuevas — Web Push API es nativa del browser
- Colores: primary `#0F6E56`, orange `#E8683A`, background `#F5F0E8`, border `#EDE8DE`
- Variable CSS `--text-sm` para tipografía del banner
- `VITE_VAPID_PUBLIC_KEY` en `.env.local` — generada con `npx web-push generate-vapid-keys`
- `sendLocalNotification` solo ejecuta si `permission === 'granted'`
- No modificar `DateStrip.tsx`, `TimeSlotGrid.tsx` ni ningún componente de disponibilidad

---

## Mapa de archivos

**Crear:**
- `src/types/notifications.ts` — tipos `NotifEventId`, `NotifPayload`, `NotifPermission`
- `src/store/notificationStore.ts` — store Zustand con permisos, suscripción y envío local
- `src/components/notifications/NotificationBanner.tsx` — banner contextual de permisos
- `public/sw-push.js` — handlers push y notificationclick para el SW
- `supabase/migrations/20260626_push_subscriptions.sql` — tabla para fase 2
- `supabase/functions/send-push/index.ts` — esqueleto Edge Function para fase 2

**Modificar:**
- `vite.config.ts` — agregar `workbox.importScripts: ['sw-push.js']`
- `src/App.tsx` — llamar `notificationStore.init()` + listener de mensajes del SW
- `src/store/requestStore.ts` — disparar `sendLocalNotification` en 3 eventos
- `src/pages/pro/ProDashboard.tsx` — montar `NotificationBanner`
- `src/pages/pro/ProRequests.tsx` — montar `NotificationBanner`
- `src/pages/MisSolicitudes.tsx` — montar `NotificationBanner` condicional

---

## Task 1: Tipos y notificationStore

**Files:**
- Create: `src/types/notifications.ts`
- Create: `src/store/notificationStore.ts`

**Interfaces:**
- Produce: `NotifEventId`, `NotifPayload`, `NotifPermission` — usados por Tasks 2, 3, 4
- Produce: `useNotificationStore` con `init`, `requestPermission`, `dismissBanner`, `sendLocalNotification`

- [ ] **Step 1: Crear los tipos**

Crear `src/types/notifications.ts`:

```ts
export type NotifEventId = 'nueva_solicitud' | 'solicitud_aceptada' | 'pro_en_camino'

export interface NotifPayload {
  eventId: NotifEventId
  title: string
  body: string
  url: string
}

export type NotifPermission = 'default' | 'granted' | 'denied'
```

- [ ] **Step 2: Crear el store**

Crear `src/store/notificationStore.ts`:

```ts
import { create } from 'zustand'
import type { NotifPayload, NotifPermission } from '../types/notifications'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
const STORAGE_SUBSCRIPTION_KEY = 'ofix_push_subscription'
const STORAGE_BANNER_KEY = 'ofix_notif_banner_dismissed'

interface NotificationState {
  permission: NotifPermission
  subscription: PushSubscription | null
  bannerDismissed: boolean
  init: () => void
  requestPermission: () => Promise<void>
  dismissBanner: () => void
  sendLocalNotification: (payload: NotifPayload) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  permission: 'default',
  subscription: null,
  bannerDismissed: localStorage.getItem(STORAGE_BANNER_KEY) === 'true',

  init: () => {
    if (!('Notification' in window)) return
    set({ permission: Notification.permission as NotifPermission })
  },

  requestPermission: async () => {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    set({ permission: result as NotifPermission })
    if (result !== 'granted') return

    try {
      const reg = await navigator.serviceWorker.ready
      const options: PushSubscriptionOptionsInit = { userVisibleOnly: true }
      if (VAPID_PUBLIC_KEY) {
        const key = Uint8Array.from(atob(VAPID_PUBLIC_KEY.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
        options.applicationServerKey = key
      }
      const sub = await reg.pushManager.subscribe(options)
      localStorage.setItem(STORAGE_SUBSCRIPTION_KEY, JSON.stringify(sub))
      set({ subscription: sub })
    } catch (_e) { /* SW no disponible en desarrollo */ }
  },

  dismissBanner: () => {
    localStorage.setItem(STORAGE_BANNER_KEY, 'true')
    set({ bannerDismissed: true })
  },

  sendLocalNotification: async (payload) => {
    if (get().permission !== 'granted') return
    if (!('serviceWorker' in navigator)) return
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(payload.title, {
        body: payload.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: { url: payload.url },
      })
    } catch (_e) { /* falla silenciosamente en contextos sin SW */ }
  },
}))
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd oficioYa && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/types/notifications.ts src/store/notificationStore.ts
git commit -m "feat: tipos y notificationStore — permisos Web Push y envío local"
```

---

## Task 2: Service Worker + vite.config.ts

**Files:**
- Create: `public/sw-push.js`
- Modify: `vite.config.ts`

**Interfaces:**
- Produce: SW extendido con handlers `push` y `notificationclick`
- Produce: `postMessage({ type: 'NAVIGATE', url })` — consumido por App.tsx en Task 4

- [ ] **Step 1: Crear el archivo del service worker**

Crear `public/sw-push.js`:

```js
// Handler de eventos push reales — fase 2 (servidor via Supabase Edge Function)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Ofix', {
      body: data.body ?? '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url ?? '/' },
    })
  )
})

// Al tocar la notificación → navegar a la URL correcta dentro de la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const existing = clientList.find((c) => 'focus' in c)
      if (existing) {
        existing.focus()
        existing.postMessage({ type: 'NAVIGATE', url })
        return
      }
      return clients.openWindow(url)
    })
  )
})
```

- [ ] **Step 2: Agregar importScripts en vite.config.ts**

En `vite.config.ts`, dentro del objeto `workbox`, agregar `importScripts`:

```ts
workbox: {
  importScripts: ['sw-push.js'],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: { cacheName: 'supabase-cache' },
    },
  ],
},
```

- [ ] **Step 3: Agregar VAPID_PUBLIC_KEY en .env.local**

Si no existe `.env.local`, crearlo. Si existe, agregar la línea:

```
VITE_VAPID_PUBLIC_KEY=
```

Dejar vacío por ahora — se completa con el valor real generado con `npx web-push generate-vapid-keys`. El store funciona sin la clave (la suscripción se crea sin `applicationServerKey`).

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 5: Commit**

```bash
git add public/sw-push.js vite.config.ts .env.local
git commit -m "feat: service worker push — handlers push y notificationclick"
```

---

## Task 3: NotificationBanner

**Files:**
- Create: `src/components/notifications/NotificationBanner.tsx`

**Interfaces:**
- Consumes: `useNotificationStore` — `permission`, `bannerDismissed`, `requestPermission`, `dismissBanner`
- Produce: `<NotificationBanner message="..." />` — usado en Tasks 5 y 6

- [ ] **Step 1: Crear el componente**

Crear `src/components/notifications/NotificationBanner.tsx`:

```tsx
import { useNotificationStore } from '../../store/notificationStore'

interface Props {
  message: string
}

export function NotificationBanner({ message }: Props) {
  const { permission, bannerDismissed, requestPermission, dismissBanner } = useNotificationStore()

  if (permission !== 'default' || bannerDismissed) return null

  return (
    <div
      className="flex items-center gap-3 mx-4 mb-3"
      style={{
        background: '#FFFFFF',
        border: '1.5px solid #EDE8DE',
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: '0 1px 4px rgba(0,0,0,.06)',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>🔔</span>
      <p
        className="flex-1"
        style={{ fontSize: 'var(--text-sm)', color: '#444444', lineHeight: 1.4 }}
      >
        {message}
      </p>
      <div className="flex gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={dismissBanner}
          style={{
            fontSize: 'var(--text-sm)',
            color: '#AAAAAA',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 6px',
          }}
        >
          Ahora no
        </button>
        <button
          type="button"
          onClick={requestPermission}
          className="font-bold"
          style={{
            fontSize: 'var(--text-sm)',
            color: '#FFFFFF',
            background: '#0F6E56',
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          Activar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/notifications/NotificationBanner.tsx
git commit -m "feat: NotificationBanner — solicitud contextual de permisos push"
```

---

## Task 4: App.tsx — init + listener de mensajes SW

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useNotificationStore.init()` de Task 1
- Consumes: `postMessage({ type: 'NAVIGATE', url })` enviado por `sw-push.js` de Task 2

- [ ] **Step 1: Agregar import del store**

En `src/App.tsx`, agregar al bloque de imports:

```ts
import { useNotificationStore } from './store/notificationStore'
```

- [ ] **Step 2: Llamar `init` y agregar listener de mensajes SW**

En el componente `App()`, agregar antes del `return`:

```tsx
const initNotifications = useNotificationStore((s) => s.init)
const navigate = useNavigate() // ya existe si App usa rutas, sino agregar

useEffect(() => {
  initNotifications()
}, [initNotifications])

useEffect(() => {
  if (!('serviceWorker' in navigator)) return
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'NAVIGATE' && typeof event.data.url === 'string') {
      navigate(event.data.url)
    }
  }
  navigator.serviceWorker.addEventListener('message', handler)
  return () => navigator.serviceWorker.removeEventListener('message', handler)
}, [navigate])
```

**Nota:** `useNavigate` requiere estar dentro de un componente hijo de `<BrowserRouter>`. Si `App` renderiza el Router directamente, crear un componente interno `AppInner` que envuelva los effects:

```tsx
function AppInner() {
  const initNotifications = useNotificationStore((s) => s.init)
  const navigate = useNavigate()

  useEffect(() => { initNotifications() }, [initNotifications])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE' && typeof event.data.url === 'string') {
        navigate(event.data.url)
      }
    }
    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [navigate])

  return null
}
```

Y montar `<AppInner />` dentro de `<BrowserRouter>` antes de `<Routes>`.

- [ ] **Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: App.tsx — init notificationStore y listener de mensajes SW para navegación"
```

---

## Task 5: Integración en requestStore — 3 eventos

**Files:**
- Modify: `src/store/requestStore.ts`

**Interfaces:**
- Consumes: `useNotificationStore.getState().sendLocalNotification(payload: NotifPayload)` de Task 1
- Consumes: `NotifPayload` de `src/types/notifications.ts`
- Consumes: `MOCK_PROFESSIONALS` de `src/data/mockProfessionals.ts` para resolver nombre del pro en modo mock

- [ ] **Step 1: Agregar imports en requestStore**

En `src/store/requestStore.ts`, agregar al bloque de imports:

```ts
import { useNotificationStore } from './notificationStore'
import type { NotifPayload } from '../types/notifications'
import { MOCK_PROFESSIONALS } from '../data/mockProfessionals'
```

- [ ] **Step 2: Disparar notificación en `addRequest`**

En `addRequest`, después de `set((s) => ({ requests: [newReq, ...s.requests] }))`:

```ts
// Notificar al profesional sobre la nueva solicitud
const { category, professional_id, location } = req
const notifPayload: NotifPayload = {
  eventId: 'nueva_solicitud',
  title: 'Nueva solicitud 🔧',
  body: `Nueva solicitud de ${category}${location ? ` en ${location}` : ''}`,
  url: '/pro/solicitudes',
}
useNotificationStore.getState().sendLocalNotification(notifPayload)
```

- [ ] **Step 3: Disparar notificación en `updateStatus`**

Reemplazar el cuerpo de `updateStatus` con:

```ts
updateStatus: async (id, status) => {
  await requestService.updateStatus(id, status)
  set((s) => ({ requests: s.requests.map((r) => r.id === id ? { ...r, status } : r) }))

  const { requests } = useRequestStore.getState()
  const req = requests.find((r) => r.id === id)
  if (!req) return

  const pro = MOCK_PROFESSIONALS.find((p) => p.id === req.professional_id)
  const proName = pro?.profiles?.full_name ?? 'El profesional'

  if (status === 'confirmed') {
    const payload: NotifPayload = {
      eventId: 'solicitud_aceptada',
      title: 'Solicitud aceptada ✅',
      body: `${proName} aceptó tu solicitud`,
      url: '/mis-solicitudes',
    }
    useNotificationStore.getState().sendLocalNotification(payload)
  }

  if (status === 'in_progress') {
    const payload: NotifPayload = {
      eventId: 'pro_en_camino',
      title: 'El pro está en camino 🚗',
      body: `${proName} está en camino a tu domicilio`,
      url: `/solicitud/${id}`,
    }
    useNotificationStore.getState().sendLocalNotification(payload)
  }
},
```

**Nota sobre `useRequestStore.getState()`:** dentro del store de Zustand no se puede llamar el hook. Usar el patrón `useRequestStore` directamente desde `get()` — reemplazar `useRequestStore.getState().requests` por `get().requests`:

```ts
updateStatus: async (id, status) => {
  await requestService.updateStatus(id, status)
  set((s) => ({ requests: s.requests.map((r) => r.id === id ? { ...r, status } : r) }))

  // Leer el request actualizado desde el estado actual
  const req = get().requests.find((r) => r.id === id) ??
    { ...await (async () => null)() }  // fallback vacío — no debería pasar

  // Simplificación: leer directamente de s tras el set
```

**Implementación correcta sin `useRequestStore.getState()`** — pasar el request a una función interna:

```ts
updateStatus: async (id, status) => {
  await requestService.updateStatus(id, status)

  let updatedReq: ServiceRequest | undefined
  set((s) => {
    const updated = s.requests.map((r) => r.id === id ? { ...r, status } : r)
    updatedReq = updated.find((r) => r.id === id)
    return { requests: updated }
  })

  if (!updatedReq) return

  const pro = MOCK_PROFESSIONALS.find((p) => p.id === updatedReq!.professional_id)
  const proName = pro?.profiles?.full_name ?? 'El profesional'

  if (status === 'confirmed') {
    useNotificationStore.getState().sendLocalNotification({
      eventId: 'solicitud_aceptada',
      title: 'Solicitud aceptada ✅',
      body: `${proName} aceptó tu solicitud`,
      url: '/mis-solicitudes',
    })
  }

  if (status === 'in_progress') {
    useNotificationStore.getState().sendLocalNotification({
      eventId: 'pro_en_camino',
      title: 'El pro está en camino 🚗',
      body: `${proName} está en camino a tu domicilio`,
      url: `/solicitud/${id}`,
    })
  }
},
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/store/requestStore.ts
git commit -m "feat: requestStore — notificaciones locales en nueva solicitud, aceptada y en camino"
```

---

## Task 6: Banners en ProDashboard, ProRequests y MisSolicitudes

**Files:**
- Modify: `src/pages/pro/ProDashboard.tsx`
- Modify: `src/pages/pro/ProRequests.tsx`
- Modify: `src/pages/MisSolicitudes.tsx`

**Interfaces:**
- Consumes: `<NotificationBanner message="..." />` de Task 3

- [ ] **Step 1: Agregar banner en ProDashboard**

En `src/pages/pro/ProDashboard.tsx`, agregar import:

```ts
import { NotificationBanner } from '../../components/notifications/NotificationBanner'
```

Dentro del JSX, antes del primer bloque de contenido (después del header, antes de las cards):

```tsx
<NotificationBanner message="Activá las notificaciones para recibir alertas de nuevas solicitudes en tiempo real." />
```

- [ ] **Step 2: Agregar banner en ProRequests**

En `src/pages/pro/ProRequests.tsx`, agregar import:

```ts
import { NotificationBanner } from '../../components/notifications/NotificationBanner'
```

Dentro del JSX, antes del listado de solicitudes:

```tsx
<NotificationBanner message="Activá las notificaciones para recibir alertas de nuevas solicitudes en tiempo real." />
```

- [ ] **Step 3: Agregar banner condicional en MisSolicitudes**

En `src/pages/MisSolicitudes.tsx`, agregar import:

```ts
import { NotificationBanner } from '../components/notifications/NotificationBanner'
```

Dentro del JSX, solo si hay solicitudes activas (`confirmed` o `in_progress`). Localizar dónde se renderizan las solicitudes y agregar antes del listado:

```tsx
{requests.some((r) => r.status === 'confirmed' || r.status === 'in_progress') && (
  <NotificationBanner message="Activá las notificaciones para saber cuándo tu profesional aceptó o está en camino." />
)}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 5: Verificar lint**

```bash
npm run lint 2>&1
```

Esperado: sin errores.

- [ ] **Step 6: Commit**

```bash
git add src/pages/pro/ProDashboard.tsx src/pages/pro/ProRequests.tsx src/pages/MisSolicitudes.tsx
git commit -m "feat: NotificationBanner en ProDashboard, ProRequests y MisSolicitudes"
```

---

## Task 7: Migración SQL + esqueleto Edge Function

**Files:**
- Create: `supabase/migrations/20260626_push_subscriptions.sql`
- Create: `supabase/functions/send-push/index.ts`

**Interfaces:**
- Produce: tabla `push_subscriptions` lista para fase 2

- [ ] **Step 1: Crear migración SQL**

Crear `supabase/migrations/20260626_push_subscriptions.sql`:

```sql
-- Tabla de suscripciones push por usuario
-- Fase 2: conectar desde notificationStore.requestPermission() cuando Supabase esté activo

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   text NOT NULL UNIQUE,
  p256dh     text NOT NULL,
  auth       text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario gestiona su suscripción" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid());
```

- [ ] **Step 2: Crear esqueleto de Edge Function**

Crear `supabase/functions/send-push/index.ts`:

```ts
// Edge Function: send-push
// Fase 2 — se activa via Supabase Realtime cuando cambia requests.status
// Busca la suscripción del destinatario en push_subscriptions y envía push via VAPID
//
// Para implementar:
// 1. Instalar web-push: deno add npm:web-push
// 2. Configurar VAPID_PRIVATE_KEY en Supabase Secrets
// 3. Implementar el handler que llama webPush.sendNotification(subscription, payload)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { userId, payload } = await req.json()

  // TODO fase 2:
  // const sub = await supabase.from('push_subscriptions').select().eq('user_id', userId).single()
  // await webPush.sendNotification(sub, JSON.stringify(payload), { vapidDetails: {...} })

  return new Response(JSON.stringify({ ok: true, userId, payload }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

- [ ] **Step 3: Verificar TypeScript en archivos del proyecto**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores (la Edge Function usa Deno, no se valida con el tsc del proyecto).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260626_push_subscriptions.sql supabase/functions/send-push/index.ts
git commit -m "feat: migración push_subscriptions y esqueleto Edge Function para fase 2"
```

---

## Self-Review

**Spec coverage:**
- ✅ Tipos `NotifEventId`, `NotifPayload`, `NotifPermission` (Task 1)
- ✅ `notificationStore` con `init`, `requestPermission`, `dismissBanner`, `sendLocalNotification` (Task 1)
- ✅ Suscripción guardada en `localStorage` con key `ofix_push_subscription` (Task 1)
- ✅ Banner dismissed en `localStorage` con key `ofix_notif_banner_dismissed` (Task 1)
- ✅ `public/sw-push.js` con handlers `push` y `notificationclick` (Task 2)
- ✅ `workbox.importScripts: ['sw-push.js']` en `vite.config.ts` (Task 2)
- ✅ `VITE_VAPID_PUBLIC_KEY` en `.env.local` (Task 2)
- ✅ `NotificationBanner` con permisos contextuales, botones Activar/Ahora no (Task 3)
- ✅ `notificationStore.init()` en `App.tsx` (Task 4)
- ✅ Listener de `postMessage({ type: 'NAVIGATE' })` en `App.tsx` (Task 4)
- ✅ `nueva_solicitud` → notifica al pro en `addRequest` (Task 5)
- ✅ `solicitud_aceptada` → notifica al cliente en `updateStatus('confirmed')` (Task 5)
- ✅ `pro_en_camino` → notifica al cliente en `updateStatus('in_progress')` (Task 5)
- ✅ Banner en ProDashboard + ProRequests (pro) y MisSolicitudes condicional (cliente) (Task 6)
- ✅ Migración SQL `push_subscriptions` con RLS (Task 7)
- ✅ Esqueleto Edge Function `send-push` (Task 7)

**Type consistency:**
- `NotifPayload` definido en Task 1, consumido en Tasks 5 ✅
- `useNotificationStore` exportado en Task 1, importado en Tasks 4, 5, 6 ✅
- `NotificationBanner` exportado en Task 3, importado en Task 6 ✅
- `sendLocalNotification(payload: NotifPayload)` — firma consistente en Tasks 1 y 5 ✅
