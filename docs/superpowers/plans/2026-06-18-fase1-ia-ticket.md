# Fase 1 IA — Análisis de ticket con Claude Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el mock hardcodeado de `ticketService.ts` por análisis real con Claude API via Supabase Edge Function, y simplificar `MediaStep` para aceptar solo texto y foto.

**Architecture:** 3 tareas independientes en orden: (1) simplificar el tipo y el formulario, (2) crear la Edge Function Deno que llama a Claude, (3) actualizar el servicio del frontend para llamar a la Edge Function con fallback al mock.

**Tech Stack:** React 18 + TypeScript + Vite (frontend), Deno + Supabase Edge Functions (backend), Claude API `claude-haiku-4-5-20251001`.

## Global Constraints

- No agregar dependencias npm nuevas al frontend
- Solo `src/types/ticket.ts`, `src/pages/TicketFlow.tsx`, `src/services/ai/ticketService.ts` y `supabase/functions/analyze-ticket/index.ts` son tocados
- El flujo libre y el flujo dirigido deben seguir funcionando
- En `IS_DEMO_MODE === true` (cuando `VITE_SUPABASE_URL` es placeholder) → usar mock, sin llamadas de red
- Modelo Claude: `claude-haiku-4-5-20251001` (exacto)
- La Edge Function devuelve JSON con campos: `title`, `description`, `urgent`, `work_type`
- El frontend agrega `category` al resultado antes de devolverlo como `GeneratedTicket`

---

### Task 1: Simplificar `TicketInput` y `MediaStep`

**Files:**
- Modify: `oficioYa/src/types/ticket.ts`
- Modify: `oficioYa/src/pages/TicketFlow.tsx`

**Interfaces:**
- Consumes: nada de otras tareas
- Produces: `TicketInput` sin `audioBlob`, `MediaStep` sin audio/video — consumido por Task 3

- [ ] **Step 1: Eliminar `audioBlob` de `TicketInput`**

Reemplazar `src/types/ticket.ts` completo por:

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

- [ ] **Step 2: Reemplazar `MediaStep` completo en `TicketFlow.tsx`**

Encontrar la función `MediaStep` (desde la línea `/* ── Paso 2: Media ── */` hasta el `}` que la cierra, antes de `/* ── Paso 3: IA procesando ── */`) y reemplazarla completa por:

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

- [ ] **Step 3: Limpiar referencias a `audioBlob` en `TicketFlow.tsx`**

Buscar en el archivo cualquier referencia a `audioBlob` y eliminarla:

En el estado inicial del input (dentro del orquestador):
```ts
// Cambiar de:
const [input, setInput] = useState<TicketInput>({ category: '', photo: null, audioBlob: null, text: '' })
// A:
const [input, setInput] = useState<TicketInput>({ category: '', photo: null, text: '' })
```

