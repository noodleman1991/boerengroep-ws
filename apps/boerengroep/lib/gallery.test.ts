import { describe, expect, it } from 'vitest'
import { arrangeGallery, toVideoItems } from './gallery'
import type { Photo } from './photos'

const photo = (id: number): Photo => ({ id, full: `f${id}`, tile: `t${id}`, square: `s${id}`, alt: '' })
const photos = (n: number) => Array.from({ length: n }, (_, i) => photo(i + 1))
const kinds = (items: { kind: string; id: number | string }[]) => items.map((item) => (item.kind === 'video' ? `V${String(item.id).replace('video-', '')}` : `p${item.id}`)).join(' ')

describe('videos among photos', () => {
  it('reads the videos an editor listed and leaves out links that cannot be played', () => {
    const items = toVideoItems([
      { url: 'https://youtu.be/dQw4w9WgXcQ', caption: ' The harvest ' },
      { url: 'https://example.org/not-a-video' },
      { url: 'https://vimeo.com/123456789', caption: null },
      null,
    ])
    expect(items).toMatchObject([
      { kind: 'video', id: 'video-0', caption: 'The harvest', cover: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', video: { provider: 'youtube' } },
      { kind: 'video', id: 'video-2', caption: undefined, video: { provider: 'vimeo' } },
    ])
    expect(items[1]?.cover).toBeUndefined()
    expect(toVideoItems(null)).toEqual([])
  })

  it('gives videos the large places of the mosaic: the first, fourth and seventh of every seven', () => {
    const videos = toVideoItems([{ url: 'https://youtu.be/aaaaaaaaaaa' }, { url: 'https://youtu.be/bbbbbbbbbbb' }])
    expect(kinds(arrangeGallery(photos(6), videos))).toBe('V0 p1 p2 V1 p3 p4 p5 p6')
  })

  it('keeps the editor’s order of photos and of videos', () => {
    const videos = toVideoItems(['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc', 'ddddddddddd'].map((id) => ({ url: `https://youtu.be/${id}` })))
    expect(kinds(arrangeGallery(photos(8), videos))).toBe('V0 p1 p2 V1 p3 p4 V2 V3 p5 p6 p7 p8')
  })

  it('shows only photos, or only videos, when that is all there is', () => {
    expect(kinds(arrangeGallery(photos(3), []))).toBe('p1 p2 p3')
    const videos = toVideoItems([{ url: 'https://youtu.be/aaaaaaaaaaa' }, { url: 'https://youtu.be/bbbbbbbbbbb' }])
    expect(kinds(arrangeGallery([], videos))).toBe('V0 V1')
  })

  it('puts videos that have no large place left after the photos', () => {
    const videos = toVideoItems(['aaaaaaaaaaa', 'bbbbbbbbbbb', 'ccccccccccc'].map((id) => ({ url: `https://youtu.be/${id}` })))
    expect(kinds(arrangeGallery(photos(1), videos))).toBe('V0 p1 V1 V2')
  })
})
