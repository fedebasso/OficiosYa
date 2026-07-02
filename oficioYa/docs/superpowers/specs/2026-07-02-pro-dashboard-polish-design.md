# Dashboard del profesional — pulido fino + funcionalidad — Design Spec

## Objetivo

Mejorar el uso diario del profesional: agregar un **toggle "Disponible ahora"**
(acción más frecuente, alimenta el matching de urgencias), reemplazar stats
hardcodeados por **datos reales**, **unificar** la card de "trabajo en curso" entre
Dashboard y Solicitudes, y afinar el pulido premium. Sin tocar el registro
(verificación admin queda como está).

## Lenguaje visual (premium, ya establecido)

- Base crema `#F5F0E8`, card `#FFFFFF`, borde `1px solid #ECE6DC`, sombra premium
  `0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)`, radios 16-20.
- Naranja `#E8683A`/`#D4571F`, verde `#22A559`/`#16A34A`, estrella `#F5A623`.
- Íconos lucide. Texto `#1A1712`/`#7A6E5E`/`#B3A794`.

---

## 1. Toggle "Disponible ahora" (funcionalidad)

### Store (`src/store/professionalStore.ts`)
Agregar estado + acción, persistido en localStorage en demo:
```ts
availableNow: boolean
setAvailableNow: (v: boolean) => void
```
- Al inicializar, leer de `localStorage.getItem('pro_available_now')` (default `true`).
- `setAvailableNow(v)`: `localStorage.setItem('pro_available_now', v ? '1' : '0')` +
  `set({ availableNow: v })`. (Cuando se conecte Supabase, mapea a
  `professionals.available_now` vía un update; fuera de este alcance.)

### UI (en `ProDashboard`, dentro del header naranja o justo debajo)
Una tarjeta/switch premium:
- Estado **online**: fondo/acento verde, punto verde con leve pulso, texto
  "Disponible ahora", subtexto "Aparecés primero en urgencias". Switch a la derecha (ON).
- Estado **offline**: gris/neutro, texto "No disponible", subtexto "No recibís
  solicitudes nuevas". Switch OFF.
- Toggle con micro-animación (el "thumb" del switch se desliza; `framer-motion`).
- Ubicación: una card dedicada arriba de todo en el body del dashboard (debajo del
  header naranja), bien visible.

---

## 2. Stats reales (sin hardcode)

- `RegistrationState` (`src/types/registration.ts`): agregar `avg_rating?: number`.
  En `MOCK_PROFILE` (professionalStore) setear `avg_rating: 4.8`.
- En `ProDashboard`, cargar el perfil (`useProfessionalStore`) y usar
  `profile?.avg_rating ?? null` para el stat de rating (reemplaza el `'4.7'` literal).
  Si es `null`, mostrar "—".
- Los stats Pendientes/En curso ya son reales (de `useProRequestsStore`). Mantener.

---

## 3. Card de "trabajo en curso" unificada

Hoy la card de `confirmed`/`in_progress` está duplicada: inline en `ProDashboard` y
como parte de `RequestCard` en `ProRequests`. Se extrae a un componente compartido.

- Create: `src/components/pro/ActiveJobCard.tsx` — recibe:
  ```ts
  interface ActiveJobCardProps {
    req: ServiceRequest
    onProgress: (s: ServiceRequest['status']) => void
    onChat: () => void
    sentProgress?: boolean
  }
  ```
  Renderiza: top bar de estado (Confirmado/En camino con dot + ícono lucide + timeAgo),
  chips (categoría con `getCategoryIcon`, urgencia con `Siren`), descripción
  (`line-clamp-2`), fecha agendada (Calendar), teléfono, y botones
  (En camino/Completado con `Navigation`/`Flag`; chat con `MessageCircle`). Estilo
  premium unificado.
- Mover los helpers necesarios (`timeAgo`, `formatScheduled`) a
  `src/lib/proFormat.ts` (nuevo) y usarlos desde `ActiveJobCard`, `ProDashboard` y
  `ProRequests` (DRY).
- `ProDashboard`: reemplazar su card inline de "en curso" por `<ActiveJobCard .../>`.
- `ProRequests`: en la sección "En curso", usar `<ActiveJobCard .../>` en vez del
  bloque activo de `RequestCard` (el `RequestCard` sigue manejando el caso `pending`
  con Aceptar/Rechazar).

---

## 4. Pulido fino (ProDashboard)

- Sombras de las cards del dashboard → sombra premium cálida unificada.
- Radios consistentes (20 en cards principales).
- Espaciados y jerarquía revisados (títulos de sección, gaps).
- Íconos y colores coherentes con el resto.

---

## Fuera de alcance

- Registro del profesional (verificación admin) — no se toca.
- Conexión Supabase del `available_now` (queda el toggle local demo, listo para mapear).
- `avg_rating` real desde reseñas (necesita Supabase) — en demo es el campo del mock.

## Constraints

- No agregar dependencias.
- `professionalStore.availableNow` persiste en localStorage en demo.
- No romper el flujo de solicitudes (aceptar/rechazar/progreso) existente.
- Mantener lenguaje premium en todo el dashboard.
- Correr `npm run lint` y `npm run build` antes del push.
