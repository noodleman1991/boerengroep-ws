import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let bg: number | string
let other: number | string
let otherEditor: any
let bgPage: { id: number | string }
let bgEvent: { id: number | string }

describe('tenant isolation for content', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    bg = (await createTenant(payload, 'boerengroep')).id
    other = (await createTenant(payload, 'inspringtheater')).id
    otherEditor = await payload.create({
      collection: 'users',
      data: {
        email: 'it-editor@site.test',
        password: 'correct-horse-battery',
        tenants: [{ tenant: other, roles: ['editor'] }],
      } as never,
      overrideAccess: true,
    })
    bgPage = await payload.create({
      collection: 'pages',
      locale: 'en',
      data: { title: 'BG contact', slug: 'contact', tenant: bg, _status: 'published' } as never,
    })
    bgEvent = await payload.create({
      collection: 'events',
      data: { title: 'BG event', slug: 'bg-event', startDate: '2026-01-01T10:00:00.000Z', tenant: bg } as never,
    })
    await payload.create({
      collection: 'pages',
      locale: 'en',
      data: { title: 'IT contact', slug: 'contact', tenant: other, _status: 'published' } as never,
    })
  })
  afterAll(async () => resetDb(payload))

  it('lists only the editor own tenant pages, even published ones of the other tenant', async () => {
    const res = await payload.find({ collection: 'pages', user: otherEditor, overrideAccess: false })
    expect(res.docs.map((d) => d.title)).toEqual(['IT contact'])
  })

  it('does not return the other tenant page by id', async () => {
    await expect(
      payload.findByID({ collection: 'pages', id: bgPage.id, user: otherEditor, overrideAccess: false }),
    ).rejects.toThrow(/Not Found|not allowed/i)
  })

  it('refuses an update of the other tenant page', async () => {
    await expect(
      payload.update({
        collection: 'pages',
        id: bgPage.id,
        data: { title: 'Hijacked' } as never,
        user: otherEditor,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/Not Found|not allowed/i)
    const stored = await payload.findByID({ collection: 'pages', id: bgPage.id })
    expect(stored.title).toBe('BG contact')
  })

  it('refuses a delete of the other tenant event', async () => {
    await expect(
      payload.delete({ collection: 'events', id: bgEvent.id, user: otherEditor, overrideAccess: false }),
    ).rejects.toThrow(/Not Found|not allowed/i)
    expect((await payload.find({ collection: 'events' })).totalDocs).toBe(1)
  })

  it('refuses creating a page inside the other tenant', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        locale: 'en',
        data: { title: 'Planted', slug: 'planted', tenant: bg, _status: 'published' } as never,
        user: otherEditor,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    const res = await payload.find({ collection: 'pages', where: { slug: { equals: 'planted' } } })
    expect(res.totalDocs).toBe(0)
  })

  it('lets the editor create a page in their own tenant', async () => {
    const created = await payload.create({
      collection: 'pages',
      locale: 'en',
      data: { title: 'Own page', slug: 'own-page', tenant: other, _status: 'published' } as never,
      user: otherEditor,
      overrideAccess: false,
    })
    expect(created.path).toBe('/own-page')
  })

  it('shows visitors published pages of both tenants through the raw API', async () => {
    // The public REST API is not tenant-filtered for anonymous readers.
    // The frontends never use it: they read through the tenant-bound query layer.
    const res = await payload.find({ collection: 'pages', overrideAccess: false })
    expect(res.totalDocs).toBe(3)
  })
})
