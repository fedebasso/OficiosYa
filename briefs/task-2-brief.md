# Task 2: Header y banner del profesional en MediaStep

**File:** `oficioYa/src/pages/TicketFlow.tsx` (único archivo a modificar)

**Working directory:** `C:\Users\fede8\Documents\OficiosYa\oficioYa`

## Contexto

Task 1 ya agregó el estado `lockedPro: ProfessionalWithProfile | null` y el useEffect que lo carga cuando hay `?pro=ID`. Ahora hay que usar ese estado para:
1. Bifurcar el header (título y subtítulo distintos en modo dirigido)
2. Agregar un banner del profesional visible en el paso 2 (MediaStep)

## Estado disponible (de Task 1)

```ts
const [lockedPro, setLockedPro] = useState<ProfessionalWithProfile | null>(null)
```

`CATEGORY_LABELS` y `CATEGORY_EMOJI` ya están importados desde `'../lib/categories'`.

## Pasos exactos

### Step 1: Reemplazar el bloque `const header = (...)` completo

Encontrar el bloque que empieza con `const header = (` y termina con el `</div>` que cierra el JSX del header (antes del `return` principal). Reemplazarlo completo por:

```tsx
const header = (
  <div
    className="px-4 pt-10 pb-3 sticky top-0 z-50 flex items-center gap-3"
    style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D4', boxShadow: '0 1px 0 #E8E0D4, 0 2px 8px rgba(0,0,0,.04)' }}
  >
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

### Step 2: Agregar prop `lockedPro` a la firma de `MediaStep`

Encontrar la función `MediaStep` que actualmente tiene esta firma:

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

Cambiarla a:

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

### Step 3: Agregar banner del profesional dentro del return de `MediaStep`

Al inicio del `return` de `MediaStep`, el JSX actual empieza así:

```tsx
return (
  <div className="flex flex-col gap-4 p-4">
    <div>
      <h2 ...>Mostranos el problema</h2>
      ...
    </div>
    ...
```

Insertar el banner ANTES del `<div>` con el título, quedando:

```tsx
return (
  <div className="flex flex-col gap-4 p-4">
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
    <div>
      <h2 className="text-xl font-black leading-tight" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
        Mostranos el problema
      </h2>
      ...resto del JSX sin cambios...
```

### Step 4: Pasar `lockedPro` al uso de `<MediaStep>` en el render

Encontrar donde se usa `<MediaStep` (dentro del `AnimatePresence`, bloque `step === 2`) y agregar la prop:

```tsx
<MediaStep
  input={input}
  onChange={(patch) => setInput((prev) => ({ ...prev, ...patch }))}
  onAnalyze={handleAnalyze}
  lockedPro={lockedPro}
/>
```

### Step 5: Verificar en dev server (http://localhost:5177)

**Modo dirigido** — navegar a `http://localhost:5177/ticket?pro=1`:
- Header dice "Solicitar a Carlos" (o primer nombre del pro con id 1)
- Subtítulo dice "Paso 1 de 2 · Electricidad" (o la categoría del pro)
- Banner del profesional visible arriba del formulario (avatar, nombre, categoría, rating)
- Botón volver del paso 2 hace `navigate(-1)` (no retrocede al paso 1)

**Modo libre** — navegar a `http://localhost:5177/ticket`:
- Header dice "Nuevo ticket" y "Paso 1 de 4" — sin cambios

### Step 6: Commit

```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat: header y banner de profesional en modo dirigido"
```

## Constraints

- Solo modificar `src/pages/TicketFlow.tsx`
- No crear archivos nuevos
- El flujo libre (sin `?pro`) no debe cambiar

## Reporte

Escribir en `C:\Users\fede8\Documents\OficiosYa\briefs\task-2-report.md` con:
- STATUS
- Commit hash
- Verificación del dev server
- Concerns

Devolver solo: STATUS, commit hash, una línea de resumen.
