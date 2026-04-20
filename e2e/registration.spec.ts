import { test, expect } from '@playwright/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function setupUser(request: any, opts: { fresh?: boolean } = {}) {
  const res = await request.post('/api/auth/test/setup', {
    data: { fresh: opts.fresh ?? false },
  })
  expect(res.ok()).toBe(true)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function cleanupUser(request: any) {
  await request.delete('/api/auth/test/setup')
}

// ─── New User Registration ────────────────────────────────────────────────────

test.describe('new user registration', () => {
  test.afterEach(async ({ request }) => {
    await cleanupUser(request)
  })

  test('new user is created in DB', async ({ request }) => {
    await setupUser(request, { fresh: true })
    const res = await request.get('/api/users/me')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.email).toBeTruthy()
  })

  test('new user gets exactly one seeded ontology', async ({ request }) => {
    await setupUser(request, { fresh: true })
    const res = await request.get('/api/ontologies')
    expect(res.status()).toBe(200)
    const ontologies = await res.json()
    expect(ontologies).toHaveLength(1)
  })

  test('dashboard loads for new user', async ({ page }) => {
    await setupUser(page.request, { fresh: true })
    await page.goto('/dashboard')
    await expect(page.locator('h1, [data-testid="dashboard"], .dashboard')).toBeTruthy()
    // No 500 error
    await expect(page.locator('text=/error/i')).not.toBeVisible()
  })
})
