# Disponibilidad Dinámica por Duración de Servicio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el intervalo fijo de 30 min por slots dinámicos basados en la duración real del servicio y un buffer configurable, tanto en la configuración del pro como en la vista del cliente.

**Architecture:** Se extiende `WorkingSchedule` con `serviceDurationMin?` y `bufferMin?` (retrocompatible con `intervalMin` existente). `getSlots` en `availabilityStore` pasa a usar `serviceDurationMin + bufferMin` como paso, generando slots de buffer visibles como `blocked`. `ProAvailability` agrega chips de selección. `requestStore` calcula `toTime` dinámicamente. `ProfessionalProfile` muestra la duración estimada al cliente.

**Tech Stack:** React 19 + TypeScript, Zustand, Tailwind CSS v3, Framer Motion. Sin dependencias nuevas.

## Global Constraints

- Colores: primary `#0F6E56`, orange `#E8683A`, background `#F5F0E8`, card border `#E8E0D4`
- Tipografía: variables CSS `--text-xs / --text-sm / --text-base`
- `intervalMin` se preserva como fallback — no eliminar
- TypeScript estricto (no `any`)
- No instalar dependencias nuevas
- No modificar: `DateStrip.tsx`, `TimeSlotGrid.tsx`, `TimeSlotPill.tsx`, `BlockSlotSheet.tsx`, `VacationSheet.tsx`
- Commits frecuentes al final de cada tarea

---

## Mapa de archivos

**Modificar:**
- `src/store/availabilityStore.ts` — extender `WorkingSchedule`, actualizar `getSlots`, exportar constantes
- `src/pages/pro/ProAvailability.tsx` — agregar chips de duración y buffer
- `src/store/requestStore.ts` — calcular `toTime` dinámicamente desde `serviceDurationMin`
- `src/components/professionals/ProfessionalProfile.tsx` — mostrar duración estimada

**Crear:**
- `supabase/migrations/20260625_availability_settings.sql`

---

## Task 1: Extender availabilityStore — tipos, constantes y lógica de slots

**Files:**
- Modify: `src/store/availabilityStore.ts`

**Interfaces:**
- Produce: `WorkingSchedule` extendido con `serviceDurationMin?: number` y `bufferMin?: number`
- Produce: `DURATION_OPTIONS: { label: string; value: number }[]` exportado
- Produce: `BUFFER_OPTIONS: { label: string; value: number }[]` exportado
- Produce: `getSlots` actualizado que usa `serviceDurationMin + bufferMin` como paso

- [ ] **Step 1: Extender la interfaz `WorkingSchedule`**

En `src/store/availabilityStore.ts`, modificar la interfaz:

```ts
export interface WorkingSchedule {
  proId: string
  days: DayOfWeek[]
  fromHour: string
  toHour: string
  intervalMin: number           // legado — usado si serviceDurationMin no está presente
  serviceDurationMin?: number   // duración del servicio en minutos
  bufferMin?: number            // tiempo de pausa entre servicios (default 0)
}
```

- [ ] **Step 2: Agregar constantes exportadas**

Después de la definición de `WorkingSchedule`, agregar:

