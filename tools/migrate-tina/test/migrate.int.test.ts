import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createTenant, resetDb, testPayload } from '@sites/cms/testing'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { migrate } from '../src/migrate'
import type { Report } from '../src/report'

const site = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/site')
const input = (payload: Payload) => ({
  payload,
  tenantSlug: 'boerengroep',
  contentDir: path.join(site, 'content'),
  uploadsDir: path.join(site, 'uploads'),
  // Addresses served by a built-in route of the app, not by a CMS page.
  reservedPaths: ['/vacancies', '/activities/calendar'],
  messages: {
    en: JSON.parse(readFileSync(path.join(site, 'messages/en.json'), 'utf8')),
    nl: JSON.parse(readFileSync(path.join(site, 'messages/nl.json'), 'utf8')),
  },
})

const COLLECTIONS = [
  'pages',
  'events',
  'past-events',
  'newsletters',
  'vacancies',
  'speakers',
  'authors',
  'tags',
  'media',
  'redirects',
  'site-settings',
] as const

async function counts(payload: Payload) {
  const out: Record<string, number> = {}
  for (const c of COLLECTIONS) {
    out[c] = (await payload.find({ collection: c, limit: 0, draft: true, overrideAccess: true })).totalDocs
  }
  return out
}

async function pageByLegacy(payload: Payload, key: string, locale: 'en' | 'nl') {
  const res = await payload.find({
    collection: 'pages',
    where: { legacyId: { equals: `pages/${key}` } },
    locale,
    fallbackLocale: false as never,
    depth: 1,
    draft: true,
    overrideAccess: true,
  })
  return res.docs[0] as any
}

let payload: Payload
let report: Report
let otherTenant: number | string

