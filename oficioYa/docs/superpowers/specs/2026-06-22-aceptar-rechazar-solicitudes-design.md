# Diseño: Aceptar/Rechazar Solicitudes + Re-búsqueda + Notificación

**Fecha:** 2026-06-22  
**Estado:** Aprobado

---

## Objetivo

Completar el flujo de aceptación/rechazo de solicitudes:
1. El profesional rechaza con un toque (sin motivo, sin fricción)
2. El cliente ve el rechazo y puede buscar otro profesional de una lista nueva
3. El cliente recibe un banner de notificación cuando su solicitud es aceptada

---

## Contexto del código existente

- `ProRequests.tsx` — ya tiene botones "Aceptar" y "Rechazar" que llaman `updateStatus(id, 'confirmed')` y `updateStatus(id, 'cancelled')`
- `MisSolicitudes.tsx` — muestra cards con estado pero sin CTA post-rechazo ni banner de aceptación
- `SolicitudDetail.tsx` — muestra el estado `cancelled` como "La solicitud fue cancelada" pero sin acción siguiente
- `requestStore.ts` — `ServiceRequest.status` ya incluye `'cancelled'` y `'confirmed'`

---

## Arquitectura

Tres cambios independientes en archivos existentes + una página nueva:

| Archivo | Cambio |
|---------|--------|
| `ProRequests.tsx` | Agregar modal de confirmación antes de rechazar |
| `MisSolicitudes.tsx` | Banner de aceptación + CTA "Buscar otro" en cards canceladas |
| `SolicitudDetail.tsx` | CTA "Buscar otro" en estado cancelado |
| `pages/BuscarOtroProfesional.tsx` | Nueva página con lista de pros filtrada |
| `App.tsx` (o router) | Agregar ruta `/buscar-profesional/:requestId` |

---

## 1. Modal de confirmación de rechazo (`ProRequests.tsx`)

### UI

Bottom sheet mínimo que aparece antes de ejecutar el rechazo:

```
┌─────────────────────────────┐
│  ¿Rechazar esta solicitud?  │
│  Esta acción no se puede    │
│  deshacer.                  │
│                             │
│  [Cancelar]  [Rechazar →]   │
└─────────────────────────────┘
```

### Comportamiento
- Se abre al tocar el botón "Rechazar" existente
- "Cancelar" → cierra el sheet sin cambios
- "Rechazar →" → llama `updateStatus(id, 'cancelled')` y cierra
- Sin campo de motivo — un toque para rechazar
- Animación: slide up con spring (igual al resto de sheets de la app)

### Implementación
- Estado local `rejectingId: string | null` en `ProRequests`
- Sheet renderizado con `AnimatePresence` al final del JSX
- El botón "Rechazar" existente en `RequestCard` cambia de llamar directamente a `onReject` a llamar a `() => setRejectingId(req.id)`

---

## 2. Banner de aceptación (`MisSolicitudes.tsx`)

### UI

Banner naranja fijo debajo del header, sobre la lista:

```
┌─────────────────────────────────┐
│  🎉 ¡[Nombre] aceptó tu trabajo!│
│  Coordiná los detalles por chat │  [×]
│                        [Chat →] │
└─────────────────────────────────┘
```

### Comportamiento
- Aparece cuando alguna solicitud del usuario cambia de `pending` → `confirmed`
- Detectado con `useEffect` que observa `requests`
- Set local `seenConfirmed: Set<string>` (estado React) evita re-mostrar en misma sesión
- Si hay múltiples aceptaciones simultáneas: muestra solo la más reciente (la primera del array)
- "Chat →" navega a `/solicitud/:id/chat` y marca como visto
- "×" descarta el banner y marca como visto

### Nombre del profesional
- Buscar en `MOCK_PROFESSIONALS` por `professional_id` (ya se hace en `MisSolicitudes`)
- Mostrar solo el primer nombre: `proName.split(' ')[0]`

---

## 3. CTA "Buscar otro profesional" en solicitudes canceladas

### En `MisSolicitudes.tsx`
Dentro de la card de solicitud cancelada, agregar debajo del estado:

```
┌─────────────────────────────────┐
│  ❌ Cancelado                   │
│  "Se cortó la luz en el baño..."│
│                                 │
│  El profesional no pudo         │
│  tomar el trabajo.              │
│                                 │
│  [ 🔍 Buscar otro profesional ] │
└─────────────────────────────────┘
```

Botón naranja outline → navega a `/buscar-profesional/:requestId`

### En `SolicitudDetail.tsx`
En el estado `cancelled`, debajo del mensaje "La solicitud fue cancelada.", agregar el mismo botón CTA.

---

## 4. Nueva página `BuscarOtroProfesional.tsx`

**Ruta:** `/buscar-profesional/:requestId`

### Flujo
1. Lee `requestId` de params
2. Busca la solicitud en el store → obtiene `category`, `location`, `description`, `scheduled_date`
3. Carga profesionales de esa categoría con `useProfessionals(category)`
4. Filtra por zona con `isInRadius` (mismo sistema del TicketFlow existente)
5. Ordena por `scoreProfessional`
6. Muestra lista de cards de profesionales (reutiliza el mismo diseño de `ResultsStep` en TicketFlow)

### UI

```
┌─────────────────────────────────┐
│  ← Buscar otro profesional      │
│  Electricidad · Pocitos         │
├─────────────────────────────────┤
│  Profesionales disponibles      │
│                                 │
│  [Card pro 1 — seleccionado ✓]  │
│  [Card pro 2]                   │
│  [Card pro 3]                   │
│  ...                            │
│                                 │
│  [Continuar con [Nombre] →]     │  CTA fijo al fondo
└─────────────────────────────────┘
```

### Al seleccionar profesional
Navega a `TicketConfirm` con state pre-cargado desde la solicitud original:
```ts
navigate('/ticket/confirmar', {
  state: {
    ticket: { title: req.description, description: req.description, category: req.category, urgent: req.urgency, work_type: req.work_type },
    proId: selectedPro.id,
    proName: selectedPro.profiles.full_name,
    proAvatar: selectedPro.profiles.avatar_url,
    proRating: selectedPro.avg_rating,
    zone: req.location ?? '',
  }
})
```

### Header
- Back → navega -1
- Subtítulo: `{emoji} {label} · {location || 'Sin zona'}`

---

## Estética

Sigue el sistema de diseño existente:
- Naranja primario: `#E8683A`
- Fondo páginas: `#F9F6F2`, cards: `#FFFFFF`, border: `#E8E0D4`
- `font-black` títulos, `font-bold` labels/CTAs
- `rounded-2xl` contenedores, `rounded-xl` chips
- Animaciones con `framer-motion` + `SPRING_GENTLE` / `SPRING_SOFT`

---

## Lo que NO cambia

- `requestStore.ts` — sin cambios (ya tiene todos los estados necesarios)
- `TicketConfirm.tsx` — sin cambios (recibe state igual que siempre)
- `Chat.tsx` — sin cambios
- El botón "Aceptar" en `ProRequests` — sin cambios (no necesita confirmación)
