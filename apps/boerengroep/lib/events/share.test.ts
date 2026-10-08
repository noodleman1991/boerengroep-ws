import { describe, expect, it } from 'vitest'
import { addToCalendarLinks, mapsUrl, shareLinks, subscribeLinks, webAddress } from './share'

const event = {
  title: 'Film: Six Inches of Soil & more',
  start: '2026-10-08T17:30:00.000Z',
  end: '2026-10-08T19:00:00.000Z' as string | null,
  description: 'A film night.',
  location: 'Forum, Wageningen',
}
const url = 'https://boerengroep.nl/en/activities/calendar/film-2026-10-08'

describe('sharing an event', () => {
  it('builds a WhatsApp message with the title, the time and the link', () => {
    const { whatsapp } = shareLinks({ title: event.title, when: 'Thursday 8 October 2026, 19:30', url })
    expect(whatsapp.startsWith('https://wa.me/?text=')).toBe(true)
    expect(decodeURIComponent(whatsapp.split('text=')[1]!)).toBe(
      `Film: Six Inches of Soil & more\nThursday 8 October 2026, 19:30\n${url}`,
    )
  })

  it('builds an email with a subject and a body', () => {
    const { email } = shareLinks({ title: event.title, when: 'Thursday 8 October 2026, 19:30', url })
    const query = new URLSearchParams(email.replace('mailto:?', ''))
    expect(query.get('subject')).toBe('Film: Six Inches of Soil & more')
    expect(query.get('body')).toBe(`Film: Six Inches of Soil & more\nThursday 8 October 2026, 19:30\n\n${url}`)
    // Spaces as %20, since mail programs show a plus sign literally.
    expect(email).not.toContain('+')
  })
})

describe('adding an event to your own calendar', () => {
  it('links to Google Calendar with the times in UTC', () => {
    const { google } = addToCalendarLinks(event, url)
    const u = new URL(google)
    expect(u.origin + u.pathname).toBe('https://calendar.google.com/calendar/render')
    expect(u.searchParams.get('action')).toBe('TEMPLATE')
    expect(u.searchParams.get('text')).toBe(event.title)
    expect(u.searchParams.get('dates')).toBe('20261008T173000Z/20261008T190000Z')
    expect(u.searchParams.get('location')).toBe('Forum, Wageningen')
    expect(u.searchParams.get('details')).toBe(`A film night.\n\n${url}`)
  })

  it('links to Outlook', () => {
    const { outlook } = addToCalendarLinks(event, url)
    const u = new URL(outlook)
    expect(u.origin + u.pathname).toBe('https://outlook.live.com/calendar/0/action/compose')
    expect(u.searchParams.get('subject')).toBe(event.title)
    expect(u.searchParams.get('startdt')).toBe('2026-10-08T17:30:00Z')
    expect(u.searchParams.get('enddt')).toBe('2026-10-08T19:00:00Z')
  })

  it('gives an event without an end two hours, like the calendar file does', () => {
    const { google } = addToCalendarLinks({ ...event, end: null }, url)
    expect(new URL(google).searchParams.get('dates')).toBe('20261008T173000Z/20261008T193000Z')
  })

  it('uses dates for whole days, the last day included', () => {
    const weekend = { ...event, start: '2026-09-25T22:00:00.000Z', end: '2026-09-26T22:00:00.000Z' }
    const { google, outlook } = addToCalendarLinks(weekend, url)
    expect(new URL(google).searchParams.get('dates')).toBe('20260926/20260928')
    const o = new URL(outlook)
    expect(o.searchParams.get('allday')).toBe('true')
    expect(o.searchParams.get('startdt')).toBe('2026-09-26')
    expect(o.searchParams.get('enddt')).toBe('2026-09-28')
  })
})

describe('subscribing to the whole calendar', () => {
  it('offers the address in the forms calendar apps expect', () => {
    const links = subscribeLinks('https://boerengroep.nl/calendar.ics?lang=nl')
    expect(links.address).toBe('https://boerengroep.nl/calendar.ics?lang=nl')
    expect(links.app).toBe('webcal://boerengroep.nl/calendar.ics?lang=nl')
    expect(new URL(links.google).searchParams.get('cid')).toBe('webcal://boerengroep.nl/calendar.ics?lang=nl')
    expect(new URL(links.outlook).searchParams.get('url')).toBe('https://boerengroep.nl/calendar.ics?lang=nl')
  })
})

describe('map link', () => {
  it('uses the editor’s own link when there is one', () => {
    expect(mapsUrl({ address: 'Forum', mapsLink: 'https://maps.app.goo.gl/x' })).toBe('https://maps.app.goo.gl/x')
  })
  it('searches for the place otherwise', () => {
    expect(mapsUrl({ address: 'Forum, Droevendaalsesteeg 2' })).toBe(
      'https://www.google.com/maps/search/?api=1&query=Forum%2C%20Droevendaalsesteeg%202',
    )
  })
  it('has no link without a place, or for a link that is not a web address', () => {
    expect(mapsUrl({})).toBeUndefined()
    expect(mapsUrl({ address: 'Forum', mapsLink: 'javascript:alert(1)' })).toBe('https://www.google.com/maps/search/?api=1&query=Forum')
  })
})

describe('links typed by editors', () => {
  it('are only used when they are web addresses', () => {
    expect(webAddress(' https://meet.example/x ')).toBe('https://meet.example/x')
    expect(webAddress('javascript:alert(1)')).toBeUndefined()
    expect(webAddress('meet.example/x')).toBeUndefined()
    expect(webAddress(null)).toBeUndefined()
  })
})
