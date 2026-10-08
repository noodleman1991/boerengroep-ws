import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { contentStaticParams, isReservedPath, RESERVED_PATHS, RESERVED_PREFIXES } from './reserved-paths'

/** Scans app/[locale] for route folders, the same way Next does. */
function scanRoutes(): { staticRoutes: string[]; dynamicPrefixes: string[] } {
  const root = path.resolve(__dirname, '..', 'app', '[locale]')
  const staticRoutes: string[] = []
  const dynamicPrefixes: string[] = []
  const walk = (dir: string, segments: string[]) => {
    const entries = readdirSync(dir, { withFileTypes: true })
    const hasPage = entries.some((e) => e.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(e.name))
    if (hasPage && segments.length > 0) staticRoutes.push(`/${segments.join('/')}`)
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (entry.name.startsWith('[')) {
        // A dynamic child owns everything below this folder. The root catch-all is the CMS route itself.
        if (segments.length > 0 && existsSync(path.join(dir, entry.name, 'page.tsx'))) {
          dynamicPrefixes.push(`/${segments.join('/')}/`)
        }
        continue
      }
      walk(path.join(dir, entry.name), [...segments, entry.name])
    }
  }
  walk(root, [])
  return { staticRoutes: staticRoutes.sort(), dynamicPrefixes: dynamicPrefixes.sort() }
}

describe('reserved paths', () => {
  it('lists exactly the built-in routes that exist under app/[locale]', () => {
    expect([...RESERVED_PATHS].sort()).toEqual(scanRoutes().staticRoutes)
  })

  it('lists exactly the built-in routes that have a dynamic child', () => {
    expect([...RESERVED_PREFIXES].sort()).toEqual(scanRoutes().dynamicPrefixes)
  })

  it('reserves a built-in route and everything under a dynamic one', () => {
    expect(isReservedPath('/vacancies')).toBe(true)
    expect(isReservedPath('/news/friends-news')).toBe(true)
    expect(isReservedPath('/news/newsletter/Newsletter-1')).toBe(true)
    expect(isReservedPath('/activities/past-events/Boerengroep-Weekend')).toBe(true)
    expect(isReservedPath('/activities/calendar/boerengroep-break-2026-10-08')).toBe(true)
  })

  it('does not reserve content pages, including ones that share a prefix', () => {
    expect(isReservedPath('/about-us/history')).toBe(false)
    expect(isReservedPath('/activities')).toBe(false)
    expect(isReservedPath('/activities/fei')).toBe(false)
    // The pages shown under the calendar are content pages with a similar address.
    expect(isReservedPath('/activities/calendar-sections/breaks')).toBe(false)
    expect(isReservedPath('/library')).toBe(false)
    expect(isReservedPath('/vacancies-archive')).toBe(false)
    expect(isReservedPath('/vacatures')).toBe(false)
  })
})

describe('contentStaticParams', () => {
  it('prebuilds content pages and leaves out the home page and built-in routes', () => {
    expect(
      contentStaticParams([
        { locale: 'en', path: '/' },
        { locale: 'en', path: '/vacancies' },
        { locale: 'nl', path: '/vacatures' },
        { locale: 'en', path: '/news/friends-news' },
        { locale: 'nl', path: '/nieuws/friends-news' },
        { locale: 'en', path: '/about-us/history' },
      ]),
    ).toEqual([
      { locale: 'nl', urlSegments: ['vacatures'] },
      { locale: 'nl', urlSegments: ['nieuws', 'friends-news'] },
      { locale: 'en', urlSegments: ['about-us', 'history'] },
    ])
  })
})
