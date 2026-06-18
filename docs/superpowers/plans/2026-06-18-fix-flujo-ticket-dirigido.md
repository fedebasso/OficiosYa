# Fix flujo ticket dirigido — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cuando el usuario llega a TicketFlow con `?pro=ID`, saltear la selección de categoría y la lista de profesionales — ir directo a descripción → IA → TicketConfirm con el profesional ya fijado.

**Architecture:** Un solo archivo modificado (`TicketFlow.tsx`). Se agrega estado `lockedPro` y un `useEffect` de carga. El header y `handleAnalyze` se bifurcan según si hay `lockedPro` o no. El flujo libre (sin `?pro`) queda intacto.

**Tech Stack:** React 18, TypeScript, Zustand, React Router v6, Framer Motion, `professionalService.getById`.

## Global Constraints

- Solo modificar `src/pages/TicketFlow.tsx`
- No crear archivos nuevos
- El flujo libre (sin `?pro`) no debe cambiar en absoluto
- Seguir el estilo visual existente: colores `#E8683A`, `#F5F0E8`, `#E8E0D4`, `#111111`, bordes `rounded-2xl`, motion con `SPRING_GENTLE`
- No agregar dependencias nuevas

---

### Task 1: Cargar profesional y activar modo dirigido

**Files:**
- Modify: `oficioYa/src/pages/TicketFlow.tsx`

**Interfaces:**
- Consumes: `professionalService.getById(id: string): Promise<ProfessionalWithProfile | null>` (ya existe en `src/services/professionalService.ts`)
- Produces: estado `lockedPro: ProfessionalWithProfile | null` usado en Tasks 2 y 3

- [ ] **Step 1: Agregar import de `professionalService`**

Al inicio del archivo, en las líneas de imports, agregar:

```ts
import { professionalService } from '../services/professionalService'
```

- [ ] **Step 2: Agregar estado `lockedPro` en el orquestador**

Dentro de `export default function TicketFlow()`, después de la línea `const timeoutIdsRef = useRef...`, agregar:

```ts
const [lockedPro, setLockedPro] = useState<ProfessionalWithProfile | null>(null)
```

- [ ] **Step 3: Agregar `useEffect` de carga del profesional**

Después del `useEffect` de cleanup existente (el que llama `clearTimeout`), agregar:

```ts
useEffect(() => {
  if (!preselectedProId) return
  professionalService.getById(preselectedProId).then((pro) => {
    if (!pro) return
    setLockedPro(pro)
    setCategory(pro.categories[0] ?? null)
    setStep(2)
  })
}, [preselectedProId])
```

- [ ] **Step 4: Verificar en dev server — modo libre sin cambios**

Navegar a `http://localhost:5177/ticket` (sin `?pro`). Confirmar que arranca en paso 1 (selector de categorías) igual que antes.

- [ ] **Step 5: Verificar en dev server — modo dirigido carga pro**

Navegar a `http://localhost:5177/ticket?pro=1`. Confirmar que salta al paso 2 directamente (no muestra categorías). Abrir devtools → React DevTools y verificar que `lockedPro` tiene los datos de Carlos Méndez (id `'1'`).

- [ ] **Step 6: Commit**

```bash
git add oficioYa/src/pages/TicketFlow.tsx
git commit -m "feat: cargar profesional y activar modo dirigido en TicketFlow"
```

---

### Task 2: Actualizar header y agregar banner del profesional en MediaStep

**Files:**
- Modify: `oficioYa/src/pages/TicketFlow.tsx`

**Interfaces:**
- Consumes: `lockedPro: ProfessionalWithProfile | null` de Task 1
- Produces: UI actualizada del header y banner visible en paso 2

- [ ] **Step 1: Actualizar el header para modo dirigido**

Reemplazar el bloque `const header = (...)` completo por:

