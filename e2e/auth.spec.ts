import { test, expect } from '@playwright/test'

test('unauthenticated user is redirected to /login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible()
})

test('/login shows Google sign-in button', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible()
})

test('/login is accessible without a session', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveURL(/\/login/)
})

test('unauthenticated API call returns 401 or redirects', async ({ request }) => {
  const res = await request.get('/api/ontologies')
  expect([200, 307, 401]).toContain(res.status())
  if (res.status() === 200) {
    const text = await res.text()
    // Should be login page HTML if redirected
    expect(text.toLowerCase()).toContain('sign in')
  }
})

test('test session endpoint sets cookie in dev', async ({ request }) => {
  const res = await request.post('/api/auth/test')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.ok).toBe(true)
  const setCookies = res.headersArray().filter(h => h.name.toLowerCase() === 'set-cookie')
  const sessionCookie = setCookies.find(h => h.value.includes('ontology_test_session=1'))
  expect(sessionCookie?.value).toContain('ontology_test_session=1')
})

test('authenticated user can access /dashboard', async ({ page }) => {
  await page.request.post('/api/auth/test')
  await page.goto('/dashboard')
  await expect(page).not.toHaveURL(/\/login/)
})
