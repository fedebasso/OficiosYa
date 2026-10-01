import type { ServiceRequest } from '../store/requestStore'

export interface VisitInput {
  kind: 'resolved' | 'quote' | 'evaluation'
  description: string
  labor: number
  materials: number
  other: number
  duration: string
  validUntil: string
}
export type VisitDecision = 'accepted' | 'rejected' | 'changes_requested'
export interface VisitReport extends VisitInput {
  version: number
  total: number
  createdAt: string
  authorId: string
  sourceQuoteVersion?: number
  response?: { decision: VisitDecision; note: string; at: string; authorId: string }
}
export type VisitCommand = { type: 'submit'; report: VisitInput } |
  { type: 'complete_quote'; quoteVersion: number; report: VisitInput } |
  { type: 'respond'; version: number; decision: VisitDecision; note?: string }

export function visitSuccessMessage(command: Pick<VisitCommand, 'type'>) {
  if (command.type === 'respond') return 'Tu respuesta quedó guardada.'
  if (command.type === 'complete_quote') return 'Cierre enviado al cliente.'
  return 'Enviado al cliente.'
}

const professionalId = (id: string) => id === 'mock-pro-1' ? '1' : id

export function updateVisit(req: ServiceRequest, actor: { id: string; role: string }, command: VisitCommand, now: string): ServiceRequest {
  if (!['confirmed', 'in_progress'].includes(req.status)) throw new Error('La visita debe estar aceptada y el trabajo debe seguir abierto.')
  const reports = req.visitReports ?? []
  const latest = reports.at(-1)
  if (command.type === 'submit') {
    if (actor.role !== 'professional' || professionalId(actor.id) !== professionalId(req.professional_id)) throw new Error('Solo el profesional asignado puede registrar la visita.')
    if (latest && (!latest.response || latest.response.decision === 'accepted')) throw new Error('El último envío está pendiente o ya fue aceptado.')
    const input = command.report
    if (!['resolved', 'quote', 'evaluation'].includes(input.kind) || input.description.trim().length < 10) throw new Error('Describí lo realizado o propuesto con al menos 10 caracteres.')
    const amounts = [input.labor, input.materials, input.other]
    if (amounts.some((n) => !Number.isFinite(n) || n < 0 || n > 500000)) throw new Error('Ingresá importes entre $0 y $500.000.')
    const total = Math.round(amounts.reduce((a, b) => a + b, 0) * 100) / 100
    if (total > 500000) throw new Error('El total máximo es $500.000.')
    if (input.kind === 'quote' && (!input.duration.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(input.validUntil) || !Number.isFinite(Date.parse(input.validUntil)) || input.validUntil < now.slice(0, 10))) throw new Error('Completá duración y una fecha de validez vigente.')
    const report: VisitReport = { ...input, description: input.description.trim(), total, version: reports.length + 1, createdAt: now, authorId: actor.id }
    return { ...req, visitReports: [...reports, report] }
  }
  if (command.type === 'complete_quote') {
    if (actor.role !== 'professional' || professionalId(actor.id) !== professionalId(req.professional_id)) throw new Error('Solo el profesional asignado puede cerrar el trabajo.')
    if (!latest || latest.kind !== 'quote' || latest.version !== command.quoteVersion || latest.response?.decision !== 'accepted') throw new Error('El presupuesto aceptado cambió. Recargá el trabajo antes de cerrarlo.')
    const input = command.report
    if (input.description.trim().length < 10) throw new Error('Describí el trabajo terminado con al menos 10 caracteres.')
    const amounts = [input.labor, input.materials, input.other]
    if (amounts.some((n) => !Number.isFinite(n) || n < 0 || n > 500000)) throw new Error('Ingresá importes entre $0 y $500.000.')
    const total = Math.round(amounts.reduce((a, b) => a + b, 0) * 100) / 100
    if (total > 500000) throw new Error('El total máximo es $500.000.')
    const report: VisitReport = {
      ...input,
      kind: 'resolved',
      description: input.description.trim(),
      duration: '',
      validUntil: '',
      total,
      version: reports.length + 1,
      sourceQuoteVersion: latest.version,
      createdAt: now,
      authorId: actor.id,
    }
    return { ...req, status: 'in_progress', visitReports: [...reports, report] }
  }
  if (actor.role !== 'client' || actor.id !== req.client_id) throw new Error('Solo el cliente de esta solicitud puede responder.')
  if (!latest || latest.version !== command.version || latest.response) throw new Error('Este envío ya cambió. Recargá el trabajo antes de responder.')
  if (!['accepted', 'rejected', 'changes_requested'].includes(command.decision)) throw new Error('Respuesta inválida.')
  if (command.decision === 'rejected' && latest.kind !== 'quote') throw new Error('Pedí una aclaración del resumen antes de confirmarlo.')
  if (command.decision !== 'accepted' && !command.note?.trim()) throw new Error('Agregá un motivo para que el profesional pueda responder.')
  if (command.decision === 'accepted' && latest.kind === 'quote' && latest.validUntil < now.slice(0, 10)) throw new Error('Este presupuesto venció. Pedí una versión actualizada.')
  const updated: VisitReport = { ...latest, response: { decision: command.decision, note: command.note?.trim() ?? '', at: now, authorId: actor.id } }
  const completed = command.decision === 'accepted' && latest.kind !== 'quote'
  return { ...req, visitReports: [...reports.slice(0, -1), updated], ...(completed ? { status: 'completed', final_amount: latest.total, completed_at: now } : {}) }
}
