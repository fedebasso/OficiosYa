import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

const source = readFileSync(new URL('../src/lib/visitFlow.ts', import.meta.url), 'utf8')
const exports = {}
runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports })
const { updateVisit, visitSuccessMessage } = exports
const req = { id: 'r1', professional_id: '1', client_id: 'client-1', status: 'confirmed' }
const pro = { id: 'mock-pro-1', role: 'professional' }
const client = { id: 'client-1', role: 'client' }
const now = '2026-09-30T12:00:00Z'
const report = { kind: 'resolved', description: 'Reemplacé el enchufe', labor: 1000, materials: 300, other: 0, duration: '', validUntil: '' }
const submit = (r = req, data = report) => updateVisit(r, pro, { type: 'submit', report: data }, now)
const respond = (r, decision = 'accepted', version = 1) => updateVisit(r, client, { type: 'respond', version, decision, note: decision === 'changes_requested' ? 'Revisar materiales' : '' }, now)

test('resolved visit requires client confirmation and stores amount with completion', () => {
  const sent = submit()
  assert.equal(sent.status, 'confirmed')
  assert.equal(sent.visitReports[0].total, 1300)
  const confirmed = respond(sent)
  assert.equal(confirmed.status, 'completed')
  assert.equal(confirmed.final_amount, 1300)
  assert.equal(confirmed.completed_at, now)
  assert.throws(() => respond(confirmed))
})
test('only the assigned professional can submit and the client can respond', () => {
  assert.throws(() => updateVisit(req, client, { type: 'submit', report }, now))
  assert.throws(() => updateVisit(req, { ...pro, id: 'other' }, { type: 'submit', report }, now))
  assert.throws(() => updateVisit(submit(), pro, { type: 'respond', version: 1, decision: 'accepted' }, now))
})
test('rejects invalid money and terminal or unaccepted requests', () => {
  for (const labor of [-1, NaN, Infinity, 1000001]) assert.throws(() => submit(req, { ...report, labor }))
  for (const status of ['pending', 'completed', 'cancelled']) assert.throws(() => submit({ ...req, status }))
})
test('revisions retain prior response and stale versions cannot be accepted', () => {
  const first = respond(submit(), 'changes_requested')
  const second = submit(first, { ...report, materials: 200 })
  assert.equal(second.visitReports.length, 2)
  assert.equal(second.visitReports[0].response.note, 'Revisar materiales')
  assert.equal(second.visitReports[1].total, 1200)
  assert.throws(() => respond(second, 'accepted', 1))
  assert.equal(respond(second, 'accepted', 2).final_amount, 1200)
})
test('accepting a quote does not complete work or create earnings', () => {
  const sent = submit(req, { ...report, kind: 'quote', duration: '2 horas', validUntil: '2026-10-10' })
  const accepted = respond(sent)
  assert.equal(accepted.status, 'confirmed')
  assert.equal(accepted.final_amount, undefined)
  assert.throws(() => submit(accepted))
})
test('professional closes an accepted quote with the actual cost and client confirms it', () => {
  const quoted = submit(req, { ...report, kind: 'quote', labor: 1000, materials: 300, duration: '2 horas', validUntil: '2026-10-10' })
  const accepted = respond(quoted)
  const finished = updateVisit(accepted, pro, {
    type: 'complete_quote',
    quoteVersion: 1,
    report: { ...report, description: 'Trabajo terminado según lo coordinado', labor: 1200, materials: 350 },
  }, '2026-10-01T15:00:00Z')

  assert.equal(finished.status, 'in_progress')
  assert.equal(finished.visitReports.length, 2)
  assert.equal(finished.visitReports[1].kind, 'resolved')
  assert.equal(finished.visitReports[1].sourceQuoteVersion, 1)
  assert.equal(finished.visitReports[1].total, 1550)
  assert.equal(finished.final_amount, undefined)

  const completed = updateVisit(finished, client, { type: 'respond', version: 2, decision: 'accepted' }, '2026-10-01T16:00:00Z')
  assert.equal(completed.status, 'completed')
  assert.equal(completed.final_amount, 1550)
})
test('quote completion requires its assigned professional and latest accepted quote', () => {
  const quoted = submit(req, { ...report, kind: 'quote', duration: '2 horas', validUntil: '2026-10-10' })
  const pending = { type: 'complete_quote', quoteVersion: 1, report }
  assert.throws(() => updateVisit(quoted, pro, pending, '2026-10-01T15:00:00Z'))

  const accepted = respond(quoted)
  assert.throws(() => updateVisit(accepted, client, pending, '2026-10-01T15:00:00Z'))
  assert.throws(() => updateVisit(accepted, pro, { ...pending, quoteVersion: 99 }, '2026-10-01T15:00:00Z'))
})
test('quote completion confirms that the closing report was sent', () => {
  assert.equal(visitSuccessMessage({ type: 'complete_quote' }), 'Cierre enviado al cliente.')
  assert.equal(visitSuccessMessage({ type: 'respond' }), 'Tu respuesta quedó guardada.')
})
test('expired quotes cannot be accepted and pending proposals cannot be overwritten', () => {
  const sent = submit(req, { ...report, kind: 'quote', duration: '2 horas', validUntil: '2026-10-10' })
  assert.throws(() => updateVisit(sent, client, { type: 'respond', version: 1, decision: 'accepted' }, '2026-10-12T12:00:00Z'))
  assert.throws(() => submit(sent))
})
