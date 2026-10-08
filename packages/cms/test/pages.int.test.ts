import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let bg: number | string
let other: number | string

async function page(tenant: number | string, title: string, slug: string, parent?: number | string) {
  return payload.create({
    collection: 'pages',
    locale: 'en',
    data: { title, slug, parent, tenant, _status: 'published' } as never,
    overrideAccess: true,
  })
}
async function read(id: number | string, locale: 'en' | 'nl') {
  return payload.findByID({ collection: 'pages', id, locale, fallbackLocale: false as never, depth: 0 })
}

describe('pages', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    bg = (await createTenant(payload, 'boerengroep')).id
    other = (await createTenant(payload, 'inspringtheater')).id
  })
  afterAll(async () => resetDb(payload))

  it('gives the home page the root path', async () => {
    const home = await page(bg, 'Home', 'home')
    expect(home.path).toBe('/')
  })

  it('builds a nested path per locale', async () => {
    const about = await page(bg, 'About us', 'about-us')
    await payload.update({
      collection: 'pages',
      id: about.id,
      locale: 'nl',
      data: { title: 'Over ons', slug: 'over-ons' } as never,
    })
    const history = await page(bg, 'History', 'history', about.id)
    await payload.update({
      collection: 'pages',
      id: history.id,
      locale: 'nl',
      data: { title: 'Geschiedenis', slug: 'geschiedenis' } as never,
    })

    expect((await read(history.id, 'en')).path).toBe('/about-us/history')
    expect((await read(history.id, 'nl')).path).toBe('/over-ons/geschiedenis')
  })

  it('updates translated descendants in one locale when a parent slug changes', async () => {
    const nl = (id: number | string, title: string, slug: string) =>
      payload.update({ collection: 'pages', id, locale: 'nl', data: { title, slug } as never })
    const parent = await page(bg, 'Library', 'library')
    const child = await page(bg, 'Archive', 'archive', parent.id)
    const grandchild = await page(bg, 'Old', 'old', child.id)
    await nl(parent.id, 'Bibliotheek', 'bibliotheek')
    await nl(child.id, 'Archief', 'archief')
    await nl(grandchild.id, 'Oud', 'oud')
    expect((await read(grandchild.id, 'nl')).path).toBe('/bibliotheek/archief/oud')

    await nl(parent.id, 'Boekerij', 'boekerij')

    expect((await read(child.id, 'nl')).path).toBe('/boekerij/archief')
    expect((await read(grandchild.id, 'nl')).path).toBe('/boekerij/archief/oud')
    expect((await read(grandchild.id, 'en')).path).toBe('/library/archive/old')
  })

  it('leaves a child without a Dutch version untouched when its parent gets a Dutch slug', async () => {
    const parent = await page(bg, 'Network', 'network')
    const child = await page(bg, 'Partners', 'partners', parent.id)

    await payload.update({
      collection: 'pages',
      id: parent.id,
      locale: 'nl',
      data: { title: 'Netwerk', slug: 'netwerk' } as never,
    })

    const dutch = await read(child.id, 'nl')
    expect(dutch.path ?? null).toBeNull()
    expect(dutch.title ?? null).toBeNull()
    expect((await read(child.id, 'en')).path).toBe('/network/partners')
  })

  it('builds a Dutch path under the English parent path when only the child is translated', async () => {
    const parent = await page(bg, 'Media', 'media')
    const child = await page(bg, 'Videos', 'videos', parent.id)
    await payload.update({
      collection: 'pages',
      id: child.id,
      locale: 'nl',
      data: { title: 'Filmpjes', slug: 'filmpjes' } as never,
    })
    expect((await read(child.id, 'nl')).path).toBe('/media/filmpjes')
  })

  it('rejects a second page with the same path in one tenant', async () => {
    await page(bg, 'Contact', 'contact')
    const error = await page(bg, 'Contact again', 'contact').catch((e) => e)
    expect(error?.data?.errors?.[0]).toMatchObject({
      path: 'slug',
      message: 'Another page already uses the path /contact.',
    })
  })

  it('allows the same path in a different tenant', async () => {
    const twin = await page(other, 'Contact', 'contact')
    expect(twin.path).toBe('/contact')
  })

  it('rejects a slug with capitals or spaces', async () => {
    await expect(page(bg, 'Bad', 'Bad Slug')).rejects.toThrow(/Address/)
  })

  it('hides drafts from anonymous readers', async () => {
    await payload.create({
      collection: 'pages',
      locale: 'en',
      data: { title: 'Secret', slug: 'secret', tenant: bg, _status: 'draft' } as never,
      overrideAccess: true,
    })
    const res = await payload.find({
      collection: 'pages',
      where: { path: { equals: '/secret' } },
      overrideAccess: false,
    })
    expect(res.totalDocs).toBe(0)
  })
})
