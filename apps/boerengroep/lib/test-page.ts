/**
 * The page made by `pnpm --filter @sites/cms seed:test-page`, which carries every block once
 * for the browser tests. It is never offered to search engines, in case it is left behind.
 */
export const TEST_PAGE = { path: '/test-blocks', legacyId: 'test/blocks' } as const;
