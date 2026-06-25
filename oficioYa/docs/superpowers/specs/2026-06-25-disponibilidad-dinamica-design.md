# Spec: Disponibilidad Dinámica por Duración de Servicio

**Fecha:** 2026-06-25  
**Estado:** Aprobado  
**Autor:** Brainstorming session con usuario

---

## Objetivo

Reemplazar el sistema de slots fijos de 30 minutos por uno donde cada profesional configura la duración real de sus servicios y un buffer opcional entre ellos. Los slots se generan dinámicamente según estos parámetros. El cliente solo ve horarios de inicio disponibles, sin elegir duraciones arbitrarias.

---

## Decisiones clave

- **Retrocompatible:** `intervalMin` se mantiene como fallback. Si `serviceDurationMin` existe, tiene precedencia.
- **Buffer visible para el cliente:** los minutos de pausa aparecen como slots `blocked` en el `TimeSlotGrid`.
- **Bloqueo automático al reservar:** al confirmar un slot, el booking cubre `fromTime → fromTime + serviceDurationMin`. El buffer se refleja automáticamente en `getSlots` sin persistirse por separado.
- **Duración configurable con chips rápidos:** 5 opciones (30, 45, 60, 90, 120 min) para simplificar la configuración al profesional.
- **Sin nuevo store:** todo se extiende dentro de `availabilityStore.ts`.
- **Tabla Supabase incluida** como migración, para conectar en fase posterior sin tocar UI.

---

## Modelo de datos

### `WorkingSchedule` (extendido)

```ts
export interface WorkingSchedule {
  proId: string
  days: DayOfWeek[]
  fromHour: string              // 'HH:MM'
  toHour: string                // 'HH:MM'
  intervalMin: number           // legado — usado si serviceDurationMin no está presente
  serviceDurationMin?: number   // duración del servicio en minutos
  bufferMin?: number            // tiempo de pausa entre servicios (default 0)
}
```

### Constante de opciones rápidas

```ts
// src/store/availabilityStore.ts (o src/lib/durationOptions.ts)
export const DURATION_OPTIONS = [
  { label: '30 min',  value: 30  },
  { label: '45 min',  value: 45  },
  { label: '60 min',  value: 60  },
  { label: '90 min',  value: 90  },
  { label: '2 horas', value: 120 },
]

export const BUFFER_OPTIONS = [
  { label: 'Sin pausa', value: 0  },
  { label: '15 min',    value: 15 },
  { label: '30 min',    value: 30 },
  { label: '45 min',    value: 45 },
  { label: '60 min',    value: 60 },
]
```

### Tabla Supabase (migración nueva)

```sql
-- supabase/migrations/20260625_availability_settings.sql
CREATE TABLE IF NOT EXISTS availability_settings (
  professional_id       uuid PRIMARY KEY REFERENCES professionals(id) ON DELETE CASCADE,
  work_start_time       time    NOT NULL DEFAULT '08:00',
  work_end_time         time    NOT NULL DEFAULT '18:00',
  service_duration_min  integer NOT NULL DEFAULT 60,
  buffer_min            integer NOT NULL DEFAULT 0,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);
```

La migración existe para la fase de conexión real. El store sigue siendo mock en esta implementación.

---

## Lógica de generación de slots (`getSlots`)

### Algoritmo

```
efectiveDuration = serviceDurationMin ?? intervalMin
efectiveBuffer   = bufferMin ?? 0
paso             = efectiveDuration + efectiveBuffer

Para cursor = fromMin; cursor + efectiveDuration <= toMin; cursor += paso:

  slotStart = cursor
  slotEnd   = cursor + efectiveDuration
  bufferEnd = slotEnd + efectiveBuffer

  // Slot del servicio
  isBooked   = algún booking de proId en date se superpone con [slotStart, slotEnd)
  isBlocked  = algún blockedSlot de proId en date se superpone con [slotStart, slotEnd)
  status     = isBooked ? 'booked' : isBlocked ? 'blocked' : 'available'
  push { time: minToTime(slotStart), status }

  // Slots de buffer (visibles como 'blocked', en pasos de 30 min para el grid)
  Para b = slotEnd; b < bufferEnd; b += 30:
    push { time: minToTime(b), status: 'blocked' }
```

### Condición de corte

Un slot de servicio solo se genera si `slotStart + efectiveDuration <= toMin`. Si no cabe completo antes del fin de jornada, no aparece.

### Ejemplos

