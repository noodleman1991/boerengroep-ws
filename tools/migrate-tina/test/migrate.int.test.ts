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
      speakers: 1,
      authors: 1,
      tags: 2,
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
      where: { slug: { equals: 'Boerengroep-Weekend' } },
      depth: 1,
    })
    const event = events.docs[0] as any
    expect(event.language).toBe('en')
    expect(event.speakers[0].speaker.name).toBe('Dr. Maria van der Meer')
    expect(event.speakers[0].role).toBe('Host')

    const recap = (await payload.find({ collection: 'past-events', depth: 1 })).docs[0] as any
    expect(recap.author.name).toBe('Cami')
    expect(recap.relatedEvent.slug).toBe('Boerengroep-Weekend')
    expect(recap.tags[0].name).toBe('weekend')
    expect(recap.language).toBeFalsy()
    expect(JSON.stringify(recap.body)).toContain('great')
  })

  it('imports an unpublished newsletter as a draft', async () => {
    const res = await payload.find({ collection: 'newsletters', draft: true, overrideAccess: true })
    expect((res.docs[0] as any)._status).toBe('draft')
    expect((res.docs[0] as any).body[0].blockType).toBe('callout')
  })

  it('links navigation items to pages when the href is a page path', async () => {
    const settings = (await payload.find({ collection: 'site-settings', depth: 1 })).docs[0] as any
    const about = settings.header.nav[0]
    expect(about.page.path).toBe('/about-us')
    expect(about.submenu[0].page.path).toBe('/about-us/history')
    expect(about.submenu[1].page).toBeFalsy()
    expect(about.submenu[1].href).toBe('/activities/calendar')
    expect(settings.header.logo.legacyPath).toBe('/uploads/branding/logo.png')
    expect(settings.theme.font).toBe('lato')
  })

  it('keeps the plain href for an address that belongs to a built-in route', async () => {
    const settings = (await payload.find({ collection: 'site-settings', depth: 1 })).docs[0] as any
    const vacancies = settings.header.nav[1]
    expect(vacancies.href).toBe('/vacancies')
    expect(vacancies.page).toBeFalsy()
  })

  it('keeps the plain href when the page is only a draft placeholder', async () => {
    const settings = (await payload.find({ collection: 'site-settings', depth: 1 })).docs[0] as any
    const activities = settings.header.nav[2]
    expect(activities.href).toBe('/activities')
    expect(activities.page).toBeFalsy()
  })

  it('creates redirects from the redirects folder and from previous page URLs', async () => {
    const res = await payload.find({ collection: 'redirects', sort: 'from' })
    expect(res.docs.map((d: any) => [d.from, d.to])).toEqual([
      ['/history', '/about-us/history'],
      ['/old-contact', '/contact'],
    ])
  })

  it('reports what needs a human', () => {
    const kinds = (k: string) => report.entries.filter((e) => e.kind === k).map((e) => e.legacyId)
    expect(kinds('missing-media')).toEqual(['pages/en/about-us/history.mdx'])
    expect(kinds('unresolved-reference')).toEqual(['events/en/Boerengroep-Weekend.mdx'])
    expect(kinds('inline-image')).toEqual(['pages/en/activities/calendar-sections/breaks.mdx'])
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
