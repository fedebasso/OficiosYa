# Radio de cobertura del profesional — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada profesional define un radio en km; las solicitudes fuera de ese radio no le llegan y los clientes solo ven profesionales que cubren su barrio.

**Architecture:** 6 tareas en orden: (1) tipo + mock, (2) función de distancia, (3) filtro en ResultsStep del cliente, (4) filtro en ProRequests del profesional, (5) selector en ProProfile, (6) selector en ProOnboarding.

**Tech Stack:** React 18 + TypeScript + Framer Motion. Sin dependencias nuevas.

## Global Constraints

- No agregar dependencias npm nuevas
- `radius_km: number | null` — null = toda Montevideo, número = km desde su zone base
- `isInRadius(proZone, radiusKm, clientZone): boolean` — función pura en `src/lib/barrio-coords.ts`
- Sin zona de cliente → mostrar todos los profesionales (no filtrar)
- Sin coordenadas para un barrio → no filtrar (beneficio de la duda)
- `RADIO_OPTIONS`: `[{ label: '3 km', value: 3 }, { label: '5 km', value: 5 }, { label: '10 km', value: 10 }, { label: '20 km', value: 20 }, { label: 'Toda la ciudad', value: null }]`
- Chip seleccionado: fondo `#E8683A`, texto blanco. No seleccionado: fondo `#F5F0E8`, texto `#555`

---

### Task 1: Agregar `radius_km` al tipo `Professional` y al mock

**Files:**
- Modify: `oficioYa/src/hooks/useProfessionals.ts`
- Modify: `oficioYa/src/data/mockProfessionals.ts`

**Interfaces:**
- Consumes: nada de otras tareas
- Produces: `Professional.radius_km: number | null` — consumido por todas las tareas siguientes

- [ ] **Step 1: Agregar `radius_km` a la interfaz `Professional`**

En `src/hooks/useProfessionals.ts`, agregar el campo en `interface Professional`:

```ts
export interface Professional {
  id: string
  bio: string
  categories: string[]
  avg_rating: number | null
  verified: boolean
  whatsapp: string
  zone: string
  featured: boolean
  jobs_count: number
  response_time_min: number
  available_now: boolean
  radius_km: number | null   // ← agregar esta línea
}
```

- [ ] **Step 2: Agregar `radius_km` a cada profesional del mock**

En `src/data/mockProfessionals.ts`, agregar `radius_km` a cada objeto con estos valores exactos:

| id | radius_km |
|---|---|
| '1' (Carlos Méndez, Pocitos) | 8 |
| '6' (Martín Suárez, Carrasco) | 5 |
| '7' (Luis Cabrera, Cordón) | null |
| '2' (Roberto Silva, Malvín) | 6 |
| '8' (Andrés Pereira, Punta Carretas) | 10 |
| '3' (Diego Fernández, Centro) | null |
| '9' (Fabián Moreira, Buceo) | 7 |
| '4' (Ana Rodríguez, Centro) | null |
| '10' (Sergio Núñez, La Blanqueada) | 4 |
| '5' (Pablo Torres, Punta Carretas) | 12 |
| '11' (Gabriel Ríos, Parque Batlle) | null |

- [ ] **Step 3: Verificar en dev server**

Navegar a `http://localhost:5177`. Confirmar que no hay errores de TypeScript en consola.

- [ ] **Step 4: Commit**

```bash
git add oficioYa/src/hooks/useProfessionals.ts oficioYa/src/data/mockProfessionals.ts
git commit -m "feat: agregar radius_km al tipo Professional y mock data"
```

---

### Task 2: Crear `src/lib/barrio-coords.ts`

**Files:**
- Create: `oficioYa/src/lib/barrio-coords.ts`

**Interfaces:**
- Consumes: nada de otras tareas
- Produces:
  - `BARRIO_COORDS: Record<string, { lat: number; lng: number }>`
  - `distanceBetweenBarrios(b1: string, b2: string): number | null`
  - `isInRadius(proZone: string, radiusKm: number | null, clientZone: string): boolean`

- [ ] **Step 1: Crear `src/lib/barrio-coords.ts`**

