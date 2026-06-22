# Diseño: Sistema de Calendario y Disponibilidad
**Fecha:** 2026-06-22  
**Alcance:** Demo mode (Zustand). Supabase se integra en una iteración posterior.  
**Enfoque elegido:** Opción B — completo sin flujo de negociación "proponer otro horario".

---

## 1. Resumen

Agregar un sistema de disponibilidad que permita:
- Al **cliente**: elegir fecha y horario al contratar un profesional (nuevo paso 4 en `RequestWizard`).
- Al **profesional**: gestionar su agenda desde una nueva página `/pro/disponibilidad` (horario laboral, bloqueos manuales, vacaciones).

Las reservas se crean automáticamente al confirmar una solicitud, bloqueando el slot para evitar superposiciones.

---

## 2. Capa de datos — `availabilityStore.ts`

### Tipos

```ts
type DayOfWeek = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo'

interface WorkingSchedule {
  proId: string
  days: DayOfWeek[]
  fromHour: string   // 'HH:MM', ej '08:00'
  toHour: string     // 'HH:MM', ej '18:00'
  intervalMin: number // 30 por defecto
}

interface BlockedSlot {
  id: string
  proId: string
  date: string       // 'YYYY-MM-DD'
  fromTime: string   // 'HH:MM'
  toTime: string     // 'HH:MM'
  reason?: string
}

interface Vacation {
  id: string
  proId: string
  fromDate: string   // 'YYYY-MM-DD'
  toDate: string     // 'YYYY-MM-DD'
}

interface Booking {
  id: string
  proId: string
  requestId: string
  date: string       // 'YYYY-MM-DD'
  fromTime: string   // 'HH:MM'
  toTime: string     // 'HH:MM' (fromTime + 60 min por defecto)
}

type SlotStatus = 'available' | 'blocked' | 'booked'

interface TimeSlot {
  time: string       // 'HH:MM'
  status: SlotStatus
}
```

### Store API

```ts
interface AvailabilityStore {
  schedules: Record<string, WorkingSchedule>   // keyed by proId
  blockedSlots: BlockedSlot[]
  vacations: Vacation[]
  bookings: Booking[]

  // Lectura
  getSlots(proId: string, date: string): TimeSlot[]
  isDateAvailable(proId: string, date: string): boolean

  // Escritura — pro
  setSchedule(proId: string, schedule: Omit<WorkingSchedule, 'proId'>): void
  addBlockedSlot(slot: Omit<BlockedSlot, 'id'>): void
  removeBlockedSlot(id: string): void
  addVacation(vacation: Omit<Vacation, 'id'>): void
  removeVacation(id: string): void

  // Escritura — sistema (al confirmar solicitud)
  addBooking(booking: Omit<Booking, 'id'>): void
}
```

### Lógica de `getSlots(proId, date)`

1. Obtener `schedule` para el pro (si no existe, retornar `[]`).
2. Convertir `date` a día de semana. Si no está en `schedule.days`, retornar `[]`.
3. Si `date` cae dentro de alguna `Vacation` del pro, retornar `[]`.
4. Generar slots cada `intervalMin` minutos entre `fromHour` y `toHour`.
5. Para cada slot, determinar status:
   - `booked` si solapa con algún `Booking` del pro ese día.
   - `blocked` si solapa con algún `BlockedSlot` del pro ese día.
   - `available` en caso contrario.
6. Retornar array de `TimeSlot` ordenado cronológicamente.

### Solapamiento

Un slot `S` solapa con un rango `[from, to)` si `S.time >= from && S.time < to`.  
Las bookings ocupan `fromTime` hasta `fromTime + 60 min` por defecto.

### Datos demo

- Pro `'1'` (Carlos Méndez): Lun–Vie 08:00–18:00, Sáb 08:00–13:00.
- Bloqueos de ejemplo: martes próximo 13:00–16:00 ("Trabajo externo").
- Booking existente vinculado al request `'201'`.

---

## 3. Componentes UI

### `DateStrip`
`src/components/availability/DateStrip.tsx`

