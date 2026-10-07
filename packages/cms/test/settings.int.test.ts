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

  it('stores localized navigation labels', async () => {
    const settings = await payload.create({
      collection: 'site-settings',
      locale: 'en',
      data: {
        tenant: bg,
        header: {
          logoAlt: 'Boerengroep',
          name: 'Stichting Boerengroep',
          nav: [{ href: '/about-us', label: 'about-us', labelText: 'About us' }],
        },
      } as never,
    })
    const navId = settings.header!.nav![0]!.id
    await payload.update({
      collection: 'site-settings',
      id: settings.id,
      locale: 'nl',
      data: { header: { nav: [{ id: navId, href: '/about-us', label: 'about-us', labelText: 'Over ons' }] } } as never,
    })
    const nl = await payload.findByID({ collection: 'site-settings', id: settings.id, locale: 'nl' })
    expect(nl.header?.nav?.[0]?.labelText).toBe('Over ons')
  })

  it('lets a tenant admin change settings but not an editor', async () => {
    const found = await payload.find({ collection: 'site-settings', where: { tenant: { equals: bg } } })
    const id = found.docs[0]!.id
    await expect(
      payload.update({
        collection: 'site-settings',
        id,
        data: { theme: { font: 'lato' } } as never,
        user: bgEditor,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/not allowed/)
    const updated = await payload.update({
      collection: 'site-settings',
      id,
      data: { theme: { font: 'lato' } } as never,
      user: bgAdmin,
      overrideAccess: false,
    })
    expect(updated.theme?.font).toBe('lato')
  })

  it('rejects a redirect that does not start with a slash', async () => {
    await expect(
      payload.create({ collection: 'redirects', data: { from: 'old', to: '/new', tenant: bg } as never }),
    ).rejects.toThrow(/From URL/)
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
