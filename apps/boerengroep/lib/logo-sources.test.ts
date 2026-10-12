import { describe, expect, it } from 'vitest'
import { logoSources } from './logo-sources'

describe('where a logo comes from', () => {
  it('goes through the site’s own picture service when it lives on the file store', () => {
    const logo = 'https://abc123.public.blob.vercel-storage.com/logo zwart.png'
    const { src, srcSet } = logoSources(logo)
    expect(src.startsWith('/_next/image?url=')).toBe(true)
    expect(src).toContain(encodeURIComponent(logo))
    // One size for an ordinary screen and one for a sharp one.
    expect(srcSet).toMatch(/ 1x, .* 2x$/)
  })
  it('is used as it is when it is a drawing or a file of the site itself', () => {
    expect(logoSources('https://abc123.public.blob.vercel-storage.com/logo.svg')).toEqual({ src: 'https://abc123.public.blob.vercel-storage.com/logo.svg' })
    expect(logoSources('/brand/boerengroep-logo.png')).toEqual({ src: '/brand/boerengroep-logo.png' })
    expect(logoSources('/api/media/file/logo.png')).toEqual({ src: '/api/media/file/logo.png' })
  })
})
