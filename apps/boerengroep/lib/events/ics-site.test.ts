import { describe, expect, it } from 'vitest'
import { eventPath, feedEvents, toIcsEvent } from './ics-site'
import type { SiteEvent } from './types'

const event: SiteEvent = {
  id: 12,
  slug: 'break-2026-10-08',
  title: 'Boerengroep Break',
  description: 'Soup and talk.',
  start: '2026-10-08T17:30:00.000Z',
  end: null,
  type: 'talk',
  status: 'full',
  statusNote: 'Waiting list',
  place: { address: 'Forum, Wageningen', callLink: 'https://meet.example/x' },
  people: [],
  featured: false,
  updatedAt: '2026-09-30T10:00:00.000Z',
}
const site = { base: 'https://boerengroep.nl', locale: 'nl' as const, tenant: 'boerengroep', onlineLabel: 'Online' }

describe('events in calendar files', () => {
  it('links back to the event page in the reader’s language', () => {
    expect(eventPath('break-2026-10-08')).toBe('/activities/calendar/break-2026-10-08')
    expect(toIcsEvent(event, site).url).toBe('https://boerengroep.nl/nl/activities/calendar/break-2026-10-08')
  })

  it('keeps one identity per event that does not depend on the web address', () => {
    expect(toIcsEvent(event, site).uid).toBe('event-12@boerengroep')
    expect(toIcsEvent(event, { ...site, base: 'https://staging.example', locale: 'en' }).uid).toBe('event-12@boerengroep')
  })

  it('puts the place in the location and the online link in the text', () => {
    const out = toIcsEvent(event, site)
    expect(out.location).toBe('Forum, Wageningen')
    expect(out.description).toBe('Soup and talk.\n\nOnline: https://meet.example/x')
    expect(out).toMatchObject({ status: 'full', statusNote: 'Waiting list', updatedAt: '2026-09-30T10:00:00.000Z' })
  })

  it('uses the online link as the location of an online event', () => {
    const out = toIcsEvent({ ...event, place: { callLink: 'https://meet.example/x' }, description: '' }, site)
    expect(out.location).toBe('https://meet.example/x')
    expect(out.description).toBe('')
  })

  it('offers everything that is coming and the past year in the feed', () => {
    const now = new Date('2026-10-08T12:00:00.000Z')
    const at = (start: string) => ({ ...event, id: start, start })
    const kept = feedEvents([at('2025-10-01T10:00:00.000Z'), at('2025-10-20T10:00:00.000Z'), at('2026-10-08T10:00:00.000Z'), at('2027-03-01T10:00:00.000Z')], now)
    expect(kept.map((e) => e.id)).toEqual(['2025-10-20T10:00:00.000Z', '2026-10-08T10:00:00.000Z', '2027-03-01T10:00:00.000Z'])
  })
})