describe('migrate', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    await createTenant(payload, 'boerengroep')
    otherTenant = (await createTenant(payload, 'inspringtheater')).id
    await payload.create({
      collection: 'tags',
      data: { name: 'untouched', tenant: otherTenant } as never,
      overrideAccess: true,
    })
    report = await migrate(input(payload))
  })
  afterAll(async () => resetDb(payload))

  it('imports every collection', async () => {
    expect(await counts(payload)).toEqual({
      pages: 8,
      events: 2,
      'past-events': 1,
      newsletters: 1,
      vacancies: 1,
      speakers: 2,
      authors: 1,
      tags: 3,
      media: 2,
      redirects: 2,
      'site-settings': 1,
    })
  })

  it('builds localized paths for a paired page', async () => {
    expect((await pageByLegacy(payload, 'about-us/history', 'en')).path).toBe('/about-us/history')
    const nl = await pageByLegacy(payload, 'about-us/history', 'nl')
    expect(nl.path).toBe('/over-ons/geschiedenis')
    expect(nl.title).toBe('Geschiedenis')
  })

  it('maps the home page to the root in both locales', async () => {
    expect((await pageByLegacy(payload, 'home', 'en')).path).toBe('/')
    expect((await pageByLegacy(payload, 'home', 'nl')).path).toBe('/')
  })

  it('keeps child URLs under a folder without its own page', async () => {
    const parent = await pageByLegacy(payload, 'activities/calendar-sections', 'en')
    expect(parent._status).toBe('draft')
    expect((await pageByLegacy(payload, 'activities/calendar-sections/breaks', 'en')).path).toBe(
      '/activities/calendar-sections/breaks',
    )
    expect((await pageByLegacy(payload, 'activities/calendar-sections/breaks', 'nl')).path).toBe(
      '/activiteiten/agenda-secties/breaks',
    )
  })

  it('links block images and converts block rich text', async () => {
    const home = await pageByLegacy(payload, 'home', 'en')
    expect(home.blocks[0].blockType).toBe('hero')
    expect(home.blocks[0].image.src.legacyPath).toBe('/uploads/hero.png')
    const history = await pageByLegacy(payload, 'about-us/history', 'en')
    expect(JSON.stringify(history.blocks[0].body)).toContain('1971')
  })

  it('keeps different block lists per locale', async () => {
    expect((await pageByLegacy(payload, 'about-us/history', 'en')).blocks).toHaveLength(2)
    expect((await pageByLegacy(payload, 'about-us/history', 'nl')).blocks).toHaveLength(1)
  })

  it('resolves references between collections', async () => {
    const events = await payload.find({
      collection: 'events',
      where: { slug: { equals: 'boerengroep-weekend-2025-09-01' } },
      depth: 1,
    })
    const event = events.docs[0] as any
    expect(event.language).toBe('en')
    expect(event.speakers[0].speaker.name).toBe('Dr. Maria van der Meer')
    expect(event.speakers[0].role).toBe('Host')

    const recap = (await payload.find({ collection: 'past-events', depth: 1 })).docs[0] as any
    expect(recap.author.name).toBe('Cami')
    expect(recap.relatedEvent.slug).toBe('boerengroep-weekend-2025-09-01')
    expect(recap.tags[0].name).toBe('weekend')
    expect(recap.language).toBeFalsy()
    expect(JSON.stringify(recap.body)).toContain('great')
  })

  it('imports an unpublished newsletter as a draft', async () => {
    const res = await payload.find({ collection: 'newsletters', draft: true, overrideAccess: true })
    expect((res.docs[0] as any)._status).toBe('draft')
    expect((res.docs[0] as any).body[0].blockType).toBe('callout')
  })

  const settingsIn = async (locale: 'en' | 'nl') =>
    (await payload.find({ collection: 'site-settings', depth: 1, locale })).docs[0] as any

  it('gives every menu item a label per language, taken from the old translation files', async () => {
    const en = await settingsIn('en')
    const nl = await settingsIn('nl')
    expect(en.header.nav.map((n: any) => n.label)).toEqual(['About us', 'Vacancies', 'Activities'])
    expect(nl.header.nav.map((n: any) => n.label)).toEqual(['Over ons', 'Vacatures', 'Activiteiten'])
    expect(en.header.nav[0].children.map((c: any) => c.label)).toEqual(['History', 'Calendar'])
    expect(nl.header.nav[0].children.map((c: any) => c.label)).toEqual(['Geschiedenis', 'Agenda'])
  })

  it('links menu items to pages, so they follow the page when it moves', async () => {
    const en = await settingsIn('en')
    const nl = await settingsIn('nl')
    expect(en.header.nav[0]).toMatchObject({ linkType: 'page' })
    expect(en.header.nav[0].page.path).toBe('/about-us')
    expect(nl.header.nav[0].page.path).toBe('/over-ons')
    expect(nl.header.nav[0].children[0].page.path).toBe('/over-ons/geschiedenis')
  })

  it('turns addresses of built-in parts of the site into section links', async () => {
    const en = await settingsIn('en')
    expect(en.header.nav[0].children[1]).toMatchObject({ linkType: 'section', section: 'calendar' })
    expect(en.header.nav[1]).toMatchObject({ linkType: 'section', section: 'vacancies' })
    expect(en.header.nav[1].page).toBeFalsy()
  })

  it('keeps a plain address when the page is only a draft placeholder', async () => {
    const en = await settingsIn('en')
    expect(en.header.nav[2]).toMatchObject({ linkType: 'custom', url: '/activities' })
  })

  it('fills in name, logo, contact details and social links', async () => {
    const en = await settingsIn('en')
    expect(en.general.name).toBe('Stichting Boerengroep')
    expect(en.general.logo.legacyPath).toBe('/uploads/branding/logo.png')
    expect(en.general.contact).toMatchObject({
      address: 'Generaal Foulkesweg 37\n6703 BL Wageningen',
      email: 'st.boerengroep@wur.nl',
      phone: '+31 (0)657 23 00 65',
    })
    expect(en.general.social).toMatchObject([{ platform: 'instagram', url: 'https://instagram.com/x' }])
  })

  it('builds footer columns with titles and labels per language', async () => {
    const en = await settingsIn('en')
    const nl = await settingsIn('nl')
    expect(en.footer.columns[0].title).toBe('About us')
    expect(nl.footer.columns[0].title).toBe('Over ons')
    expect(nl.footer.columns[0].links[0]).toMatchObject({ label: 'Geschiedenis', linkType: 'page' })
    expect(nl.footer.columns[0].links[0].page.path).toBe('/over-ons/geschiedenis')
  })

  it('creates redirects from the redirects folder and from previous page URLs', async () => {
    const res = await payload.find({ collection: 'redirects', sort: 'from' })
    expect(res.docs.map((d: any) => [d.from, d.to])).toEqual([
      ['/history', '/about-us/history'],
      ['/old-contact', '/contact'],
    ])
  })

  it('turns an inline image in the text into an image node that points at the media file', async () => {
    const page = await pageByLegacy(payload, 'activities/calendar-sections/breaks', 'en')
    const nodes = page.body.root.children
    const upload = nodes.find((n: any) => n.type === 'upload')
    expect(upload.value.legacyPath).toBe('/uploads/hero.png')
    expect(JSON.stringify(nodes)).toContain('Body with')
    expect(JSON.stringify(nodes)).not.toContain('TINAIMAGE')
  })

  it('reports what needs a human', () => {
    const kinds = (k: string) => report.entries.filter((e) => e.kind === k).map((e) => e.legacyId)
    expect(kinds('missing-media')).toEqual(['pages/en/about-us/history.mdx'])
    expect(kinds('unresolved-reference')).toEqual(['events/en/Boerengroep-Weekend.mdx'])
    expect(kinds('inline-image')).toEqual([])
    expect(kinds('unpaired-locale')).toEqual(['pages/en/accessibility.mdx'])
    expect(kinds('placeholder-parent')).toHaveLength(2)
    expect(report.failed).toBe(false)
  })

  it('changes nothing when it runs a second time', async () => {
    const before = await counts(payload)
    const second = await migrate(input(payload))
    expect(await counts(payload)).toEqual(before)
    expect(second.failed).toBe(false)
  })

  it('leaves the other tenant alone', async () => {
    const res = await payload.find({ collection: 'tags', where: { tenant: { equals: otherTenant } } })
    expect(res.docs.map((d: any) => d.name)).toEqual(['untouched'])
  })

  it('refuses to run for a tenant that does not exist', async () => {
    await expect(migrate({ ...input(payload), tenantSlug: 'nope' })).rejects.toThrow(/Tenant "nope" not found/)
  })
})
