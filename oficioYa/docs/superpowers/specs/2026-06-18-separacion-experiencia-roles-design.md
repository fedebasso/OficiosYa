# Separación de Experiencia por Roles — OficiosYa

**Fecha:** 2026-06-18  
**Estado:** Aprobado  
**Fase:** A de 3 (Separación de experiencia — sin nuevas páginas de stats/ingresos)

---

## Objetivo

Separar completamente la experiencia de Cliente y Profesional en OficiosYa mediante dos layouts independientes, navegaciones propias, y lazy loading por rol. El resultado es una app que siente como dos productos distintos pero comparte la misma base de código.

---

## Decisiones de diseño

| Decisión | Elección |
|---|---|
| Arquitectura de routing | Un router, dos layouts (Opción B) |
| Home del profesional | ProDashboard propio en `/pro/dashboard` |
| Calificación bidireccional | Diferida para Fase siguiente |
| BottomNav cliente | 4 tabs: Inicio / Solicitudes / Mensajes / Perfil |
| BottomNav profesional | 3 tabs: Dashboard / Solicitudes / Perfil |
| ProDashboard contenido | Stats resumidas + feed de solicitudes pendientes |
| Performance | Lazy loading por rol + Suspense con PageSkeleton |

---

## Arquitectura

### Enfoque: Un router, dos layouts

`App.tsx` mantiene un único `BrowserRouter`. Al detectar el rol del usuario, envuelve las rutas en `ClientLayout` o `ProLayout`. Cada layout tiene su propio BottomNav.

```
BrowserRouter
  ├── Rutas compartidas (sin layout)
  │     /login, /registro, /pro/registro
  │     /profesional/:id, /urgencias
  │     /ticket, /ticket/confirmar
  │     /admin/verificaciones
  │
  ├── ClientLayout  (si role === 'client' o sin sesión)
  │     /                    → Home
  │     /buscar              → Search
  │     /buscar/:categoria   → Search
  │     /mis-solicitudes     → MisSolicitudes
  │     /solicitud/:id       → SolicitudDetail
  │     /solicitud/:id/chat  → Chat
  │     /mensajes            → Mensajes (nueva)
  │     /perfil              → ClientProfile
  │
  └── ProLayout  (si role === 'professional')
        /pro/dashboard       → ProDashboard (nueva)
        /pro/solicitudes     → ProRequests
        /pro/perfil          → ProProfile
        /pro/trabajos        → ProWorkHistory (mantener ruta, ocultar de nav)
```

### Redirecciones por rol

- Profesional en `/` → redirige a `/pro/dashboard`
- Cliente en `/pro/*` → redirige a `/`
- No autenticado en rutas protegidas → redirige a `/login`

---

## Archivos nuevos

### `src/layouts/ClientLayout.tsx`
Wrapper que renderiza `PageShell` + `ClientBottomNav`. Envuelve todas las rutas de cliente.

### `src/layouts/ProLayout.tsx`
Wrapper que renderiza `PageShell` + `ProBottomNav`. Envuelve todas las rutas de profesional.

### `src/components/layout/ClientBottomNav.tsx`

4 tabs fijas:

| Tab | Ruta | Ícono |
|---|---|---|
| Inicio | `/` | House |
| Solicitudes | `/mis-solicitudes` | FileText |
| Mensajes | `/mensajes` | MessageCircle |
| Perfil | `/perfil` | UserCircle |

### `src/components/layout/ProBottomNav.tsx`

3 tabs fijas:

| Tab | Ruta | Ícono | Badge |
|---|---|---|---|
| Dashboard | `/pro/dashboard` | LayoutDashboard | Nº de pendientes (naranja) |
| Solicitudes | `/pro/solicitudes` | FileText | — |
| Perfil | `/pro/perfil` | UserCircle | — |

Badge en Dashboard: usa `proRequestsStore` (ya en caché) — no hace query nueva.

### `src/components/layout/PageSkeleton.tsx`
Fallback de `<Suspense>`. Fondo `#F5F0E8`, 3 rectángulos shimmer animados. Se muestra mientras baja el chunk JS de la página.

