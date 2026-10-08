import { describe, expect, it } from 'vitest'
import { calendarFile, escapeText, foldLine, type IcsEvent } from './ics'

const now = new Date('2026-10-01T08:00:00.000Z')
const labels = { full: 'Full', cancelled: 'Cancelled', postponed: 'Postponed' }

const evening: IcsEvent = {
  uid: 'event-12@boerengroep.nl',
  title: 'Boerengroep Break',
  description: 'Soup, talk and music.\nBring a friend; bring a bowl, too.',
  start: '2026-10-08T17:30:00.000Z',
  end: '2026-10-08T19:00:00.000Z',
  location: 'Forum, Droevendaalsesteeg 2, Wageningen',
  url: 'https://boerengroep.nl/en/activities/calendar/boerengroep-break-2026-10-08',
  status: 'scheduled',
  updatedAt: '2026-09-30T10:00:00.000Z',
}

const lines = (file: string) => file.split('\r\n')
const unfolded = (file: string) => file.replace(/\r\n /g, '').split('\r\n')

describe('calendar files', () => {
  it('escapes the characters the format reserves', () => {
    expect(escapeText('a, b; c \\ d\ne')).toBe('a\\, b\; c \\\\ d\\ne')
    expect(escapeText('line one\r\nline two')).toBe('line one\\nline two')
  })

  it('folds long lines at 75 bytes without cutting a character in half', () => {
    const long = `SUMMARY:${'🎬Film night '.repeat(12)}`
    const folded = foldLine(long)
    const parts = folded.split('\r\n')
    expect(parts.length).toBeGreaterThan(1)
    for (const part of parts) expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75)
    for (const part of parts.slice(1)) expect(part.startsWith(' ')).toBe(true)
    expect(parts.map((p, i) => (i === 0 ? p : p.slice(1))).join('')).toBe(long)
    expect(foldLine('SUMMARY:short')).toBe('SUMMARY:short')
  })

  it('writes one event with times in UTC, so every calendar shows the right hour', () => {
    const file = calendarFile([evening], { name: 'Boerengroep', now, labels })
    expect(file.endsWith('\r\n')).toBe(true)
    expect(file.includes('\n') && !/[^\r]\n/.test(file)).toBe(true)
    const all = unfolded(file)
    expect(all.slice(0, 3)).toEqual(['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Boerengroep//Events//EN'])
    expect(all).toContain('BEGIN:VEVENT')
    expect(all).toContain('UID:event-12@boerengroep.nl')
    expect(all).toContain('DTSTAMP:20261001T080000Z')
    expect(all).toContain('DTSTART:20261008T173000Z')
    expect(all).toContain('DTEND:20261008T190000Z')
    expect(all).toContain('SUMMARY:Boerengroep Break')
    expect(all).toContain('DESCRIPTION:Soup\\, talk and music.\\nBring a friend\; bring a bowl\\, too.\\n\\nhttps://boerengroep.nl/en/activities/calendar/boerengroep-break-2026-10-08')
    expect(all).toContain('LOCATION:Forum\\, Droevendaalsesteeg 2\\, Wageningen')
    expect(all).toContain('URL:https://boerengroep.nl/en/activities/calendar/boerengroep-break-2026-10-08')
    expect(all).toContain('STATUS:CONFIRMED')
    expect(all).toContain('LAST-MODIFIED:20260930T100000Z')
    expect(all.at(-2)).toBe('END:VCALENDAR')
  })

  it('gives an event without an end two hours', () => {
    const all = unfolded(calendarFile([{ ...evening, end: null }], { name: 'x', now, labels }))
    expect(all).toContain('DTEND:20261008T193000Z')
  })

  it('ignores an end that lies before the start', () => {
    const all = unfolded(calendarFile([{ ...evening, end: '2026-10-01T19:00:00.000Z' }], { name: 'x', now, labels }))
    expect(all).toContain('DTEND:20261008T193000Z')
  })

  it('writes whole days as dates, with the last day included', () => {
    const weekend = { ...evening, start: '2026-09-25T22:00:00.000Z', end: '2026-09-26T22:00:00.000Z' }
    const all = unfolded(calendarFile([weekend], { name: 'x', now, labels }))
    expect(all).toContain('DTSTART;VALUE=DATE:20260926')
    expect(all).toContain('DTEND;VALUE=DATE:20260928')
    const oneDay = unfolded(calendarFile([{ ...weekend, end: null }], { name: 'x', now, labels }))
    expect(oneDay).toContain('DTEND;VALUE=DATE:20260927')
  })

  it('marks a cancelled event as cancelled, so it is struck out in a subscribed calendar', () => {
    const all = unfolded(calendarFile([{ ...evening, status: 'cancelled', statusNote: 'Too few sign-ups' }], { name: 'x', now, labels }))
    expect(all).toContain('STATUS:CANCELLED')
    expect(all).toContain('SUMMARY:Cancelled: Boerengroep Break')
    expect(all.find((l) => l.startsWith('DESCRIPTION:'))).toMatch(/^DESCRIPTION:Cancelled\. Too few sign-ups\\n\\nSoup/)
  })

  it('marks a postponed event as not happening on this date', () => {
    const all = unfolded(calendarFile([{ ...evening, status: 'postponed' }], { name: 'x', now, labels }))
    expect(all).toContain('STATUS:CANCELLED')
    expect(all).toContain('SUMMARY:Postponed: Boerengroep Break')
  })

  it('says so in the title when an event is full, but keeps it confirmed', () => {
    const all = unfolded(calendarFile([{ ...evening, status: 'full' }], { name: 'x', now, labels }))
    expect(all).toContain('STATUS:CONFIRMED')
    expect(all).toContain('SUMMARY:Boerengroep Break (Full)')
  })

  it('raises the sequence when an event is edited, so calendars take over the change', () => {
    const seq = (updatedAt: string) =>
      Number(unfolded(calendarFile([{ ...evening, updatedAt }], { name: 'x', now, labels })).find((l) => l.startsWith('SEQUENCE:'))?.slice(9))
    expect(seq('2026-09-30T10:00:01.000Z')).toBeGreaterThan(seq('2026-09-30T10:00:00.000Z'))
    expect(seq('2026-09-30T10:00:00.000Z')).toBeGreaterThanOrEqual(0)
  })

  it('writes a feed that calendars refresh and name', () => {
    const file = calendarFile([evening, { ...evening, uid: 'event-13@boerengroep.nl' }], { name: 'Boerengroep, events', now, labels, feed: true })
    const all = unfolded(file)
    expect(all).toContain('METHOD:PUBLISH')
    expect(all).toContain('X-WR-CALNAME:Boerengroep\\, events')
    expect(all).toContain('X-WR-TIMEZONE:Europe/Amsterdam')
    expect(all).toContain('REFRESH-INTERVAL;VALUE=DURATION:PT6H')
    expect(all).toContain('X-PUBLISHED-TTL:PT6H')
    expect(all.filter((l) => l === 'BEGIN:VEVENT')).toHaveLength(2)
    for (const line of lines(file)) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
  })

  it('writes a valid empty feed', () => {
    const all = unfolded(calendarFile([], { name: 'x', now, labels, feed: true }))
    expect(all[0]).toBe('BEGIN:VCALENDAR')
    expect(all).not.toContain('BEGIN:VEVENT')
  })
})
