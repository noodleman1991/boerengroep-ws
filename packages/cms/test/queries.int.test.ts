import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createQueries } from '../src/queries'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let bg: number | string
let other: number | string
let draftMode = false

const queries = (tenantSlug: string) =>
  createQueries({ getPayload: async () => payload, tenantSlug, isDraft: async () => draftMode })

async function page(
  tenant: number | string,
  en: { title: string; slug: string },
  nl?: { title: string; slug: string },
  extra: Record<string, unknown> = {},
) {
  const doc = await payload.create({
    collection: 'pages',
    locale: 'en',
    data: { ...en, tenant, _status: 'published', ...extra } as never,
  })
  if (nl) await payload.update({ collection: 'pages', id: doc.id, locale: 'nl', data: nl as never })
  return doc
}

describe('queries', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    bg = (await createTenant(payload, 'boerengroep')).id
    other = (await createTenant(payload, 'inspringtheater')).id

    await page(bg, { title: 'Home', slug: 'home' }, { title: 'Start', slug: 'home' })
    const about = await page(bg, { title: 'About us', slug: 'about-us' }, { title: 'Over ons', slug: 'over-ons' })
    await page(
      bg,
      { title: 'History', slug: 'history' },
      { title: 'Geschiedenis', slug: 'geschiedenis' },
      { parent: about.id },
    )
    await page(bg, { title: 'Accessibility', slug: 'accessibility' })
    const sections = await page(
      bg,
      { title: 'Sections', slug: 'sections' },
      { title: 'Secties', slug: 'secties' },
      { _status: 'draft' },
    )
    await page(bg, { title: 'Breaks', slug: 'breaks' }, { title: 'Pauzes', slug: 'pauzes' }, { parent: sections.id })
    await page(bg, { title: 'Secret', slug: 'secret' }, undefined, { _status: 'draft' })
    await page(other, { title: 'Other contact', slug: 'contact' })
    await page(other, { title: 'Other about', slug: 'about-us' })

    for (const [tenant, title] of [
      [bg, 'BG event'],
      [other, 'IT event'],
    ] as const) {
      await payload.create({
        collection: 'events',
        data: { title, slug: 'same-slug', startDate: '2026-01-01T10:00:00.000Z', eventType: 'talk', tenant } as never,
      })
      await payload.create({
        collection: 'vacancies',
        data: { title: `${title} vacancy`, slug: 'same-slug', opportunityType: 'board', tenant } as never,
      })
      await payload.create({
        collection: 'redirects',
        data: { from: '/old', to: tenant === bg ? '/bg-new' : '/it-new', tenant } as never,
      })
      await payload.create({
        collection: 'site-settings',
        data: { general: { name: `${title} site` }, tenant } as never,
      })
      await payload.create({
        collection: 'newsletters',
        data: {
          title: `${title} news`,
          slug: 'Issue-1',
          type: 'article',
          organization: 'Boerengroep',
          publishDate: '2026-02-01T10:00:00.000Z',
          tenant,
          _status: 'published',
        } as never,
      })
      await payload.create({
        collection: 'past-events',
        data: { title: `${title} recap`, slug: 'Recap', date: '2026-01-05T10:00:00.000Z', tenant, _status: 'published' } as never,
      })
    }
    await payload.create({
      collection: 'newsletters',
      data: {
        title: 'Unpublished',
        slug: 'Unpublished',
        type: 'article',
        organization: 'Boerengroep',
        publishDate: '2026-03-01T10:00:00.000Z',
        tenant: bg,
        _status: 'draft',
      } as never,
    })
    await payload.create({
      collection: 'past-events',
      data: { title: 'Dutch recap', slug: 'Terugblik', language: 'nl', date: '2026-01-06T10:00:00.000Z', tenant: bg, _status: 'published' } as never,
    })
  })
  afterAll(async () => resetDb(payload))

  describe('resolvePage', () => {
    it('finds a page by its path in the requested locale', async () => {
      const q = queries('boerengroep')
      expect((await q.resolvePage('en', '/about-us/history'))?.page?.title).toBe('History')
      expect((await q.resolvePage('nl', '/over-ons/geschiedenis'))?.page?.title).toBe('Geschiedenis')
    })

    it('finds the home page at the root', async () => {
      expect((await queries('boerengroep').resolvePage('nl', '/'))?.page?.title).toBe('Start')
    })

    it('redirects an English path requested in Dutch to the Dutch path', async () => {
      expect(await queries('boerengroep').resolvePage('nl', '/about-us/history')).toEqual({
        redirectTo: '/over-ons/geschiedenis',
      })
    })

    it('redirects a Dutch path requested in English to the English path', async () => {
      expect(await queries('boerengroep').resolvePage('en', '/over-ons')).toEqual({ redirectTo: '/about-us' })
    })

    it('serves the English content without a redirect loop when there is no Dutch version', async () => {
      const res = await queries('boerengroep').resolvePage('nl', '/accessibility')
      expect(res?.redirectTo).toBeUndefined()
      expect(res?.page?.title).toBe('Accessibility')
    })

    it('redirects a path that mixes Dutch and English segments', async () => {
      const q = queries('boerengroep')
      expect(await q.resolvePage('nl', '/over-ons/history')).toEqual({ redirectTo: '/over-ons/geschiedenis' })
      expect(await q.resolvePage('en', '/about-us/geschiedenis')).toEqual({ redirectTo: '/about-us/history' })
    })

    it('follows a mixed path through a draft parent to a published page', async () => {
      const q = queries('boerengroep')
      expect(await q.resolvePage('nl', '/secties/breaks')).toEqual({ redirectTo: '/secties/pauzes' })
      expect(await q.resolvePage('nl', '/secties')).toBeNull()
    })

    it('does not resolve a mixed path through the wrong parent or into another tenant', async () => {
      const q = queries('boerengroep')
      expect(await q.resolvePage('nl', '/accessibility/history')).toBeNull()
      expect(await q.resolvePage('nl', '/over-ons/contact')).toBeNull()
      expect(await queries('inspringtheater').resolvePage('nl', '/over-ons/history')).toBeNull()
    })

    it('returns null for an unknown path', async () => {
      expect(await queries('boerengroep').resolvePage('en', '/nope')).toBeNull()
    })

    it('never returns another tenant page with the same path', async () => {
      expect((await queries('boerengroep').resolvePage('en', '/about-us'))?.page?.title).toBe('About us')
      expect((await queries('inspringtheater').resolvePage('en', '/about-us'))?.page?.title).toBe('Other about')
      expect(await queries('boerengroep').resolvePage('en', '/contact')).toBeNull()
    })

    it('hides a draft page unless draft mode is on', async () => {
      expect(await queries('boerengroep').resolvePage('en', '/secret')).toBeNull()
      draftMode = true
      expect((await queries('boerengroep').resolvePage('en', '/secret'))?.page?.title).toBe('Secret')
      draftMode = false
    })
  })

  it('looks a page up by its English path and returns it in Dutch', async () => {
    const res = await queries('boerengroep').getPageByEnglishPath('/about-us/history', 'nl')
    expect(res?.title).toBe('Geschiedenis')
  })

  it('lists published page paths per locale for this tenant only', async () => {
    const paths = await queries('boerengroep').listPagePaths()
    expect(paths).toContainEqual({ locale: 'nl', path: '/over-ons/geschiedenis' })
    expect(paths).toContainEqual({ locale: 'en', path: '/' })
    expect(paths.some((p) => p.path === '/secret')).toBe(false)
    expect(paths.some((p) => p.path === '/contact')).toBe(false)
    expect(paths.filter((p) => p.locale === 'nl' && p.path === '/accessibility')).toHaveLength(0)
  })

  it('scopes every list and lookup to the tenant', async () => {
    const q = queries('boerengroep')
    expect((await q.listEvents()).map((d) => d.title)).toEqual(['BG event'])
    expect((await q.listVacancies()).map((d) => d.title)).toEqual(['BG event vacancy'])
    expect((await q.listNewsletters()).map((d) => d.title)).toEqual(['BG event news'])
    expect((await q.getNewsletter('Issue-1', 'en'))?.title).toBe('BG event news')
    expect((await q.getPastEvent('Recap'))?.title).toBe('BG event recap')
    expect((await q.findRedirect('/old'))?.to).toBe('/bg-new')
    expect((await q.getSiteSettings('en'))?.general?.name).toBe('BG event site')
  })

  it('hides an unpublished newsletter from lists and lookups', async () => {
    const q = queries('boerengroep')
    expect(await q.getNewsletter('Unpublished', 'en')).toBeNull()
    draftMode = true
    expect((await q.getNewsletter('Unpublished', 'en'))?.title).toBe('Unpublished')
    draftMode = false
  })

  it('shows past events of the locale and those without a language', async () => {
    const q = queries('boerengroep')
    expect((await q.listPastEvents('en')).map((d) => d.title)).toEqual(['BG event recap'])
    expect((await q.listPastEvents('nl')).map((d) => d.title)).toEqual(['Dutch recap', 'BG event recap'])
  })

  it('finds one event by its address, and only on its own site', async () => {
    const mine = (await queries('boerengroep').listEvents())[0]!
    const theirs = (await queries('inspringtheater').listEvents())[0]!
    // Both sites have an event with the same name on the same day, so the same address.
    expect(mine.slug).toBe(theirs.slug)
    expect((await queries('boerengroep').getEvent(mine.slug!))?.id).toBe(mine.id)
    expect((await queries('inspringtheater').getEvent(mine.slug!))?.id).toBe(theirs.id)
    expect(await queries('boerengroep').getEvent('no-such-event')).toBeNull()
  })

  it('finds the story written about an event once it is published', async () => {
    const q = queries('boerengroep')
    const event = (await q.listEvents())[0]!
    expect(await q.getRecapOfEvent(event.id, 'en')).toBeNull()
    const draft = await payload.create({
      collection: 'past-events',
      data: { title: 'How it went', slug: 'How-it-went', date: '2026-01-07T10:00:00.000Z', relatedEvent: event.id, tenant: bg, _status: 'draft' } as never,
    })
    expect(await q.getRecapOfEvent(event.id, 'en')).toBeNull()
    await payload.update({ collection: 'past-events', id: draft.id, data: { _status: 'published' } as never })
    expect((await q.getRecapOfEvent(event.id, 'en'))?.slug).toBe('How-it-went')
    // The other site's event with the same address has no story.
    const theirs = (await queries('inspringtheater').listEvents())[0]!
    expect(await queries('inspringtheater').getRecapOfEvent(theirs.id, 'en')).toBeNull()
    await payload.delete({ collection: 'past-events', id: draft.id })
  })

  it('fails clearly for a tenant that does not exist', async () => {
    await expect(queries('ghost').listEvents()).rejects.toThrow(/Tenant "ghost" not found/)
  })

  it('uses the cache function with tenant-prefixed tags when not in draft mode', async () => {
    const seen: { key: string[]; tags: string[] }[] = []
    const q = createQueries({
      getPayload: async () => payload,
      tenantSlug: 'boerengroep',
      isDraft: async () => false,
      cache: (fn, key, tags) => {
        seen.push({ key, tags })
        return fn
      },
    })
    await q.listEvents()
    expect(seen[0]!.tags).toEqual(['boerengroep:events', 'boerengroep:speakers', 'boerengroep:media'])
    expect(seen[0]!.key.slice(0, 2)).toEqual(['boerengroep', 'listEvents'])
  })

  it('refreshes a page when something shown on it changes, not only the page itself', async () => {
    const seen = new Map<string, string[]>()
    const q = createQueries({
      getPayload: async () => payload,
      tenantSlug: 'boerengroep',
      isDraft: async () => false,
      cache: (fn, key, tags) => {
        seen.set(key[1]!, tags.map((tag) => tag.replace('boerengroep:', '')))
        return fn
      },
    })
    await q.resolvePage('en', '/about-us')
    await q.getPageByEnglishPath('/about-us', 'nl')
    await q.listEvents()
    await q.getPastEvent('Recap')
    await q.listPastEvents('en')
    await q.getNewsletter('Issue-1', 'en')
    // A page can show a form, the photos of a past event, and people.
    for (const name of ['resolvePage', 'getPageByEnglishPath']) {
      expect(seen.get(name), name).toEqual(expect.arrayContaining(['pages', 'forms', 'past-events', 'media']))
    }
    // An event shows its speakers. A story shows its author, its tags, its event and forms in its blocks.
    expect(seen.get('listEvents')).toEqual(expect.arrayContaining(['events', 'speakers']))
    for (const name of ['getPastEvent', 'listPastEvents']) {
      expect(seen.get(name), name).toEqual(expect.arrayContaining(['past-events', 'events', 'authors', 'tags', 'forms']))
    }
    expect(seen.get('getNewsletter')).toEqual(expect.arrayContaining(['newsletters', 'authors', 'tags', 'forms', 'past-events']))
  })

  it('bypasses the cache in draft mode', async () => {
    let cached = 0
    const q = createQueries({
      getPayload: async () => payload,
      tenantSlug: 'boerengroep',
      isDraft: async () => true,
      cache: (fn) => {
        cached++
        return fn
      },
    })
    await q.listNewsletters()
    expect(cached).toBe(0)
  })
})
