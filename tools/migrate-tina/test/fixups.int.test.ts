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
  // Placeholder content that the old site still carries.
  removeFiles: ['events/nl/soepkeuken.mdx', 'speakers/sample-speaker.md', 'tags/sample.mdx'],
  clearPageBodies: ['activities/calendar-sections/breaks'],
  // A page whose text is really a set of photos with a sentence under each.
  galleryPages: ['about-us'],
}

async function byLegacyId(payload: Payload, collection: string, legacyId: string) {
  const res = await payload.find({ collection: collection as never, where: { legacyId: { equals: legacyId } }, draft: true, overrideAccess: true })
  return res.docs[0] as any
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

  it('removes placeholder events, people and tags that an earlier run imported, and nothing else', async () => {
    expect(await byLegacyId(payload, 'events', 'events/nl/soepkeuken.mdx')).toBeUndefined()
    expect(await byLegacyId(payload, 'speakers', 'speakers/sample-speaker.md')).toBeUndefined()
    expect(await byLegacyId(payload, 'tags', 'tags/sample.mdx')).toBeUndefined()
    expect((await byLegacyId(payload, 'events', 'events/en/Boerengroep-Weekend.mdx'))?.title).toBeTruthy()
    expect((await byLegacyId(payload, 'speakers', 'speakers/maria.md'))?.name).toBe('Dr. Maria van der Meer')
    expect((await byLegacyId(payload, 'tags', 'tags/weekend.mdx'))?.name).toBe('weekend')
  })

  it('says in the report which files were left out', async () => {
    const report = await migrate({ ...base(payload), fixups })
    for (const file of fixups.removeFiles) {
      expect(report.entries.filter((e) => e.legacyId === file)).toEqual([{ kind: 'skipped', legacyId: file, message: 'removed by a fix-up' }])
    }
  })

  it('empties the hidden text of a page named in the fix-ups and keeps the page', async () => {
    const before = await migrate(base(payload)).then(() => page(payload, 'activities/calendar-sections/breaks', 'en'))
    expect(JSON.stringify(before.body)).toContain('text')
    await migrate({ ...base(payload), fixups })
    const after = await page(payload, 'activities/calendar-sections/breaks', 'en')
    expect(after.title).toBe(before.title)
    expect(after.body ?? null).toBeNull()
  })

  it('turns the text of a photo page into a gallery, with the sentences as captions', async () => {
    const before = await migrate(base(payload)).then(() => page(payload, 'about-us', 'en'))
    expect(before.blocks.map((block: any) => block.blockType)).toEqual(['content'])
    await migrate({ ...base(payload), fixups })
    const after = await page(payload, 'about-us', 'en')
    expect(after.blocks).toHaveLength(1)
    const gallery = after.blocks[0]
    expect(gallery).toMatchObject({ blockType: 'gallery', title: 'Photos of the weekend', intro: 'A few moments from the farm.', source: 'pictures' })
    const photos = await payload.find({ collection: 'media', where: { id: { in: gallery.images.map((image: any) => image.id ?? image) } }, locale: 'en', sort: 'legacyPath', overrideAccess: true })
    expect(photos.docs.map((doc: any) => [doc.legacyPath, doc.caption])).toEqual([
      ['/uploads/branding/logo.png', 'The kitchen crew.'],
      ['/uploads/hero.png', 'Around the fire on Saturday night'],
    ])
    expect(gallery.images.map((image: any) => image.legacyPath ?? image)).toEqual(['/uploads/hero.png', '/uploads/branding/logo.png'])
  })

  it('stays the same when run again', async () => {
    const before = (await payload.find({ collection: 'pages', limit: 0, draft: true })).totalDocs
    await migrate({ ...base(payload), fixups })
    expect((await payload.find({ collection: 'pages', limit: 0, draft: true })).totalDocs).toBe(before)
    expect((await payload.find({ collection: 'redirects', limit: 0 })).totalDocs).toBe(4)
  })
})
