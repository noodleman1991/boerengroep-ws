import { defineConfig } from '@playwright/test'

// The accessibility and screen-size tests are the shared ones, run against this site's pages.
// What only this site has is tested in ./e2e.
process.env.E2E_SITE = 'inspringtheater'

export default defineConfig({
  retries: 0,
  use: { baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3001' },
  projects: [
    { name: 'shared', testDir: '../boerengroep/e2e', testMatch: /(a11y|responsive)\.spec\.ts/ },
    { name: 'site', testDir: './e2e' },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: 'EMAILS_OFF=1 pnpm start', url: 'http://localhost:3001/en', reuseExistingServer: true, timeout: 120_000 },
})
