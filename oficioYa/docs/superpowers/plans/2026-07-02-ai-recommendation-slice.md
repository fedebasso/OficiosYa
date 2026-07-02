# IA — Camino de recomendación (slice 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Camino IA que detecta el oficio del texto libre (con desambiguación si es vago) y recomienda profesionales por especialización + geo + rating + trabajos, mostrando el "por qué", todo premium.

**Architecture:** Nuevo `inferCategory.ts` (clasificador por keywords). `scoring.ts` reescrito con especialización + desglose. `TicketFlow.tsx` reordenado a "describir primero" + paso de desambiguación + resultados transparentes, con emojis→lucide.

**Tech Stack:** React + TypeScript + framer-motion + lucide-react

## Global Constraints

- Lenguaje visual premium: base crema `#F5F0E8`, sombra `0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)`, borde `1px solid #ECE6DC`, chips `#FAF6F0`/`#ECE4D8`, naranja `#D4571F`/`#E8683A`, estrella `#F5A623`
- Íconos lucide (nada de emojis); categorías con `getCategoryIcon` + `createElement`
- No cambiar la lógica de creación de solicitud ni `analyzeTicket`
- `scoreProfessional` mantiene firma retornando `number` (param `ticketCategory` opcional)
- Correr `npm run lint` y `npm run build` antes del push

---

### Task 1: Clasificador de oficio `inferCategory`

**Files:**
- Create: `src/lib/inferCategory.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface CategoryGuess { category: string | null; confidence: 'high' | 'low'; alternatives: string[] }
  export function inferCategory(text: string): CategoryGuess
  export const CATEGORY_KEYWORDS: Record<string, string[]>
  ```

- [ ] **Step 1: Crear `src/lib/inferCategory.ts`**

```ts
// Clasificador liviano por palabras clave (modo demo). Cuando se conecte Supabase,
// el LLM de la edge function `analyze-ticket` reemplaza/enriquece esta detección.

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  electricista:       ['electri', 'luz', 'luces', 'tomacorriente', 'enchufe', 'tablero', 'corto', 'cortocircuito', 'foco', 'lampara', 'cable'],
  plomero:            ['plom', 'sanit', 'caño', 'agua', 'perdida', 'pérdida', 'filtracion', 'filtración', 'canilla', 'llave de agua', 'destape', 'inodoro', 'baño', 'humedad'],
  aire_acondicionado: ['aire', 'ac', 'split', 'frio', 'frío', 'calor', 'refriger', 'no enfria', 'no enfría', 'aire acondicionado'],
  cerrajero:          ['cerraj', 'llave', 'cerradura', 'porton', 'portón', 'traba', 'trabo', 'no abre', 'candado'],
  albanil:            ['alba', 'pared', 'fisura', 'grieta', 'mampost', 'cemento', 'revoque', 'pozo', 'pisos', 'ladrillo'],
  pintor:             ['pint', 'pintar', 'color', 'pared descascar', 'barniz', 'esmalte'],
}

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export interface CategoryGuess {
  category: string | null
  confidence: 'high' | 'low'
  alternatives: string[]
}

const DEFAULT_ALTS = ['electricista', 'plomero', 'aire_acondicionado', 'cerrajero', 'pintor', 'albanil']

export function inferCategory(text: string): CategoryGuess {
  const t = normalize(text)
  const scored = Object.entries(CATEGORY_KEYWORDS)
    .map(([id, kws]) => ({ id, hits: kws.reduce((n, k) => (t.includes(normalize(k)) ? n + 1 : n), 0) }))
    .filter((c) => c.hits > 0)
    .sort((a, b) => b.hits - a.hits)

  if (scored.length === 0) {
    return { category: null, confidence: 'low', alternatives: DEFAULT_ALTS.slice(0, 3) }
  }

  const top = scored[0]
  const second = scored[1]
  const clear = !second || top.hits >= second.hits + 2 || (scored.length === 1)
  const confidence: 'high' | 'low' = clear && top.hits >= 1 ? 'high' : 'low'
  const alternatives = scored.slice(0, 3).map((c) => c.id)

  return { category: top.id, confidence, alternatives: alternatives.length ? alternatives : DEFAULT_ALTS.slice(0, 3) }
}
```

