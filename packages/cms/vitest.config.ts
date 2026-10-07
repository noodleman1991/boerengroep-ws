import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
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
          fileParallelism: false,
          hookTimeout: 120_000,
          testTimeout: 30_000,
        },
      },
    ],
  },
})
