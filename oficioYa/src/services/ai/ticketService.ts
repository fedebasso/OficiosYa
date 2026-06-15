// src/services/ai/ticketService.ts
import type { TicketInput, GeneratedTicket } from '../../types/ticket'
import type { WorkType } from '../../store/requestStore'

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

const FALLBACK_TICKET: Omit<GeneratedTicket, 'category'> = {
  title: 'Trabajo de mantenimiento del hogar',
  description: 'Se requiere la intervención de un profesional para evaluar y resolver el problema detectado en el domicilio.',
  urgent: false,
  work_type: 'otro' as WorkType,
}

export async function analyzeTicket(input: TicketInput): Promise<GeneratedTicket> {
  // Mock: simula latencia de API IA
  await new Promise((resolve) => setTimeout(resolve, 2500))
  const mock = MOCK_TICKETS[input.category] ?? FALLBACK_TICKET
  return { ...mock, category: input.category }
}