**Duración 60 min, buffer 30 min, jornada 08:00–12:00:**
```
08:00 → available  (servicio)
08:30 → blocked    (buffer)
09:00 → available  (servicio)
09:30 → blocked    (buffer)
10:00 → available  (servicio)
10:30 → blocked    (buffer)
11:00 → available  (servicio)
```

**Duración 90 min, buffer 0, jornada 08:00–18:00:**
```
08:00 → available
09:30 → available
11:00 → available
12:30 → available
14:00 → available
15:30 → available
17:00 → available
```

**Duración 30 min, buffer 0, jornada 08:00–10:00:**
```
08:00 → available
08:30 → available
09:00 → available
09:30 → available
```

---

## Bloqueo al confirmar reserva

Cuando el cliente confirma un slot `startTime`:

```ts
addBooking({
  proId,
  requestId,
  date,
  fromTime: startTime,
  toTime: minToTime(timeToMin(startTime) + efectiveDuration),
})
```

El buffer **no se persiste** como booking. `getSlots` lo calcula automáticamente: cualquier minuto dentro de `[toTime, toTime + bufferMin)` de un booking existente cae en rango bloqueado porque el próximo slot disponible empieza en `toTime + bufferMin`.

La detección de superposición en `getSlots` cubre esto: un slot candidato `[slotStart, slotEnd)` colisiona con el booking si `booking.fromTime < slotEnd && booking.toTime > slotStart`.

---

## UI del profesional — `ProAvailability.tsx`

### Nuevos bloques (agregados después de hora inicio/fin)

**Duración del servicio** — chips horizontales, uno seleccionado a la vez:
```
⏱ Duración del servicio
[30 min] [45 min] [60 min ✓] [90 min] [2 horas]
```
- Chip activo: fondo `#0F6E56`, texto blanco
- Chip inactivo: fondo `#F5F0E8`, texto `#555555`
- Default: el valor actual de `schedule.serviceDurationMin` o 60 min si no está configurado

**Pausa entre servicios** — colapsado por defecto, expandible:
```
[+ Agregar pausa entre servicios]
   ↓ expandido:
[Sin pausa ✓] [15 min] [30 min] [45 min] [60 min]
```
- Default: Sin pausa (0 min)
- Se muestra expandido si `schedule.bufferMin > 0`

**Vista previa en tiempo real** — el `TimeSlotGrid` existente ya muestra slots generados. Al cambiar duración o buffer, los slots del `previewDate` se recalculan instantáneamente (el store es reactivo, sin llamada async).

**Guardar agenda** — `setSchedule` actualizado para incluir los nuevos campos:
```ts
setSchedule(proId, {
  days: localDays,
  fromHour,
  toHour,
  intervalMin: schedule?.intervalMin ?? 30,  // preservar legado
  serviceDurationMin: localDuration,
  bufferMin: localBuffer,
})
```

### Sin cambios en

- `DateStrip` — no se modifica
- `TimeSlotGrid` — no se modifica (ya renderiza `blocked` correctamente)
- `BlockSlotSheet`, `VacationSheet` — no se modifican

---

## UI del cliente

### `ProfessionalDetail` / `ProfessionalProfile`

Agregar línea informativa de duración estimada:
```
⏱ Duración estimada: 1 hora
```
Se calcula desde `schedule.serviceDurationMin`:
- `< 60` → "X min"  
- `=== 60` → "1 hora"  
- `> 60 && % 60 === 0` → "X horas"  
- resto → "X hora Y min"

### Flujo de reserva (`RequestWizard` / `TicketFlow`)

Al confirmar el slot seleccionado, se pasa `toTime = startTime + serviceDurationMin` al `addBooking`. El componente que llama al booking debe leer `serviceDurationMin` del schedule del pro para calcular `toTime`.

---

## Archivos a modificar

**Modificar:**
- `src/store/availabilityStore.ts` — extender `WorkingSchedule`, actualizar `getSlots`, exportar `DURATION_OPTIONS` y `BUFFER_OPTIONS`
- `src/pages/pro/ProAvailability.tsx` — agregar chips de duración y buffer, actualizar `setSchedule`
- `src/pages/ProfessionalDetail.tsx` (o `ProfessionalProfile.tsx`) — agregar label de duración estimada

**Crear:**
- `supabase/migrations/20260625_availability_settings.sql`

**No modificar:**
- `src/components/availability/DateStrip.tsx`
- `src/components/availability/TimeSlotGrid.tsx`
- `src/components/availability/TimeSlotPill.tsx`
- `src/components/availability/BlockSlotSheet.tsx`
- `src/components/availability/VacationSheet.tsx`
