import { describe, expect, it } from 'vitest'
import { groupVacancies, vacancyState } from './vacancies'

// Thursday 8 October 2026, three in the afternoon in the Netherlands.
const now = new Date('2026-10-08T13:00:00.000Z')
// The admin saves a chosen day as midnight Dutch time, which is 22:00 UTC the evening before.
const day = (date: string) => new Date(`${date}T00:00:00+02:00`).toISOString()

describe('whether people can still apply', () => {
  it('is always open when the editor ticked "always open", whatever the date says', () => {
    expect(vacancyState({ openApplication: true }, now)).toEqual({ state: 'open' })
    expect(vacancyState({ openApplication: true, applicationDeadline: day('2020-01-01') }, now)).toEqual({ state: 'open' })
  })

  it('is open when no last day was given', () => {
    expect(vacancyState({}, now)).toEqual({ state: 'open' })
    expect(vacancyState({ openApplication: false, applicationDeadline: null }, now)).toEqual({ state: 'open' })
  })

  it('is open up to and including the last day, by the Dutch calendar', () => {
    expect(vacancyState({ applicationDeadline: day('2026-10-20') }, now)).toEqual({ state: 'until', deadline: '2026-10-20' })
    expect(vacancyState({ applicationDeadline: day('2026-10-08') }, now)).toEqual({ state: 'until', deadline: '2026-10-08' })
    // Five to midnight on the last day is still in time.
    expect(vacancyState({ applicationDeadline: day('2026-10-08') }, new Date('2026-10-08T21:55:00.000Z')).state).toBe('until')
  })

  it('shows as closed for three days after the last day, then leaves the page', () => {
    expect(vacancyState({ applicationDeadline: day('2026-10-07') }, now)).toEqual({ state: 'closed', deadline: '2026-10-07' })
    expect(vacancyState({ applicationDeadline: day('2026-10-05') }, now).state).toBe('closed')
    expect(vacancyState({ applicationDeadline: day('2026-10-04') }, now).state).toBe('gone')
  })
})

describe('the vacancies page', () => {
  const v = (id: number, opportunityType: string, extra: Record<string, unknown> = {}) => ({ id, title: `Vacancy ${id}`, opportunityType, ...extra })
  const all = [
    v(1, 'volunteer', { openApplication: true }),
    v(2, 'volunteer', { applicationDeadline: day('2026-11-01') }),
    v(3, 'volunteer', { applicationDeadline: day('2026-10-12') }),
    v(4, 'volunteer', { applicationDeadline: day('2026-10-06') }),
    v(5, 'volunteer', { applicationDeadline: day('2025-09-29') }),
    v(6, 'volunteer'),
    v(7, 'board', { openApplication: true }),
    v(8, 'something-new'),
    v(9, null as never),
  ]

  it('groups by kind in a fixed order and leaves out vacancies that closed long ago', () => {
    const groups = groupVacancies(all, now)
    expect(groups.map((group) => [group.kind, group.items.map((item) => item.vacancy.id)])).toEqual([
      ['volunteer', [3, 2, 1, 6, 4]],
      ['board', [7]],
      ['other', [8, 9]],
    ])
  })

  it('puts the nearest last day first, then the ones that are always open, and closed ones last', () => {
    const [volunteer] = groupVacancies(all, now)
    expect(volunteer!.items.map((item) => item.state)).toEqual(['until', 'until', 'open', 'open', 'closed'])
  })

  it('counts only what people can still apply for', () => {
    const [volunteer, board] = groupVacancies(all, now)
    expect(volunteer!.open).toBe(4)
    expect(board!.open).toBe(1)
  })

  it('names the kinds that have nothing right now, so the page can say so', () => {
    const groups = groupVacancies(all, now, { includeEmpty: true })
    expect(groups.map((group) => group.kind)).toEqual(['volunteer', 'internship', 'coordinator', 'board', 'other'])
    expect(groups.find((group) => group.kind === 'internship')).toMatchObject({ items: [], open: 0 })
  })
})
