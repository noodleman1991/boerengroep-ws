import { SECTION_PATHS, type SectionKey } from '@sites/cms/links'
import type { Id } from './context'

export type MigratedLink = {
  linkType: 'page' | 'section' | 'custom'
  page?: Id
  section?: SectionKey
  url?: string
  anchor?: string
}

const SECTION_BY_PATH = new Map<string, SectionKey>(
  Object.entries(SECTION_PATHS).map(([key, path]) => [path, key as SectionKey]),
)

/**
 * Turns an address from the old menu into a link the editors can manage:
 * a built-in section, a page, or a plain address when it is neither.
 */
export function parseHref(href: string | undefined | null, pageByEnPath: Map<string, Id>): MigratedLink | undefined {
  if (!href || !href.trim()) return undefined
  if (!href.startsWith('/')) return { linkType: 'custom', url: href }
  const [base, anchor] = href.split('#') as [string, string | undefined]
  const withAnchor = <T extends object>(link: T) => (anchor ? { ...link, anchor } : link)
  const section = SECTION_BY_PATH.get(base)
  if (section) return withAnchor({ linkType: 'section' as const, section })
  const page = pageByEnPath.get(base)
  if (page !== undefined) return withAnchor({ linkType: 'page' as const, page })
  return { linkType: 'custom', url: href }
}

/** Reads one text from a translation file by its key path. */
export function labelFrom(messages: unknown, keys: string[]): string | undefined {
  let node: unknown = messages
  for (const key of keys) {
    if (!node || typeof node !== 'object') return undefined
    node = (node as Record<string, unknown>)[key]
  }
  return typeof node === 'string' ? node : undefined
}
