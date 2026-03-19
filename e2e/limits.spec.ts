/**
 * Plan limit enforcement e2e tests.
 *
 * Each test uses the plan test user (e2e-plan@ontology.live) configured via
 * POST /api/auth/test/setup.  The endpoint sets the session cookie and
 * directly writes plan / usage counters to the DB so we can simulate any
 * state without going through Stripe or making real Claude calls.
 *
 * Limits by plan:
 *   free:     2 ontologies, 0 imports/month, 0 analyzes/month, no YAML export
 *   starter:  10 ontologies, 10 imports/month, 0 analyzes/month, YAML export
 *   pro:      unlimited ontologies, 100 imports/month, 20 analyzes/month, YAML export
 *   business: unlimited everything, YAML export
 */
import { test, expect } from '@playwright/test'

const VALID_ONTOLOGY_JSON = JSON.stringify({
  name: 'Limit Test Ontology',
  description: 'Used by plan limit tests',
  domain: 'e2e-limits',
  nodes: [
    { id: 'n1', type: 'class', label: 'Node 1', description: '', semantics: '', examples: [] },
  ],
  edges: [],
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function setup(request: any, opts: {
  plan: string
  importCount?: number
  analyzeCount?: number
  fresh?: boolean
}) {
  const res = await request.post('/api/auth/test/setup', {
    data: {
      plan: opts.plan,
      importCount: opts.importCount ?? 0,
      analyzeCount: opts.analyzeCount ?? 0,
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

// ─── Free Plan ───────────────────────────────────────────────────────────────

test.describe('free plan limits', () => {
  test.afterEach(async ({ request }) => { await cleanup(request) })

  test('import is blocked (0 imports/month)', async ({ request }) => {
    await setup(request, { plan: 'free' })
    const res = await postImport(request)
    expect(res.status()).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/plan|limit|upgrade/i)
  })

  test('analyze/upload is blocked (0 analyzes/month)', async ({ request }) => {
    await setup(request, { plan: 'free' })
    // Plan check fires before reading form data, so empty body is fine
    const res = await request.post('/api/ontologies/upload')
    expect(res.status()).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/plan|limit|upgrade/i)
  })

  test('creating 3rd ontology is blocked (2 ontology limit)', async ({ request }) => {
    // fresh=true seeds 1 demo ontology; create 1 more → total 2 = limit reached
    await setup(request, { plan: 'free', fresh: true })

    const first = await createOntology(request, 'First')
    expect(first.status()).toBe(201)

    const third = await createOntology(request, 'Third')
    expect(third.status()).toBe(403)
    const body = await third.json()
    expect(body.error).toMatch(/plan|limit|upgrade/i)
  })
})

// ─── Starter Plan ────────────────────────────────────────────────────────────

test.describe('starter plan limits', () => {
  test.afterEach(async ({ request }) => { await cleanup(request) })

  test('import is allowed below limit', async ({ request }) => {
    await setup(request, { plan: 'starter', importCount: 0 })
    const res = await postImport(request)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.id).toBeTruthy()
  })

  test('import is blocked when monthly limit reached (10/10)', async ({ request }) => {
    await setup(request, { plan: 'starter', importCount: 10 })
    const res = await postImport(request)
    expect(res.status()).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/plan|limit|upgrade/i)
  })

  test('analyze/upload is blocked (0 analyzes/month)', async ({ request }) => {
    await setup(request, { plan: 'starter' })
    const res = await request.post('/api/ontologies/upload')
    expect(res.status()).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/plan|limit|upgrade/i)
  })

  test('creating 11th ontology is blocked (10 ontology limit)', async ({ request }) => {
    // Setup seeds 1 demo ontology; create 9 more to reach the limit of 10
    await setup(request, { plan: 'starter' })
    for (let i = 0; i < 9; i++) {
      const res = await createOntology(request, `Ontology ${i + 1}`)
      expect(res.status()).toBe(201)
    }
    const overLimit = await createOntology(request, 'Over Limit')
    expect(overLimit.status()).toBe(403)
  })
})

// ─── Pro Plan ────────────────────────────────────────────────────────────────

test.describe('pro plan limits', () => {
  test.afterEach(async ({ request }) => { await cleanup(request) })

  test('import is allowed below limit (99/100)', async ({ request }) => {
    await setup(request, { plan: 'pro', importCount: 99 })
    const res = await postImport(request)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.id).toBeTruthy()
  })

  test('import is blocked when monthly limit reached (100/100)', async ({ request }) => {
    await setup(request, { plan: 'pro', importCount: 100 })
    const res = await postImport(request)
    expect(res.status()).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/plan|limit|upgrade/i)
  })

  test('analyze is blocked when monthly limit reached (20/20)', async ({ request }) => {
    await setup(request, { plan: 'pro', analyzeCount: 20 })
    const res = await request.post('/api/ontologies/upload')
    expect(res.status()).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/plan|limit|upgrade/i)
  })

  test('ontology creation is unlimited', async ({ request }) => {
    await setup(request, { plan: 'pro' })
    // Create 15 ontologies without hitting a limit
    for (let i = 0; i < 15; i++) {
      const res = await createOntology(request, `Pro Ontology ${i + 1}`)
      expect(res.status()).toBe(201)
    }
  })
})

// ─── YAML Export ─────────────────────────────────────────────────────────────

test.describe('yaml export', () => {
  test.afterEach(async ({ request }) => { await cleanup(request) })

  test('free plan cannot export YAML (403)', async ({ request }) => {
    await setup(request, { plan: 'free', fresh: true })
    // Get the seeded ontology id
    const list = await request.get('/api/ontologies')
    const ontologies = await list.json()
    const id = ontologies[0].id
    const res = await request.get(`/api/ontologies/${id}/export`)
    expect(res.status()).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/plan|upgrade/i)
  })

  test('starter plan can export YAML (200)', async ({ request }) => {
    await setup(request, { plan: 'starter', fresh: true })
    const list = await request.get('/api/ontologies')
    const ontologies = await list.json()
    const id = ontologies[0].id
    const res = await request.get(`/api/ontologies/${id}/export`)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toMatch(/yaml/)
    const text = await res.text()
    expect(text).toMatch(/name:/)
  })

  test('pro plan can export YAML (200)', async ({ request }) => {
    await setup(request, { plan: 'pro', fresh: true })
    const list = await request.get('/api/ontologies')
    const ontologies = await list.json()
    const id = ontologies[0].id
    const res = await request.get(`/api/ontologies/${id}/export`)
    expect(res.status()).toBe(200)
  })
})

// ─── Business Plan ───────────────────────────────────────────────────────────

test.describe('business plan limits', () => {
  test.afterEach(async ({ request }) => { await cleanup(request) })

  test('import is unlimited (importCount at 9999)', async ({ request }) => {
    await setup(request, { plan: 'business', importCount: 9999 })
    const res = await postImport(request)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.id).toBeTruthy()
  })

  test('analyze is unlimited (analyzeCount at 9999)', async ({ request }) => {
    // Plan check fires before reading form data; with unlimited plan it passes
    // and the route proceeds to read form data (returns 400/500 — not 403).
    await setup(request, { plan: 'business', analyzeCount: 9999 })
    const res = await request.post('/api/ontologies/upload')
    expect(res.status()).not.toBe(403)
  })

  test('ontology creation is unlimited', async ({ request }) => {
    await setup(request, { plan: 'business' })
    for (let i = 0; i < 15; i++) {
      const res = await createOntology(request, `Business Ontology ${i + 1}`)
      expect(res.status()).toBe(201)
    }
  })
})
