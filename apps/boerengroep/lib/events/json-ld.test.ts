import { describe, expect, it } from 'vitest'
import { siteUrlFrom } from '../site-url'
import { eventJsonLd, jsonLdScript } from './json-ld'
import type { SiteEvent } from './types'

const event: SiteEvent = {
  id: 7,
  slug: 'break-2026-10-08',
  title: 'Boerengroep Break',
  description: 'Soup and talk.',
  start: '2026-10-08T17:30:00.000Z',
  end: '2026-10-08T19:00:00.000Z',
  status: 'scheduled',
  place: { address: 'Forum, Wageningen' },
  image: { share: 'https://blob/share.jpg', original: 'https://blob/o.jpg', alt: 'x' },
  people: [],
  featured: false,
}
const ctx = { url: 'https://boerengroep.nl/en/activities/calendar/break-2026-10-08', organizer: { name: 'Stichting Boerengroep', url: 'https://boerengroep.nl' } }

describe('event data for search engines', () => {
  it('describes an event in a place', () => {
    expect(eventJsonLd(event, ctx)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Boerengroep Break',
      description: 'Soup and talk.',
      startDate: '2026-10-08T17:30:00.000Z',
      endDate: '2026-10-08T19:00:00.000Z',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'Place', name: 'Forum, Wageningen', address: 'Forum, Wageningen' },
      image: ['https://blob/share.jpg'],
      organizer: { '@type': 'Organization', name: 'Stichting Boerengroep', url: 'https://boerengroep.nl' },
      url: ctx.url,
    })
  })

  it('says when an event is cancelled, postponed, online or both', () => {
    expect(eventJsonLd({ ...event, status: 'cancelled' }, ctx).eventStatus).toBe('https://schema.org/EventCancelled')
    expect(eventJsonLd({ ...event, status: 'postponed' }, ctx).eventStatus).toBe('https://schema.org/EventPostponed')
    const online = eventJsonLd({ ...event, place: { callLink: 'https://meet.example/x' } }, ctx)
    expect(online.eventAttendanceMode).toBe('https://schema.org/OnlineEventAttendanceMode')
    expect(online.location).toEqual({ '@type': 'VirtualLocation', url: 'https://meet.example/x' })
    const both = eventJsonLd({ ...event, place: { address: 'Forum', callLink: 'https://meet.example/x' } }, ctx)
    expect(both.eventAttendanceMode).toBe('https://schema.org/MixedEventAttendanceMode')
  })

  it('uses plain dates for whole days and leaves out what is not known', () => {
    const weekend = eventJsonLd(
      { ...event, start: '2026-09-25T22:00:00.000Z', end: '2026-09-26T22:00:00.000Z', image: undefined, description: '', place: {} },
      ctx,
    )
    expect(weekend.startDate).toBe('2026-09-26')
    expect(weekend.endDate).toBe('2026-09-27')
    expect('image' in weekend).toBe(false)
    expect('description' in weekend).toBe(false)
    expect('location' in weekend).toBe(false)
  })

  it('cannot be broken out of by text in an event', () => {
    const script = jsonLdScript({ name: '</script><script>alert(1)</script>' })
    expect(script).not.toContain('</script>')
    expect(JSON.parse(script)).toEqual({ name: '</script><script>alert(1)</script>' })
  })
})

describe('the address of the site', () => {
  it('prefers the public address and drops a trailing slash', () => {
    expect(siteUrlFrom({ NEXT_PUBLIC_SITE_URL: 'https://boerengroep.nl/', BASE_URL: 'https://other' })).toBe('https://boerengroep.nl')
    expect(siteUrlFrom({ BASE_URL: 'https://boerengroep.nl' })).toBe('https://boerengroep.nl')
  })
  it('uses the deployment address on a preview, and localhost on a laptop', () => {
    expect(siteUrlFrom({ VERCEL_URL: 'bg-git-x.vercel.app' })).toBe('https://bg-git-x.vercel.app')
    expect(siteUrlFrom({})).toBe('http://localhost:3000')
  })
})
