# Spec: Fix flujo de solicitud dirigida a profesional

**Fecha:** 2026-06-18  
**Estado:** Aprobado

## Problema

Cuando el cliente llega a `TicketFlow` desde el perfil de un profesional (URL `/ticket?pro=ID`), el wizard muestra el paso 1 (selector de categorías) y el paso 4 (lista de todos los profesionales), ambos innecesarios. El profesional ya fue elegido.

## Solución: modo "dirigido"

`TicketFlow` detecta si hay `?pro=ID` en la URL y activa un modo dirigido de 2 pasos visibles.

## Regla central

- **Sin `?pro`** → flujo libre de 4 pasos (comportamiento actual sin cambios)
- **Con `?pro=ID`** → flujo dirigido: descripción → IA → TicketConfirm directo

## Cambios en `TicketFlow.tsx`

### Estado adicional

```ts
const [lockedPro, setLockedPro] = useState<ProfessionalWithProfile | null>(null)
```

Al montar, si hay `preselectedProId`, cargar el profesional desde `professionalService.getById(id)` (o filtrar desde `professionalService.getAll()`) y guardarlo en `lockedPro`. Pre-llenar `category` con `lockedPro.categories[0]`.

### Step inicial

Si `lockedPro` existe: `useState<1|2|3|4>(2)` — arrancar en paso 2. Si no: paso 1 (comportamiento actual).

### Header

| Condición | Título | Subtítulo |
|---|---|---|
| `lockedPro` + step 2 | "Solicitar a [Nombre]" | "Paso 1 de 2 · [Categoría]" |
| `lockedPro` + step 3 | "Analizando..." | "Paso 2 de 2 · [Categoría]" |
| Sin `lockedPro` | comportamiento actual | "Paso X de 4" |

### Banner del profesional (nuevo componente inline)

Mostrar en paso 2 cuando hay `lockedPro`:

```tsx
<div style={bannerStyle}>
  <Avatar pro={lockedPro} />
  <div>
    <ProName />
    <ProSpec /> {/* categoría + zona */}
  </div>
  <RatingBadge />
</div>
```

El banner va pegado arriba del formulario de descripción, dentro de `MediaStep` o encima de él — usando una prop `lockedPro?: ProfessionalWithProfile`.

### `handleAnalyze` en modo dirigido

Si `lockedPro` existe, al terminar el análisis de IA navegar directamente a `/ticket/confirmar` sin pasar por el paso 4:

```ts
const handleAnalyze = async () => {
  // ... lógica actual de AI ...
  const result = await analyzeTicket(ticketInput)
  setTicket(result)
  if (lockedPro) {
    // modo dirigido: saltar paso 4
    setTimeout(() => handlePedir(lockedPro, result), 2600)
  } else {
    setTimeout(() => setStep(4), 2600)
  }
}
```

`handlePedir` necesita recibir el ticket como parámetro para no depender de estado asíncrono:

```ts
const handlePedir = (pro: ProfessionalWithProfile, resolvedTicket?: GeneratedTicket) => {
  const t = resolvedTicket ?? ticket
  navigate('/ticket/confirmar', {
    state: { ticket: t, proId: pro.id, proName: pro.profiles.full_name, proAvatar: pro.profiles.avatar_url, proRating: pro.avg_rating },
  })
}
```

### Paso 4 (ResultsStep)

No se renderiza en modo dirigido. El `step === 4` solo se llega cuando no hay `lockedPro`.

### Botón volver en paso 2 con `lockedPro`

`navigate(-1)` — vuelve al perfil del pro. No retrocede al paso 1.

## Carga del profesional

Usar `professionalService.getAll()` (que ya existe) y filtrar por ID. No requiere nuevo método en el servicio.

```ts
useEffect(() => {
  if (!preselectedProId) return
  professionalService.getAll().then((pros) => {
    const found = pros.find((p) => p.id === preselectedProId)
    if (found) {
      setLockedPro(found)
      setCategory(found.categories[0] ?? null)
      setStep(2)
    }
  })
}, [preselectedProId])
```

## Archivos modificados

- `src/pages/TicketFlow.tsx` — único archivo a tocar

## Fuera de scope

- Cambios en `TicketConfirm.tsx` (ya funciona correctamente)
- Cambios en `ProfessionalProfile.tsx` (ya navega a `/ticket?pro=ID`)
- Modo libre (sin `?pro`) — sin cambios
