import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'

// Exercise the hook's orchestration with controlled asynchronous persistence.
function completion(onCompleted) {
  const events = []
  const req = { id: 'request-1', professional_id: '1', client_id: null, category: 'electricista' }
  const dependencies = {
    react: { useState: () => [req, () => events.push('closed')], useCallback: (fn) => fn },
    '../services/earningsService': { earningsService: { recordJob: async () => events.push('earning') } },
    '../services/chatService': { chatService: {} },
    '../store/toastStore': { useToastStore: () => () => events.push('toast') },
    '../lib/money': { formatUYU: (amount) => String(amount) },
  }
  const source = readFileSync(new URL('../src/hooks/useCompleteJob.ts', import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const exports = {}
  runInNewContext(outputText, { exports, require: (id) => {
    assert.ok(id in dependencies, id)
    return dependencies[id]
  } })
  return { hook: exports.useCompleteJob(onCompleted), events }
}

test('completion waits for the request to save before recording earnings or announcing success', async () => {
  let saved
  const pending = new Promise((resolve) => { saved = resolve })
  const { hook, events } = completion(() => pending)
  const result = hook.confirm(1500)
  try {
    assert.deepEqual(events, [])
  } finally {
    saved()
    await result
  }
  assert.deepEqual(events, ['earning', 'closed', 'toast'])
})

test('a failed request save keeps the sheet open and does not record earnings or show success', async () => {
  const { hook, events } = completion(async () => { throw new Error('Storage full') })
  await assert.rejects(hook.confirm(1500), /Storage full/)
  assert.deepEqual(events, [])
})