```ts
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

- [ ] **Step 3: Actualizar `getSlots` con la nueva lógica de generación**

Reemplazar el cuerpo del `getSlots` en el store. El código actual usa `min += schedule.intervalMin` — reemplazarlo completo:

```ts
getSlots: (proId, date) => {
  const { schedules, blockedSlots, vacations, bookings } = get()
  const schedule = schedules[proId]
  if (!schedule) return []

  if (!schedule.days.includes(dateToDayOfWeek(date))) return []

  const inVacation = vacations.some(
    (v) => v.proId === proId && date >= v.fromDate && date <= v.toDate
  )
  if (inVacation) return []

  const fromMin = timeToMin(schedule.fromHour)
  const toMin   = timeToMin(schedule.toHour)
  const efectiveDuration = schedule.serviceDurationMin ?? schedule.intervalMin
  const efectiveBuffer   = schedule.bufferMin ?? 0
  const paso             = efectiveDuration + efectiveBuffer

  const slots: TimeSlot[] = []

  for (let cursor = fromMin; cursor + efectiveDuration <= toMin; cursor += paso) {
    const slotStart = cursor
    const slotEnd   = cursor + efectiveDuration
    const bufferEnd = slotEnd + efectiveBuffer

    const isBooked = bookings.some(
      (b) =>
        b.proId === proId &&
        b.date  === date  &&
        timeToMin(b.fromTime) < slotEnd &&
        timeToMin(b.toTime)   > slotStart
    )

    const isBlocked = blockedSlots.some(
      (bs) =>
        bs.proId === proId &&
        bs.date  === date  &&
        timeToMin(bs.fromTime) < slotEnd &&
        timeToMin(bs.toTime)   > slotStart
    )

    slots.push({
      time:   minToTime(slotStart),
      status: isBooked ? 'booked' : isBlocked ? 'blocked' : 'available',
    })

    // Slots de buffer: visibles como 'blocked' para que el cliente entienda el hueco
    for (let b = slotEnd; b < bufferEnd; b += 30) {
      slots.push({ time: minToTime(b), status: 'blocked' })
    }
  }

  return slots
},
```

- [ ] **Step 4: Verificar TypeScript**

```bash
cd oficioYa && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 5: Verificar manualmente que los slots se generan correctamente**

Abrir la consola del browser (o crear un test manual) y verificar con el pro `mock-pro-1`:

Con `serviceDurationMin: 60, bufferMin: 30, fromHour: '08:00', toHour: '12:00'`:
- Slots esperados: `08:00 (available)`, `08:30 (blocked)`, `09:00 (available)`, `09:30 (blocked)`, `10:00 (available)`, `10:30 (blocked)`, `11:00 (available)`

Con `serviceDurationMin: 90, bufferMin: 0, fromHour: '08:00', toHour: '12:00'`:
- Slots esperados: `08:00`, `09:30`, `11:00`

Agregar temporalmente a `DEMO_SCHEDULES` para testear:
```ts
'mock-pro-1': { proId: 'mock-pro-1', days: WEEKDAYS_SAT, fromHour: '08:00', toHour: '18:00', intervalMin: 30, serviceDurationMin: 60, bufferMin: 30 },
```
Luego revertir a los valores originales (sin `serviceDurationMin` para dejar el fallback activo).

- [ ] **Step 6: Commit**

```bash
git add src/store/availabilityStore.ts
git commit -m "feat: disponibilidad dinámica — WorkingSchedule con serviceDurationMin y bufferMin, getSlots actualizado"
```

---

## Task 2: Chips de duración y buffer en ProAvailability

**Files:**
- Modify: `src/pages/pro/ProAvailability.tsx`

**Interfaces:**
- Consumes: `DURATION_OPTIONS`, `BUFFER_OPTIONS` de `src/store/availabilityStore.ts`
- Consumes: `WorkingSchedule.serviceDurationMin`, `WorkingSchedule.bufferMin`
- Produce: `ProAvailability` con selección de duración, buffer, y vista previa reactiva

- [ ] **Step 1: Agregar imports y estado local**

En `src/pages/pro/ProAvailability.tsx`, agregar al import del store:

```ts
import { useAvailabilityStore, type DayOfWeek, DURATION_OPTIONS, BUFFER_OPTIONS } from '../../store/availabilityStore'
```

Agregar estado local después de los estados existentes (`localDays`, `fromHour`, `toHour`, `scheduleSaved`):

```ts
const [localDuration, setLocalDuration] = useState<number>(
  schedule?.serviceDurationMin ?? 60
)
const [localBuffer, setLocalBuffer] = useState<number>(
  schedule?.bufferMin ?? 0
)
const [showBuffer, setShowBuffer] = useState<boolean>(
  (schedule?.bufferMin ?? 0) > 0
)
```

