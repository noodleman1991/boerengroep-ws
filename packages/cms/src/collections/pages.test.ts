import { describe, expect, it } from 'vitest'
import { pagePreviewUrl } from './pages'

describe('pagePreviewUrl', () => {
  it('points at the preview route with the localized page address', () => {
    expect(pagePreviewUrl('/over-ons/geschiedenis', 'nl')).toBe('/api/preview?path=%2Fnl%2Fover-ons%2Fgeschiedenis')
  })
  it('maps the home page to the locale root', () => {
    expect(pagePreviewUrl('/', 'en')).toBe('/api/preview?path=%2Fen')
  })
  it('falls back to the English root for a page that has no path yet', () => {
    expect(pagePreviewUrl(undefined, undefined)).toBe('/api/preview?path=%2Fen')
  })
  it('points at the other site, with a signed link, for a page of the site that has no admin panel of its own', () => {
    const url = pagePreviewUrl('/over-inspringtheater/geschiedenis', 'nl', { siteUrl: 'https://www.inspringtheater.nl/', secret: 's3cret' })
    const parsed = new URL(url)
    expect(parsed.origin).toBe('https://www.inspringtheater.nl')
    expect(parsed.pathname).toBe('/api/preview')
    expect(parsed.searchParams.get('path')).toBe('/nl/over-inspringtheater/geschiedenis')
    expect(parsed.searchParams.get('sig')).toMatch(/^[0-9a-f]{64}$/)
    expect(Number(parsed.searchParams.get('exp'))).toBeGreaterThan(Date.now())
  })
})
