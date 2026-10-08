import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Ctx } from './context'
import { listUploads, locateUploads, resolveMedia } from './media'
import { Report } from './report'
import { emptyFixups } from './fixups'

function ctx(): Ctx {
  return {
    payload: {} as never,
    tenantId: 1,
    report: new Report(),
    media: new Map([
      ['/uploads/1030.jpeg', 7],
      ['/uploads/past events/a b.jpg', 8],
    ]),
    ids: new Map(),
    pageByEnPath: new Map(),
    reservedPaths: new Set(),
    fixups: emptyFixups,
    messages: {},
    toLexical: async () => undefined,
  }
}

describe('listUploads', () => {
  it('lists files as /uploads paths and skips dotfiles', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'up-'))
    mkdirSync(path.join(dir, 'branding'))
    writeFileSync(path.join(dir, 'b.png'), 'x')
    writeFileSync(path.join(dir, 'branding/logo.png'), 'x')
    writeFileSync(path.join(dir, '.DS_Store'), 'x')
    expect(listUploads(dir)).toEqual(['/uploads/b.png', '/uploads/branding/logo.png'])
  })
})

describe('locateUploads', () => {
  it('adds files from an extra folder, and the uploads folder wins when both have a file', () => {
    const uploads = mkdtempSync(path.join(tmpdir(), 'up-'))
    const rescued = mkdtempSync(path.join(tmpdir(), 'extra-'))
    writeFileSync(path.join(uploads, 'a.png'), 'x')
    writeFileSync(path.join(rescued, 'a.png'), 'y')
    writeFileSync(path.join(rescued, '1207.png'), 'y')
    const files = locateUploads(uploads, [rescued])
    expect([...files.keys()].sort()).toEqual(['/uploads/1207.png', '/uploads/a.png'])
    expect(files.get('/uploads/a.png')).toBe(path.join(uploads, 'a.png'))
    expect(files.get('/uploads/1207.png')).toBe(path.join(rescued, '1207.png'))
  })
  it('is the uploads folder alone without extra folders', () => {
    const uploads = mkdtempSync(path.join(tmpdir(), 'up-'))
    writeFileSync(path.join(uploads, 'a.png'), 'x')
    expect([...locateUploads(uploads).keys()]).toEqual(['/uploads/a.png'])
  })
})

describe('resolveMedia', () => {
  it('returns the media id for a known upload path', () => {
    expect(resolveMedia(ctx(), '/uploads/1030.jpeg', 'events/en/a.mdx')).toBe(7)
  })
  it('matches a path that is percent-encoded in content', () => {
    expect(resolveMedia(ctx(), '/uploads/past%20events/a%20b.jpg', 'x')).toBe(8)
  })
  it('returns nothing for an empty value without reporting', () => {
    const c = ctx()
    expect(resolveMedia(c, '', 'x')).toBeUndefined()
    expect(resolveMedia(c, undefined, 'x')).toBeUndefined()
    expect(c.report.count()).toBe(0)
  })
  it('reports a path that is not in uploads and leaves the field empty', () => {
    const c = ctx()
    expect(resolveMedia(c, '/uploads/1234.jpg', 'pages/en/about-us/history.mdx')).toBeUndefined()
    expect(c.report.entries[0]).toEqual({
      kind: 'missing-media',
      legacyId: 'pages/en/about-us/history.mdx',
      message: '/uploads/1234.jpg is not in the uploads folder',
    })
  })
  it('reports an external image URL', () => {
    const c = ctx()
    expect(resolveMedia(c, 'https://assets.tina.io/abc/x.png', 'x')).toBeUndefined()
    expect(c.report.entries[0]!.message).toBe('external image https://assets.tina.io/abc/x.png was not imported')
  })
})