```ts
export const BARRIO_COORDS: Record<string, { lat: number; lng: number }> = {
  'Pocitos':         { lat: -34.9050, lng: -56.1580 },
  'Punta Carretas':  { lat: -34.9150, lng: -56.1530 },
  'Carrasco':        { lat: -34.8850, lng: -56.0500 },
  'Malvín':          { lat: -34.8950, lng: -56.1100 },
  'Buceo':           { lat: -34.8980, lng: -56.1350 },
  'Centro':          { lat: -34.9060, lng: -56.1900 },
  'Cordón':          { lat: -34.9020, lng: -56.1780 },
  'La Blanqueada':   { lat: -34.8900, lng: -56.1700 },
  'Parque Batlle':   { lat: -34.8940, lng: -56.1620 },
  'Punta Gorda':     { lat: -34.9020, lng: -56.1100 },
  'Tres Cruces':     { lat: -34.8980, lng: -56.1810 },
  'Palermo':         { lat: -34.9050, lng: -56.1820 },
  'Barrio Sur':      { lat: -34.9120, lng: -56.1950 },
  'Ciudad Vieja':    { lat: -34.9080, lng: -56.2030 },
  'Aguada':          { lat: -34.9000, lng: -56.1920 },
  'Goes':            { lat: -34.8920, lng: -56.1840 },
  'La Teja':         { lat: -34.8870, lng: -56.2130 },
  'Cerro':           { lat: -34.8850, lng: -56.2400 },
  'Prado':           { lat: -34.8800, lng: -56.1980 },
  'Capurro':         { lat: -34.8880, lng: -56.2050 },
  'Sayago':          { lat: -34.8750, lng: -56.2200 },
  'Nuevo París':     { lat: -34.8700, lng: -56.2300 },
  'Unión':           { lat: -34.8800, lng: -56.1560 },
  'Jacinto Vera':    { lat: -34.8870, lng: -56.1660 },
  'Larrañaga':       { lat: -34.8830, lng: -56.1740 },
  'Maroñas':         { lat: -34.8750, lng: -56.1480 },
  'Flor de Maroñas': { lat: -34.8700, lng: -56.1450 },
  'Piedras Blancas': { lat: -34.8650, lng: -56.1200 },
  'Manga':           { lat: -34.8600, lng: -56.1350 },
  'Reducto':         { lat: -34.8960, lng: -56.1860 },
  'Peñarol':         { lat: -34.8600, lng: -56.2000 },
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function distanceBetweenBarrios(b1: string, b2: string): number | null {
  const c1 = BARRIO_COORDS[b1]
  const c2 = BARRIO_COORDS[b2]
  if (!c1 || !c2) return null
  const R = 6371
  const dLat = toRad(c2.lat - c1.lat)
  const dLng = toRad(c2.lng - c1.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function isInRadius(proZone: string, radiusKm: number | null, clientZone: string): boolean {
  if (!clientZone) return true
  if (radiusKm === null) return true
  const d = distanceBetweenBarrios(proZone, clientZone)
  if (d === null) return true
  return d <= radiusKm
}
```

- [ ] **Step 2: Commit**

```bash
git add oficioYa/src/lib/barrio-coords.ts
git commit -m "feat: coordenadas de barrios de Montevideo y función isInRadius"
```

---

### Task 3: Filtro por radio en `ResultsStep` + indicador en cards

**Files:**
- Modify: `oficioYa/src/pages/TicketFlow.tsx`

**Interfaces:**
- Consumes:
  - `Professional.radius_km: number | null` de Task 1
  - `isInRadius(proZone, radiusKm, clientZone): boolean` de Task 2
- Produces: lista de profesionales filtrada por radio, con indicador visual

- [ ] **Step 1: Agregar import de `isInRadius`**

Al inicio de `src/pages/TicketFlow.tsx`:
```ts
import { isInRadius } from '../lib/barrio-coords'
```

- [ ] **Step 2: Aplicar filtro por radio antes del scoring en `ResultsStep`**

Dentro de `ResultsStep`, reemplazar:

```ts
const sorted = [...professionals]
  .map((p) => ({ pro: p, score: scoreProfessional(p, clientZone) }))
  .sort((a, b) => b.score - a.score)
  .map(({ pro }) => pro)
```

Por:

```ts
const inRange = professionals.filter((p) =>
  isInRadius(p.zone, p.radius_km, clientZone)
)

const sorted = inRange
  .map((p) => ({ pro: p, score: scoreProfessional(p, clientZone) }))
  .sort((a, b) => b.score - a.score)
  .map(({ pro }) => pro)
```

