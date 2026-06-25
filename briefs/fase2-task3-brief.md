# Fase2 Task 3: Selector de zona en MediaStep y nuevo sort en ResultsStep

**Working directory:** `C:\Users\fede8\Documents\OficiosYa\oficioYa`

## Contexto

- `TicketInput.zone: string` ya existe (Task 1)
- `scoreProfessional(pro, clientZone): number` ya existe en `src/lib/scoring.ts` (Task 2)
- Hay que: (a) mostrar chips de zona en `MediaStep`, (b) actualizar `ResultsStep` con el nuevo sort

## Archivo a modificar

Solo `src/pages/TicketFlow.tsx`

## Step 1: Agregar import de `scoreProfessional`

Al inicio del archivo, en los imports:
```ts
import { scoreProfessional } from '../lib/scoring'
```

## Step 2: Agregar selector de zona dentro de `MediaStep`

En el return de `MediaStep`, ENTRE el bloque del textarea (`{showText && (...)}`) y el botón "Analizar con IA", insertar este bloque completo:

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

**IMPORTANTE:** El click en un chip ya seleccionado lo deselecciona (`zone: ''`). La zona NO afecta `hasContent`.

## Step 3: Actualizar la firma de `ResultsStep` para recibir `clientZone`

Cambiar de:
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

## Step 4: Reemplazar el sort dentro de `ResultsStep`

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

## Step 5: Pasar `clientZone` al `<ResultsStep>` en el render del orquestador

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

## Step 6: Commit

```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat: selector de zona en MediaStep y ranking dinámico en ResultsStep"
```

## Constraints

- Solo modificar `src/pages/TicketFlow.tsx`
- No crear archivos nuevos
- Zonas exactas en este orden: Pocitos, Punta Carretas, Carrasco, Malvín, Buceo, Centro, Cordón, La Blanqueada, Parque Batlle
- Chip seleccionado: `#E8683A` bg + texto blanco. No seleccionado: `#FFFFFF` bg + borde `#EDE8DE`
- La zona NO afecta `hasContent`
- `preselectedProId` se elimina del sort (ya no se usa para ordenar)

## Reporte

Escribir en `C:\Users\fede8\Documents\OficiosYa\briefs\fase2-task3-report.md`.
Devolver: STATUS, commit hash, una línea.
