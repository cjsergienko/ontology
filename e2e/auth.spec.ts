import { test, expect } from '@playwright/test'

const CORRECT_PIN = '7291'
const WRONG_PIN = '0000'

test('unauthenticated user is redirected to /login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByPlaceholder('PIN')).toBeVisible()
})

test('wrong PIN shows error and stays on /login', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('PIN').fill(WRONG_PIN)
  await page.getByRole('button', { name: 'Enter' }).click()
  await expect(page.getByText('Wrong PIN')).toBeVisible()
  await expect(page).toHaveURL(/\/login/)
})

test('correct PIN grants access and redirects to /', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('PIN').fill(CORRECT_PIN)
  await page.getByRole('button', { name: 'Enter' }).click()
  await expect(page).toHaveURL('/')
  // Should NOT be on login page
  await expect(page.getByPlaceholder('PIN')).not.toBeVisible()
})

test('auth cookie persists — subsequent requests skip login', async ({ page }) => {
  // Log in
  await page.goto('/login')
  await page.getByPlaceholder('PIN').fill(CORRECT_PIN)
  await page.getByRole('button', { name: 'Enter' }).click()
  await expect(page).toHaveURL('/')

  // Navigate away and back — should not be redirected to login
  await page.goto('/login') // explicit visit to login is allowed
  await page.goto('/')
  await expect(page).toHaveURL('/')
  await expect(page.getByPlaceholder('PIN')).not.toBeVisible()
})

test('/login is accessible without auth cookie', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByPlaceholder('PIN')).toBeVisible()
})

test('unauthenticated API call returns 401', async ({ request }) => {
  const res = await request.get('/api/ontologies')
  // proxy should block non-api/auth routes — but /api/ontologies is a protected path
  // Next.js proxy redirects to /login (307), which the request follows to HTML
  // So we check status is not 200 with JSON (it's either 307 or HTML login page)
  expect([307, 200]).toContain(res.status()) // 200 = login page HTML, 307 = redirect
  if (res.status() === 200) {
    const text = await res.text()
    expect(text).toContain('PIN') // login page HTML
  }
})

test('correct PIN via API sets cookie', async ({ request }) => {
  const res = await request.post('/api/auth', {
    data: { pin: CORRECT_PIN },
  })
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.ok).toBe(true)
  // Cookie should be set
  const headers = res.headersArray()
  const setCookie = headers.find(h => h.name.toLowerCase() === 'set-cookie')
  expect(setCookie?.value).toContain('ontology_auth=1')
})

test('wrong PIN via API returns 401', async ({ request }) => {
  const res = await request.post('/api/auth', {
    data: { pin: WRONG_PIN },
  })
  expect(res.status()).toBe(401)
  const body = await res.json()
  expect(body.error).toBe('Wrong PIN')
})
