import { describe, expect, it } from 'vitest'
import { mapBackground } from './blocks'
import { labelFrom, menuTarget, parseHref } from './links'

const pages = new Map<string, number>([
  ['/about-us', 1],
  ['/about-us/history', 2],
])

describe('parseHref', () => {
  it('links to a page when the address is a known page', () => {
    expect(parseHref('/about-us/history', pages)).toEqual({ linkType: 'page', page: 2 })
  })
  it('keeps the part after the hash as a jump target', () => {
    expect(parseHref('/about-us#team', pages)).toEqual({ linkType: 'page', page: 1, anchor: 'team' })
  })
  it('recognises built-in sections, with or without a jump target', () => {
    expect(parseHref('/activities/calendar', pages)).toEqual({ linkType: 'section', section: 'calendar' })
    expect(parseHref('/vacancies#volunteers', pages)).toEqual({ linkType: 'section', section: 'vacancies', anchor: 'volunteers' })
    expect(parseHref('/', pages)).toEqual({ linkType: 'section', section: 'home' })
  })
  it('prefers the built-in section when a page has the same address', () => {
    const withTwin = new Map([['/vacancies', 9]])
    expect(parseHref('/vacancies', withTwin)).toEqual({ linkType: 'section', section: 'vacancies' })
  })
  it('falls back to a plain address for anything else', () => {
    expect(parseHref('/activities', pages)).toEqual({ linkType: 'custom', url: '/activities' })
    expect(parseHref('https://wur.nl/x#y', pages)).toEqual({ linkType: 'custom', url: 'https://wur.nl/x#y' })
  })
  it('gives nothing for an empty address', () => {
    expect(parseHref('', pages)).toBeUndefined()
    expect(parseHref(undefined, pages)).toBeUndefined()
  })
})

describe('labelFrom', () => {
  const messages = { navigation: { items: { history: 'History', 'about-us': 'About us' } } }
  it('reads a label from the translation file by key', () => {
    expect(labelFrom(messages, ['navigation', 'items', 'history'])).toBe('History')
  })
  it('gives nothing for a missing key or a value that is not text', () => {
    expect(labelFrom(messages, ['navigation', 'items', 'nope'])).toBeUndefined()
    expect(labelFrom(messages, ['navigation', 'items'])).toBeUndefined()
    expect(labelFrom(undefined, ['a'])).toBeUndefined()
  })
})

describe('mapBackground', () => {
  it('maps the old typed colour codes to presets', () => {
    expect(mapBackground('bg-background')).toBe('white')
    expect(mapBackground('bg-white')).toBe('white')
    expect(mapBackground(undefined)).toBe('white')
    expect(mapBackground('bg-[#44AD39]/10')).toBe('mist')
    expect(mapBackground('bg-[#44AD39]/30')).toBe('leaf')
    expect(mapBackground('bg-[#F28F07]/20')).toBe('harvest')
    expect(mapBackground('bg-[#4169E1]/20')).toBe('sky')
    expect(mapBackground('bg-[#F5F5F0]')).toBe('mist')
  })
  it('keeps a value that is already a preset', () => {
    expect(mapBackground('dark')).toBe('dark')
  })
  it('uses white for a colour it does not know', () => {
    expect(mapBackground('bg-[#123456]')).toBe('white')
  })
})

describe('where a menu item goes on the new site', () => {
  const site = { pages, reserved: new Set(['/vacancies']), redirects: [{ from: '/agenda', to: '/activities/calendar' }, { from: '/cookies', to: '/about-us' }] }

  it('follows a page that moved, so the menu does not point at a forwarding address', () => {
    expect(menuTarget('/agenda', site)).toEqual({ linkType: 'section', section: 'calendar' })
    expect(menuTarget('/cookies', site)).toEqual({ linkType: 'page', page: 1 })
  })

  it('tells a link to nowhere apart from a link to another website or a built-in page', () => {
    expect(menuTarget('/get-involved/volunteers', site)).toBe('dead')
    expect(menuTarget('https://example.org/x', site)).toEqual({ linkType: 'custom', url: 'https://example.org/x' })
    expect(menuTarget('/vacancies', site)).toEqual({ linkType: 'section', section: 'vacancies' })
    expect(menuTarget('/about-us', site)).toEqual({ linkType: 'page', page: 1 })
  })
})

describe('content files a site leaves out', () => {
  it('can be named one by one or by their folder', async () => {
    const { isRemoved } = await import('./fixups')
    const list = ['events/nl/what.mdx', 'speakers/*', 'newsletters/*']
    expect(isRemoved('events/nl/what.mdx', list)).toBe(true)
    expect(isRemoved('events/nl/other.mdx', list)).toBe(false)
    expect(isRemoved('speakers/anna.md', list)).toBe(true)
    expect(isRemoved('newsletters/en/welcome.mdx', list)).toBe(true)
    expect(isRemoved('speakers-old/anna.md', list)).toBe(false)
  })
})
