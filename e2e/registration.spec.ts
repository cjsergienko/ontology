import { test, expect } from '@playwright/test'

// Helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function setupPlanUser(request: any, opts: { plan?: string; fresh?: boolean } = {}) {
  const res = await request.post('/api/auth/test/setup', {
    data: { plan: opts.plan ?? 'free', fresh: opts.fresh ?? false },
  })
  expect(res.ok()).toBe(true)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanupPlanUser(request: any) {
  await request.delete('/api/auth/test/setup')
}

// ─── New User Registration ────────────────────────────────────────────────────

test.describe('new user registration', () => {
  test.afterEach(async ({ request }) => {
    await cleanupPlanUser(request)
  })

  test('new user starts on free plan', async ({ request }) => {
    await setupPlanUser(request, { fresh: true })
    const res = await request.get('/api/users/me')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.plan).toBe('free')
  })

  test('new user gets exactly one seeded ontology', async ({ request }) => {
    await setupPlanUser(request, { fresh: true })
    const res = await request.get('/api/ontologies')
    expect(res.status()).toBe(200)
    const ontologies = await res.json()
    expect(ontologies).toHaveLength(1)
  })

  test('dashboard shows free plan badge for new user', async ({ page }) => {
    await setupPlanUser(page.request, { fresh: true })
    await page.goto('/dashboard')
    // Plan badge text is uppercase — match case-insensitively
    await expect(page.locator('text=/free/i').first()).toBeVisible()
  })
})

// ─── Plan Badge on Dashboard ──────────────────────────────────────────────────

test.describe('plan badge on dashboard', () => {
  test.afterEach(async ({ request }) => {
    await cleanupPlanUser(request)
  })

  for (const plan of ['starter', 'pro', 'business'] as const) {
    test(`dashboard shows ${plan} plan badge`, async ({ page }) => {
      await setupPlanUser(page.request, { plan })
      await page.goto('/dashboard')
      await expect(page.locator(`text=/${plan}/i`).first()).toBeVisible()
    })
  }
})
