# Restricción de contacto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar WhatsApp y teléfono de perfiles y solicitudes pendientes; habilitarlos solo cuando el profesional acepta (`confirmed` / `in_progress`).

**Architecture:** Cambios quirúrgicos en cuatro archivos existentes. Sin nuevos componentes ni stores. La regla de gating vive en cada página que renderiza los botones de contacto.

**Tech Stack:** React 18, TypeScript, Zustand, React Router v6, Framer Motion, Lucide React.

## Global Constraints

- No crear archivos nuevos salvo el plan mismo.
- No modificar el store `requestStore` ni `chatStore` — la lógica de gating es puramente de presentación.
- Seguir el estilo visual existente (colores, bordes, `rounded-2xl`, motion).
- No hay tests unitarios en el proyecto — verificación manual en el dev server (`http://localhost:5177`).

---

### Task 1: Limpiar `TicketConfirm.tsx` — eliminar `proWhatsapp` de la interfaz

**Files:**
- Modify: `oficioYa/src/pages/TicketConfirm.tsx`

**Interfaces:**
- Consumes: nada de otras tareas
- Produces: nada que tareas posteriores consuman

- [ ] **Step 1: Eliminar `proWhatsapp` de `LocationState`**

En `src/pages/TicketConfirm.tsx`, la interfaz `LocationState` actualmente incluye:

```ts
interface LocationState {
  ticket: GeneratedTicket
  proId: string
  proName: string
  proAvatar: string | null
  proRating: number | null
  proWhatsapp: string   // ← eliminar esta línea
}
```

Resultado esperado:

```ts
interface LocationState {
  ticket: GeneratedTicket
  proId: string
  proName: string
  proAvatar: string | null
  proRating: number | null
}
```

- [ ] **Step 2: Verificar que no se usa `proWhatsapp` en el render**

Buscar en el archivo cualquier referencia a `proWhatsapp` o `state.proWhatsapp`. Si no existe ninguna en el JSX (ya confirmado en el análisis — el campo estaba declarado pero no renderizado), no hay más cambios.

- [ ] **Step 3: Verificar en dev server**

Abrir `http://localhost:5177`, completar el flujo TicketFlow → TicketConfirm. La pantalla de éxito debe mostrar solo "Ver mis solicitudes" y "Volver al inicio". Sin botón verde de WhatsApp.

- [ ] **Step 4: Commit**

```bash
git add oficioYa/src/pages/TicketConfirm.tsx
git commit -m "fix: eliminar proWhatsapp de LocationState en TicketConfirm"
```

---

### Task 2: Limpiar `TicketFlow.tsx` — no pasar `proWhatsapp` al navegar

**Files:**
- Modify: `oficioYa/src/pages/TicketFlow.tsx`

**Interfaces:**
- Consumes: `LocationState` de Task 1 (ya sin `proWhatsapp`)
- Produces: nada

- [ ] **Step 1: Localizar la navegación a `/ticket/confirmar`**

Buscar en `src/pages/TicketFlow.tsx` la llamada a `navigate('/ticket/confirmar', { state: { ... } })`. Tiene la forma:

```ts
navigate('/ticket/confirmar', {
  state: {
    ticket,
    proId: selectedPro.id,
    proName: selectedPro.profiles.full_name,
    proAvatar: selectedPro.profiles.avatar_url,
    proRating: selectedPro.avg_rating,
    proWhatsapp: selectedPro.whatsapp ?? selectedPro.profiles.phone ?? '',
  },
})
```

- [ ] **Step 2: Eliminar `proWhatsapp` del state de navegación**

```ts
navigate('/ticket/confirmar', {
  state: {
    ticket,
    proId: selectedPro.id,
    proName: selectedPro.profiles.full_name,
    proAvatar: selectedPro.profiles.avatar_url,
    proRating: selectedPro.avg_rating,
  },
})
```

- [ ] **Step 3: Verificar en dev server**

