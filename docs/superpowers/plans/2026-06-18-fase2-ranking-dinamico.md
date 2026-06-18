# Fase 2 IA — Ranking dinámico de profesionales Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el sort simple de `ResultsStep` por un score ponderado (disponibilidad, zona, rating, trabajos, verificación, tiempo de respuesta), y capturar la zona del cliente en el paso 2 del wizard.

**Architecture:** 3 tareas en orden: (1) agregar `zone` a `TicketInput`, (2) crear `src/lib/scoring.ts` con la función pura de scoring, (3) actualizar `MediaStep` con el selector de zona y `ResultsStep` con el nuevo sort.

**Tech Stack:** React 18 + TypeScript + Framer Motion.

## Global Constraints

- No agregar dependencias npm nuevas
- Solo `src/types/ticket.ts`, `src/lib/scoring.ts`, `src/pages/TicketFlow.tsx` son tocados
- La zona en `TicketInput` es `string` — vacío `''` si no seleccionó
- Zona NO bloquea el botón "Analizar con IA" — `hasContent` no cambia
- Zonas disponibles exactas (en este orden): `'Pocitos', 'Punta Carretas', 'Carrasco', 'Malvín', 'Buceo', 'Centro', 'Cordón', 'La Blanqueada', 'Parque Batlle'`
- Pesos del score: `available_now` = 40, zona match = 25, rating = 20 (normalizado sobre 5), jobs = 10 (cap en 100), verified = 5, response_time > 30min = −5
- Chip seleccionado: background `#E8683A`, texto blanco. No seleccionado: background `#FFFFFF`, borde `#EDE8DE`
- El flujo dirigido (con `lockedPro`) no muestra `ResultsStep` — no se ve afectado

---

### Task 1: Agregar `zone` a `TicketInput`

**Files:**
- Modify: `oficioYa/src/types/ticket.ts`
- Modify: `oficioYa/src/pages/TicketFlow.tsx` (solo el estado inicial)

**Interfaces:**
- Consumes: nada de otras tareas
- Produces: `TicketInput.zone: string` — consumido por Tasks 2 y 3

- [ ] **Step 1: Agregar `zone` a `TicketInput` en `src/types/ticket.ts`**

Reemplazar el archivo completo por:

```ts
// src/types/ticket.ts
import type { WorkType } from '../store/requestStore'

export interface TicketInput {
  category: string
  photo: File | null
  text: string
  zone: string
}

export interface GeneratedTicket {
  title: string
  description: string
  category: string
  urgent: boolean
  work_type: WorkType
}
```

- [ ] **Step 2: Actualizar el estado inicial de `input` en el orquestador de `TicketFlow.tsx`**

Buscar en `export default function TicketFlow()`:

```ts
const [input, setInput] = useState<TicketInput>({ category: '', photo: null, text: '' })
```

Cambiar a:

```ts
const [input, setInput] = useState<TicketInput>({ category: '', photo: null, text: '', zone: '' })
```