- [ ] **Step 2: Actualizar la función de guardar**

Reemplazar la llamada a `setSchedule` en la función de guardar (actualmente en línea ~85):

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

- [ ] **Step 3: Agregar bloque de duración del servicio en el JSX**

Después del bloque de selección de hora fin (`<select value={toHour}...`), agregar dentro de la card de horario:

```tsx
{/* Duración del servicio */}
<div style={{ marginTop: 16 }}>
  <p style={SECTION_LABEL}>Duración del servicio</p>
  <div className="flex flex-wrap gap-2">
    {DURATION_OPTIONS.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => { setLocalDuration(opt.value); setScheduleSaved(false) }}
        className="font-bold transition-all active:scale-95"
        style={{
          padding: '7px 14px',
          borderRadius: 10,
          fontSize: 'var(--text-sm)',
          background: localDuration === opt.value ? '#0F6E56' : '#F5F0E8',
          color:      localDuration === opt.value ? '#FFFFFF'  : '#555555',
          border: '1.5px solid',
          borderColor: localDuration === opt.value ? '#0F6E56' : '#E8E0D4',
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
</div>

{/* Pausa entre servicios */}
<div style={{ marginTop: 16 }}>
  <p style={SECTION_LABEL}>Pausa entre servicios</p>
  {!showBuffer ? (
    <button
      type="button"
      onClick={() => setShowBuffer(true)}
      className="font-bold"
      style={{
        fontSize: 'var(--text-sm)',
        color: '#0F6E56',
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      + Agregar pausa entre servicios
    </button>
  ) : (
    <div className="flex flex-wrap gap-2">
      {BUFFER_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => {
            setLocalBuffer(opt.value)
            setScheduleSaved(false)
            if (opt.value === 0) setShowBuffer(false)
          }}
          className="font-bold transition-all active:scale-95"
          style={{
            padding: '7px 14px',
            borderRadius: 10,
            fontSize: 'var(--text-sm)',
            background: localBuffer === opt.value ? '#E8683A' : '#F5F0E8',
            color:      localBuffer === opt.value ? '#FFFFFF'  : '#555555',
            border: '1.5px solid',
            borderColor: localBuffer === opt.value ? '#E8683A' : '#E8E0D4',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )}
</div>
```

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 5: Verificar visualmente**

```bash
npm run dev
```

Navegar a `/pro/disponibilidad` (logueado como pro). Verificar:
1. Aparecen los chips de duración: 30 min, 45 min, 60 min (seleccionado), 90 min, 2 horas
2. Aparece el botón "+ Agregar pausa entre servicios"
3. Al hacer click en la pausa, aparecen los chips de buffer
4. Al seleccionar "Sin pausa", el bloque se colapsa
5. Al cambiar duración, la vista previa (TimeSlotGrid) se actualiza en tiempo real
6. Al guardar, los nuevos valores se persisten en el store

- [ ] **Step 6: Commit**

```bash
git add src/pages/pro/ProAvailability.tsx
git commit -m "feat: chips de duración y buffer en ProAvailability"
```

---

## Task 3: requestStore — toTime dinámico desde serviceDurationMin

**Files:**
- Modify: `src/store/requestStore.ts`

**Interfaces:**
- Consumes: `useAvailabilityStore.getState().schedules` para leer `serviceDurationMin`
- Produce: `addBooking` llamado con `toTime = fromTime + serviceDurationMin` (en vez de `+60` hardcodeado)

- [ ] **Step 1: Actualizar el cálculo de `toTime` en `requestStore`**

En `src/store/requestStore.ts`, localizar el bloque que calcula `toMin` (actualmente `hh * 60 + mm + 60`):

```ts
// Antes (línea ~58):
const toMin = hh * 60 + mm + 60       // +60 min de duración

// Reemplazar con:
const schedules = useAvailabilityStore.getState().schedules
const proSchedule = schedules[req.professional_id]
const durationMin = proSchedule?.serviceDurationMin ?? proSchedule?.intervalMin ?? 60
const toMin = hh * 60 + mm + durationMin
```

