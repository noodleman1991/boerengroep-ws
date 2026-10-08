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

/**
 * Makes an address unique within one run. The same event often exists once per
 * language, so the language is tried first, then a number.
 */
export function uniqueSlug(base: string, language: string | undefined, used: Set<string>): string {
  let slug = base
  if (used.has(slug) && language) slug = `${base}-${language}`
  for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`
  used.add(slug)
  return slug
}
