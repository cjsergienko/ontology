/**
 * Open-edition AI quota e2e tests.
 *
 * No plan tiers. All users get full access. The only gate is a token quota:
 * TOKEN_LIMIT = 3000 output tokens per user (tracked in users.tokens_used).
 *
 * When tokens_used >= TOKEN_LIMIT, AI routes return HTTP 402.
 * Non-AI routes (create, export, list) are always open.
 *
 * Setup uses POST /api/auth/test/setup with tokensUsed to simulate quota state.
 */
import { test, expect } from '@playwright/test'

const VALID_ONTOLOGY_JSON = JSON.stringify({
  name: 'Limit Test Ontology',
  description: 'Used by quota tests',
  domain: 'e2e-limits',
  nodes: [
    { id: 'n1', type: 'class', label: 'Node 1', description: '', semantics: '', examples: [] },
  ],
  edges: [],
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function setup(request: any, opts: { tokensUsed?: number; fresh?: boolean } = {}) {
  const res = await request.post('/api/auth/test/setup', {
    data: {
      plan: 'free',
      tokensUsed: opts.tokensUsed ?? 0,
      fresh: opts.fresh ?? false,
    },
  })
  expect(res.ok()).toBe(true)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanup(request: any) {
  await request.delete('/api/auth/test/setup')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function postImport(request: any) {
  return request.post('/api/ontologies/import', {
    multipart: {
      file: {
        name: 'limit-test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(VALID_ONTOLOGY_JSON),
      },
    },
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createOntology(request: any, name = 'Limit Test') {
  return request.post('/api/ontologies', {
    data: { name, description: '', domain: 'e2e-limits' },
  })
}

// ─── Token quota gate ────────────────────────────────────────────────────────

test.describe('AI token quota', () => {
  test.afterEach(async ({ request }) => { await cleanup(request) })

  test('import is allowed when quota not reached', async ({ request }) => {
    await setup(request, { tokensUsed: 0 })
    const res = await postImport(request)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.id).toBeTruthy()
  })

  test('import is blocked (402) when token quota exceeded', async ({ request }) => {
    await setup(request, { tokensUsed: 3000 })
    const res = await postImport(request)
    expect(res.status()).toBe(402)
    const body = await res.json()
    expect(body.error).toBe('token_limit')
  })

  test('upload is blocked (402) when token quota exceeded', async ({ request }) => {
    await setup(request, { tokensUsed: 3000 })
    const res = await request.post('/api/ontologies/upload')
    expect(res.status()).toBe(402)
    const body = await res.json()
    expect(body.error).toBe('token_limit')
  })

  test('upload is allowed when quota not reached', async ({ request }) => {
    await setup(request, { tokensUsed: 0 })
    // No files → 400, but not 402 (quota check passes)
    const res = await request.post('/api/ontologies/upload')
    expect(res.status()).not.toBe(402)
  })
})

// ─── Non-AI routes are always open ───────────────────────────────────────────

test.describe('non-AI routes always open', () => {
  test.afterEach(async ({ request }) => { await cleanup(request) })

  test('ontology creation is unlimited even at max tokens', async ({ request }) => {
    await setup(request, { tokensUsed: 3000 })
    for (let i = 0; i < 5; i++) {
      const res = await createOntology(request, `Ontology ${i + 1}`)
      expect(res.status()).toBe(201)
    }
  })

  test('YAML export works for any user', async ({ request }) => {
    await setup(request, { fresh: true })
    const list = await request.get('/api/ontologies')
    const ontologies = await list.json()
    const id = ontologies[0].id
    const res = await request.get(`/api/ontologies/${id}/export`)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toMatch(/yaml/)
    const text = await res.text()
    expect(text).toMatch(/name:/)
  })

  test('YAML export works even when token quota exceeded', async ({ request }) => {
    await setup(request, { fresh: true, tokensUsed: 3000 })
    const list = await request.get('/api/ontologies')
    const ontologies = await list.json()
    const id = ontologies[0].id
    const res = await request.get(`/api/ontologies/${id}/export`)
    expect(res.status()).toBe(200)
  })
})