- [ ] **Step 2: Verificar TypeScript**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/inferCategory.ts
git commit -m "feat: add inferCategory keyword classifier for AI ticket flow"
```

---

### Task 2: Scoring con especialización + desglose

**Files:**
- Modify (reescritura completa): `src/lib/scoring.ts`

**Interfaces:**
- Consumes: `ProfessionalWithProfile` de `../hooks/useProfessionals`, `isInRadius` de `./barrio-coords`
- Produces:
  ```ts
  export interface ScoreBreakdown { total: number; specialist: boolean; sameZone: boolean; rating: number | null; jobs: number }
  export function scoreProfessional(pro, clientZone, ticketCategory?): number
  export function scoreBreakdown(pro, clientZone, ticketCategory): ScoreBreakdown
  ```

- [ ] **Step 1: Reemplazar el contenido completo de `src/lib/scoring.ts`**

```ts
import type { ProfessionalWithProfile } from '../hooks/useProfessionals'
import { isInRadius } from './barrio-coords'

export interface ScoreBreakdown {
  total: number
  specialist: boolean
  sameZone: boolean
  rating: number | null
  jobs: number
}

function specializationPoints(pro: ProfessionalWithProfile, ticketCategory?: string): { pts: number; specialist: boolean } {
  if (!ticketCategory) return { pts: 0, specialist: false }
  if (pro.categories[0] === ticketCategory) return { pts: 35, specialist: true }
  if (pro.categories.includes(ticketCategory)) return { pts: 15, specialist: false }
  return { pts: -100, specialist: false }
}

function geoPoints(pro: ProfessionalWithProfile, clientZone: string): { pts: number; sameZone: boolean } {
  if (clientZone && pro.zone === clientZone) return { pts: 25, sameZone: true }
  if (clientZone && isInRadius(pro.zone, clientZone, pro.radius_km ?? undefined)) return { pts: 12, sameZone: false }
  return { pts: 0, sameZone: false }
}

export function scoreProfessional(
  pro: ProfessionalWithProfile,
  clientZone: string,
  ticketCategory?: string,
): number {
  let score = 0
  score += specializationPoints(pro, ticketCategory).pts
  score += geoPoints(pro, clientZone).pts
  if (pro.available_now) score += 40
  score += ((pro.avg_rating ?? 0) / 5) * 20
  score += Math.min(pro.jobs_count / 100, 1) * 10
  if (pro.verified) score += 5
  if (pro.response_time_min > 30) score -= 5
  return score
}

export function scoreBreakdown(
  pro: ProfessionalWithProfile,
  clientZone: string,
  ticketCategory: string,
): ScoreBreakdown {
  const spec = specializationPoints(pro, ticketCategory)
  const geo = geoPoints(pro, clientZone)
  return {
    total: scoreProfessional(pro, clientZone, ticketCategory),
    specialist: spec.specialist,
    sameZone: geo.sameZone,
    rating: pro.avg_rating ?? null,
    jobs: pro.jobs_count,
  }
}
```

Nota: verificar que `isInRadius(zoneA, zoneB, radiusKm?)` exista con esa firma en
`src/lib/barrio-coords.ts`. Si la firma difiere, ajustar la llamada en `geoPoints`
(leer el archivo primero).

- [ ] **Step 2: Verificar TypeScript**

Run: `npx tsc --noEmit`
Expected: sin errores. (Los llamados existentes `scoreProfessional(pro, zone)` siguen
válidos porque `ticketCategory` es opcional.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/scoring.ts
git commit -m "feat: specialization-aware scoring with breakdown"
```

---

### Task 3: TicketFlow — describir primero + desambiguación + emojis→lucide

**Files:**
- Modify: `src/pages/TicketFlow.tsx`

**Interfaces:**
- Consumes: `inferCategory` (Task 1), `getCategoryIcon` de `../lib/categories`

**IMPORTANTE:** leer `src/pages/TicketFlow.tsx` completo antes de editar (archivo grande,
~900 líneas). Los pasos actuales: 1 CategoryStep, 2 MediaStep, 3 AIProcessingStep,
4 ResultsStep, orquestados por `const [step, setStep] = useState<1|2|3|4>(1)`.

