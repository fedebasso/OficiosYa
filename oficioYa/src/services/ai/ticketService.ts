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
