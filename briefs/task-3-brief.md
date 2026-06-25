# Task 3: Saltar paso 4 en modo dirigido — ir directo a TicketConfirm

**File:** `oficioYa/src/pages/TicketFlow.tsx` (único archivo a modificar)

**Working directory:** `C:\Users\fede8\Documents\OficiosYa\oficioYa`

## Contexto

Tasks 1 y 2 ya implementados: `lockedPro` se carga cuando hay `?pro=ID`, el header muestra "Solicitar a [Nombre]", el banner del pro aparece en MediaStep. Ahora falta la parte más importante: después de que la IA analiza el problema, el flujo dirigido debe ir directo a `/ticket/confirmar` sin pasar por el paso 4 (lista de profesionales).

## Pasos exactos

### Step 1: Actualizar `handlePedir` para recibir ticket como parámetro

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

### Step 2: Actualizar `handleAnalyze` para bifurcar según modo

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

### Step 3: Agregar `!lockedPro` como condición para mostrar el paso 4

Encontrar el bloque:
```tsx
{step === 4 && ticket && (
```

Y cambiarlo a:
```tsx
{step === 4 && ticket && !lockedPro && (
```

El resto del bloque queda igual.

### Step 4: Verificar el flujo dirigido completo en dev server (http://localhost:5177)

1. Ir a `http://localhost:5177/profesional/1` (perfil de Carlos Méndez)
2. Hacer clic en "Solicitar trabajo" → debe navegar a `/ticket?pro=1`
3. Confirmar paso 2 directo con banner del profesional
4. Escribir texto en el campo o subir foto, luego hacer clic en "Analizar con IA"
5. Confirmar pantalla de IA — "Paso 2 de 2"
6. Después del análisis debe navegar directo a `/ticket/confirmar` — SIN pasar por lista de profesionales
7. Verificar que la pantalla de confirmar muestra el profesional correcto (Carlos Méndez)

### Step 5: Verificar flujo libre sin regresión en dev server

1. Ir a `http://localhost:5177/ticket` (sin `?pro`)
2. Paso 1 (categorías) → elegir categoría → continuar
3. Paso 2 (descripción) → escribir texto → Analizar con IA
4. Paso 3 (IA) → Paso 4 (lista de profesionales) → elegir uno → TicketConfirm
5. Todo debe funcionar igual que antes

### Step 6: Commit

```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat: saltar paso 4 en modo dirigido y navegar directo a TicketConfirm"
```

## Constraints

- Solo modificar `src/pages/TicketFlow.tsx`
- No crear archivos nuevos
- El flujo libre (sin `?pro`) no debe cambiar absolutamente nada

## Reporte

Escribir en `C:\Users\fede8\Documents\OficiosYa\briefs\task-3-report.md` con:
- STATUS
- Commit hash
- Verificación de ambos flujos
- Concerns

Devolver solo: STATUS, commit hash, una línea de resumen.
