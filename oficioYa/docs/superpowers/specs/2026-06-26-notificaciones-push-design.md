# Spec: Notificaciones Push

**Fecha:** 2026-06-26  
**Estado:** Aprobado  
**Autor:** Brainstorming session con usuario

---

## Objetivo

Alertar en tiempo real a profesionales y clientes sobre cambios de estado en sus solicitudes, usando Web Push API nativa del browser. El MVP implementa el frontend completo (permisos, service worker, notificaciones locales de prueba). El backend (Supabase Edge Function) se agrega en fase 2.

---

## Decisiones clave

- **Web Push API + VAPID** — estándar del browser, sin Firebase, sin dependencias nuevas
- **Solo push nativa del SO** — sin historial interno ni campana en la app
- **MVP con notificaciones locales** — disparadas desde `requestStore` sin servidor, para testear el flujo completo
- **3 eventos cubiertos:** nueva solicitud (→ pro), solicitud aceptada (→ cliente), pro en camino (→ cliente)
- **Permisos contextuales** — no se piden al abrir la app; se muestran banners en pantallas relevantes
- **Suscripción en localStorage en MVP** — fase 2 migra a tabla Supabase `push_subscriptions`

---

## Eventos de notificación

| ID | Trigger | Destino | Título | Body | URL destino |
|---|---|---|---|---|---|
| `nueva_solicitud` | `requestStore.addRequest` | Profesional asignado | "Nueva solicitud 🔧" | "{clientName} necesita un {category} en {zone}" | `/pro/solicitudes` |
| `solicitud_aceptada` | `requestStore.updateStatus('confirmed')` | Cliente | "Solicitud aceptada ✅" | "{proName} aceptó tu solicitud" | `/mis-solicitudes` |
| `pro_en_camino` | `requestStore.updateStatus('in_progress')` | Cliente | "El pro está en camino 🚗" | "{proName} está en camino a tu domicilio" | `/solicitud/{requestId}` |

---

## Tipos

```ts
// src/types/notifications.ts

export type NotifEventId = 'nueva_solicitud' | 'solicitud_aceptada' | 'pro_en_camino'

export interface NotifPayload {
  eventId: NotifEventId
  title: string
  body: string
  url: string
}

export type NotifPermission = 'default' | 'granted' | 'denied'
```

---

## Store: `notificationStore.ts`

**Ubicación:** `src/store/notificationStore.ts`

```ts
interface NotificationState {
  permission: NotifPermission
  subscription: PushSubscription | null
  bannerDismissed: boolean

  init: () => void
  requestPermission: () => Promise<void>
  dismissBanner: () => void
  sendLocalNotification: (payload: NotifPayload) => Promise<void>
  // Fase 2: saveSubscription(sub: PushSubscription) → upsert en Supabase
}
```

### `init()`
Lee `Notification.permission` del browser y actualiza `permission` en el store. Se llama una vez al montar la app en `App.tsx`.

### `requestPermission()`
1. Llama `Notification.requestPermission()`
2. Si `granted`: llama `navigator.serviceWorker.ready` → `pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VITE_VAPID_PUBLIC_KEY })`
3. Guarda la suscripción en `localStorage` con key `ofix_push_subscription`
4. Actualiza `permission` y `subscription` en el store

### `dismissBanner()`
Guarda en `localStorage` con key `ofix_notif_banner_dismissed = true`. El banner no vuelve a aparecer.

### `sendLocalNotification(payload)`
```ts
const reg = await navigator.serviceWorker.ready
reg.showNotification(payload.title, {
  body: payload.body,
  icon: '/icon-192.png',
  badge: '/icon-192.png',
  data: { url: payload.url },
})
```
Solo ejecuta si `permission === 'granted'`. Si no, no hace nada.

---

## Service Worker: `public/sw-push.js`

Este archivo se inyecta en el SW existente via `workbox.importScripts` en `vite.config.ts`.