- [ ] **Step 4: Verificar en dev server (http://localhost:5177)**

Navegar a `http://localhost:5177/ticket`. Confirmar:
- Paso 2 muestra solo foto + botón de texto
- No hay botones de audio ni video
- Se puede subir foto y escribir texto
- El botón "Analizar con IA" aparece habilitado cuando hay foto o texto ≥ 10 chars

- [ ] **Step 5: Commit**

```bash
git add oficioYa/src/types/ticket.ts oficioYa/src/pages/TicketFlow.tsx
git commit -m "feat: simplificar MediaStep — solo foto y texto, eliminar audio/video"
```

---

### Task 2: Supabase Edge Function `analyze-ticket`

**Files:**
- Create: `supabase/functions/analyze-ticket/index.ts`

**Interfaces:**
- Consumes: nada de otras tareas
- Produces: endpoint POST `{SUPABASE_URL}/functions/v1/analyze-ticket` que devuelve `{ title, description, urgent, work_type }` — consumido por Task 3

**Nota:** El directorio `supabase/functions/analyze-ticket/` debe crearse dentro de la raíz del repositorio (`C:\Users\fede8\Documents\OficiosYa\`), no dentro de `oficioYa/`.

- [ ] **Step 1: Crear el directorio y el archivo**

```bash
mkdir -p supabase/functions/analyze-ticket
```

Crear `supabase/functions/analyze-ticket/index.ts` con el contenido completo:

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SYSTEM_PROMPT = `Sos un asistente especializado en servicios del hogar en Uruguay.
Analizá la descripción y/o imagen del problema que te envía un cliente y generá un ticket de servicio estructurado.

Respondé ÚNICAMENTE con JSON válido, sin texto adicional, con este formato exacto:
{
  "title": "Título breve del problema (máx 60 caracteres)",
  "description": "Descripción profesional del trabajo requerido (2-3 oraciones)",
  "urgent": true,
  "work_type": "reparacion"
}

Valores válidos para work_type: "reparacion", "instalacion", "mantenimiento", "otro"
Criterios de urgencia: marcá urgent=true si hay riesgo de seguridad, daño progresivo, o el cliente menciona que es urgente.
Sé preciso y profesional. No inventes detalles que no estén en la descripción o imagen.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    const { text, category, photoBase64 } = await req.json()

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    // Construir contenido del mensaje
    const userContent: unknown[] = []

    if (photoBase64) {
      // Extraer mediaType y datos del data URL
      const match = photoBase64.match(/^data:([^;]+);base64,(.+)$/)
      if (match) {
        const [, mediaType, data] = match
        userContent.push({
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data },
        })
      }
    }

    const textContent = [
      `Categoría: ${category}`,
      text ? `Descripción del cliente: ${text}` : 'El cliente no agregó descripción de texto.',
    ].join('\n')

    userContent.push({ type: 'text', text: textContent })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: err }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const claude = await response.json()
    const rawText = claude.content?.[0]?.text ?? ''

    // Extraer JSON de la respuesta (Claude puede incluir ```json ``` a veces)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'Claude did not return valid JSON', raw: rawText }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const ticket = JSON.parse(jsonMatch[0])

    return new Response(JSON.stringify(ticket), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/analyze-ticket/index.ts
git commit -m "feat: Edge Function analyze-ticket con Claude API"
```

- [ ] **Step 3: Nota sobre deploy**

La Edge Function se deploya con:
```bash
supabase functions deploy analyze-ticket --no-verify-jwt
```

Y el secret se configura con:
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

Esto requiere Supabase CLI y un proyecto Supabase real configurado. **No es parte de esta tarea** — se hace cuando el proyecto tenga Supabase real. Por ahora el archivo queda en el repo listo para deploy.

---

### Task 3: Actualizar `ticketService.ts` para llamar a la Edge Function

**Files:**
- Modify: `oficioYa/src/services/ai/ticketService.ts`

**Interfaces:**
- Consumes:
  - `TicketInput` de Task 1: `{ category: string, photo: File | null, text: string }`
  - Endpoint POST de Task 2: `{SUPABASE_URL}/functions/v1/analyze-ticket`
- Produces: `analyzeTicket(input: TicketInput): Promise<GeneratedTicket>` — misma firma que antes, sin cambios en los consumidores

- [ ] **Step 1: Reemplazar `ticketService.ts` completo**

Reemplazar `src/services/ai/ticketService.ts` completo por:

```ts
import type { TicketInput, GeneratedTicket } from '../../types/ticket'
import type { WorkType } from '../../store/requestStore'
import { IS_DEMO_MODE } from '../../lib/env'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

/* ── Mock fallback ── */
const MOCK_TICKETS: Record<string, Omit<GeneratedTicket, 'category'>> = {
  electricista: {
    title: 'Falla eléctrica en tomacorriente',
    description: 'Se detectó una posible falla en el circuito eléctrico. El tomacorriente no entrega corriente y puede haber un cortocircuito en el cableado interno. Requiere revisión urgente para evitar riesgo de incendio.',
    urgent: true,
    work_type: 'reparacion' as WorkType,
  },
  plomero: {
    title: 'Pérdida de agua en cañería',
    description: 'Filtración de agua detectada bajo el lavatorio. La pérdida puede deberse a una unión deficiente o a una fisura en el caño. Conviene cortar el paso de agua hasta la reparación.',
    urgent: true,
    work_type: 'reparacion' as WorkType,
  },
  aire_acondicionado: {
    title: 'Aire acondicionado sin frío',
    description: 'El equipo enciende pero no enfría el ambiente. Posible falta de gas refrigerante o filtros obstruidos. Se recomienda limpieza y revisión del sistema de refrigeración.',
    urgent: false,
    work_type: 'mantenimiento' as WorkType,
  },
  cerrajero: {
    title: 'Cerradura bloqueada o rota',
    description: 'La cerradura no responde correctamente a la llave. Puede necesitar lubricación, ajuste del cilindro o reemplazo completo del mecanismo.',
    urgent: false,
    work_type: 'reparacion' as WorkType,
  },
  pintor: {
    title: 'Repintura de superficie interior',
    description: 'La pared presenta humedad, descascarado o manchas que requieren preparación de la superficie y aplicación de nueva pintura. Se necesita sellado previo para resultados duraderos.',
    urgent: false,
    work_type: 'otro' as WorkType,
  },
  albanil: {
    title: 'Reparación de mampostería',
    description: 'Se observan fisuras o desprendimientos en la pared que requieren relleno, fraguado y terminación. Es importante reparar pronto para evitar mayor deterioro estructural.',
    urgent: false,
    work_type: 'reparacion' as WorkType,
  },
}

const FALLBACK: Omit<GeneratedTicket, 'category'> = {
  title: 'Trabajo de mantenimiento del hogar',
  description: 'Se requiere la intervención de un profesional para evaluar y resolver el problema detectado en el domicilio.',
  urgent: false,
  work_type: 'otro' as WorkType,
}

function mockResult(input: TicketInput): GeneratedTicket {
  const mock = MOCK_TICKETS[input.category] ?? FALLBACK
  return { ...mock, category: input.category }
}

async function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function analyzeTicket(input: TicketInput): Promise<GeneratedTicket> {
  if (IS_DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 2500))
    return mockResult(input)
  }

  try {
    const photoBase64 = input.photo ? await toBase64(input.photo) : undefined

    const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        text: input.text,
        category: input.category,
        photoBase64,
      }),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    if (data.error) throw new Error(data.error)

    return {
      title: data.title,
      description: data.description,
      urgent: Boolean(data.urgent),
      work_type: data.work_type as WorkType,
      category: input.category,
    }
  } catch {
    // Fallback silencioso al mock si falla la Edge Function
    await new Promise((r) => setTimeout(r, 500))
    return mockResult(input)
  }
}
```

- [ ] **Step 2: Verificar en dev server — modo demo (sin Supabase real)**

Navegar a `http://localhost:5177/ticket`, seleccionar categoría, escribir texto, hacer clic en "Analizar con IA". Confirmar:
- El spinner de IA aparece (~2.5 segundos)
- Llega a paso 4 con un ticket generado (del mock)
- No hay errores en consola relacionados con `audioBlob`

- [ ] **Step 3: Commit**

```bash
git add oficioYa/src/services/ai/ticketService.ts
git commit -m "feat: ticketService llama a Edge Function con fallback al mock"
```
