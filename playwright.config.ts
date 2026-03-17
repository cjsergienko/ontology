import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3900',
  },
  // No webServer — tests run against the already-running PM2 dev server
})
