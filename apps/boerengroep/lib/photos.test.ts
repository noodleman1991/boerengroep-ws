import { describe, expect, it } from 'vitest'
import { toPhotos } from './photos'

const picture = (id: number, extra: Record<string, unknown> = {}) => ({
  id,
  url: `https://blob/${id}.jpg`,
  mimeType: 'image/jpeg',
  width: 2000,
  height: 1500,
  alt: `Photo ${id}`,
  sizes: { card: { url: `https://blob/${id}-800x600.jpg` }, square: { url: `https://blob/${id}-800x800.jpg` } },
  ...extra,
})

describe('photos for a gallery', () => {
  it('gives each photo its cuts, its size and its words', () => {
    expect(toPhotos([picture(1, { caption: ' Harvest day ' })] as never)).toEqual([
      {
        id: 1,
        full: 'https://blob/1.jpg',
        tile: 'https://blob/1-800x600.jpg',
        square: 'https://blob/1-800x800.jpg',
        width: 2000,
        height: 1500,
        alt: 'Photo 1',
        caption: 'Harvest day',
      },
    ])
  })

  it('leaves out files that are not pictures and pictures that were not loaded', () => {
    const out = toPhotos([picture(1), 7, null, picture(2, { mimeType: 'application/pdf' }), picture(3, { url: null })] as never)
    expect(out.map((p) => p.id)).toEqual([1])
  })

  it('falls back to the whole picture for a missing cut, and to the caption for missing alt text', () => {
    const [photo] = toPhotos([picture(4, { sizes: {}, alt: null, caption: 'Seed swap' })] as never)
    expect(photo).toMatchObject({ tile: 'https://blob/4.jpg', square: 'https://blob/4.jpg', alt: 'Seed swap', caption: 'Seed swap' })
    expect(toPhotos([picture(5, { alt: '', caption: null })] as never)[0]).toMatchObject({ alt: '', caption: undefined })
  })

  it('copes with nothing', () => {
    expect(toPhotos(null)).toEqual([])
    expect(toPhotos(undefined)).toEqual([])
  })
})