```tsx
const header = (
  <div
    className="px-4 pt-10 pb-3 sticky top-0 z-50 flex items-center gap-3"
    style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)' }}
  >
    {/* Botón volver */}
    {step === 1 && (
      <button type="button" onClick={() => navigate(-1)}
        className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0">
        <ChevronLeft size={24} style={{ color: '#111111' }} />
      </button>
    )}
    {step === 2 && (
      <button
        type="button"
        onClick={() => {
          if (lockedPro) {
            navigate(-1)
          } else {
            setDirection('back')
            setStep(1)
          }
        }}
        className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0"
      >
        <ChevronLeft size={24} style={{ color: '#111111' }} />
      </button>
    )}
    {step === 4 && (
      <button type="button" onClick={() => { setDirection('back'); setStep(2) }}
        className="p-1 -ml-1 rounded-full active:opacity-60 transition-opacity flex-shrink-0">
        <ChevronLeft size={24} style={{ color: '#111111' }} />
      </button>
    )}

    {/* Títulos */}
    <div>
      <h1 className="text-base font-black leading-tight" style={{ color: '#111111' }}>
        {step === 1 && 'Nuevo ticket'}
        {step === 2 && (lockedPro ? `Solicitar a ${lockedPro.profiles.full_name.split(' ')[0]}` : 'Describí el problema')}
        {step === 3 && 'Analizando...'}
        {step === 4 && 'Profesionales para vos'}
      </h1>
      <p className="text-xs mt-0.5" style={{ color: '#AAAAAA' }}>
        {lockedPro && step !== 1 && step !== 4
          ? `Paso ${step === 2 ? 1 : 2} de 2 · ${CATEGORY_LABELS[lockedPro.categories[0]] ?? lockedPro.categories[0]}`
          : `Paso ${step} de 4`
        }
      </p>
    </div>
  </div>
)
```

- [ ] **Step 2: Agregar prop `lockedPro` a `MediaStep`**

Cambiar la firma de `MediaStep` de:

```ts
function MediaStep({
  input,
  onChange,
  onAnalyze,
}: {
  input: TicketInput
  onChange: (patch: Partial<TicketInput>) => void
  onAnalyze: () => void
})
```

A:

```ts
function MediaStep({
  input,
  onChange,
  onAnalyze,
  lockedPro,
}: {
  input: TicketInput
  onChange: (patch: Partial<TicketInput>) => void
  onAnalyze: () => void
  lockedPro?: ProfessionalWithProfile | null
})
```

- [ ] **Step 3: Agregar banner del profesional dentro de `MediaStep`**

Al inicio del `return` de `MediaStep`, antes del `<div>` con el título "Mostranos el problema", insertar:

```tsx
{lockedPro && (
  <div
    className="flex items-center gap-3 rounded-2xl p-3"
    style={{ background: '#FFFFFF', border: '1.5px solid #E8E0D4' }}
  >
    {lockedPro.profiles.avatar_url ? (
      <img
        src={lockedPro.profiles.avatar_url}
        alt={lockedPro.profiles.full_name}
        className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
      />
    ) : (
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#E8683A,#c44d1f)', fontSize: 18 }}
      >
        {lockedPro.profiles.full_name.charAt(0)}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="text-sm font-bold truncate" style={{ color: '#111111' }}>
        {lockedPro.profiles.full_name}
      </div>
      <div className="text-[10px]" style={{ color: '#AAAAAA' }}>
        {CATEGORY_EMOJI[lockedPro.categories[0]] ?? '🛠️'} {CATEGORY_LABELS[lockedPro.categories[0]] ?? lockedPro.categories[0]} · {lockedPro.zone}
      </div>
    </div>
    {lockedPro.avg_rating != null && (
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-xl flex-shrink-0"
        style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.2)' }}
      >
        <span style={{ color: '#f59e0b', fontSize: 11 }}>★</span>
        <span className="text-xs font-black" style={{ color: '#22c55e' }}>{lockedPro.avg_rating}</span>
      </div>
    )}
  </div>
)}
```

**Nota:** `CATEGORY_EMOJI` y `CATEGORY_LABELS` ya están importados en el archivo desde `'../lib/categories'`.

- [ ] **Step 4: Pasar `lockedPro` al uso de `MediaStep` en el render**

Encontrar el bloque donde se renderiza `<MediaStep .../>` (dentro del `AnimatePresence`, `step === 2`) y agregar la prop:

```tsx
<MediaStep
  input={input}
  onChange={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
  onAnalyze={handleAnalyze}
  lockedPro={lockedPro}
/>
```

- [ ] **Step 5: Verificar en dev server**

Navegar a `http://localhost:5177/ticket?pro=1`. Confirmar:
- El header dice "Solicitar a Carlos" (o el primer nombre del pro con id `'1'`)
- El subtítulo dice "Paso 1 de 2 · Electricidad" (o la categoría del pro)
- El banner del profesional aparece arriba del formulario de descripción con avatar, nombre, categoría, zona y rating

Navegar a `http://localhost:5177/ticket` (sin `?pro`). Confirmar que el header sigue diciendo "Nuevo ticket" y "Paso 1 de 4" — sin cambios en el flujo libre.

- [ ] **Step 6: Commit**

```bash
git add oficioYa/src/pages/TicketFlow.tsx
git commit -m "feat: header y banner de profesional en modo dirigido"
```

---

### Task 3: Saltar paso 4 en modo dirigido — ir directo a TicketConfirm