### `src/pages/Mensajes.tsx`
Lista de conversaciones activas del cliente. Consume `chatStore` existente.

- Cada item: avatar del profesional + nombre + último mensaje + timestamp
- Tap → navega a `/solicitud/:id/chat`
- Estado vacío: "Aún no tenés conversaciones"
- Si `chatStore` no tiene datos: carga desde `supabase` (modo real) o muestra vacío (modo demo)

### `src/pages/pro/ProDashboard.tsx`
Home del profesional. Consume `proRequestsStore` (sin query nueva).

**Estructura:**
1. Header: "Buenos días, {nombre}" + fecha
2. Stats en 3 chips:
   - Pendientes (naranja)
   - En curso (violeta)
   - Rating (amarillo, valor mock 4.7 hasta conectar valoraciones reales)
3. Feed de solicitudes pendientes (máx 5):
   - Card con descripción + categoría + botones Aceptar/Rechazar inline
   - Usa `updateStatus` del store — acción inmediata sin query extra
4. Link "Ver todas las solicitudes →" → `/pro/solicitudes`
5. Si no hay pendientes: estado vacío "Todo al día ✓" + CTA "Completar perfil" → `/pro/perfil`

---

## Archivos modificados

### `src/App.tsx`
- Todos los imports de páginas pasan a `lazy()`
- Lógica de layout: detecta `user.role` y envuelve rutas en `ClientLayout` o `ProLayout`
- Redirecciones por rol en rutas de entrada (`/` → `/pro/dashboard` si pro)
- `<Suspense fallback={<PageSkeleton />}>` envuelve los grupos de rutas

### `src/components/layout/BottomNav.tsx`
- Simplificado: delega a `ClientBottomNav` o `ProBottomNav` según rol
- Elimina la lógica de tabs inline que hoy tiene

---

## Archivos que NO cambian

- `src/pages/Home.tsx`
- `src/pages/pro/ProRequests.tsx`
- `src/pages/pro/ProProfile.tsx`
- `src/pages/pro/ProWorkHistory.tsx`
- `src/pages/ClientProfile.tsx`
- `src/store/proRequestsStore.ts`
- `src/store/authStore.ts`
- Todos los componentes de registro (`src/components/pro/registration/`)

---

## Performance

### Lazy loading por rol

```tsx
// Páginas cliente — chunk separado, no baja si el usuario es pro
const Home            = lazy(() => import('./pages/Home'))
const MisSolicitudes  = lazy(() => import('./pages/MisSolicitudes'))
const ClientProfile   = lazy(() => import('./pages/ClientProfile'))
const Mensajes        = lazy(() => import('./pages/Mensajes'))

// Páginas profesional — chunk separado, no baja si el usuario es cliente
const ProDashboard    = lazy(() => import('./pages/pro/ProDashboard'))
const ProRequests     = lazy(() => import('./pages/pro/ProRequests'))
const ProProfile      = lazy(() => import('./pages/pro/ProProfile'))
```

Páginas compartidas siguen importadas estáticamente (son pequeñas y las usan ambos roles).

### Caché de datos
`proRequestsStore` ya implementado — evita double-fetch entre ProDashboard y ProRequests. No requiere cambios.

---

## Colores y tokens

- Fondo layouts: `#F5F0E8`
- Acento principal: `#E8683A`
- BottomNav activo: `#E8683A`
- BottomNav inactivo: `#AAAAAA`
- Badge pendientes: `#EF4444` (rojo)
- Stats ProDashboard: pendientes `#F59E0B`, en curso `#8B5CF6`, rating `#F59E0B`
- Verde verificado: `#0F6E56`

---

## Lo que queda para fases siguientes

- **Fase B — Páginas nuevas profesional:** Estadísticas detalladas, métricas de ingresos, portafolio mejorado
- **Fase C — Performance avanzada:** Paginación, precarga de datos, optimización de queries
- **Calificación bidireccional:** Pro puede calificar al cliente al completar un trabajo