Completar el flujo completo: Home → buscar profesional → Solicitar trabajo → TicketFlow (pasos 1, 2, 3) → TicketConfirm. No debe haber errores de TypeScript en consola ni referencias a `proWhatsapp`.

- [ ] **Step 4: Commit**

```bash
git add oficioYa/src/pages/TicketFlow.tsx
git commit -m "fix: eliminar proWhatsapp del state de navegación en TicketFlow"
```

---

### Task 3: `ProRequests.tsx` — quitar WhatsApp de `PendingCard`, ocultar teléfono

**Files:**
- Modify: `oficioYa/src/pages/pro/ProRequests.tsx`

**Interfaces:**
- Consumes: nada de otras tareas
- Produces: nada

- [ ] **Step 1: Quitar `onWhatsApp` de la firma de `PendingCard`**

Cambiar:

```ts
function PendingCard({ req, onAccept, onReject, onWhatsApp }: {
  req: ServiceRequest
  onAccept: () => void
  onReject: () => void
  onWhatsApp: () => void
})
```

Por:

```ts
function PendingCard({ req, onAccept, onReject }: {
  req: ServiceRequest
  onAccept: () => void
  onReject: () => void
})
```

- [ ] **Step 2: Eliminar el bloque de `contact_phone` visible en `PendingCard`**

Eliminar este bloque (líneas ~90-98 del archivo actual):

```tsx
{req.contact_phone && (
  <div
    className="flex items-center gap-2 rounded-xl px-3 py-2"
    style={{ background: '#F5F0E8', border: '1px solid #E8E0D4' }}
  >
    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#AAAAAA' }}>Tel</span>
    <span className="text-sm font-semibold" style={{ color: '#111111' }}>{req.contact_phone}</span>
  </div>
)}
```

- [ ] **Step 3: Eliminar el botón de WhatsApp dentro de `PendingCard`**

Eliminar este bloque del grupo de acciones (líneas ~122-133):

```tsx
{req.contact_phone && (
  <motion.button
    type="button"
    onClick={onWhatsApp}
    whileTap={{ scale: 0.97 }}
    className="w-12 flex items-center justify-center rounded-xl flex-shrink-0"
    style={{ background: '#DCFCE7', color: '#16A34A', border: '1px solid #BBF7D0' }}
    aria-label="WhatsApp"
  >
    <MessageCircle size={15} />
  </motion.button>
)}
```

- [ ] **Step 4: Actualizar el caller de `PendingCard` en `ProRequests`**

Cambiar:

```tsx
<PendingCard
  req={req}
  onAccept={() => updateStatus(req.id, 'confirmed')}
  onReject={() => updateStatus(req.id, 'cancelled')}
  onWhatsApp={() => req.contact_phone && openWhatsApp(req.contact_phone)}
/>
```

Por:

```tsx
<PendingCard
  req={req}
  onAccept={() => updateStatus(req.id, 'confirmed')}
  onReject={() => updateStatus(req.id, 'cancelled')}
/>
```

- [ ] **Step 5: Verificar en dev server**

Navegar a `/pro/solicitudes` (logueado como profesional). Las cards pendientes deben mostrar solo descripción, categoría, y botones Aceptar/Rechazar. Sin teléfono ni ícono de WhatsApp.

- [ ] **Step 6: Commit**

```bash
git add oficioYa/src/pages/pro/ProRequests.tsx
git commit -m "fix: ocultar teléfono y WhatsApp en solicitudes pendientes del pro"
```

---

### Task 4: `SolicitudDetail.tsx` — botón WhatsApp condicional por status

**Files:**
- Modify: `oficioYa/src/pages/SolicitudDetail.tsx`

**Interfaces:**
- Consumes: `ServiceRequest.status`, `ServiceRequest.contact_phone`
- Produces: nada

**Contexto:** El cliente ingresa su propio teléfono en `contact_phone`. El número del profesional no está en `ServiceRequest` todavía. En esta iteración, el botón de WhatsApp en `SolicitudDetail` abre el teléfono del **profesional** — pero como el número del pro no está en el store, se usa `contact_phone` del cliente como placeholder hasta que se integre Supabase. El gating por status es lo crítico.

