import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  retries: 0,
  use: { baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000' },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : // A local copy holds real addresses. The tests fill in forms, so this copy sends no mail.
      { command: 'EMAILS_OFF=1 pnpm start', url: 'http://localhost:3000/en', reuseExistingServer: true, timeout: 120_000 },
})
