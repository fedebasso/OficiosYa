# Spec: Servicios Técnicos Oficiales

**Fecha:** 2026-06-24  
**Estado:** Aprobado  
**Autor:** Brainstorming session con usuario

---

## Objetivo

Permitir que los usuarios de Ofix consulten disponibilidad y agenden directamente con servicios técnicos oficiales (Samsung, LG, Whirlpool, etc.) desde un único lugar, sin navegar por múltiples sitios web.

Ofix actúa como capa de visualización y reserva sobre las agendas de los servicios oficiales. No administra técnicos ni agenda en este módulo — conecta con sistemas externos.

---

## Entrada al módulo

Banner/card en la pantalla `Home` que lleva a `/servicios-oficiales`. El BottomNav no cambia. La sección es pública (no requiere login para ver el listado y disponibilidad; sí para confirmar turno).

---

## Rutas

```
/servicios-oficiales          → OfficialServicesPage
/servicios-oficiales/:id      → OfficialServiceDetail
```

Ambas rutas se agregan como lazy imports en `App.tsx`, sin layout propio (usan el `ClientLayout` existente).

---

## Tipos de datos

```ts
// src/types/officialServices.ts

type IntegrationType = 'mock' | 'google_calendar' | 'api' | 'booking_url'
type ServicePlan = 'presencia' | 'agenda' | 'destacado'

interface OfficialService {
  id: string
  company_name: string
  logo_url?: string
  brands: string[]        // ['Samsung', 'LG']
  categories: string[]    // ['aire_acondicionado', 'heladera']
  city: string
  zones: string[]
  website?: string
  booking_url?: string
  integration_type: IntegrationType
  plan: ServicePlan
  active: boolean
}

interface ServiceSlot {
  date: string      // 'YYYY-MM-DD'
  time: string      // 'HH:MM'
  available: boolean
}

interface PendingBooking {
  serviceId: string
  date: string
  time: string
  createdAt: string
}
```

---

## Store: `officialServiceStore.ts`

Zustand store en `src/store/officialServiceStore.ts` con dos responsabilidades:

### Estado
```ts
{
  services: OfficialService[]
  slots: Record<string, ServiceSlot[]>   // key: `${serviceId}_${date}`
  pendingBooking: PendingBooking | null
  loading: boolean
  error: string | null
}
```

### Acciones
```ts
fetchServices(filters?: { category?: string; brand?: string; zone?: string }): Promise<void>
fetchSlots(serviceId: string, dates: string[]): Promise<void>
confirmBooking(serviceId: string, date: string, time: string): void
clearPendingBooking(): void
```

`fetchServices` y `fetchSlots` tienen firma fija. En MVP retornan mock data. En fases siguientes, el cuerpo se reemplaza según `integration_type` sin tocar UI:

| `integration_type` | Comportamiento fase 2 |
|---|---|
| `mock` | Datos demo (plan presencia o en evaluación) |
| `google_calendar` | Google Calendar API compartido |
| `api` | Endpoint REST del servicio oficial |
| `booking_url` | Redirige sin mostrar slots propios |

`confirmBooking` guarda `PendingBooking` en el store (y en `localStorage`). En fase 2 esto se convierte en una llamada a Supabase tabla `official_bookings`.

---

## Mock data: `src/data/officialServicesMock.ts`

5 servicios hardcodeados:

| Empresa | Marcas | Categorías | Plan |
|---|---|---|---|
| Samsung Service Center | Samsung | aire_acondicionado, tv, heladera | destacado |
| LG Service Oficial | LG | aire_acondicionado, lavarropas | agenda |
| Whirlpool Uruguay | Whirlpool, Consul | lavarropas, horno | agenda |
| Midea Técnica | Midea, BGH | aire_acondicionado | presencia |
| James Service | James | lavarropas, heladera | presencia |

**Slots mock** (solo para planes `agenda` y `destacado`):
- Próximos 14 días, lunes a viernes
- Franjas: 9:00, 10:00, 11:00, 14:00, 15:00, 16:00
- ~60% de slots marcados como `available: true` para simular disponibilidad real

Planes `presencia`: `fetchSlots` retorna array vacío → UI muestra "Sin turnos online".

---

## Componentes nuevos

### `OfficialServiceCard`
**Ubicación:** `src/components/officialServices/OfficialServiceCard.tsx`

Card compacta tipo directorio:
```
┌─────────────────────────────────────────────┐
│ [LOGO 40px]  Samsung Service Center  ● Disp │
│              Aire AC · TV · Heladera         │
│              Pocitos, Punta Carretas         │
│              Próx: Lun 9:00 · Mar 10:30     │
└─────────────────────────────────────────────┘
```

