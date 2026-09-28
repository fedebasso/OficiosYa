import type { TicketInput, GeneratedTicket } from '../../types/ticket'
import type { WorkType } from '../../store/requestStore'
import { IS_DEMO_MODE } from '../../lib/env'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

/* ── Mock fallback ── */
function mockResult(input: TicketInput): GeneratedTicket {
  const description = input.text.trim()
  return {
    title: 'Solicitud de servicio',
    description: description || 'El cliente adjuntó una foto. Coordiná los detalles del trabajo por chat.',
    category: input.category,
    urgent: false,
    work_type: 'otro',
  }
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

    // 422 = no_match: el problema no corresponde a servicios del hogar
    if (res.status === 422) throw new Error('NO_MATCH')

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
  } catch (err) {
    // NO_MATCH: relanzar para que el frontend muestre el error al usuario
    if (err instanceof Error && err.message === 'NO_MATCH') throw err
    // Cualquier otro error (red, timeout, etc): fallback silencioso al mock
    await new Promise((r) => setTimeout(r, 500))
    return mockResult(input)
  }
}
