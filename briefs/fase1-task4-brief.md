# Fase1-IA Task 4: Error state en TicketFlow cuando la IA no reconoce el problema

**Working directory:** `C:\Users\fede8\Documents\OficiosYa\oficioYa`

## Contexto

`ticketService.analyzeTicket` ahora puede lanzar `new Error('NO_MATCH')` cuando la IA detecta que el problema no corresponde a servicios del hogar. `handleAnalyze` en `TicketFlow.tsx` actualmente no captura este error. Hay que:
1. Agregar estado `aiError`
2. Capturar el error `NO_MATCH` en `handleAnalyze`
3. Mostrar una pantalla de error en el paso 3 con botón "Intentar de nuevo"

## Archivo a modificar

`src/pages/TicketFlow.tsx`

## Step 1: Agregar estado `aiError`

Buscar la línea:
```ts
const [ticket, setTicket] = useState<GeneratedTicket | null>(null)
```

Agregar después:
```ts
const [aiError, setAiError] = useState<'no_match' | null>(null)
```

## Step 2: Reemplazar `handleAnalyze` completo

Encontrar la función `handleAnalyze` y reemplazarla completa por:

```ts
const handleAnalyze = async () => {
  if (!category) return
  const ticketInput: TicketInput = { ...input, category }
  setStep(3)
  setAiError(null)
  setAiProgress(0)
  timeoutIdsRef.current.forEach(clearTimeout)
  timeoutIdsRef.current = []

  const intervals = [400, 900, 1600, 2500]
  intervals.forEach((delay, i) => {
    const id = setTimeout(() => setAiProgress(i + 1), delay)
    timeoutIdsRef.current.push(id)
  })

  try {
    const result = await analyzeTicket(ticketInput)
    setTicket(result)

    if (lockedPro) {
      const id = setTimeout(() => handlePedir(lockedPro, result), 2600)
      timeoutIdsRef.current.push(id)
    } else {
      const id = setTimeout(() => setStep(4), 2600)
      timeoutIdsRef.current.push(id)
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'NO_MATCH') {
      setAiError('no_match')
    }
  }
}
```

## Step 3: Reemplazar el bloque de paso 3 en el AnimatePresence

Buscar el bloque:
```tsx
{step === 3 && (
  <motion.div
    key="step3"
    variants={fadeVariants}
    initial="enter"
    animate="center"
    exit="exit"
    style={{ width: '100%', display: 'flex', flex: 1 }}
  >
    <AIProcessingStep progress={aiProgress} />
  </motion.div>
)}
```

Reemplazarlo por:
```tsx
{step === 3 && (
  <motion.div
    key="step3"
    variants={fadeVariants}
    initial="enter"
    animate="center"
    exit="exit"
    style={{ width: '100%', display: 'flex', flex: 1 }}
  >
    {aiError === 'no_match' ? (
      <div className="flex flex-col items-center justify-center flex-1 p-8 text-center gap-5">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{ background: 'rgba(239,68,68,.08)', border: '1.5px solid rgba(239,68,68,.15)' }}
        >
          🤔
        </div>
        <div>
          <h2 className="text-xl font-black leading-tight mb-2" style={{ color: '#111111', letterSpacing: '-0.3px' }}>
            No pudimos identificar el problema
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#777777' }}>
            La descripción o imagen no corresponde a un servicio del hogar. Intentá con una foto del problema o describí qué trabajo necesitás (electricidad, plomería, pintura, etc).
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => { setAiError(null); setDirection('back'); setStep(2) }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-2xl py-3.5 text-sm font-bold"
          style={{ background: '#E8683A', color: '#fff', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
        >
          Intentar de nuevo
        </motion.button>
      </div>
    ) : (
      <AIProcessingStep progress={aiProgress} />
    )}
  </motion.div>
)}
```

## Step 4: Verificar en dev server (http://localhost:5177)

En modo demo el error NO_MATCH nunca se dispara (mock siempre devuelve resultado).
Verificar que el flujo normal funciona:
- Paso 2 → clic en "Analizar con IA" → spinner IA → paso 4 (o TicketConfirm en modo dirigido)
- Sin regresiones

## Step 5: Commit

```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat: mostrar error cuando la IA no reconoce el problema del cliente"
```

## Constraints

- Solo modificar `src/pages/TicketFlow.tsx`
- El botón "Intentar de nuevo" resetea `aiError` a null y vuelve al paso 2
- El color del botón de error es `#E8683A` (naranja, igual que el resto de CTAs)
- No crear archivos nuevos

## Reporte

Escribir en `C:\Users\fede8\Documents\OficiosYa\briefs\fase1-task4-report.md`.
Devolver: STATUS, commit hash, una línea de resumen.
