# Spec: Fase 1 IA — Análisis de ticket con Claude (texto + foto)

**Fecha:** 2026-06-18  
**Estado:** Aprobado

## Objetivo

Reemplazar el mock hardcodeado de `ticketService.ts` por análisis real con Claude API, vía Supabase Edge Function. Simplificar simultáneamente `MediaStep` para aceptar solo texto y foto, eliminando audio y video.

## Archivos modificados

| Archivo | Tipo | Cambio |
|---|---|---|
| `oficioYa/src/types/ticket.ts` | Modify | Eliminar `audioBlob` de `TicketInput` |
| `oficioYa/src/pages/TicketFlow.tsx` | Modify | Simplificar `MediaStep` — quitar audio/video |
| `oficioYa/src/services/ai/ticketService.ts` | Modify | Llamada real a Edge Function con fallback al mock |
| `supabase/functions/analyze-ticket/index.ts` | Create | Edge Function proxy hacia Claude API |

---

## Parte 1: Tipo `TicketInput` simplificado

```ts
// src/types/ticket.ts
export interface TicketInput {
  category: string
  photo: File | null
  text: string
  // audioBlob eliminado
}
```

`GeneratedTicket` no cambia.

---

## Parte 2: `MediaStep` simplificado

Eliminar de `MediaStep` en `TicketFlow.tsx`:
- Estado `recording`, `mediaRef`, `chunksRef` (MediaRecorder)
- Estado `videoFile`, `videoRef`
- Función `startRecording`, `stopRecording`
- Botón de grabación de audio y su UI
- Input de video y su lógica
- Import de `useRef` solo si queda sin uso (verificar — `fileRef` sigue)

Mantener:
- `fileRef` y el input de foto
- Estado `showText` y el campo de texto libre
- `photoUrl` y su cleanup (`useMemo`, `useEffect`)

La condición `hasContent` pasa de:
```ts
const hasContent = input.photo !== null || input.audioBlob !== null || input.text.length >= 10 || videoFile !== null
```
A:
```ts
const hasContent = input.photo !== null || input.text.length >= 10
```

---

## Parte 3: Supabase Edge Function `analyze-ticket`

**Ubicación:** `supabase/functions/analyze-ticket/index.ts`

**Runtime:** Deno (estándar de Supabase Edge Functions)

**Request body:**
```json
{
  "text": "descripción del problema",
  "category": "electricista",
  "photoBase64": "data:image/jpeg;base64,..." 
}
```
`photoBase64` es opcional. `text` puede ser vacío si hay foto.

**Lógica:**
1. Leer `ANTHROPIC_API_KEY` desde `Deno.env.get('ANTHROPIC_API_KEY')`
2. Construir mensaje para Claude:
   - Si hay `photoBase64`: contenido multimodal (`image` + `text`)
   - Si solo texto: contenido de texto
3. Llamar a `https://api.anthropic.com/v1/messages` con modelo `claude-haiku-4-5-20251001`
4. Parsear la respuesta JSON de Claude
5. Devolver `GeneratedTicket` como JSON

**Prompt del sistema (exacto):**
```
Sos un asistente especializado en servicios del hogar en Uruguay.
Analizá la descripción y/o imagen del problema que te envía un cliente y generá un ticket de servicio estructurado.

Respondé ÚNICAMENTE con JSON válido, sin texto adicional, con este formato exacto:
{
  "title": "Título breve del problema (máx 60 caracteres)",
  "description": "Descripción profesional del trabajo requerido (2-3 oraciones)",
  "urgent": true | false,
  "work_type": "reparacion" | "instalacion" | "mantenimiento" | "otro"
}

Criterios de urgencia: marcá urgent=true si hay riesgo de seguridad, daño progresivo, o el cliente menciona que es urgente.
Sé preciso y profesional. No inventes detalles que no estén en la descripción o imagen.
```

**Mensaje del usuario:**
```
Categoría: {category}
Descripción: {text}
[+ imagen si hay photoBase64]
```

**Response exitosa (200):**
```json
{
  "title": "...",
  "description": "...",
  "urgent": false,
  "work_type": "reparacion",
  "category": "electricista"
}
```

**Response de error (500):**
```json
{ "error": "..." }
```

**Headers CORS:** necesarios para que el browser pueda llamar desde `localhost:5177` y desde el dominio de producción.

---

## Parte 4: `ticketService.ts` actualizado

**Lógica:**

```ts
export async function analyzeTicket(input: TicketInput): Promise<GeneratedTicket> {
  if (IS_DEMO_MODE) {
    // Fallback al mock — en demo sin Supabase configurado
    await new Promise(r => setTimeout(r, 2500))
    return mockResult(input)
  }

  try {
    // Convertir foto a base64 si existe
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
    return { ...data, category: input.category }
  } catch {
    // Fallback silencioso al mock si falla la Edge Function
    await new Promise(r => setTimeout(r, 500))
    return mockResult(input)
  }
}
```

`toBase64(file: File): Promise<string>` — helper que usa `FileReader` para convertir el File a data URL.

---

## Modo demo vs producción

| Condición | Comportamiento |
|---|---|
| `IS_DEMO_MODE === true` | Mock hardcodeado, sin llamada a red |
| `IS_DEMO_MODE === false`, Edge Function OK | Claude API real |
| `IS_DEMO_MODE === false`, Edge Function falla | Fallback silencioso al mock |

---

## Secret requerido en Supabase

```
ANTHROPIC_API_KEY=sk-ant-...
```

Se configura en el dashboard de Supabase → Settings → Edge Functions → Secrets.

## Fuera de scope

- Transcripción de audio (eliminado del producto)
- Streaming de respuesta
- Extensión de `GeneratedTicket` con campos nuevos (complejidad, ubicación, presupuesto)
- Deploy de la Edge Function a producción (requiere Supabase configurado)
