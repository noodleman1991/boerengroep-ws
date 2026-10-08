import { describe, expect, it } from 'vitest'
import { dateParts, dayKey, formatDay, formatTime, formatTimes, formatWhen, isAllDay, monthGrid, monthKey, monthLabel, shiftMonth } from './time'

describe('Dutch time for everyone', () => {
  it('puts an evening event on its Dutch day, whatever the visitor’s own clock says', () => {
    // 23:30 in Wageningen in summer is 21:30 UTC.
    expect(dayKey('2026-07-01T21:30:00.000Z')).toBe('2026-07-01')
    // 00:30 in Wageningen is still the previous day in UTC.
    expect(dayKey('2026-07-01T22:30:00.000Z')).toBe('2026-07-02')
    expect(monthKey('2026-07-31T22:30:00.000Z')).toBe('2026-08')
  })

  it('shows the hour on the Dutch clock, in summer and in winter', () => {
    expect(formatTime('2026-07-01T17:30:00.000Z', 'en')).toBe('19:30')
    expect(formatTime('2026-12-01T18:30:00.000Z', 'nl')).toBe('19:30')
  })

  it('keeps 19:30 at 19:30 across the change to winter time', () => {
    // Clocks go back on 25 October 2026.
    expect(formatTime('2026-10-24T17:30:00.000Z', 'en')).toBe('19:30')
    expect(formatTime('2026-10-25T18:30:00.000Z', 'en')).toBe('19:30')
    expect(dayKey('2026-10-25T22:59:00.000Z')).toBe('2026-10-25')
    expect(dayKey('2026-10-25T23:00:00.000Z')).toBe('2026-10-26')
  })

  it('gives the pieces for the large date', () => {
    expect(dateParts('2026-10-08T17:30:00.000Z', 'en')).toEqual({ day: '8', month: 'Oct', weekday: 'Thu', year: '2026' })
    expect(dateParts('2026-03-12T18:30:00.000Z', 'nl')).toEqual({ day: '12', month: 'mrt', weekday: 'do', year: '2026' })
  })
})

describe('when an event is', () => {
  it('reads as one sentence for an evening', () => {
    expect(formatWhen('2026-10-08T17:30:00.000Z', '2026-10-08T19:00:00.000Z', 'en')).toBe('Thursday 8 October 2026, 19:30 to 21:00')
    expect(formatWhen('2026-10-08T17:30:00.000Z', '2026-10-08T19:00:00.000Z', 'nl')).toBe('donderdag 8 oktober 2026, 19:30 tot 21:00')
  })

  it('leaves out the end when there is none', () => {
    expect(formatWhen('2026-10-08T17:30:00.000Z', null, 'en')).toBe('Thursday 8 October 2026, 19:30')
  })

  it('names both days when an event runs overnight or longer', () => {
    expect(formatWhen('2026-05-01T15:00:00.000Z', '2026-05-03T14:00:00.000Z', 'en')).toBe(
      'Friday 1 May, 17:00 to Sunday 3 May 2026, 16:00',
    )
  })

  it('treats midnight to midnight as whole days, the last day included', () => {
    // An editor picked 26 and 27 September without times.
    const start = '2026-09-25T22:00:00.000Z'
    const end = '2026-09-26T22:00:00.000Z'
    expect(isAllDay(start, end)).toBe(true)
    expect(formatWhen(start, end, 'en')).toBe('Saturday 26 to Sunday 27 September 2026')
    expect(formatWhen(start, null, 'en')).toBe('Saturday 26 September 2026')
    expect(formatWhen(start, start, 'nl')).toBe('zaterdag 26 september 2026')
    expect(isAllDay('2026-10-08T17:30:00.000Z', null)).toBe(false)
  })

  it('names both months for whole days that cross a month', () => {
    expect(formatWhen('2026-07-12T22:00:00.000Z', '2026-08-06T22:00:00.000Z', 'en')).toBe('Monday 13 July to Friday 7 August 2026')
  })
})

describe('the short time beside a date', () => {
  it('gives the hours of an evening', () => {
    expect(formatTimes('2026-10-08T17:30:00.000Z', '2026-10-08T19:00:00.000Z', 'en')).toBe('19:30 to 21:00')
    expect(formatTimes('2026-10-08T17:30:00.000Z', null, 'nl')).toBe('19:30')
  })
  it('gives nothing for one whole day, so the caller can say "all day"', () => {
    expect(formatTimes('2026-09-25T22:00:00.000Z', null, 'en')).toBeNull()
  })
  it('says until when for more days', () => {
    expect(formatTimes('2026-09-25T22:00:00.000Z', '2026-09-26T22:00:00.000Z', 'en')).toBe('until Sunday 27 September')
    expect(formatTimes('2026-09-25T22:00:00.000Z', '2026-09-26T22:00:00.000Z', 'nl')).toBe('t/m zondag 27 september')
    expect(formatTimes('2026-05-01T15:00:00.000Z', '2026-05-03T14:00:00.000Z', 'en')).toBe('17:00, until Sunday 3 May')
  })
  it('names a day for a heading', () => {
    expect(formatDay('2026-10-08', 'en')).toBe('Thursday 8 October')
    expect(formatDay('2026-10-08', 'nl')).toBe('donderdag 8 oktober')
  })
})

describe('the month grid', () => {
  it('names a month', () => {
    expect(monthLabel('2026-10', 'en')).toBe('October 2026')
    expect(monthLabel('2026-03', 'nl')).toBe('maart 2026')
  })

  it('steps across a year end', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
    expect(shiftMonth('2026-10', 0)).toBe('2026-10')
  })

  it('starts weeks on Monday and fills the first and last week from the neighbours', () => {
    const weeks = monthGrid('2026-10')
    // 1 October 2026 is a Thursday.
    expect(weeks[0]).toEqual(['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'])
    expect(weeks.at(-1)).toEqual(['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'])
    expect(weeks).toHaveLength(5)
  })

  it('handles a February that fits exactly in four weeks', () => {
    // February 2027 starts on a Monday and has 28 days.
    expect(monthGrid('2027-02')).toHaveLength(4)
    expect(monthGrid('2027-02')[0]?.[0]).toBe('2027-02-01')
  })
})
