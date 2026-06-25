# Radio T3: Filtro por radio en ResultsStep + indicador en cards

**Working dir:** `C:\Users\fede8\Documents\OficiosYa\oficioYa`

## Contexto
- `isInRadius(proZone, radiusKm, clientZone): boolean` ya existe en `src/lib/barrio-coords.ts`
- `Professional.radius_km: number | null` ya existe en el tipo y en el mock
- `ResultsStep` en `src/pages/TicketFlow.tsx` recibe `clientZone: string`
- El sort actual usa `scoreProfessional` de `src/lib/scoring.ts`

## Cambios en `src/pages/TicketFlow.tsx`

### Step 1: Agregar import de `isInRadius`
```ts
import { isInRadius } from '../lib/barrio-coords'
```

### Step 2: Aplicar filtro por radio antes del scoring en `ResultsStep`

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

### Step 3: Agregar indicador de radio en las cards

En el JSX de cada card de profesional dentro de `ResultsStep`, buscar donde se muestra la info del pro (zona, categoría, rating) y agregar después de la línea de zona:

```tsx
<span className="text-[9px] font-bold" style={{ color: '#AAAAAA' }}>
  {pro.radius_km === null ? '🌍 Toda la ciudad' : `📍 ${pro.zone} · ${pro.radius_km} km`}
</span>
```

Para ubicarlo: buscar en `ResultsStep` el JSX que muestra `pro.zone` o `pro.categories` y agregar el span debajo de esa línea.

### Commit
```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat: filtro por radio en ResultsStep e indicador en cards"
```

## Constraints
- Solo modificar `src/pages/TicketFlow.tsx`
- El filtro va ANTES del scoring (no después)
- Sin clientZone → `isInRadius` devuelve true → no se filtran pros

## Reporte
Escribir en `C:\Users\fede8\Documents\OficiosYa\briefs\radio-t3-report.md`.
Devolver: STATUS, commit hash, una línea.
