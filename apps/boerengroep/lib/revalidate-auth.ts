import { timingSafeEqual } from 'node:crypto'

export function secretMatches(given: string | null, expected: string | undefined): boolean {
  if (!expected || given === null) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Keeps only well-formed tags that belong to this tenant. */
export function ownTags(tags: unknown, tenantSlug: string): string[] {
  if (!Array.isArray(tags)) return []
  return tags.filter((t): t is string => typeof t === 'string' && t.startsWith(`${tenantSlug}:`))
}