- [ ] **Step 3: Agregar indicador de radio en las cards de profesional**

Dentro de `ResultsStep`, en el JSX de cada card de profesional, buscar donde se muestra la info del pro (nombre, especialidad, zona) y agregar debajo:

```tsx
<span className="text-[9px] font-bold" style={{ color: '#AAAAAA' }}>
  {pro.radius_km === null ? '🌍 Toda la ciudad' : `📍 ${pro.zone} · ${pro.radius_km} km`}
</span>
```

Para ubicarlo correctamente, leer el JSX de la card en `ResultsStep` y agregar después de la línea que muestra la zona/categoría del profesional.

- [ ] **Step 4: Verificar en dev server**

Flujo: seleccionar categoría "Electricidad", seleccionar barrio "Carrasco", analizar. En paso 4:
- Martín Suárez (Carrasco, 5km) → debe aparecer (distance Carrasco→Carrasco = 0km ≤ 5km)
- Carlos Méndez (Pocitos, 8km) → distancia Pocitos→Carrasco ≈ 10km → NO aparece
- Luis Cabrera (Cordón, null) → siempre aparece
- Cada card muestra `📍 Pocitos · 8 km` o `🌍 Toda la ciudad`

- [ ] **Step 5: Commit**

```bash
git add oficioYa/src/pages/TicketFlow.tsx
git commit -m "feat: filtro por radio en ResultsStep e indicador en cards"
```

---

### Task 4: Filtro por radio en `ProRequests`

**Files:**
- Modify: `oficioYa/src/pages/pro/ProRequests.tsx`

**Interfaces:**
- Consumes:
  - `isInRadius` de Task 2
  - `MOCK_PROFESSIONALS` de `src/data/mockProfessionals.ts` (para obtener zone + radius_km del pro logueado)
- Produces: solicitudes filtradas por radio del profesional

- [ ] **Step 1: Agregar imports en `ProRequests.tsx`**

```ts
import { isInRadius } from '../../lib/barrio-coords'
import { MOCK_PROFESSIONALS } from '../../data/mockProfessionals'
```

- [ ] **Step 2: Obtener el perfil del profesional logueado y filtrar solicitudes**

Dentro de `export default function ProRequests()`, después de obtener `user` y `requests`, agregar:

```ts
// Obtener el pro logueado del mock para acceder a zone y radius_km
const currentPro = MOCK_PROFESSIONALS.find((p) => p.profiles.id === user?.id)

// Filtrar solicitudes dentro del radio del profesional
const visibleRequests = requests.filter((req) =>
  isInRadius(
    currentPro?.zone ?? '',
    currentPro?.radius_km ?? null,
    req.location ?? ''
  )
)
```

- [ ] **Step 3: Usar `visibleRequests` en lugar de `requests`**

Reemplazar las 3 líneas que calculan `pending`, `active`, `others`:

```ts
const pending = requests.filter((r) => r.status === 'pending')
const active  = requests.filter((r) => r.status === 'confirmed' || r.status === 'in_progress')
const others  = requests.filter((r) => r.status !== 'pending' && r.status !== 'confirmed' && r.status !== 'in_progress')
```

Por:

```ts
const pending = visibleRequests.filter((r) => r.status === 'pending')
const active  = visibleRequests.filter((r) => r.status === 'confirmed' || r.status === 'in_progress')
const others  = visibleRequests.filter((r) => r.status !== 'pending' && r.status !== 'confirmed' && r.status !== 'in_progress')
```

- [ ] **Step 4: Verificar en dev server**

Navegar a `/pro/solicitudes`. En modo demo las solicitudes mock no tienen `location` por defecto → `isInRadius` devuelve `true` para todas (comportamiento correcto: sin barrio = sin filtro). El flujo no debe romperse.

- [ ] **Step 5: Commit**

```bash
git add oficioYa/src/pages/pro/ProRequests.tsx
git commit -m "feat: filtrar solicitudes por radio del profesional en ProRequests"
```

---

### Task 5: Selector de radio en `ProProfile`

**Files:**
- Modify: `oficioYa/src/pages/pro/ProProfile.tsx`