- [ ] **Step 3: Verificar en dev server (http://localhost:5177)**

Navegar a `http://localhost:5177/ticket`. Confirmar que no hay errores de TypeScript en consola. El flujo funciona igual que antes.

- [ ] **Step 4: Commit**

```bash
git add oficioYa/src/types/ticket.ts oficioYa/src/pages/TicketFlow.tsx
git commit -m "feat: agregar campo zone a TicketInput"
```

---

### Task 2: Crear `src/lib/scoring.ts`

**Files:**
- Create: `oficioYa/src/lib/scoring.ts`

**Interfaces:**
- Consumes: `ProfessionalWithProfile` de `../hooks/useProfessionals`
- Produces: `scoreProfessional(pro: ProfessionalWithProfile, clientZone: string): number` — consumido por Task 3

- [ ] **Step 1: Crear `src/lib/scoring.ts` con el contenido exacto**

```ts
import type { ProfessionalWithProfile } from '../hooks/useProfessionals'

export function scoreProfessional(pro: ProfessionalWithProfile, clientZone: string): number {
  let score = 0
  if (pro.available_now) score += 40
  if (clientZone && pro.zone === clientZone) score += 25
  score += ((pro.avg_rating ?? 0) / 5) * 20
  score += Math.min(pro.jobs_count / 100, 1) * 10
  if (pro.verified) score += 5
  if (pro.response_time_min > 30) score -= 5
  return score
}
```

- [ ] **Step 2: Verificar el score con los datos del mock**

Abrir devtools en `http://localhost:5177` y ejecutar en consola (solo para verificar lógica mentalmente):

Con Carlos Méndez (electricista): `available_now: true, zone: 'Pocitos', avg_rating: 4.8, jobs_count: 127, verified: true, response_time_min: 15`
- available: 40
- zona match si clientZone = 'Pocitos': 25
- rating: (4.8/5)×20 = 19.2
- jobs: min(127/100, 1)×10 = 10
- verified: 5
- response: 0 (15 < 30)
- **Total con Pocitos: 99.2** — correcto

- [ ] **Step 3: Commit**

```bash
git add oficioYa/src/lib/scoring.ts
git commit -m "feat: función scoreProfessional para ranking dinámico"
```

---

### Task 3: Selector de zona en `MediaStep` y nuevo sort en `ResultsStep`

**Files:**
- Modify: `oficioYa/src/pages/TicketFlow.tsx`

**Interfaces:**
- Consumes:
  - `TicketInput.zone: string` de Task 1
  - `scoreProfessional` de Task 2: `import { scoreProfessional } from '../lib/scoring'`
- Produces: UI con selector de zona, `ResultsStep` con ranking dinámico

- [ ] **Step 1: Agregar import de `scoreProfessional` en `TicketFlow.tsx`**

Al inicio del archivo, en los imports, agregar:

```ts
import { scoreProfessional } from '../lib/scoring'
```

- [ ] **Step 2: Agregar selector de zona dentro de `MediaStep`**

En el return de `MediaStep`, ENTRE el bloque del textarea de texto (`{showText && (...)}`) y el botón "Analizar con IA", insertar:

```tsx
{/* Zona del cliente */}
<div className="flex flex-col gap-2">
  <div>
    <p className="text-sm font-bold" style={{ color: '#111111' }}>
      ¿En qué barrio necesitás el servicio?
    </p>
    <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>
      Opcional — te mostramos profesionales más cerca
    </p>
  </div>
  <div className="grid grid-cols-3 gap-2">
    {['Pocitos', 'Punta Carretas', 'Carrasco', 'Malvín', 'Buceo', 'Centro', 'Cordón', 'La Blanqueada', 'Parque Batlle'].map((zone) => {
      const active = input.zone === zone
      return (
        <motion.button
          key={zone}
          type="button"
          onClick={() => onChange({ zone: active ? '' : zone })}
          whileTap={{ scale: 0.95 }}
          className="rounded-xl py-2 px-1 text-center text-[11px] font-bold leading-tight"
          style={{
            background: active ? '#E8683A' : '#FFFFFF',
            border: `1.5px solid ${active ? '#E8683A' : '#EDE8DE'}`,
            color: active ? '#FFFFFF' : '#555555',
          }}
        >
          {zone}
        </motion.button>
      )
    })}
  </div>
</div>
```

**Nota:** El click en un chip ya seleccionado lo deselecciona (vuelve a `zone: ''`). Esto es intencional — el campo es opcional.

- [ ] **Step 3: Actualizar la firma de `ResultsStep` para recibir `clientZone`**

Cambiar la firma de:

```ts
function ResultsStep({
  ticket,
  category,
  preselectedProId,
  onPedir,
}: {
  ticket: GeneratedTicket
  category: string
  preselectedProId: string | null
  onPedir: (pro: ProfessionalWithProfile) => void
})
```

A:

```ts
function ResultsStep({
  ticket,
  category,
  preselectedProId,
  clientZone,
  onPedir,
}: {
  ticket: GeneratedTicket
  category: string
  preselectedProId: string | null
  clientZone: string
  onPedir: (pro: ProfessionalWithProfile) => void
})
```

- [ ] **Step 4: Reemplazar el sort dentro de `ResultsStep`**

Reemplazar:

```ts
const sorted = [...professionals].sort((a, b) => {
  if (a.id === preselectedProId) return -1
  if (b.id === preselectedProId) return 1
  if (a.available_now !== b.available_now) return a.available_now ? -1 : 1
  return (b.avg_rating ?? 0) - (a.avg_rating ?? 0)
})
```

Por:

```ts
const sorted = [...professionals]
  .map((p) => ({ pro: p, score: scoreProfessional(p, clientZone) }))
  .sort((a, b) => b.score - a.score)
  .map(({ pro }) => pro)
```

- [ ] **Step 5: Pasar `clientZone` al `<ResultsStep>` en el render del orquestador**

Encontrar:

```tsx
<ResultsStep
  ticket={ticket}
  category={category ?? ''}
  preselectedProId={preselectedProId}
  onPedir={handlePedir}
/>
```

Cambiar a:

```tsx
<ResultsStep
  ticket={ticket}
  category={category ?? ''}
  preselectedProId={preselectedProId}
  clientZone={input.zone}
  onPedir={handlePedir}
/>
```

- [ ] **Step 6: Verificar en dev server — sin zona**

Navegar a `http://localhost:5177/ticket`. Seleccionar categoría "Electricidad", escribir texto, analizar. En paso 4:
- Los profesionales aparecen ordenados por score (disponible primero, luego por rating/trabajos)
- No hay errores en consola

- [ ] **Step 7: Verificar en dev server — con zona Pocitos**

Repetir el flujo seleccionando zona "Pocitos". En paso 4:
- Carlos Méndez (Pocitos, available, 4.8★) debe aparecer primero
- Confirmar visualmente que el orden cambia respecto al flujo sin zona

- [ ] **Step 8: Commit**

```bash
git add oficioYa/src/pages/TicketFlow.tsx
git commit -m "feat: selector de zona en MediaStep y ranking dinámico en ResultsStep"
```