- [ ] **Step 1: Imports**

Agregar:
```tsx
import { createElement } from 'react'
import { Sparkles } from 'lucide-react'
import { getCategoryIcon } from '../lib/categories'
import { inferCategory } from '../lib/inferCategory'
```

- [ ] **Step 2: Reordenar el flujo a "describir primero" + estado de desambiguación**

En el componente orquestador:
- Cambiar el tipo de step para incluir un paso de desambiguación:
  `const [step, setStep] = useState<'describe' | 'disambig' | 'processing' | 'results'>('describe')`
  (o mantener números y agregar 0/1.5; preferir strings por claridad).
- Estado nuevo: `const [guessAlts, setGuessAlts] = useState<string[]>([])`.
- El primer paso visible pasa a ser **MediaStep** (describir). Al confirmar la
  descripción, ejecutar:
  ```tsx
  const guess = inferCategory(text)
  if (guess.confidence === 'high' && guess.category) {
    setCategory(guess.category)      // setear la categoría resuelta en el estado del ticket
    setStep('processing')
  } else {
    setGuessAlts(guess.alternatives)
    setStep('disambig')
  }
  ```
- El `CategoryStep` deja de ser el paso 1; se reutiliza como **fallback** ("ver todas las
  categorías") desde el paso de desambiguación.

- [ ] **Step 3: Nuevo paso de desambiguación `DisambiguationStep`**

Agregar este componente y renderizarlo cuando `step === 'disambig'`:
```tsx
function DisambiguationStep({
  alternatives,
  onPick,
  onSeeAll,
}: {
  alternatives: string[]
  onPick: (category: string) => void
  onSeeAll: () => void
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#D4571F' }}>
          Ayudanos a entender
        </p>
        <h2 className="text-xl font-black leading-tight" style={{ color: '#1A1712', letterSpacing: '-0.3px' }}>
          ¿Qué es lo que te pasa?
        </h2>
        <p className="text-sm mt-1" style={{ color: '#7A6E5E' }}>
          Elegí lo que más se acerca a tu problema.
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        {alternatives.map((id) => {
          const { label } = getCategoryMeta(id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => onPick(id)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl text-left active:scale-[0.99] transition-transform"
              style={{ background: '#FFFFFF', border: '1px solid #ECE6DC', boxShadow: '0 2px 6px rgba(60,40,20,.04), 0 12px 28px -12px rgba(60,40,20,.14)' }}
            >
              <span className="flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, borderRadius: 12, background: '#FAF6F0' }}>
                {createElement(getCategoryIcon(id), { size: 20, style: { color: '#D4571F' } })}
              </span>
              <span className="font-bold" style={{ color: '#1A1712', fontSize: 15 }}>{label}</span>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={onSeeAll}
        className="text-sm font-bold self-center mt-1"
        style={{ color: '#7A6E5E' }}
      >
        No estoy seguro · ver todas las categorías
      </button>
    </div>
  )
}
```
(`getCategoryMeta` ya está importado en el archivo. `onPick(id)` setea la categoría y va
a `processing`. `onSeeAll` muestra el `CategoryStep` completo como fallback.)

- [ ] **Step 4: Emojis → lucide en el resto del flujo**

- El texto "✨ Nuevo ticket" → quitar el ✨ o usar `Sparkles` (`{createElement(Sparkles,{size:12,style:{color:'#D4571F'}})}`).
- Botón "Analizar con IA ✨" → "Analizar con IA" con `<Sparkles size={16} />` (inline-flex gap).
- `CategoryStep`: la grid usa `cat.emoji` → reemplazar por `createElement(getCategoryIcon(cat.id), { size: 22, style:{color:'#D4571F'} })`.
- `AIProcessingStep`: cualquier emoji → `Sparkles`/lucide.
- Cualquier otro emoji en el archivo → lucide equivalente.

- [ ] **Step 5: Verificar TypeScript y browser**

Run: `npx tsc --noEmit` → sin errores.
Abrir el flujo (`/ticket`): describir un problema claro ("no tengo luz en el tablero")
debe saltar directo a procesando; uno vago ("algo se rompió en casa") debe mostrar la
desambiguación.

- [ ] **Step 6: Commit**

```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat: describe-first AI ticket flow with disambiguation, lucide icons"
```

---

### Task 4: Resultados transparentes (chips "por qué" + mejor opción)

**Files:**
- Modify: `src/pages/TicketFlow.tsx` (función `ResultsStep`)

**Interfaces:**
- Consumes: `scoreBreakdown` de Task 2

- [ ] **Step 1: Importar y usar `scoreBreakdown` en ResultsStep**

Agregar import:
```tsx
import { scoreProfessional, scoreBreakdown } from '../lib/scoring'
```

En `ResultsStep`, al construir la lista rankeada, pasar la categoría del ticket a
`scoreProfessional(p, clientZone, ticket.category)` y calcular el breakdown por pro:
```tsx
const ranked = professionals
  .map((p) => ({ pro: p, bd: scoreBreakdown(p, clientZone, ticket.category) }))
  .filter((r) => r.bd.total > 0)
  .sort((a, b) => b.bd.total - a.bd.total)
```

- [ ] **Step 2: Render de cada resultado con badge + chips "por qué"**

Para cada `{ pro, bd }`, por encima o debajo de la `ProfessionalCard`, agregar:
- Si es el primero: badge **"Mejor opción para vos"**:
  ```tsx
  <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: '#FEF0EA', color: '#D4571F' }}>
    <Sparkles size={11} /> Mejor opción para vos
  </span>
  ```
- Fila de chips (debajo de la card), solo los que apliquen:
  ```tsx
  <div className="flex flex-wrap gap-1.5 mt-1.5">
    {bd.specialist && (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background:'#FAF6F0', border:'1px solid #ECE4D8', color:'#7A6E5E' }}>
        {createElement(getCategoryIcon(ticket.category), { size: 12, style:{ color:'#D4571F' } })} Especialista en {getCategoryMeta(ticket.category).label}
      </span>
    )}
    {bd.sameZone && (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background:'#FAF6F0', border:'1px solid #ECE4D8', color:'#7A6E5E' }}>
        <MapPin size={12} style={{ color:'#B3A794' }} /> Cerca tuyo
      </span>
    )}
    {bd.rating != null && (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background:'#FAF6F0', border:'1px solid #ECE4D8', color:'#7A6E5E' }}>
        <Star size={12} fill="#F5A623" color="#F5A623" /> {bd.rating.toFixed(1)}
      </span>
    )}
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg" style={{ background:'#FAF6F0', border:'1px solid #ECE4D8', color:'#7A6E5E' }}>
      <Briefcase size={12} style={{ color:'#B3A794' }} /> {bd.jobs} trabajos
    </span>
  </div>
  ```
  Agregar `MapPin, Star, Briefcase` al import de `lucide-react`.

- [ ] **Step 3: Enlace "¿Preferís elegir vos?" al final de resultados**

Debajo de la lista, agregar:
```tsx
<button
  type="button"
  onClick={() => navigate('/buscar')}
  className="w-full text-center text-sm font-bold py-3 mt-1"
  style={{ color: '#7A6E5E' }}
>
  ¿Preferís elegir vos? Ver todos los profesionales
</button>
```

- [ ] **Step 4: Verificar TypeScript y browser**

Run: `npx tsc --noEmit` → sin errores.
En resultados, el primero muestra "Mejor opción para vos" y cada uno sus chips de por qué.

- [ ] **Step 5: Commit**

```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat: transparent AI results with reason chips and best-match badge"
```

---

### Task 5: Lint, build, deploy

- [ ] **Step 1: Grep de emojis restantes en el flujo**

Run: `grep -n "✨\|⚡\|🚿\|❄️\|🔑\|🎨\|🧱\|🔨\|📍" src/pages/TicketFlow.tsx`
Expected: sin resultados.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: sin errores.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `✓ built` sin errores.

- [ ] **Step 4: Push y deploy**

```bash
git push origin main
vercel --prod
```
Expected: deployment `Ready` en `https://oficios-ya-8112.vercel.app`.
