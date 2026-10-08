import { describe, expect, it } from 'vitest'
import { eventSlug } from './event-slug'

describe('eventSlug', () => {
  it('joins the title and the date of the event', () => {
    expect(eventSlug('Boerengroep Break: Samhain', '2025-10-30T18:30:00.000Z')).toBe('boerengroep-break-samhain-2025-10-30')
  })
  it('drops accents and symbols', () => {
    expect(eventSlug('Café & Soepkeuken — Wageningen!', '2026-03-05T17:00:00.000Z')).toBe('cafe-soepkeuken-wageningen-2026-03-05')
  })
  it('uses the date in Dutch time, not in UTC', () => {
    // Half past midnight on New Year's Day in Wageningen is still 31 December in UTC.
    expect(eventSlug('New year walk', '2025-12-31T23:30:00.000Z')).toBe('new-year-walk-2026-01-01')
  })
  it('shortens a very long title at a word', () => {
    const slug = eventSlug('Feminism and Agroecology II: Doing engaged research together with farming women in Europe', '2026-02-01T10:00:00.000Z')
    expect(slug).toBe('feminism-and-agroecology-ii-doing-engaged-research-together-2026-02-01')
    expect(slug.length).toBeLessThanOrEqual(72)
  })
  it('works without a date or without a title', () => {
    expect(eventSlug('Open meeting', undefined)).toBe('open-meeting')
    expect(eventSlug('', '2026-02-01T10:00:00.000Z')).toBe('event-2026-02-01')
    expect(eventSlug('!!!', null)).toBe('event')
  })
  it('accepts a Date as well as a text date', () => {
    expect(eventSlug('Seed swap', new Date('2026-04-11T08:00:00.000Z'))).toBe('seed-swap-2026-04-11')
  })
})
