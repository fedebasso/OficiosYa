# Task 1: Cargar profesional y activar modo dirigido

**File:** `oficioYa/src/pages/TicketFlow.tsx` (único archivo a modificar)

**Working directory:** `C:\Users\fede8\Documents\OficiosYa\oficioYa`

## Contexto

`TicketFlow` es el wizard de creación de solicitudes. Cuando el usuario llega desde un perfil de profesional, la URL tiene `?pro=ID`. Actualmente el wizard ignora ese ID para el flujo y muestra el paso 1 (selector de categorías) igual que si el usuario hubiera llegado sin contexto. El fix es: detectar `?pro=ID`, cargar el profesional, pre-llenar la categoría, y saltar directamente al paso 2.

## Pasos exactos

### Step 1: Agregar import de `professionalService`

Al inicio del archivo, donde están los imports, agregar:

```ts
import { professionalService } from '../services/professionalService'
```

### Step 2: Agregar estado `lockedPro`

Dentro de `export default function TicketFlow()`, después de la línea:
```ts
const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([])
```

Agregar:
```ts
const [lockedPro, setLockedPro] = useState<ProfessionalWithProfile | null>(null)
```

### Step 3: Agregar `useEffect` de carga del profesional

Después del `useEffect` de cleanup existente (el que hace `clearTimeout`), agregar:

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

### Step 4: Verificar en dev server (el servidor corre en http://localhost:5177)

- Navegar a `http://localhost:5177/ticket` (sin `?pro`) → debe arrancar en paso 1 (categorías) sin cambios
- Navegar a `http://localhost:5177/ticket?pro=1` → debe saltar al paso 2 directamente

### Step 5: Commit

```bash
git add src/pages/TicketFlow.tsx
git commit -m "feat: cargar profesional y activar modo dirigido en TicketFlow"
```

## Constraints

- Solo modificar `src/pages/TicketFlow.tsx`
- No crear archivos nuevos
- El flujo libre (sin `?pro`) no debe cambiar

## Reporte

Escribir reporte completo en `C:\Users\fede8\Documents\OficiosYa\briefs\task-1-report.md` con:
- STATUS: DONE / BLOCKED / NEEDS_CONTEXT
- Commit hash
- Verificación del dev server
- Cualquier concern

Devolver solo: STATUS, commit hash, una línea de resumen.