```js
// Handler de eventos push reales (fase 2 — servidor)
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

// Al tocar la notificación → navegar a la URL correcta
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

### Navegación desde notificationclick

El SW no puede llamar `useNavigate`. En su lugar envía `postMessage({ type: 'NAVIGATE', url })` al cliente. `App.tsx` escucha este mensaje y llama `navigate(url)`.

---

## Variables de entorno

```
# .env.local
VITE_VAPID_PUBLIC_KEY=<clave_pública_generada>
```

Generar claves con: `npx web-push generate-vapid-keys`  
La clave privada se usa solo en el servidor (Edge Function fase 2) — **nunca en el frontend**.

---

## Banners de permisos

### Componente: `NotificationBanner.tsx`

**Ubicación:** `src/components/notifications/NotificationBanner.tsx`

```
┌─────────────────────────────────────────────────────┐
│ 🔔 {mensaje contextual}                              │
│                         [Activar]  [Ahora no]        │
└─────────────────────────────────────────────────────┘
```

Props:
```ts
interface Props {
  message: string
}
```

El componente lee `permission` y `bannerDismissed` del `notificationStore`. Solo se renderiza si `permission === 'default'` y `bannerDismissed === false`.

### Dónde se monta

**Profesional:**
- `src/pages/pro/ProDashboard.tsx` — arriba del contenido principal
- `src/pages/pro/ProRequests.tsx` — arriba del listado
- Mensaje: *"Activá las notificaciones para recibir alertas de nuevas solicitudes en tiempo real."*

**Cliente:**
- `src/pages/MisSolicitudes.tsx` — solo si hay al menos una solicitud `confirmed` o `in_progress`
- Mensaje: *"Activá las notificaciones para saber cuándo tu profesional aceptó o está en camino."*

---

## Integración con requestStore

En `src/store/requestStore.ts`, después de cada operación exitosa:

### `addRequest` (nueva solicitud)
```ts
useNotificationStore.getState().sendLocalNotification({
  eventId: 'nueva_solicitud',
  title: 'Nueva solicitud 🔧',
  body: `${clientName} necesita un ${category} en ${zone}`,
  url: '/pro/solicitudes',
})
```

### `updateStatus('confirmed', requestId)`
```ts
useNotificationStore.getState().sendLocalNotification({
  eventId: 'solicitud_aceptada',
  title: 'Solicitud aceptada ✅',
  body: `${proName} aceptó tu solicitud`,
  url: '/mis-solicitudes',
})
```

### `updateStatus('in_progress', requestId)`
```ts
useNotificationStore.getState().sendLocalNotification({
  eventId: 'pro_en_camino',
  title: 'El pro está en camino 🚗',
  body: `${proName} está en camino a tu domicilio`,
  url: `/solicitud/${requestId}`,
})
```

Los datos del profesional/cliente se leen desde el request correspondiente en el store. En modo mock los nombres vienen de los datos demo.

---

## Navegación desde notificación

En `App.tsx`, agregar un `useEffect` que escucha mensajes del SW:

```ts
useEffect(() => {
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'NAVIGATE') {
      navigate(event.data.url)
    }
  }
  navigator.serviceWorker?.addEventListener('message', handler)
  return () => navigator.serviceWorker?.removeEventListener('message', handler)
}, [navigate])
```

---

## Fase 2: preparación para backend real

### Migración SQL

```sql
-- supabase/migrations/20260626_push_subscriptions.sql
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

### Edge Function (esqueleto)

```
supabase/functions/send-push/index.ts  ← esqueleto sin implementar
```

Recibe `{ userId, payload }`, busca en `push_subscriptions`, envía via `web-push` con clave VAPID privada almacenada en Supabase Secrets.

---

## Archivos a crear/modificar

**Crear:**
- `src/types/notifications.ts`
- `src/store/notificationStore.ts`
- `src/components/notifications/NotificationBanner.tsx`
- `public/sw-push.js`
- `supabase/migrations/20260626_push_subscriptions.sql`
- `supabase/functions/send-push/index.ts` (esqueleto)

**Modificar:**
- `vite.config.ts` — agregar `workbox.importScripts: ['sw-push.js']`
- `src/App.tsx` — llamar `notificationStore.init()` + listener de SW messages
- `src/store/requestStore.ts` — disparar `sendLocalNotification` en 3 eventos
- `src/pages/pro/ProDashboard.tsx` — montar `NotificationBanner`
- `src/pages/pro/ProRequests.tsx` — montar `NotificationBanner`
- `src/pages/MisSolicitudes.tsx` — montar `NotificationBanner` condicional
