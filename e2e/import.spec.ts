import { test, expect } from '@playwright/test'

// Minimal valid ontology in our internal JSON format
const VALID_ONTOLOGY_JSON = JSON.stringify({
  name: 'E2E Test Ontology',
  description: 'Created by Playwright import test',
  domain: 'testing',
  nodes: [
    { id: 'concept_a', type: 'class', label: 'Concept A', description: 'A test concept', semantics: '', examples: [] },
  ],
  edges: [],
})

// The capability tile heading that opens the unified modal on the Import tab
const OPEN_IMPORT_MODAL_TILE = 'Upload Ontology'
// The modal title (unified NewOntologyModal)
const IMPORT_MODAL_TITLE = 'New Ontology'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function login(page: any) {
  await page.request.post('/api/auth/test')
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/dashboard')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteTestOntologies(request: any) {
  await request.post('/api/auth/test')
  const res = await request.get('/api/ontologies')
  const ontologies = await res.json()
  for (const o of ontologies) {
    if (o.domain === 'testing') {
      await request.delete(`/api/ontologies/${o.id}`)
    }
  }
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

test.afterEach(async ({ request }) => {
  await deleteTestOntologies(request)
})

// ─── Modal UI ───────────────────────────────────────────────────────────────

test('import modal opens from home page', async ({ page }) => {
  await login(page)
  await page.getByRole('heading', { name: OPEN_IMPORT_MODAL_TILE, exact: true }).click()
  await expect(page.locator('.fixed.inset-0 h2')).toBeVisible()
})

test('import button is disabled with no file selected', async ({ page }) => {
  await login(page)
  await page.getByRole('heading', { name: OPEN_IMPORT_MODAL_TILE, exact: true }).click()
  const importBtn = page.getByRole('button', { name: /import →/i })
  await expect(importBtn).toBeDisabled()
})

test('cancel button closes the modal', async ({ page }) => {
  await login(page)
  await page.getByRole('heading', { name: OPEN_IMPORT_MODAL_TILE, exact: true }).click()
  const modalHeading = page.locator('.fixed.inset-0 h2')
  await expect(modalHeading).toBeVisible()
  await page.getByRole('button', { name: /cancel/i }).click()
  await expect(modalHeading).not.toBeVisible()
})


test('selecting a file shows filename and enables import button', async ({ page }) => {
  await login(page)
  await page.getByRole('heading', { name: OPEN_IMPORT_MODAL_TILE, exact: true }).click()

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('input[type="file"]').first().evaluate((el: HTMLInputElement) => el.click()),
  ])
  await fileChooser.setFiles({
    name: 'test-ontology.json',
    mimeType: 'application/json',
    buffer: Buffer.from(VALID_ONTOLOGY_JSON),
  })

  await expect(page.getByText('test-ontology.json')).toBeVisible()
  await expect(page.getByRole('button', { name: /import →/i })).toBeEnabled()
})

test('clearing selected file disables import button', async ({ page }) => {
  await login(page)
  await page.getByRole('heading', { name: OPEN_IMPORT_MODAL_TILE, exact: true }).click()

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('input[type="file"]').first().evaluate((el: HTMLInputElement) => el.click()),
  ])
  await fileChooser.setFiles({
    name: 'test-ontology.json',
    mimeType: 'application/json',
    buffer: Buffer.from(VALID_ONTOLOGY_JSON),
  })

  // Clear button is inside the modal overlay (.fixed.inset-0), scoped to avoid home-page buttons
  await page.locator('.fixed.inset-0 button:has(svg[width="14"])').click()
  await expect(page.getByRole('button', { name: /import →/i })).toBeDisabled()
})

// ─── JSON fast path (no Claude) ─────────────────────────────────────────────

test('importing valid JSON ontology redirects to editor', async ({ page }) => {
  await login(page)
  await page.getByRole('heading', { name: OPEN_IMPORT_MODAL_TILE, exact: true }).click()

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('input[type="file"]').first().evaluate((el: HTMLInputElement) => el.click()),
  ])
  await fileChooser.setFiles({
    name: 'e2e-ontology.json',
    mimeType: 'application/json',
    buffer: Buffer.from(VALID_ONTOLOGY_JSON),
  })

  await page.getByRole('button', { name: /import →/i }).click()

  // Should navigate to the ontology editor page
  await expect(page).toHaveURL(/\/ontology\/[a-f0-9-]+/, { timeout: 10_000 })
})

test('importing valid JSON ontology shows its name in the editor', async ({ page }) => {
  await login(page)
  await page.getByRole('heading', { name: OPEN_IMPORT_MODAL_TILE, exact: true }).click()

  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('input[type="file"]').first().evaluate((el: HTMLInputElement) => el.click()),
  ])
  await fileChooser.setFiles({
    name: 'e2e-named.json',
    mimeType: 'application/json',
    buffer: Buffer.from(VALID_ONTOLOGY_JSON),
  })

  await page.getByRole('button', { name: /import →/i }).click()
  await expect(page).toHaveURL(/\/ontology\/[a-f0-9-]+/, { timeout: 10_000 })

  // Ontology name should appear somewhere on the editor page
  await expect(page.getByText('E2E Test Ontology')).toBeVisible()
})

// ─── API: /api/ontologies/import ─────────────────────────────────────────────

test('POST /api/ontologies/import with no file returns 400', async ({ request }) => {
  // Authenticate first
  await request.post('/api/auth/test')

  const res = await request.post('/api/ontologies/import', {
    multipart: {},
  })
  expect(res.status()).toBe(400)
  const body = await res.json()
  expect(body.error).toBeTruthy()
})

test('POST /api/ontologies/import with valid JSON returns ontology', async ({ request }) => {
  await request.post('/api/auth/test')

  const res = await request.post('/api/ontologies/import', {
    multipart: {
      file: {
        name: 'api-test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(VALID_ONTOLOGY_JSON),
      },
    },
  })

  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.id).toBeTruthy()
  expect(body.name).toBe('E2E Test Ontology')
  expect(Array.isArray(body.nodes)).toBe(true)
  expect(Array.isArray(body.edges)).toBe(true)
})

test('POST /api/ontologies/import with valid JSON assigns positions to nodes', async ({ request }) => {
  await request.post('/api/auth/test')

  const res = await request.post('/api/ontologies/import', {
    multipart: {
      file: {
        name: 'positions-test.json',
        mimeType: 'application/json',
        buffer: Buffer.from(VALID_ONTOLOGY_JSON),
      },
    },
  })

  const body = await res.json()
  for (const node of body.nodes) {
    expect(node.position).toMatchObject({ x: expect.any(Number), y: expect.any(Number) })
  }
})
