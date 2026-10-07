/**
 * Addresses (without the locale prefix) that are served by a built-in route under
 * app/[locale], not by a CMS page. The catch-all content route must not prebuild
 * these, or its output would replace the built-in page.
 *
 * lib/reserved-paths.test.ts compares these lists with the folders on disk, so
 * adding or removing a built-in route without updating them fails the tests.
 */
export const RESERVED_PATHS = [
  '/activities/calendar',
  '/activities/past-events',
  '/library/podcast',
  '/news',
  '/news/friends-news',
  '/news/newsletter',
  '/newsletter/delete-data',
  '/newsletter/export-data',
  '/newsletter/unsubscribe',
  '/newsletter/verify',
  '/vacancies',
] as const

/** Built-in routes with a dynamic child own every address below them. */
export const RESERVED_PREFIXES = ['/activities/past-events/', '/news/friends-news/', '/news/newsletter/'] as const

export function isReservedPath(path: string): boolean {
  return (
    (RESERVED_PATHS as readonly string[]).includes(path) ||
    RESERVED_PREFIXES.some((prefix) => path.startsWith(prefix))
  )
}

/** Static params for the catch-all content route: every CMS page that no built-in route owns. */
export function contentStaticParams<L extends string>(
  paths: { locale: L; path: string }[],
): { locale: L; urlSegments: string[] }[] {
  return paths
    .filter((p) => p.path !== '/' && !isReservedPath(p.path))
    .map((p) => ({ locale: p.locale, urlSegments: p.path.slice(1).split('/') }))
}
