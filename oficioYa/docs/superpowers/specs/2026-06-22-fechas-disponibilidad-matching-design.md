# Diseño: Sistema de Fechas, Disponibilidad y Matching

**Fecha:** 2026-06-22  
**Estado:** Aprobado  

---

## Objetivo

Reducir la fricción durante la creación de solicitudes y aumentar la cantidad de profesionales compatibles que reciben cada trabajo. El cliente solo elige una fecha deseada y un nivel de flexibilidad. La lógica de matching es manejada por la aplicación.

Las urgencias se gestionan exclusivamente desde la sección de Urgencias existente. No se agrega "Lo antes posible" al flujo normal.

---

## Arquitectura

El cambio afecta 4 áreas aisladas entre sí. No se modifica: `ProAvailability.tsx`, `availabilityStore`, `RequestForm`, chat, presupuestos, urgencias, `Step7Availability`.

### 1. `types/ticket.ts`

Extiende `TicketInput` con dos campos nuevos:

```ts
export type DateFlexibility = 'exact' | '1day' | '2days' | 'flexible'

export interface TicketInput {
  category: string
  photo: File | null
  text: string
  zone: string
  desired_date: string        // ISO date string 'YYYY-MM-DD'
  date_flexibility: DateFlexibility
}
```

`GeneratedTicket` no cambia.

### 2. `TicketFlow.tsx`

Se agrega un paso 3 dedicado (`DateStep`) entre `MediaStep` y `handleAnalyze`. Los pasos se renumeran:

```
1. Categoría
2. Descripción (foto + texto + zona)
3. Fecha ← NUEVO
4. IA procesando (automático)
5. Resultados
```

El estado del orquestador suma:
```ts
const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
```

`TicketInput` inicial incluye `desired_date: ''` y `date_flexibility: 'exact'`.

### 3. `lib/scoring.ts`

Nueva función exportada:

```ts
export function getNextAvailableDate(
  pro: ProfessionalWithProfile,
  desiredDate: string,
  flexibility: DateFlexibility,
  store: AvailabilityStore
): string | null
```

**Lógica:**
1. Calcula el rango de fechas según flexibilidad:
   - `exact` → solo `desiredDate`
   - `1day` → `desiredDate - 1` a `desiredDate + 1`
   - `2days` → `desiredDate - 2` a `desiredDate + 2`
   - `flexible` → próximos 28 días desde `desiredDate`
2. Para cada fecha del rango (en orden cronológico):
   - Verifica que el día de la semana esté en `schedule.days` del pro
   - Verifica que no haya vacation cubriendo esa fecha
   - Verifica que no haya blocked slot para esa fecha completa
3. Retorna la primera fecha disponible encontrada, o `null`.

**Bonus de score** agregado en `scoreProfessional`:

| Resultado | Puntos |
|-----------|--------|
| `nextDate` === `desiredDate` exacto | +20 |
| `nextDate` dentro de ±1 día | +15 |
| `nextDate` dentro de ±2 días | +10 |
| `nextDate` en rango flexible | +5 |
| `nextDate` === `null` | -50 |

### 4. `ResultsStep` (dentro de `TicketFlow.tsx`)

Cada card de profesional muestra la próxima fecha disponible:
- Si `nextDate` existe: `"📅 Disponible desde el 17 jul"`
- Si `nextDate` es `null`: `"📅 Consultar disponibilidad"` con card visualmente atenuada (opacity 0.6)

---

## UI del DateStep (Paso 3)

### Layout

```
┌─────────────────────────────────┐
│  ← Describí el problema   3/5   │  header sticky
├─────────────────────────────────┤
│                                 │
│  📅 ¿Para cuándo lo necesitás?  │  título h2 font-black
│  Elegí una fecha aproximada     │  subtítulo gris
│                                 │
│  ┌─────────────────────────┐    │
│  │  < Julio 2026   >       │    │  mes + nav flechas
│  │  Lu Ma Mi Ju Vi Sá Do   │    │
│  │   1  2  3  4  5  6  7   │    │  calendario mensual
│  │   8  9 10 11 12 13 14   │    │  seleccionado = círculo naranja
│  │  15 16 17 18 19 20 21   │    │  días pasados = gris/disabled
│  │  22 23 24 25 26 27 28   │    │
│  │  29 30 31               │    │
│  └─────────────────────────┘    │
│                                 │
│  Nivel de flexibilidad          │  label
│  ┌──────────┐ ┌──────────┐      │
│  │  Exacta  │ │  ± 1 día │      │  grid 2x2
│  └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐      │
│  │ ± 2 días │ │ Flexible │      │
│  └──────────┘ └──────────┘      │
│                                 │
│  [  Buscar profesionales →   ]  │  CTA naranja
└─────────────────────────────────┘
```

### Comportamiento

- Días anteriores a hoy: gris, no tocables
- Al tocar una fecha: chip "Exacta" se selecciona automáticamente por defecto
- Chips de flexibilidad muestran el rango resultante como subtexto:
  - Exacta → "Solo el 15 jul"
  - ± 1 día → "14 – 16 jul"
  - ± 2 días → "13 – 17 jul"
  - Flexible → "Mayor disponibilidad"
- CTA habilitado solo cuando hay fecha seleccionada
- Transiciones: slide-forward/back igual que el resto del wizard

### Estética

Sigue el sistema de diseño existente:
- Naranja primario: `#E8683A`
- Fondo tarjetas: `#FFFFFF` con border `#E8E0D4`
- Fondo página: `#F9F6F2`
- Tipografía: `font-black` para títulos, `font-bold` para labels
- Bordes redondeados: `rounded-2xl` para contenedores, `rounded-xl` para chips
- Animaciones: `framer-motion` con spring suave

---

## Flujo completo del cliente

1. Describe el trabajo (foto + texto)
2. Selecciona zona (opcional)
3. **Selecciona fecha deseada** ← nuevo
4. **Elige nivel de flexibilidad** ← nuevo
5. IA analiza y genera ticket
6. Ve profesionales con próxima fecha disponible
7. Elige profesional → confirma → chat

---

## Compatibilidad

- La disponibilidad del pro viene de `availabilityStore` (ya configurada en `ProAvailability`)
- Si un pro no tiene schedule configurado, `getNextAvailableDate` retorna `null`
- El bonus de fecha es aditivo al score existente; no rompe el ranking para pros sin datos de disponibilidad
- `desired_date` y `date_flexibility` se pasan a `TicketConfirm` vía `navigate` state para referencia futura