Strip horizontal scrollable con los próximos 14 días. Cada día = píldora pequeña con número y letra del día (`21\nD`). Estados: seleccionado (naranja, `#E8683A`), no laborable/vacaciones (gris, no seleccionable), disponible (fondo #F5F0E8).

### `TimeSlotGrid`
`src/components/availability/TimeSlotGrid.tsx`

Grilla de píldoras en filas de 4. Cada píldora muestra la hora (`08:30`).

Estados visuales:
| Estado | Fondo | Texto | Interacción |
|--------|-------|-------|-------------|
| available | `linear-gradient(135deg, #16A34A, #15803D)` | blanco | seleccionable |
| booked | `linear-gradient(135deg, #DC2626, #B91C1C)` | blanco | deshabilitado |
| blocked | `linear-gradient(135deg, #DC2626, #B91C1C)` | blanco | deshabilitado |
| pending | `linear-gradient(135deg, #F59E0B, #D97706)` | blanco | deshabilitado |
| selected | naranja marca + borde + scale(1.05) | blanco | — |

Animación al seleccionar: `transition: transform 150ms, box-shadow 150ms` + `scale(1.05)`.

### `TimeSlotPill`
`src/components/availability/TimeSlotPill.tsx`

Píldora individual. Props: `time`, `status`, `selected`, `onClick`.

### `BlockSlotSheet`
`src/components/availability/BlockSlotSheet.tsx`

Bottom sheet (mismo patrón AnimatePresence que el resto de la app) con:
- `<input type="date">` estilizado
- Selects de hora inicio / fin (opciones cada 30 min)
- Input de texto para motivo (opcional)
- Botón "Guardar bloqueo" (naranja primario)

### `VacationSheet`
`src/components/availability/VacationSheet.tsx`

Bottom sheet simplificado con fecha inicio, fecha fin y botón guardar.

---

## 4. Flujo del cliente — RequestWizard

### Cambio de pasos

| Paso | Título | Cambio |
|------|--------|--------|
| 1 | ¿Qué tipo de trabajo? | sin cambio |
| 2 | Contanos qué necesitás | sin cambio |
| 3 | ¿Es urgente? | sin cambio |
| **4** | **Elegir fecha y horario** | **NUEVO** |
| 5 | Confirmá tu solicitud | antes era paso 4 |

### Cambios en `WizardData`

Agregar campos:
```ts
scheduled_date: string | null   // 'YYYY-MM-DD'
scheduled_time: string | null   // 'HH:MM'
```

### Paso 4 — UI

- Título: "¿Cuándo lo necesitás?"
- `DateStrip` en la parte superior
- Mensaje si no hay slots ("El profesional no tiene disponibilidad este día")
- `TimeSlotGrid` debajo
- Botón "Continuar" habilitado solo si hay fecha y horario seleccionados

### Integración con `requestStore`

En `addRequest`, al crear la solicitud también llamar a `availabilityStore.addBooking()` con los datos del slot seleccionado.

### Paso 5 — Confirmación

Mostrar en el resumen: `Fecha: Martes 24/06 · 10:00hs`.

---

## 5. Página pro — `ProAvailability`

**Ruta:** `/pro/disponibilidad`  
**Archivo:** `src/pages/pro/ProAvailability.tsx`

### Estructura de la página

```
Header: "Mi Disponibilidad"

── Sección 1: Horario laboral ──────────────────
  [Lun] [Mar] [Mié] [Jue] [Vie] [Sáb] [Dom]
  (toggles por día)
  Días activos muestran: Desde [08:00 ▼] Hasta [18:00 ▼]
  Botón "Guardar horario"

── Sección 2: Bloqueos manuales ───────────────
  [➕ Bloquear horario]
  Lista: card por bloqueo (fecha · hora inicio–fin · motivo) [×]

── Sección 3: Vacaciones ──────────────────────
  [🏖️ Agregar período]
  Lista: chips "24/06 → 28/06" [×]

── Sección 4: Preview del día ─────────────────
  "Disponibilidad hoy"
  TimeSlotGrid (read-only) para la fecha actual
```

### Navegación

Agregar entrada "Agenda" en `ProBottomNav` (ícono `Calendar` de lucide-react).  
Ruta: `/pro/disponibilidad`.

---

## 6. Archivos a crear / modificar

### Crear
| Archivo | Descripción |
|---------|-------------|
| `src/store/availabilityStore.ts` | Store Zustand con toda la lógica |
| `src/components/availability/DateStrip.tsx` | Strip de fechas |
| `src/components/availability/TimeSlotGrid.tsx` | Grilla de píldoras |
| `src/components/availability/TimeSlotPill.tsx` | Píldora individual |
| `src/components/availability/BlockSlotSheet.tsx` | Bottom sheet de bloqueo |
| `src/components/availability/VacationSheet.tsx` | Bottom sheet de vacaciones |
| `src/pages/pro/ProAvailability.tsx` | Página de disponibilidad del pro |

### Modificar
| Archivo | Cambio |
|---------|--------|
| `src/components/requests/RequestWizard.tsx` | Agregar paso 4, nuevo `WizardData` |
| `src/pages/RequestService.tsx` | `TOTAL_STEPS` pasa de 4 a 5 |
| `src/store/requestStore.ts` | `addRequest` llama a `addBooking` |
| `src/components/layout/ProBottomNav.tsx` | Nueva entrada "Agenda" |
| `src/App.tsx` | Nueva ruta `/pro/disponibilidad` |

---

## 7. Fuera de alcance (esta iteración)

- Flujo "proponer otro horario" (requiere notificaciones bidireccionales → Supabase).
- Sincronización con Google Calendar / iCal.
- Duraciones de trabajo variables (todas las bookings son 60 min fijos por ahora).
- Supabase real-time — se integra en iteración posterior sin cambiar la interfaz del store.
- Notificaciones push cuando se bloquea un horario ya reservado.