- [ ] **Step 1: Agregar import de `Phone` de lucide-react**

Al inicio del archivo, en la línea de imports de lucide:

```ts
import { ChevronLeft, MessageCircle, XCircle, Star, Phone } from 'lucide-react'
```

- [ ] **Step 2: Agregar función helper `openWhatsApp` antes del componente**

Agregar después de las constantes `STEPS`:

```ts
function openWhatsApp(phone: string) {
  const clean = phone.replace(/\s/g, '')
  const msg = encodeURIComponent('Hola, te contacto por mi solicitud en OficioYa.')
  window.open(`https://wa.me/${clean}?text=${msg}`, '_blank')
}
```

- [ ] **Step 3: Agregar botón WhatsApp condicional en la sección de acciones**

En el bloque `{/* Acciones */}`, después del botón de chat y antes del botón de reseña:

```tsx
{/* WhatsApp — solo cuando el profesional aceptó */}
{(req.status === 'confirmed' || req.status === 'in_progress') && req.contact_phone && (
  <motion.button
    type="button"
    onClick={() => openWhatsApp(req.contact_phone!)}
    whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
    className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 text-white"
    style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,.25)' }}
  >
    <Phone size={16} />
    Contactar por WhatsApp
  </motion.button>
)}
```

El bloque de acciones completo resultante debe quedar:

```tsx
<motion.div variants={fadeUp} className="flex flex-col gap-2 mt-1">

  {/* Chat interno — siempre disponible si no está cancelado */}
  {!isCancelled && (
    <motion.button
      type="button"
      onClick={() => navigate(`/solicitud/${req.id}/chat`)}
      whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
      className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 text-white"
      style={{ background: '#0F6E56', boxShadow: '0 4px 14px rgba(15,110,86,.25)' }}
    >
      <MessageCircle size={16} />
      Chatear con el profesional
    </motion.button>
  )}

  {/* WhatsApp — solo cuando el profesional aceptó */}
  {(req.status === 'confirmed' || req.status === 'in_progress') && req.contact_phone && (
    <motion.button
      type="button"
      onClick={() => openWhatsApp(req.contact_phone!)}
      whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
      className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 text-white"
      style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,.25)' }}
    >
      <Phone size={16} />
      Contactar por WhatsApp
    </motion.button>
  )}

  {/* Dejar reseña — solo si completado */}
  {req.status === 'completed' && (
    <motion.button
      type="button"
      onClick={() => setShowReview(true)}
      whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
      className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2"
      style={{ background: 'rgba(232,104,58,.1)', color: '#E8683A', border: '1.5px solid rgba(232,104,58,.25)' }}
    >
      <Star size={16} />
      Dejar reseña
    </motion.button>
  )}

  {/* Cancelar — solo si está pendiente */}
  {req.status === 'pending' && (
    <motion.button
      type="button"
      onClick={() => setShowCancel(true)}
      whileTap={{ scale: 0.97 }} transition={SPRING_SOFT}
      className="w-full rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2"
      style={{ background: 'rgba(239,68,68,.06)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,.15)' }}
    >
      <XCircle size={16} />
      Cancelar solicitud
    </motion.button>
  )}

</motion.div>
```

- [ ] **Step 4: Verificar en dev server — status `pending`**

Ir a `/mis-solicitudes`, abrir una solicitud en estado `pending`. Verificar: botón de chat visible, botón de WhatsApp NO visible, botón de cancelar visible.

- [ ] **Step 5: Verificar en dev server — status `confirmed`**

Cambiar manualmente el status de una solicitud a `confirmed` (desde el store de Zustand en devtools o desde ProRequests aceptando). Verificar: botón de chat visible, botón de WhatsApp verde visible.

- [ ] **Step 6: Commit**

```bash
git add oficioYa/src/pages/SolicitudDetail.tsx
git commit -m "feat: mostrar WhatsApp en SolicitudDetail solo cuando status es confirmed/in_progress"
```
