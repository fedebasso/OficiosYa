# Spec: Fase 2 IA — Ranking dinámico de profesionales

**Fecha:** 2026-06-18  
**Estado:** Aprobado

## Objetivo

Reemplazar el ordenamiento simple de `ResultsStep` (disponible → rating) por un score ponderado que considera disponibilidad, zona del cliente, rating, trabajos, verificación y tiempo de respuesta. Capturar la zona del cliente en el paso 2 del wizard.

## Archivos modificados

| Archivo | Tipo | Cambio |
|---|---|---|
| `oficioYa/src/types/ticket.ts` | Modify | Agregar `zone: string` a `TicketInput` |
| `oficioYa/src/lib/scoring.ts` | Create | Función pura `scoreProfessional` |
| `oficioYa/src/pages/TicketFlow.tsx` | Modify | Selector de zona en `MediaStep`, pasar `zone` al `ResultsStep`, usar scoring |

---

## Parte 1: `TicketInput` con `zone`

```ts
export interface TicketInput {
  category: string
  photo: File | null
  text: string
  zone: string   // barrio del cliente — string vacío si no seleccionó
}
```

Estado inicial en el orquestador: `{ category: '', photo: null, text: '', zone: '' }`

---

## Parte 2: `scoring.ts`

**Ubicación:** `src/lib/scoring.ts`

```ts
import type { ProfessionalWithProfile } from '../hooks/useProfessionals'

export function scoreProfessional(pro: ProfessionalWithProfile, clientZone: string): number {
  let score = 0
  if (pro.available_now) score += 40
  if (clientZone && pro.zone === clientZone) score += 25
  score += ((pro.avg_rating ?? 0) / 5) * 20
  score += Math.min((pro.jobs_count) / 100, 1) * 10
  if (pro.verified) score += 5
  if (pro.response_time_min > 30) score -= 5
  return score
}
```

Score máximo: 100. Mínimo posible: −5. La función es pura — sin efectos secundarios, fácil de testear y ajustar pesos.

---

## Parte 3: Selector de zona en `MediaStep`

**Zonas disponibles** (exactamente estas, en este orden):

```ts
const ZONES = [
  'Pocitos', 'Punta Carretas', 'Carrasco', 'Malvín',
  'Buceo', 'Centro', 'Cordón', 'La Blanqueada', 'Parque Batlle',
]
```

**UI:** Grid de chips de 3 columnas, estilo consistente con las categorías del paso 1. Chip seleccionado: fondo `#E8683A`, texto blanco. No seleccionado: fondo `#FFFFFF`, borde `#EDE8DE`.

**Posición:** Entre el toggle de texto y el botón "Analizar con IA".

**Label:** `¿En qué barrio necesitás el servicio?` encima de los chips. Subtext: `Opcional — te mostramos profesionales más cerca`.

**La zona NO bloquea el botón "Analizar con IA"** — `hasContent` no cambia.

---

## Parte 4: `ResultsStep` usa scoring

**Prop adicional:** `ResultsStep` recibe `clientZone: string`.

**Nuevo sort:**

```ts
const sorted = [...professionals]
  .map((p) => ({ pro: p, score: scoreProfessional(p, clientZone) }))
  .sort((a, b) => b.score - a.score)
  .map(({ pro }) => pro)
```

El `preselectedProId` (modo libre desde búsqueda sin ticket) ya no sube al primero artificialmente — el score natural lo posiciona. Eliminar las líneas:
```ts
if (a.id === preselectedProId) return -1
if (b.id === preselectedProId) return 1
```

**`clientZone`** se pasa desde el orquestador: `input.zone`.

---

## Comportamiento sin zona seleccionada

Si `clientZone === ''`, la condición `clientZone && pro.zone === clientZone` es falsa para todos → nadie recibe los 25 pts de zona → el ranking usa los otros 4 factores. Comportamiento correcto y neutro.

## Fuera de scope

- Geolocalización GPS real
- Cálculo de distancia por coordenadas
- Mostrar el score numérico al usuario (los chips de "Disponible", rating, etc. ya dan suficiente contexto)
