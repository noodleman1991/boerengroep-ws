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
        eventType: 'workshop',
        speakers: [{ speaker: speaker.id, role: 'Host' }],
        tenant,
      } as never,
      depth: 1,
    })
    expect((event.speakers?.[0]?.speaker as { name: string }).name).toBe('Dr. Maria van der Meer')
    expect(event.slug).toBe('Boerengroep-Break-Samhain')
  })

  it('rejects an event type that is not in the list', async () => {
    await expect(
      payload.create({
        collection: 'events',
        data: {
          title: 'x',
          slug: 'x',
          startDate: '2025-10-30T18:30:00.000Z',
          eventType: 'party',
          tenant,
        } as never,
      }),
    ).rejects.toThrow(/Event Type/)
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
