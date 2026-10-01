import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

function service({ failWrite = false, backendError = null, demo = true, requests = [] } = {}) {
  const storage = new Map()
  const source = readFileSync(new URL('../src/services/earningsService.ts', import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const dependencies = {
    './requestService': { requestService: { getAll: async () => requests } },
    '../lib/env': { IS_DEMO_MODE: demo },
    '../lib/week': {},
    '../lib/supabase': { getSupabase: async () => ({ from: () => ({
      update: () => ({ eq: async () => ({ error: backendError }) }),
    }) }) },
  }
  const exports = {}
  runInNewContext(outputText, {
    exports,
    require: (id) => { assert.ok(id in dependencies, id); return dependencies[id] },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => {
        if (failWrite) throw new Error('Quota exceeded')
        storage.set(key, value)
      },
    },
  })
  return { api: exports.earningsService, storage }
}

const job = {
  requestId: 'request-1', proId: 'new-pro', clientName: 'Cliente',
  category: 'electricista', amount: 1500, completedAt: '2026-09-29T12:00:00Z',
}

test('earnings report failed browser storage instead of claiming the charge was saved', async () => {
  const { api } = service({ failWrite: true })
  await assert.rejects(api.recordJob(job), /guardar/)
})

test('earnings propagate backend errors without writing a local success record', async () => {
  const { api, storage } = service({ demo: false, backendError: new Error('Backend unavailable') })
  await assert.rejects(api.recordJob(job), /Backend unavailable/)
  assert.equal(storage.size, 0)
})

test('retrying the same completion replaces the earning instead of duplicating it', async () => {
  const { api } = service()
  await api.recordJob(job)
  await api.recordJob({ ...job, amount: 1700 })
  const jobs = await api.getJobs('new-pro')
  assert.equal(jobs.length, 1)
  assert.equal(jobs[0].amount, 1700)
})

test('confirmed request recovers earnings without a second storage write and wins over an older copy', async () => {
  const requests = [{ id: 'request-1', professional_id: 'new-pro', status: 'completed', final_amount: 1800, completed_at: job.completedAt, category: 'electricista' }]
  const { api } = service({ requests })
  await api.recordJob(job)
  const jobs = await api.getJobs('new-pro')
  assert.equal(jobs.length, 1)
  assert.equal(jobs[0].amount, 1800)
  const fresh = service({ requests, failWrite: true })
  assert.equal((await fresh.api.getJobs('new-pro'))[0].amount, 1800)
})
