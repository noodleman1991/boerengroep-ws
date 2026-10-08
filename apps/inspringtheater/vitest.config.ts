import { defineConfig } from 'vitest/config'

// The pages and components are tested where they live, in apps/boerengroep. The tests here
// only guard what ties this app to them.
export default defineConfig({
  test: { environment: 'node', include: ['*.test.ts'] },
})
