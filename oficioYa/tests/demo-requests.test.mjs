import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

function demo() {
  const storage = new Map()
  let user = { id: 'mock-client-1', role: 'client' }
  let released = null
  let nextId = 0
  let failWrite = false
  const source = readFileSync(new URL('../src/services/requestService.ts', import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const dependencies = {
    '../lib/visitFlow': (() => {
      const exports = {}
      const code = readFileSync(new URL('../src/lib/visitFlow.ts', import.meta.url), 'utf8')
      runInNewContext(ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports })
      return exports
    })(),
    '../lib/supabase': { getSupabase() { throw new Error('Unexpected backend call') } },
    '../lib/env': { IS_DEMO_MODE: true },
    './authService': { authService: { getSession: async () => user } },
    '../store/availabilityStore': {
      useAvailabilityStore: { getState: () => ({
        schedules: {},
        removeBooking: (id) => { released = id },
      }) },
    },
  }
  function reload() {
    const exports = {}
    runInNewContext(outputText, {
      exports,
      require: (id) => {
        assert.ok(id in dependencies, id)
        return dependencies[id]
      },
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => { if (failWrite) throw new Error('Quota'); storage.set(key, value) },
      },
      crypto: { randomUUID: () => 'request-' + ++nextId },
    })
    return exports.requestService
  }
  return { reload, login: (value) => { user = value }, released: () => released, failWrites: (value) => { failWrite = value } }
}

const input = {
  professional_id: '1', category: 'electricista',
  description: 'Instalar un enchufe', urgency: false,
}

test('client request survives reload and professional cancellation is shared', async () => {
  const context = demo()
  const created = await context.reload().create(input)
  assert.equal(created.client_id, 'mock-client-1')
  context.login({ id: 'mock-pro-1', role: 'professional' })
  const pro = context.reload()
  assert.ok((await pro.getAll()).some((r) => r.id === created.id))
  await pro.updateStatus(created.id, 'cancelled')
  assert.equal(context.released(), created.id)
  context.login({ id: 'mock-client-1', role: 'client' })
  const request = (await context.reload().getAll()).find((r) => r.id === created.id)
  assert.equal(request.status, 'cancelled')
})

test('requests are isolated by account and guests cannot submit', async () => {
  const context = demo()
  await context.reload().create(input)
  context.login({ id: 'another-client', role: 'client' })
  assert.equal((await context.reload().getAll()).length, 0)
  context.login(null)
  await assert.rejects(context.reload().create(input), /Iniciá sesión/)
})

test('duplicate active appointment is rejected and cancellation allows retry', async () => {
  const context = demo()
  const api = context.reload()
  const appointment = { ...input, scheduled_date: '2030-10-01T10:00:00' }
  const created = await api.create(appointment)
  await assert.rejects(api.create(appointment), /Ya existe una solicitud/)
  await api.updateStatus(created.id, 'cancelled')
  const replacement = await api.create(appointment)
  assert.notEqual(replacement.id, created.id)
})

test('visit confirmation survives reload and failed writes do not partially complete the request', async () => {
  const context = demo()
  context.login({ id: 'mock-pro-1', role: 'professional' })
  await context.reload().updateVisit('201', { type: 'submit', report: {
    kind: 'resolved', description: 'Reparación del panel eléctrico', labor: 1500, materials: 300, other: 0, duration: '', validUntil: '',
  } })
  context.login({ id: 'mock-client-1', role: 'client' })
  context.failWrites(true)
  await assert.rejects(context.reload().updateVisit('201', { type: 'respond', version: 1, decision: 'accepted' }), /guardar/)
  let request = (await context.reload().getAll()).find((r) => r.id === '201')
  assert.equal(request.status, 'confirmed')
  assert.equal(request.visitReports[0].response, undefined)
  context.failWrites(false)
  await context.reload().updateVisit('201', { type: 'respond', version: 1, decision: 'accepted' })
  request = (await context.reload().getAll()).find((r) => r.id === '201')
  assert.equal(request.status, 'completed')
  assert.equal(request.final_amount, 1800)
  assert.ok(request.completed_at)
})