- Logo 40×40px con fallback a iniciales (igual que `ProfessionalCard`)
- Badge verde "Disponible" / gris "Sin turnos" según plan y slots
- Badge dorado ⭐ para plan `destacado`
- Muestra los próximos 2 slots disponibles en texto compacto ("Lun 9:00 · Mar 10:30")
- `onClick` navega a `/servicios-oficiales/:id`

Props:
```ts
interface Props {
  service: OfficialService
  nextSlots: ServiceSlot[]   // primeros 2 disponibles, puede ser []
  onClick: () => void
}
```

---

### `DateStripGeneric`
**Ubicación:** `src/components/availability/DateStripGeneric.tsx`

Versión prop-driven de `DateStrip`. La diferencia: en vez de leer de `availabilityStore` via `proId`, recibe `isDateAvailable: (date: string) => boolean` como prop. El componente original `DateStrip` no se modifica.

Props:
```ts
interface Props {
  selected: string | null
  onSelect: (date: string) => void
  isDateAvailable: (date: string) => boolean
}
```

`TimeSlotGrid` se reutiliza sin cambios.

---

## Páginas nuevas

### `OfficialServicesPage`
**Ruta:** `/servicios-oficiales`  
**Ubicación:** `src/pages/OfficialServicesPage.tsx`

Estructura:
1. Header "Servicios Técnicos Oficiales" con back arrow
2. Search bar: filtra por nombre de empresa o marca (client-side)
3. Chips horizontales de categoría (scrollable, mismo patrón que `Search`)
4. Chip de zona (dropdown o chips, mismo patrón que `Search`)
5. Lista de `OfficialServiceCard`, ordenada: `destacado` → `agenda` → `presencia`
6. Estado vacío si no hay resultados para los filtros

Carga inicial: llama `fetchServices()` al montar. Filtros son client-side sobre el array ya cargado.

---

### `OfficialServiceDetail`
**Ruta:** `/servicios-oficiales/:id`  
**Ubicación:** `src/pages/OfficialServiceDetail.tsx`

Estructura:
1. Header: logo grande, nombre, marcas como chips, zonas
2. Si plan `presencia`: banner "Reservas online no disponibles" + botón "Ver sitio web" → `website`
3. Si plan `agenda` o `destacado`:
   - `DateStripGeneric` — 14 días, días sin slots deshabilitados
   - Al seleccionar fecha → `TimeSlotGrid` con slots del día
   - Al seleccionar hora → botón "Confirmar turno" se activa
4. Al confirmar:
   - Llama `confirmBooking(id, date, time)` → guarda `PendingBooking`
   - Abre `booking_url?date=YYYY-MM-DD&time=HH:MM` en nueva pestaña
   - Muestra toast "Turno solicitado — completá la reserva en el sitio del service"

---

## Entrada desde Home

En `src/pages/Home.tsx`, agregar un banner antes o después de la sección de categorías:

```
┌─────────────────────────────────────────────┐
│  🔧 Servicios Técnicos Oficiales            │
│  Samsung · LG · Whirlpool · y más          │
│  Agendá directo con el service →           │
└─────────────────────────────────────────────┘
```

Card con fondo distinto al resto (ej. degradado sutil verde/blanco), tap navega a `/servicios-oficiales`.

---

## Monetización reflejada en UI

| Plan | Comportamiento |
|---|---|
| `presencia` | Aparece en listado, badge gris "Sin turnos online", sin DateStrip ni slots, botón "Ver sitio web" |
| `agenda` | Listado + disponibilidad + DateStrip + TimeSlotGrid + confirmación |
| `destacado` | Todo lo de `agenda` + badge ⭐ + posición prioritaria en el listado |

Ordenamiento: `destacado` primero, luego `agenda`, luego `presencia`. Dentro de cada grupo, orden alfabético por `company_name`.

---

## Fase 2: integración real (fuera de scope MVP)

Cuando un servicio oficial se sume con agenda real:
1. Cambiar `integration_type` en la DB
2. Reemplazar cuerpo de `fetchSlots` para ese tipo — UI no cambia
3. Crear tabla Supabase `official_bookings` y conectar `confirmBooking`
4. Opcionalmente mover reservas a "Mis Solicitudes" del cliente

---

## Archivos a crear/modificar

**Crear:**
- `src/types/officialServices.ts`
- `src/data/officialServicesMock.ts`
- `src/store/officialServiceStore.ts`
- `src/components/officialServices/OfficialServiceCard.tsx`
- `src/components/availability/DateStripGeneric.tsx`
- `src/pages/OfficialServicesPage.tsx`
- `src/pages/OfficialServiceDetail.tsx`

**Modificar:**
- `src/App.tsx` — agregar 2 rutas lazy
- `src/pages/Home.tsx` — agregar banner de entrada
