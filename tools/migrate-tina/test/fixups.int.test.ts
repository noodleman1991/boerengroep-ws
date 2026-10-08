import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createTenant, resetDb, testPayload } from '@sites/cms/testing'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { migrate } from '../src/migrate'

const site = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/site')
const base = (payload: Payload) => ({
  payload,
  tenantSlug: 'boerengroep',
  contentDir: path.join(site, 'content'),
  uploadsDir: path.join(site, 'uploads'),
})
const fixups = {
  removePages: ['accessibility'],
  pageOverrides: {
    'about-us/history': { nl: { title: 'Ons verhaal', slug: 'ons-verhaal' }, en: { title: 'Our Story' } },
  },
  redirects: [
    { from: '/accessibility', to: '/about-us' },
    { from: '/over-ons/geschiedenis', to: '/about-us/history' },
  ],
}

async function page(payload: Payload, key: string, locale: 'en' | 'nl') {
  const res = await payload.find({
    collection: 'pages',
    where: { legacyId: { equals: `pages/${key}` } },
    locale,
    fallbackLocale: false as never,
    draft: true,
    overrideAccess: true,
  })
  return res.docs[0] as any
}

let payload: Payload

describe('migration fix-ups', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    await createTenant(payload, 'boerengroep')
    // First run without fix-ups, as the earlier dry runs did, so removal has something to remove.
    await migrate(base(payload))
    await migrate({ ...base(payload), fixups })
  })
  afterAll(async () => resetDb(payload))

  it('removes a page that was imported by an earlier run', async () => {
    expect(await page(payload, 'accessibility', 'en')).toBeUndefined()
  })

  it('overrides title and slug per language and rebuilds the path', async () => {
    const nl = await page(payload, 'about-us/history', 'nl')
    expect(nl.title).toBe('Ons verhaal')
    expect(nl.path).toBe('/over-ons/ons-verhaal')
    const en = await page(payload, 'about-us/history', 'en')
    expect(en.title).toBe('Our Story')
    expect(en.path).toBe('/about-us/history')
  })

  it('adds the listed redirects as permanent ones', async () => {
    const res = await payload.find({ collection: 'redirects', sort: 'from', limit: 20 })
    const pairs = res.docs.map((d: any) => [d.from, d.to, d.permanent])
    expect(pairs).toContainEqual(['/accessibility', '/about-us', true])
    expect(pairs).toContainEqual(['/over-ons/geschiedenis', '/about-us/history', true])
  })

  it('does not report the removed page as missing its Dutch version', async () => {
    const report = await migrate({ ...base(payload), fixups })
    expect(report.entries.filter((e) => e.legacyId.includes('accessibility'))).toEqual([
      { kind: 'skipped', legacyId: 'pages/en/accessibility.mdx', message: 'removed by a fix-up' },
    ])
    expect(report.failed).toBe(false)
  })

  it('stays the same when run again', async () => {
    const before = (await payload.find({ collection: 'pages', limit: 0, draft: true })).totalDocs
    await migrate({ ...base(payload), fixups })
    expect((await payload.find({ collection: 'pages', limit: 0, draft: true })).totalDocs).toBe(before)
    expect((await payload.find({ collection: 'redirects', limit: 0 })).totalDocs).toBe(4)
  })
})
