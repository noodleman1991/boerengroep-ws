import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let bg: number | string
let other: number | string
let bgEditor: any
let bgAdmin: any

describe('site settings and redirects', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    bg = (await createTenant(payload, 'boerengroep')).id
    other = (await createTenant(payload, 'inspringtheater')).id
    const mk = (email: string, role: string) =>
      payload.create({
        collection: 'users',
        data: { email, password: 'correct-horse-battery', tenants: [{ tenant: bg, roles: [role] }] } as never,
        overrideAccess: true,
      })
    bgEditor = await mk('editor@site.test', 'editor')
    bgAdmin = await mk('admin@site.test', 'tenant-admin')
  })
  afterAll(async () => resetDb(payload))

  it('stores a menu with labels per language and links to a page, a section and another address', async () => {
    const about = await payload.create({
      collection: 'pages',
      locale: 'en',
      data: { title: 'About us', slug: 'about-us', tenant: bg, _status: 'published' } as never,
    })
    await payload.update({ collection: 'pages', id: about.id, locale: 'nl', data: { title: 'Over ons', slug: 'over-ons' } as never })

    const settings = await payload.create({
      collection: 'site-settings',
      locale: 'en',
      data: {
        tenant: bg,
        general: { name: 'Stichting Boerengroep', tagline: 'Since 1971' },
        header: {
          nav: [
            {
              label: 'About us',
              linkType: 'page',
              page: about.id,
              children: [{ label: 'Calendar', linkType: 'section', section: 'calendar', anchor: 'open-meetings' }],
            },
            { label: 'WUR', linkType: 'custom', url: 'https://wur.nl', highlight: true },
          ],
        },
      } as never,
    })
    const nav = settings.header!.nav!
    await payload.update({
      collection: 'site-settings',
      id: settings.id,
      locale: 'nl',
      data: {
        general: { tagline: 'Sinds 1971' },
        header: {
          nav: [
            { id: nav[0]!.id, label: 'Over ons', linkType: 'page', page: about.id, children: [{ id: nav[0]!.children![0]!.id, label: 'Agenda', linkType: 'section', section: 'calendar', anchor: 'open-meetings' }] },
            { id: nav[1]!.id, label: 'WUR', linkType: 'custom', url: 'https://wur.nl', highlight: true },
          ],
        },
      } as never,
    })

    const nl = (await payload.findByID({ collection: 'site-settings', id: settings.id, locale: 'nl', depth: 1 })) as any
    expect(nl.general.tagline).toBe('Sinds 1971')
    expect(nl.header.nav[0].label).toBe('Over ons')
    expect(nl.header.nav[0].page.path).toBe('/over-ons')
    expect(nl.header.nav[0].children[0]).toMatchObject({ label: 'Agenda', section: 'calendar', anchor: 'open-meetings' })
    expect(nl.header.nav[1]).toMatchObject({ url: 'https://wur.nl', highlight: true })
    const en = (await payload.findByID({ collection: 'site-settings', id: settings.id, locale: 'en', depth: 1 })) as any
    expect(en.header.nav[0].label).toBe('About us')
    expect(en.header.nav[0].page.path).toBe('/about-us')
  })

  it('falls back to the English label when the Dutch one is not filled in', async () => {
    const found = await payload.find({ collection: 'site-settings', where: { tenant: { equals: bg } } })
    await payload.update({
      collection: 'site-settings',
      id: found.docs[0]!.id,
      locale: 'en',
      data: { footer: { columns: [{ title: 'Get involved', links: [{ label: 'Vacancies', linkType: 'section', section: 'vacancies' }] }] } } as never,
    })
    const nl = (await payload.findByID({ collection: 'site-settings', id: found.docs[0]!.id, locale: 'nl' })) as any
    expect(nl.footer.columns[0].title).toBe('Get involved')
    expect(nl.footer.columns[0].links[0].label).toBe('Vacancies')
  })

  it('keeps newsletter texts per language and the Brevo list for the site', async () => {
    const found = await payload.find({ collection: 'site-settings', where: { tenant: { equals: bg } } })
    const id = found.docs[0]!.id
    await payload.update({
      collection: 'site-settings',
      id,
      locale: 'en',
      data: { newsletter: { brevoListId: 7, heading: 'Stay in the loop', thanksTitle: 'Almost there' } } as never,
    })
    await payload.update({ collection: 'site-settings', id, locale: 'nl', data: { newsletter: { heading: 'Blijf op de hoogte' } } as never })
    const nl = (await payload.findByID({ collection: 'site-settings', id, locale: 'nl' })) as any
    expect(nl.newsletter).toMatchObject({ brevoListId: 7, heading: 'Blijf op de hoogte', thanksTitle: 'Almost there' })
  })

  it('lets a tenant admin change settings but not an editor', async () => {
    const found = await payload.find({ collection: 'site-settings', where: { tenant: { equals: bg } } })
    const id = found.docs[0]!.id
    await expect(
      payload.update({
        collection: 'site-settings',
        id,
        data: { calendar: { defaultView: 'month' } } as never,
        user: bgEditor,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/not allowed/)
    const updated = (await payload.update({
      collection: 'site-settings',
      id,
      data: { calendar: { defaultView: 'month' } } as never,
      user: bgAdmin,
      overrideAccess: false,
    })) as any
    expect(updated.calendar.defaultView).toBe('month')
  })

  it('rejects a redirect that does not start with a slash', async () => {
    await expect(
      payload.create({ collection: 'redirects', data: { from: 'old', to: '/new', tenant: bg } as never }),
    ).rejects.toThrow(/Old address/)
  })

  it('rejects a duplicate source within a tenant and allows it across tenants', async () => {
    await payload.create({ collection: 'redirects', data: { from: '/old', to: '/new', tenant: bg } as never })
    const error = await payload
      .create({ collection: 'redirects', data: { from: '/old', to: '/other', tenant: bg } as never })
      .catch((e) => e)
    expect(error?.data?.errors?.[0]).toMatchObject({ path: 'from', message: '/old already redirects somewhere.' })
    const twin = await payload.create({
      collection: 'redirects',
      data: { from: '/old', to: '/new', tenant: other } as never,
    })
    expect(twin.from).toBe('/old')
  })
})