**Files:**
- Modify: `oficioYa/src/pages/TicketFlow.tsx`

**Interfaces:**
- Consumes: `lockedPro: ProfessionalWithProfile | null` de Task 1
- Produces: navegación directa a `/ticket/confirmar` tras la IA cuando hay `lockedPro`

- [ ] **Step 1: Actualizar `handlePedir` para recibir ticket como parámetro**

Reemplazar:

```ts
const handlePedir = (pro: ProfessionalWithProfile) => {
  navigate('/ticket/confirmar', {
    state: { ticket, proId: pro.id, proName: pro.profiles.full_name, proAvatar: pro.profiles.avatar_url, proRating: pro.avg_rating },
  })
}
```

Por:

```ts
const handlePedir = (pro: ProfessionalWithProfile, resolvedTicket?: GeneratedTicket) => {
  const t = resolvedTicket ?? ticket
  navigate('/ticket/confirmar', {
    state: { ticket: t, proId: pro.id, proName: pro.profiles.full_name, proAvatar: pro.profiles.avatar_url, proRating: pro.avg_rating },
  })
}
```

- [ ] **Step 2: Actualizar `handleAnalyze` para bifurcar según modo**

Reemplazar:

```ts
const handleAnalyze = async () => {
  if (!category) return
  const ticketInput: TicketInput = { ...input, category }
  setStep(3)
  setAiProgress(0)
  timeoutIdsRef.current.forEach(clearTimeout)
  timeoutIdsRef.current = []

  const intervals = [400, 900, 1600, 2500]
  intervals.forEach((delay, i) => {
    const id = setTimeout(() => setAiProgress(i + 1), delay)
    timeoutIdsRef.current.push(id)
  })

  const result = await analyzeTicket(ticketInput)
  setTicket(result)
  const id = setTimeout(() => setStep(4), 2600)
  timeoutIdsRef.current.push(id)
}
```

Por:

```ts
const handleAnalyze = async () => {
  if (!category) return
  const ticketInput: TicketInput = { ...input, category }
  setStep(3)
  setAiProgress(0)
  timeoutIdsRef.current.forEach(clearTimeout)
  timeoutIdsRef.current = []

  const intervals = [400, 900, 1600, 2500]
  intervals.forEach((delay, i) => {
    const id = setTimeout(() => setAiProgress(i + 1), delay)
    timeoutIdsRef.current.push(id)
  })

  const result = await analyzeTicket(ticketInput)
  setTicket(result)

  if (lockedPro) {
    // Modo dirigido: saltar paso 4, ir directo a TicketConfirm
    const id = setTimeout(() => handlePedir(lockedPro, result), 2600)
    timeoutIdsRef.current.push(id)
  } else {
    // Modo libre: mostrar lista de profesionales
    const id = setTimeout(() => setStep(4), 2600)
    timeoutIdsRef.current.push(id)
  }
}
```

- [ ] **Step 3: Actualizar `ResultsStep` en el render — no mostrar en modo dirigido**

Encontrar el bloque `{step === 4 && ticket && (...)` y agregar la condición `!lockedPro`:

```tsx
{step === 4 && ticket && !lockedPro && (
  <motion.div
    key="step4"
    custom={direction}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    style={{ width: '100%' }}
  >
    <ResultsStep
      ticket={ticket}
      category={category ?? ''}
      preselectedProId={preselectedProId}
      onPedir={handlePedir}
    />
  </motion.div>
)}
```

- [ ] **Step 4: Verificar flujo dirigido completo**

1. Ir a `http://localhost:5177/profesional/1` (perfil de Carlos Méndez)
2. Hacer clic en "Solicitar trabajo" — debe navegar a `/ticket?pro=1`
3. Confirmar que aparece paso 2 directo con banner del profesional
4. Subir foto o escribir texto, hacer clic en "Analizar con IA"
5. Confirmar que la pantalla de IA dice "Analizando... · Paso 2 de 2"
6. Confirmar que después del análisis navega a `/ticket/confirmar` directamente — **sin pasar por la lista de profesionales**
7. Confirmar que en la pantalla de confirmar aparece el pro correcto

- [ ] **Step 5: Verificar flujo libre sin regresión**

1. Ir a `http://localhost:5177/ticket` (sin `?pro`)
2. Confirmar paso 1 (categorías) → paso 2 (descripción) → IA → paso 4 (lista de pros) → TicketConfirm
3. Todo debe funcionar exactamente igual que antes

- [ ] **Step 6: Commit**

```bash
git add oficioYa/src/pages/TicketFlow.tsx
git commit -m "feat: saltar paso 4 en modo dirigido y navegar directo a TicketConfirm"
```
