# Fase1-IA Task 2: Edge Function analyze-ticket

**Working directory:** `C:\Users\fede8\Documents\OficiosYa`

## Contexto

Crear la Supabase Edge Function que actúa como proxy seguro entre el frontend y Claude API. El directorio `supabase/functions/` debe crearse en la RAÍZ del repo (`C:\Users\fede8\Documents\OficiosYa\`), NO dentro de `oficioYa/`.

## Archivo a crear

`supabase/functions/analyze-ticket/index.ts`

## Contenido completo del archivo

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SYSTEM_PROMPT = `Sos un asistente especializado en servicios del hogar en Uruguay (electricidad, sanitario, aire acondicionado, cerrajería, pintura, albañilería).

Analizá la descripción y/o imagen del problema que te envía un cliente.

PRIMERO: determiná si el problema corresponde a un servicio del hogar. Si la descripción o imagen no tiene nada que ver con servicios del hogar (por ejemplo: es una consulta médica, un pedido de comida, una foto de persona, algo irrelevante), respondé ÚNICAMENTE con:
{ "no_match": true }

Si SÍ corresponde a un servicio del hogar, generá un ticket estructurado respondiendo ÚNICAMENTE con JSON válido, sin texto adicional:
{
  "title": "Título breve del problema (máx 60 caracteres)",
  "description": "Descripción profesional del trabajo requerido (2-3 oraciones)",
  "urgent": true,
  "work_type": "reparacion"
}

Valores válidos para work_type: "reparacion", "instalacion", "mantenimiento", "otro"
Criterios de urgencia: marcá urgent=true si hay riesgo de seguridad, daño progresivo, o el cliente menciona urgencia.
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

    // Si Claude devolvió no_match, retornar 422
    if (ticket.no_match) {
      return new Response(JSON.stringify({ no_match: true }), {
        status: 422,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

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

## Pasos

1. Crear directorio `supabase/functions/analyze-ticket/` en `C:\Users\fede8\Documents\OficiosYa\`
2. Crear el archivo con el contenido exacto arriba
3. Commit desde la raíz del repo:

```bash
git add supabase/functions/analyze-ticket/index.ts
git commit -m "feat: Edge Function analyze-ticket con Claude API y detección no_match"
```

## Constraints

- El archivo va en `supabase/functions/analyze-ticket/index.ts` relativo a la RAÍZ (`C:\Users\fede8\Documents\OficiosYa\`)
- No modificar ningún archivo de `oficioYa/`
- El contenido del archivo debe ser EXACTAMENTE el código de arriba, sin cambios

## Reporte

Escribir en `C:\Users\fede8\Documents\OficiosYa\briefs\fase1-task2-report.md`.
Devolver: STATUS, commit hash, una línea de resumen.