El bloque completo queda así:

```ts
if (req.scheduled_date) {
  const parts = req.scheduled_date.split('T')
  const dateStr = parts[0]
  const timeStr = parts[1]
  if (timeStr) {
    const fromTime = timeStr.slice(0, 5)
    const [hh, mm] = fromTime.split(':').map(Number)
    const schedules = useAvailabilityStore.getState().schedules
    const proSchedule = schedules[req.professional_id]
    const durationMin = proSchedule?.serviceDurationMin ?? proSchedule?.intervalMin ?? 60
    const toMin = hh * 60 + mm + durationMin
    const toTime = `${Math.floor(toMin / 60).toString().padStart(2, '0')}:${(toMin % 60).toString().padStart(2, '0')}`
    useAvailabilityStore.getState().addBooking({
      proId: req.professional_id,
      requestId: newReq.id,
      date: dateStr,
      fromTime,
      toTime,
    })
  }
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 3: Verificar que el import de availabilityStore existe**

Buscar si `requestStore.ts` ya importa `useAvailabilityStore`:

```bash
grep "useAvailabilityStore" src/store/requestStore.ts
```

Si no existe, agregar al inicio del archivo:
```ts
import { useAvailabilityStore } from './availabilityStore'
```

- [ ] **Step 4: Commit**

```bash
git add src/store/requestStore.ts
git commit -m "feat: toTime calculado dinámicamente desde serviceDurationMin del profesional"
```

---

## Task 4: Label de duración estimada en ProfessionalProfile

**Files:**
- Modify: `src/components/professionals/ProfessionalProfile.tsx`

**Interfaces:**
- Consumes: `useAvailabilityStore` — `schedules` para leer `serviceDurationMin` del pro
- Produce: label "⏱ Duración estimada: X" visible para el cliente en el perfil del pro

- [ ] **Step 1: Agregar helper de formateo de duración**

En `src/components/professionals/ProfessionalProfile.tsx`, agregar función antes del componente:

```ts
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return h === 1 ? '1 hora' : `${h} horas`
  return `${h} hora ${m} min`
}
```

- [ ] **Step 2: Leer la duración del store**

En el cuerpo del componente `ProfessionalProfile`, después de la línea que lee `getSlots`:

```ts
const getSlots  = useAvailabilityStore((s) => s.getSlots)
const schedules = useAvailabilityStore((s) => s.schedules)
const proSchedule = schedules[id]
const estimatedDuration = proSchedule?.serviceDurationMin ?? proSchedule?.intervalMin ?? null
```

- [ ] **Step 3: Agregar el label en el JSX**

Localizar en el JSX la sección de datos del profesional (zona, rating, etc.) y agregar el label de duración. Buscar el elemento que muestra la zona o el rating y agregar debajo:

```tsx
{estimatedDuration !== null && (
  <div
    className="flex items-center gap-1 font-bold"
    style={{ fontSize: 'var(--text-sm)', color: '#555555' }}
  >
    <span>⏱</span>
    <span>Duración estimada: {formatDuration(estimatedDuration)}</span>
  </div>
)}
```

Colocar este bloque en la sección de info del profesional, junto a la zona y trabajos realizados. Si la sección tiene varios elementos en fila con `gap`, agregarlo como elemento adicional en esa misma fila o como una nueva fila debajo.

- [ ] **Step 4: Verificar TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Esperado: sin errores.

- [ ] **Step 5: Verificar visualmente**

```bash
npm run dev
```

Navegar al perfil de cualquier profesional. Verificar:
1. Aparece "⏱ Duración estimada: 30 min" (valor del `intervalMin` fallback)
2. Luego ir a `/pro/disponibilidad`, configurar duración en 90 min y guardar
3. Volver al perfil del mismo pro — debe mostrar "⏱ Duración estimada: 1 hora 30 min"

- [ ] **Step 6: Commit**

```bash
git add src/components/professionals/ProfessionalProfile.tsx
git commit -m "feat: duración estimada del servicio visible en perfil del profesional"
```

---

## Task 5: Migración SQL de availability_settings

**Files:**
- Create: `supabase/migrations/20260625_availability_settings.sql`

**Interfaces:**
- Produce: tabla `availability_settings` lista para conectar en fase posterior

- [ ] **Step 1: Crear el archivo de migración**

Crear `supabase/migrations/20260625_availability_settings.sql`:

```sql
-- Tabla de configuración de disponibilidad por profesional
-- Fase 2: conectar con officialServiceStore y availabilityStore cuando Supabase esté activo

