import { describe, expect, it } from 'vitest'
import { eventsByDay, groupByMonth, isUpcoming, kindsIn, pickEvents, splitEvents } from './select'

type Kind = { id: string; name: string; colour: string }
type E = { id: number; start: string; end: string | null; kind?: Kind; featured?: boolean }
// Kinds as editors make them in the admin panel.
const KINDS: Record<string, Kind> = {
  talk: { id: '1', name: 'Talk', colour: 'green' },
  workshop: { id: '2', name: 'Workshop', colour: 'orange' },
  pot: { id: '3', name: 'Open Pot', colour: 'red' },
}
const e = (id: number, start: string, end: string | null = null, kind: string | null = 'talk', featured = false): E => ({
  id,
  start,
  end,
  kind: kind ? KINDS[kind] : undefined,
  featured,
})

// Thursday 8 October 2026, 14:00 in Wageningen.
const now = new Date('2026-10-08T12:00:00.000Z')

describe('upcoming or past', () => {
  it('keeps an event on the list until it has ended', () => {
    expect(isUpcoming(e(1, '2026-10-08T10:00:00.000Z', '2026-10-08T13:00:00.000Z'), now)).toBe(true)
    expect(isUpcoming(e(1, '2026-10-08T08:00:00.000Z', '2026-10-08T11:00:00.000Z'), now)).toBe(false)
  })

  it('keeps an event without an end for the rest of its Dutch day', () => {
    expect(isUpcoming(e(1, '2026-10-08T07:00:00.000Z'), now)).toBe(true)
    expect(isUpcoming(e(1, '2026-10-07T21:00:00.000Z'), now)).toBe(false)
    // Just after midnight in Wageningen on the 9th: yesterday's event is over.
    expect(isUpcoming(e(1, '2026-10-08T17:30:00.000Z'), new Date('2026-10-08T22:30:00.000Z'))).toBe(false)
  })

  it('does not trust an end that lies before the start', () => {
    expect(isUpcoming(e(1, '2026-10-20T15:00:00.000Z', '2026-09-30T17:00:00.000Z'), now)).toBe(true)
  })

  it('counts the last whole day of a weekend as still going', () => {
    // Whole days 10 and 11 October. On the 11th at noon it is still on.
    const weekend = e(1, '2026-10-09T22:00:00.000Z', '2026-10-10T22:00:00.000Z')
    expect(isUpcoming(weekend, new Date('2026-10-11T10:00:00.000Z'))).toBe(true)
    expect(isUpcoming(weekend, new Date('2026-10-11T22:30:00.000Z'))).toBe(false)
  })

  it('lists what is coming soonest first and what has been latest first', () => {
    const events = [e(1, '2026-11-01T10:00:00.000Z'), e(2, '2026-09-01T10:00:00.000Z'), e(3, '2026-10-20T10:00:00.000Z'), e(4, '2026-10-01T10:00:00.000Z')]
    const { upcoming, past } = splitEvents(events, now)
    expect(upcoming.map((x) => x.id)).toEqual([3, 1])
    expect(past.map((x) => x.id)).toEqual([4, 2])
  })
})

describe('grouping', () => {
  it('groups by Dutch month and keeps the order', () => {
    const groups = groupByMonth([e(1, '2026-10-20T10:00:00.000Z'), e(2, '2026-10-31T23:30:00.000Z'), e(3, '2026-11-05T10:00:00.000Z')])
    expect(groups.map((g) => [g.month, g.events.map((x) => x.id)])).toEqual([
      ['2026-10', [1]],
      ['2026-11', [2, 3]],
    ])
  })

  it('puts an event on every day it spans', () => {
    const days = eventsByDay([
      e(1, '2026-10-08T17:30:00.000Z', '2026-10-08T19:00:00.000Z'),
      e(2, '2026-10-09T22:00:00.000Z', '2026-10-10T22:00:00.000Z'),
      e(3, '2026-10-08T07:00:00.000Z'),
    ])
    expect(days.get('2026-10-08')?.map((x) => x.id)).toEqual([3, 1])
    expect(days.get('2026-10-10')?.map((x) => x.id)).toEqual([2])
    expect(days.get('2026-10-11')?.map((x) => x.id)).toEqual([2])
    expect(days.has('2026-10-12')).toBe(false)
  })

  it('does not spread an event over weeks because of a wrong end date', () => {
    const days = eventsByDay([e(1, '2026-10-08T17:30:00.000Z', '2026-09-01T19:00:00.000Z')])
    expect([...days.keys()]).toEqual(['2026-10-08'])
  })

  it('lists each kind that has events once, by name, with how many events it has', () => {
    const kinds = kindsIn([e(1, 'x', null, 'workshop'), e(2, 'x', null, 'talk'), e(3, 'x', null, 'workshop'), e(4, 'x', null, 'pot'), e(5, 'x', null, null)], 'en')
    expect(kinds.map((kind) => [kind.name, kind.count])).toEqual([['Open Pot', 1], ['Talk', 1], ['Workshop', 2]])
    expect(kinds[0]).toMatchObject({ id: '3', colour: 'red' })
  })

  it('offers no kinds when no event has one', () => {
    expect(kindsIn([e(1, 'x', null, null)], 'en')).toEqual([])
  })
})

describe('events for a band on a page', () => {
  const events = [
    e(1, '2026-09-01T10:00:00.000Z', null, 'talk'),
    e(2, '2026-10-20T10:00:00.000Z', null, 'workshop'),
    e(3, '2026-11-01T10:00:00.000Z', null, 'talk', true),
    e(4, '2026-12-01T10:00:00.000Z', null, 'talk'),
    e(5, '2026-10-01T10:00:00.000Z', null, 'workshop'),
  ]

  it('takes the next ones, the spotlighted one first', () => {
    expect(pickEvents(events, { mode: 'upcoming', count: 2 }, now).map((x) => x.id)).toEqual([3, 2])
    expect(pickEvents(events, { mode: 'upcoming', count: 5 }, now).map((x) => x.id)).toEqual([3, 2, 4])
  })

  it('can stay with one kind', () => {
    expect(pickEvents(events, { mode: 'type', kind: 2, count: 3 }, now).map((x) => x.id)).toEqual([2])
  })

  it('shows hand-picked events in the editor’s order, also when they have passed', () => {
    expect(pickEvents(events, { mode: 'picked', picked: [5, 3, 99], count: 3 }, now).map((x) => x.id)).toEqual([5, 3])
  })

  it('falls back to the most recent ones when nothing is coming, and says so', () => {
    const none = pickEvents(events.slice(0, 1).concat(events[4]!), { mode: 'upcoming', count: 3 }, now)
    expect(none).toEqual([])
    const recent = pickEvents(events.slice(0, 1).concat(events[4]!), { mode: 'upcoming', count: 3, orRecent: true }, now)
    expect(recent.map((x) => x.id)).toEqual([5, 1])
  })
})
