# Fase1-IA Task 1: Simplificar TicketInput y MediaStep

**Working directory:** `C:\Users\fede8\Documents\OficiosYa\oficioYa`

## Contexto

`TicketFlow.tsx` es el wizard de creación de solicitudes. `MediaStep` es el paso 2 donde el usuario describe el problema. Actualmente soporta foto, audio y video. Vamos a reducirlo a solo foto y texto porque la IA solo procesará esas dos entradas.

## Archivos a modificar

- `src/types/ticket.ts`
- `src/pages/TicketFlow.tsx`

## Step 1: Reemplazar `src/types/ticket.ts` completo

```ts
// src/types/ticket.ts
import type { WorkType } from '../store/requestStore'

export interface TicketInput {
  category: string
  photo: File | null
  text: string
}

export interface GeneratedTicket {
  title: string
  description: string
  category: string
  urgent: boolean
  work_type: WorkType
}
```

## Step 2: Reemplazar la función `MediaStep` completa en `TicketFlow.tsx`

La función `MediaStep` empieza en la línea con el comentario `/* ── Paso 2: Media ── */` y termina justo antes del comentario `/* ── Paso 3: IA procesando ── */`. Reemplazarla COMPLETA (incluyendo el comentario de sección) por:

```tsx
/* ── Paso 2: Media ── */
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
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [showText, setShowText] = useState(false)

  const photoUrl = useMemo(() => {
    if (!input.photo) return null
    return URL.createObjectURL(input.photo)
  }, [input.photo])

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl)
    }
  }, [photoUrl])

  const hasContent = input.photo !== null || input.text.length >= 10

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
        <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>
          Foto o descripción — lo que sea más fácil
        </p>
      </div>

      {/* Hero: foto */}
      {input.photo ? (
        <div className="relative rounded-2xl overflow-hidden" style={{ height: 180 }}>
          <img
            src={photoUrl ?? ''}
            alt="foto del problema"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange({ photo: null })}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white font-black"
            style={{ background: '#EF4444', fontSize: 14 }}
          >
            ×
          </button>
        </div>
      ) : (
        <motion.button
          type="button"
          onClick={() => fileRef.current?.click()}
          whileTap={{ scale: 0.98 }}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl relative overflow-hidden"
          style={{ height: 200, border: '2px dashed #E8683A', background: '#FEF0EA' }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(232,104,58,.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <motion.span
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
            style={{ fontSize: 42, position: 'relative', zIndex: 1 }}
          >
            📷
          </motion.span>
          <span className="text-sm font-bold" style={{ color: '#E8683A', position: 'relative', zIndex: 1 }}>
            Sacar o subir foto
          </span>
          <span className="text-xs" style={{ color: '#C4927A', position: 'relative', zIndex: 1 }}>
            Tocá para abrir la cámara
          </span>
        </motion.button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onChange({ photo: e.target.files?.[0] ?? null })}
      />

      {/* Texto */}
      <motion.button
        type="button"
        onClick={() => setShowText((v) => !v)}
        whileTap={{ scale: 0.94 }}
        className="flex items-center gap-2 rounded-xl py-3 px-4"
        style={{
          background: showText ? 'rgba(232,104,58,.1)' : '#FFFFFF',
          border: `1.5px solid ${showText ? '#E8683A' : '#EDE8DE'}`,
        }}
      >
        <span style={{ fontSize: 20 }}>✏️</span>
        <span className="text-sm font-bold" style={{ color: showText ? '#E8683A' : '#555' }}>
          {showText ? 'Ocultar texto' : 'Describir con texto'}
        </span>
      </motion.button>

      {showText && (
        <textarea
          value={input.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={3}
          placeholder="Describí el problema con tus palabras..."
          className="rounded-xl p-3 text-sm resize-none"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E8E0D4',
            color: '#111',
            outline: 'none',
            caretColor: '#E8683A',
          }}
        />
      )}

      <button
        type="button"
        onClick={onAnalyze}
        disabled={!hasContent}
        className="w-full rounded-2xl py-4 text-base font-bold text-white active:opacity-80 disabled:opacity-40 transition-opacity"
        style={{ background: '#E8683A', boxShadow: '0 4px 14px rgba(232,104,58,.3)' }}
      >
        Analizar con IA ✨
      </button>
    </div>
  )
}
```

## Step 3: Limpiar `audioBlob` del estado inicial en el orquestador

Buscar en el cuerpo de `export default function TicketFlow()`:

```ts
const [input, setInput] = useState<TicketInput>({ category: '', photo: null, audioBlob: null, text: '' })
```

Cambiar a:

```ts
const [input, setInput] = useState<TicketInput>({ category: '', photo: null, text: '' })
```

## Step 4: Verificar en dev server (http://localhost:5177)

Navegar a `http://localhost:5177/ticket`. Confirmar:
- Paso 2 muestra solo foto + botón de texto
- No hay botones de audio ni video
- Botón "Analizar con IA" se habilita con foto o texto ≥ 10 chars
- No hay errores TypeScript en consola

## Step 5: Commit

```bash
git add src/types/ticket.ts src/pages/TicketFlow.tsx
git commit -m "feat: simplificar MediaStep — solo foto y texto, eliminar audio/video"
```

## Constraints

- Solo modificar `src/types/ticket.ts` y `src/pages/TicketFlow.tsx`
- No crear archivos nuevos
- El flujo libre y el flujo dirigido siguen funcionando

## Reporte

Escribir en `C:\Users\fede8\Documents\OficiosYa\briefs\fase1-task1-report.md`.
Devolver: STATUS, commit hash, una línea de resumen.
