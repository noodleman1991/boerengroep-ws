import { describe, expect, it } from 'vitest'
import { refId, type Ctx } from './context'
import { Report } from './report'

function ctx(): Ctx {
  return {
    payload: {} as never,
    tenantId: 1,
    report: new Report(),
    media: new Map(),
    ids: new Map([['speakers/marcha.md', 42]]),
    pageByEnPath: new Map(),
    reservedPaths: new Set(),
    fixups: { removePages: [], pageOverrides: {}, redirects: [], removeFiles: [], clearPageBodies: [] },
    messages: {},
    toLexical: async () => undefined,
  }
}

describe('refId', () => {
  it('resolves a Tina reference that starts with content/', () => {
    expect(refId(ctx(), 'content/speakers/marcha.md', 'events/en/a.mdx')).toBe(42)
  })
  it('treats an empty string as no reference without reporting', () => {
    const c = ctx()
    expect(refId(c, '', 'events/en/a.mdx')).toBeUndefined()
    expect(c.report.count()).toBe(0)
  })
  it('reports a reference to a file that was not imported', () => {
    const c = ctx()
    expect(refId(c, 'content/speakers/ghost.md', 'events/en/a.mdx')).toBeUndefined()
    expect(c.report.entries[0]).toEqual({
      kind: 'unresolved-reference',
      legacyId: 'events/en/a.mdx',
      message: 'content/speakers/ghost.md was not imported',
    })
  })
  it('reports a reference that is not a string', () => {
    const c = ctx()
    expect(refId(c, { nope: true }, 'events/en/a.mdx')).toBeUndefined()
    expect(c.report.count('unresolved-reference')).toBe(1)
  })
})
