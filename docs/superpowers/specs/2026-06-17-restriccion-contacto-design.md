# Spec: Restricción de contacto y flujo de comunicación

**Fecha:** 2026-06-17  
**Estado:** Aprobado  

## Objetivo

Eliminar el acceso directo a WhatsApp y teléfono de los perfiles de profesionales. Toda comunicación ocurre dentro de OficiosYa hasta que el profesional acepta la solicitud (status `confirmed`).

## Regla central

WhatsApp y teléfono del profesional solo son visibles cuando `status === 'confirmed' | 'in_progress'`. En `pending` y `cancelled` solo existe el chat interno. En `completed` tampoco se muestra (el trabajo terminó, no hay coordinación operativa pendiente).

## Archivos afectados

### 1. `src/components/professionals/ProfessionalProfile.tsx` — sin cambios
Ya no expone WhatsApp ni teléfono. El CTA "Solicitar trabajo" navega a `/ticket?pro=:id`. No requiere modificación.

### 2. `src/pages/TicketConfirm.tsx` — limpiar interfaz
- Eliminar `proWhatsapp` de `LocationState` (está declarado pero no se usa en el render).
- La pantalla de éxito ya tiene "Ver mis solicitudes" y "Volver al inicio" — correcto, sin botón de WhatsApp.

### 3. `src/pages/TicketFlow.tsx` — verificar y limpiar
- Buscar cualquier uso de `whatsapp` en la navegación a `TicketConfirm` y eliminarlo del `state` pasado.
- No exponer datos de contacto del profesional durante el flujo de creación.

### 4. `src/pages/SolicitudDetail.tsx` — agregar botón WhatsApp condicional
- El botón "Chatear con el profesional" ya existe y es correcto (disponible si no está cancelado).
- **Agregar** botón de WhatsApp visible solo si `status === 'confirmed' || status === 'in_progress'` y existe `req.contact_phone` (teléfono que el cliente ingresó) o el número del profesional.
- El botón abre `https://wa.me/598${numero}` con un mensaje pre-armado.
- Posición: debajo del botón de chat, antes del botón de cancelar.

> **Nota:** El número de WhatsApp debe venir del profesional, no del cliente. Actualmente `ServiceRequest` no persiste el `whatsapp` del profesional. Para esta iteración: usar `req.contact_phone` como fallback hasta que el modelo de datos lo incluya. La lógica de gating por status es lo crítico.

### 5. `src/pages/pro/ProRequests.tsx` — quitar WhatsApp de cards pendientes, mantenerlo en activas
- `PendingCard`: eliminar el botón de WhatsApp (el ícono `MessageCircle` que llama `onWhatsApp`). También ocultar el campo `contact_phone` visible en la card mientras está pendiente.
- `ActiveCard` (confirmed/in_progress): **mantener** el botón de WhatsApp — el profesional lo necesita para coordinarse cuando ya aceptó. También mantener `contact_phone` visible.
- Actualizar la firma del componente `PendingCard` eliminando `onWhatsApp` del prop.
- En el caller (`ProRequests` main), eliminar el handler `onWhatsApp` del render de `PendingCard`.

## Flujo resultante

```
Cliente
  → Perfil Profesional (sin WA, sin teléfono)
  → "Solicitar Trabajo"
  → TicketFlow (sin WA)
  → TicketConfirm (sin WA en éxito)
  → SolicitudDetail [pending]
      • Chat interno ✅
      • WhatsApp ❌
  → Pro acepta → [confirmed]
      • Chat interno ✅
      • WhatsApp ✅ (coordinación operativa)
  → [in_progress]
      • Chat interno ✅
      • WhatsApp ✅
  → [completed]
      • Solo reseña
      • WhatsApp ❌
```

## Fuera de scope

- Implementar número de WhatsApp del profesional en el modelo `ServiceRequest` (requiere migración de Supabase).
- Chat para el lado del profesional (ProRequests) — el pro aún no tiene vista de chat propia.
- Ocultar `contact_phone` del cliente en Supabase a nivel de RLS.
