import path from 'node:path'

/** Slug for events, newsletters, vacancies and past events. Capitals are kept. */
export function fileSlug(relPath: string): string {
  const name = path.posix.basename(relPath).replace(/\.(mdx?|json)$/, '')
  return name.replace(/[^A-Za-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
}

/** Slug for one page URL segment. Lowercase, single hyphens. */
export function pageSlug(segment: string): string {
  return segment
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
