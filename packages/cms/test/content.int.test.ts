import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let tenant: number | string

describe('content collections', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    tenant = (await createTenant(payload, 'boerengroep')).id
  })
  afterAll(async () => resetDb(payload))

  it('links an event to a speaker with a role', async () => {
    const speaker = await payload.create({
      collection: 'speakers',
      data: { name: 'Dr. Maria van der Meer', affiliation: 'WUR', tenant } as never,
    })
    const event = await payload.create({
      collection: 'events',
      data: {
        title: 'Boerengroep Break: Samhain',
        slug: 'Boerengroep-Break-Samhain',
        language: 'en',
        startDate: '2025-10-30T18:30:00.000Z',
        speakers: [{ speaker: speaker.id, role: 'Host' }],
        tenant,
      } as never,
      depth: 1,
    })
    expect((event.speakers?.[0]?.speaker as { name: string }).name).toBe('Dr. Maria van der Meer')
    expect(event.slug).toBe('Boerengroep-Break-Samhain')
  })

  it('marks a new event as scheduled and lets an editor mark it full', async () => {
    const event = await payload.create({
      collection: 'events',
      data: { title: 'Seed swap', slug: 'seed-swap', startDate: '2026-11-01T10:00:00.000Z', tenant } as never,
    })
    expect(event.status).toBe('scheduled')
    const full = await payload.update({
      collection: 'events',
      id: event.id,
      data: { status: 'full', statusNote: 'Waiting list via email' } as never,
    })
    expect(full.status).toBe('full')
  })

  it('makes the address of an event from its title and date when none is given', async () => {
    const make = () =>
      payload.create({
        collection: 'events',
        data: { title: 'Boerengroep Break', startDate: '2026-12-03T18:30:00.000Z', tenant } as never,
      })
    const first = await make()
    const second = await make()
    expect(first.slug).toBe('boerengroep-break-2026-12-03')
    expect(second.slug).toBe('boerengroep-break-2026-12-03-2')
  })

  it('keeps the address when the title of an event changes later', async () => {
    const event = await payload.create({
      collection: 'events',
      data: { title: 'Farm walk', startDate: '2026-12-10T09:00:00.000Z', tenant } as never,
    })
    const renamed = await payload.update({ collection: 'events', id: event.id, data: { title: 'Winter farm walk' } as never })
    expect(renamed.slug).toBe('farm-walk-2026-12-10')
  })

  it('refuses a second event with the same address on one site', async () => {
    const error = await payload
      .create({
        collection: 'events',
        data: { title: 'Seed swap again', slug: 'seed-swap', startDate: '2026-11-02T10:00:00.000Z', tenant } as never,
      })
      .catch((e) => e)
    expect(error?.data?.errors?.[0]).toMatchObject({ path: 'slug' })
    expect(error.data.errors[0].message).toMatch(/already used/)
  })

  it('keeps photos on a past event in the order they were added', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64',
    )
    const ids: (number | string)[] = []
    for (const name of ['b.png', 'a.png']) {
      const m = await payload.create({
        collection: 'media',
        data: { alt: name, caption: `Caption ${name}`, tenant } as never,
        file: { data: png, mimetype: 'image/png', name, size: png.length },
      })
      ids.push(m.id)
    }
    const recap = await payload.create({
      collection: 'past-events',
      data: { title: 'With photos', slug: 'With-photos', date: '2026-01-01T10:00:00.000Z', photos: ids, tenant, _status: 'published' } as never,
      depth: 1,
    })
    expect((recap.photos as any[]).map((p) => p.filename)).toEqual(['b.png', 'a.png'])
    expect((recap.photos as any[])[0].caption).toBe('Caption b.png')
  })

  it('gives an event a kind that editors made themselves, with a name per language and a colour', async () => {
    const kind = await payload.create({
      collection: 'event-kinds',
      locale: 'en',
      data: { name: 'Seed swap', colour: 'orange', tenant } as never,
    })
    await payload.update({ collection: 'event-kinds', id: kind.id, locale: 'nl', data: { name: 'Zadenruil' } as never })
    const event = await payload.create({
      collection: 'events',
      data: { title: 'Autumn seed swap', startDate: '2026-11-21T13:00:00.000Z', kind: kind.id, tenant } as never,
    })
    const inDutch = await payload.findByID({ collection: 'events', id: event.id, locale: 'nl', depth: 1 })
    expect(inDutch.kind).toMatchObject({ name: 'Zadenruil', colour: 'orange' })
    const inEnglish = await payload.findByID({ collection: 'events', id: event.id, locale: 'en', depth: 1 })
    expect(inEnglish.kind).toMatchObject({ name: 'Seed swap' })
  })

  it('lets an event go without a kind, and refuses a colour that is not on the list', async () => {
    const event = await payload.create({
      collection: 'events',
      data: { title: 'No kind', startDate: '2026-11-22T13:00:00.000Z', tenant } as never,
    })
    expect(event.kind ?? null).toBeNull()
    await expect(
      payload.create({ collection: 'event-kinds', data: { name: 'Odd', colour: 'chartreuse', tenant } as never }),
    ).rejects.toThrow(/Colour/)
  })

  it('keeps one vacancy in both languages, and shows English where Dutch is not written yet', async () => {
    const vacancy = await payload.create({
      collection: 'vacancies',
      locale: 'en',
      data: { title: 'Secretary', slug: 'Secretary', opportunityType: 'board', duration: 'One year', requiredSkills: ['Minutes'], tenant } as never,
    })
    await payload.update({ collection: 'vacancies', id: vacancy.id, locale: 'nl', data: { title: 'Secretaris' } as never })
    const nl = await payload.findByID({ collection: 'vacancies', id: vacancy.id, locale: 'nl' })
    expect(nl.title).toBe('Secretaris')
    expect(nl.duration).toBe('One year')
    expect(nl.requiredSkills).toEqual(['Minutes'])
    expect((await payload.findByID({ collection: 'vacancies', id: vacancy.id, locale: 'en' })).title).toBe('Secretary')
    expect('language' in nl).toBe(false)
  })

  it('keeps an unpublished newsletter away from visitors', async () => {
    await payload.create({
      collection: 'newsletters',
      data: {
        title: 'Draft issue',
        slug: 'Draft-issue',
        type: 'article',
        organization: 'Boerengroep',
        publishDate: '2026-01-01T10:00:00.000Z',
        tenant,
        _status: 'draft',
      } as never,
    })
    const res = await payload.find({ collection: 'newsletters', overrideAccess: false })
    expect(res.totalDocs).toBe(0)
  })

  it('accepts a past event that points at a calendar event and an author', async () => {
    const author = await payload.create({ collection: 'authors', data: { name: 'Cami', tenant } as never })
    const tag = await payload.create({ collection: 'tags', data: { name: 'weekend', tenant } as never })
    const events = await payload.find({ collection: 'events', limit: 1 })
    const recap = await payload.create({
      collection: 'past-events',
      data: {
        title: 'Boerengroep Weekend',
        slug: 'Boerengroep-Weekend',
        date: '2025-09-01T10:00:00.000Z',
        author: author.id,
        relatedEvent: events.docs[0]!.id,
        tags: [tag.id],
        tenant,
        _status: 'published',
      } as never,
    })
    expect(recap.slug).toBe('Boerengroep-Weekend')
  })

  it('stores a vacancy with list fields', async () => {
    const vacancy = await payload.create({
      collection: 'vacancies',
      data: {
        title: 'General Board Member',
        slug: 'General-Board-Member',
        language: 'en',
        opportunityType: 'board',
        requiredSkills: ['organising', 'writing'],
        languagesRequired: ['English'],
        tenant,
      } as never,
    })
    expect(vacancy.requiredSkills).toEqual(['organising', 'writing'])
  })
})