CREATE TABLE IF NOT EXISTS availability_settings (
  professional_id       uuid PRIMARY KEY REFERENCES professionals(id) ON DELETE CASCADE,
  work_start_time       time    NOT NULL DEFAULT '08:00',
  work_end_time         time    NOT NULL DEFAULT '18:00',
  service_duration_min  integer NOT NULL DEFAULT 60 CHECK (service_duration_min > 0),
  buffer_min            integer NOT NULL DEFAULT 0  CHECK (buffer_min >= 0),
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER availability_settings_updated_at
  BEFORE UPDATE ON availability_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: solo el propio profesional puede leer/escribir su configuración
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pro puede ver su config" ON availability_settings
  FOR SELECT USING (
    professional_id = (SELECT id FROM professionals WHERE user_id = auth.uid())
  );

CREATE POLICY "Pro puede upsert su config" ON availability_settings
  FOR ALL USING (
    professional_id = (SELECT id FROM professionals WHERE user_id = auth.uid())
  );

-- Lectura pública de duración (para mostrar en perfil del cliente)
CREATE POLICY "Clientes pueden ver duración" ON availability_settings
  FOR SELECT USING (true);
```

- [ ] **Step 2: Verificar que el archivo existe**

```bash
cat supabase/migrations/20260625_availability_settings.sql | head -5
```

Esperado: muestra el comentario inicial.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260625_availability_settings.sql
git commit -m "feat: migración SQL availability_settings para fase 2 de Supabase"
```

---

## Self-Review

**Spec coverage:**
- ✅ `WorkingSchedule` extendido con `serviceDurationMin?` y `bufferMin?` (Task 1)
- ✅ Retrocompatibilidad con `intervalMin` como fallback (Task 1)
- ✅ Generación dinámica de slots: paso = duración + buffer (Task 1)
- ✅ Slots de buffer visibles como `blocked` (Task 1)
- ✅ Corte correcto: solo genera slot si cabe completo (`cursor + efectiveDuration <= toMin`) (Task 1)
- ✅ `DURATION_OPTIONS` con 5 opciones rápidas (Task 1)
- ✅ `BUFFER_OPTIONS` con 5 opciones (Task 1)
- ✅ Chips de duración en `ProAvailability` (Task 2)
- ✅ Chips de buffer colapsado/expandido (Task 2)
- ✅ Vista previa reactiva en tiempo real (Task 2 — el store es reactivo)
- ✅ `setSchedule` actualizado con `serviceDurationMin` y `bufferMin` (Task 2)
- ✅ `toTime` dinámico al confirmar reserva (Task 3)
- ✅ Label "⏱ Duración estimada" en perfil del pro (Task 4)
- ✅ Migración SQL `availability_settings` (Task 5)

**Type consistency:**
- `WorkingSchedule.serviceDurationMin` definido en Task 1, consumido en Tasks 2, 3, 4 ✅
- `WorkingSchedule.bufferMin` definido en Task 1, consumido en Task 2 ✅
- `DURATION_OPTIONS` y `BUFFER_OPTIONS` exportados en Task 1, importados en Task 2 ✅
- `useAvailabilityStore.getState().schedules` en Task 3 — patrón ya usado en el codebase ✅
