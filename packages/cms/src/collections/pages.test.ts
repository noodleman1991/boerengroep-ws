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
})