**Interfaces:**
- Consumes: nada de otras tareas (estado local)
- Produces: UI de selector de radio editable en el perfil del profesional

- [ ] **Step 1: Agregar estado `radiusKm` en `ProProfile`**

Después de `const [zone, setZone] = useState('')`:

```ts
const [radiusKm, setRadiusKm] = useState<number | null>(null)
```

- [ ] **Step 2: Definir las opciones de radio**

Después de la constante `ZONES`:

```ts
const RADIO_OPTIONS: { label: string; value: number | null }[] = [
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: 'Toda la ciudad', value: null },
]
```

- [ ] **Step 3: Agregar sección de radio en el JSX de `ProProfile`**

Agregar una nueva `<Section>` después de la sección de zona (buscar donde se muestra el selector de zona y agregar debajo):

```tsx
<motion.div variants={fadeUp}>
  <Section title="Radio de cobertura">
    <p className="text-xs mb-3" style={{ color: '#999' }}>
      ¿Hasta dónde te desplazás desde tu zona?
    </p>
    <div className="flex flex-wrap gap-2">
      {RADIO_OPTIONS.map((opt) => {
        const active = radiusKm === opt.value
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => setRadiusKm(opt.value)}
            className="rounded-xl px-3 py-2 text-xs font-bold"
            style={{
              background: active ? '#E8683A' : '#F5F0E8',
              color: active ? '#FFFFFF' : '#555555',
              border: `1.5px solid ${active ? '#E8683A' : '#EDE8DE'}`,
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  </Section>
</motion.div>
```

- [ ] **Step 4: Verificar en dev server**

Navegar a `/pro/perfil`. Confirmar que la sección "Radio de cobertura" aparece con los 5 chips. Al tocar uno se selecciona (naranja). Sin errores en consola.

- [ ] **Step 5: Commit**

```bash
git add oficioYa/src/pages/pro/ProProfile.tsx
git commit -m "feat: selector de radio de cobertura en ProProfile"
```

---

### Task 6: Selector de radio en `ProOnboarding`

**Files:**
- Modify: `oficioYa/src/pages/pro/ProOnboarding.tsx`

**Interfaces:**
- Consumes: nada de otras tareas (estado local)
- Produces: card de configuración de radio en el onboarding del profesional

- [ ] **Step 1: Agregar las constantes y estado en `ProOnboarding`**

Después de los imports:

```ts
const RADIO_OPTIONS: { label: string; value: number | null }[] = [
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
  { label: '10 km', value: 10 },
  { label: '20 km', value: 20 },
  { label: 'Toda la ciudad', value: null },
]
```

Dentro de `export default function ProOnboarding()`, agregar:

```ts
const [radiusKm, setRadiusKm] = useState<number | null>(null)
```

- [ ] **Step 2: Agregar card de radio en el JSX**

Dentro del contenido principal, después de la sección de "Pasos" (la lista de STEPS), agregar:

```tsx
{/* Radio de cobertura */}
<div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}>
  <div>
    <h3 className="font-black text-sm mb-0.5" style={{ color: '#111111' }}>
      📍 Radio de cobertura
    </h3>
    <p className="text-xs leading-relaxed" style={{ color: '#777777' }}>
      ¿Hasta dónde te desplazás para trabajar? Podés cambiarlo después desde tu perfil.
    </p>
  </div>
  <div className="flex flex-wrap gap-2">
    {RADIO_OPTIONS.map((opt) => {
      const active = radiusKm === opt.value
      return (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => setRadiusKm(opt.value)}
          className="rounded-xl px-3 py-2 text-xs font-bold"
          style={{
            background: active ? '#E8683A' : '#F5F0E8',
            color: active ? '#FFFFFF' : '#555555',
            border: `1.5px solid ${active ? '#E8683A' : '#EDE8DE'}`,
          }}
        >
          {opt.label}
        </button>
      )
    })}
  </div>
</div>
```

- [ ] **Step 3: Verificar en dev server**

Navegar a `/pro/registro`. Confirmar que aparece la card "Radio de cobertura" con los chips. Al tocar uno se selecciona en naranja.

- [ ] **Step 4: Commit**

```bash
git add oficioYa/src/pages/pro/ProOnboarding.tsx
git commit -m "feat: selector de radio de cobertura en ProOnboarding"
```
