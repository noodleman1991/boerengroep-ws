import { describe, expect, it } from 'vitest'
import { resolveLink, SECTION_PATHS } from './link'

describe('resolveLink', () => {
  it('uses the path of a linked page', () => {
    expect(resolveLink({ linkType: 'page', page: { id: 1, path: '/over-ons/geschiedenis' } })).toBe('/over-ons/geschiedenis')
  })
  it('uses the address of a built-in section', () => {
    expect(resolveLink({ linkType: 'section', section: 'calendar' })).toBe('/activities/calendar')
    expect(resolveLink({ linkType: 'section', section: 'home' })).toBe('/')
  })
  it('passes a custom address through, on this site or another one', () => {
    expect(resolveLink({ linkType: 'custom', url: '/vacancies' })).toBe('/vacancies')
    expect(resolveLink({ linkType: 'custom', url: 'https://wur.nl' })).toBe('https://wur.nl')
  })
  it('adds the anchor, with or without a leading hash', () => {
    expect(resolveLink({ linkType: 'section', section: 'vacancies', anchor: 'volunteers' })).toBe('/vacancies#volunteers')
    expect(resolveLink({ linkType: 'section', section: 'calendar', anchor: '#open-meetings' })).toBe(
      '/activities/calendar#open-meetings',
    )
  })
  it('gives nothing when the chosen kind of link is not filled in', () => {
    expect(resolveLink({ linkType: 'page', page: null })).toBeUndefined()
    expect(resolveLink({ linkType: 'page', page: 12 })).toBeUndefined()
    expect(resolveLink({ linkType: 'section' })).toBeUndefined()
    expect(resolveLink({ linkType: 'custom', url: '  ' })).toBeUndefined()
    expect(resolveLink(null)).toBeUndefined()
  })
  it('treats a link without a kind as a page link, the default in the admin', () => {
    expect(resolveLink({ page: { id: 1, path: '/contact' } })).toBe('/contact')
  })
  it('has an address for every built-in section', () => {
    expect(Object.keys(SECTION_PATHS).sort()).toEqual(
      ['calendar', 'friends-news', 'home', 'news', 'newsletter', 'past-events', 'podcast', 'vacancies'].sort(),
    )
  })
})
