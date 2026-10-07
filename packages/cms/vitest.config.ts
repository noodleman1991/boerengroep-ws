import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Integration files share one database, so files never run in parallel.
    fileParallelism: false,
    projects: [
      {
        test: { name: 'unit', environment: 'node', include: ['src/**/*.test.ts'] },
      },
      {
        test: {
          name: 'int',
          environment: 'node',
          include: ['test/**/*.int.test.ts'],
          setupFiles: ['test/setup-env.ts'],
          hookTimeout: 120_000,
          testTimeout: 30_000,
        },
      },
    ],
  },
})
