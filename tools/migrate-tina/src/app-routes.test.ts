import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { listAppRoutes } from './app-routes'

function app(files: string[]): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'app-'))
  for (const f of files) {
    mkdirSync(path.dirname(path.join(dir, f)), { recursive: true })
    writeFileSync(path.join(dir, f), '')
  }
  return dir
}

describe('listAppRoutes', () => {
  it('lists static routes under app/[locale] that have a page file', () => {
    const dir = app([
      'app/[locale]/page.tsx',
      'app/[locale]/vacancies/page.tsx',
      'app/[locale]/activities/calendar/page.tsx',
      'app/[locale]/activities/past-events/page.tsx',
      'app/[locale]/news/layout.tsx',
    ])
    expect(listAppRoutes(dir)).toEqual(['/', '/activities/calendar', '/activities/past-events', '/vacancies'])
  })

  it('leaves out dynamic routes and the catch-all', () => {
    const dir = app([
      'app/[locale]/[...urlSegments]/page.tsx',
      'app/[locale]/news/newsletter/[...slug]/page.tsx',
      'app/[locale]/news/newsletter/page.tsx',
    ])
    expect(listAppRoutes(dir)).toEqual(['/news/newsletter'])
  })

  it('ignores route groups in the path and returns nothing without an app folder', () => {
    expect(listAppRoutes(app(['app/[locale]/(marketing)/about/page.tsx']))).toEqual(['/about'])
    expect(listAppRoutes(app(['readme.md']))).toEqual([])
  })
})
