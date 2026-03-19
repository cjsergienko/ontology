---
name: e2e-testing
description: Use this agent when writing, fixing, or running e2e tests in the e2e/ directory. Knows the Playwright setup, pre-push hook, test patterns, and common selector pitfalls for this codebase.
tools: Read, Edit, Write, Glob, Grep, Bash
---

# E2E Testing Agent — ontology.live

## Setup
- **Framework**: Playwright (`@playwright/test`)
- **Config**: `playwright.config.ts`
- **Test files**: `e2e/*.spec.ts`
- **Pre-push hook**: runs `npm run test:e2e` before every push — failures block the push

## Test files
| File | What it tests |
|------|--------------|
| `e2e/auth.spec.ts` | Auth redirects, login page, session endpoints |
| `e2e/import.spec.ts` | New Ontology modal (all 3 tabs), file import, API endpoints |

## Running tests
```bash
# Full suite
npm run test:e2e

# Single file
npx playwright test e2e/import.spec.ts

# With UI
npx playwright test --ui

# Headed (see browser)
npx playwright test --headed
```

## Auth helper pattern
Tests authenticate via the dev-only endpoint:
```typescript
async function login(page: any) {
  await page.request.post('/api/auth/test')
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/dashboard')
}
```

## Cleanup pattern
Tests that create ontologies clean up after themselves:
```typescript
test.afterEach(async ({ request }) => {
  await request.post('/api/auth/test')
  const res = await request.get('/api/ontologies')
  const ontologies = await res.json()
  for (const o of ontologies) {
    if (o.domain === 'testing') {
      await request.delete(`/api/ontologies/${o.id}`)
    }
  }
})
```
Always use `domain: 'testing'` in test ontologies for easy cleanup.

## Selector rules
- **Modal**: use `.fixed.inset-0 h2` to target modal heading (avoids ambiguity with page-level "New Ontology" button)
- **File inputs**: use `.first()` — the unified modal has two hidden `input[type="file"]` elements (import + analyze tabs)
- **Tab buttons**: `getByRole('button', { name: /tab label/i })`
- **Capability tiles**: `getByRole('heading', { name: 'Upload Ontology', exact: true })` — tiles use `<h3>` not `<button>`
- **Submit buttons**: match exact label text e.g. `getByRole('button', { name: /import →/i })`

## Common failure causes
1. **Modal text ambiguity** — "New Ontology" appears as both a page button and modal h2 → scope to `.fixed.inset-0`
2. **Multiple file inputs** — always `.first()` for the import tab input
3. **Selector stale after UI refactor** — check if a button became a div or vice versa
4. **Pre-push linter revert** — if linter reverts test changes, verify the committed version on GitHub and re-sync

## Adding new tests
- Keep API-level tests (no browser) separate from UI interaction tests
- API tests go after `// ─── API: /api/... ───` comment blocks
- Use `Buffer.from(JSON.stringify(...))` for file uploads in API tests
