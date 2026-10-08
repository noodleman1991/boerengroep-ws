import { describe, expect, it } from 'vitest'
import { readAsGalleries } from './gallery-pages'

const text = (value: string) => ({ type: 'text', text: value })
const heading = (value: string) => ({ type: 'heading', tag: 'h2', children: [text(value)] })
const sentence = (...parts: string[]) => ({ type: 'paragraph', children: parts.map(text) })
const picture = (id: number) => ({ type: 'upload', relationTo: 'media', value: id })
const body = (...children: unknown[]) => ({ root: { type: 'root', children } })

describe('reading a text that is really a photo page', () => {
  it('names the gallery after the heading and takes the sentence under each picture as its caption', () => {
    const galleries = readAsGalleries(
      body(heading('The summer course'), picture(53), sentence('Dinner by the river:'), picture(52), sentence('A workshop on tools. '), picture(50)),
    )
    expect(galleries).toEqual([
      {
        title: 'The summer course',
        images: [{ id: 53, caption: 'Dinner by the river' }, { id: 52, caption: 'A workshop on tools.' }, { id: 50 }],
      },
    ])
  })

  it('takes a sentence before the first picture as the introduction', () => {
    const [gallery] = readAsGalleries(body(heading('Weekend'), sentence('A few ', 'moments.'), picture(1), picture(2)))!
    expect(gallery).toEqual({ title: 'Weekend', intro: 'A few moments.', images: [{ id: 1 }, { id: 2 }] })
  })

  it('starts a new gallery at each heading', () => {
    const galleries = readAsGalleries(body(heading('2026'), picture(1), picture(2), heading('2025'), picture(3), sentence('Then.')))!
    expect(galleries.map((g) => [g.title, g.images.length])).toEqual([['2026', 2], ['2025', 1]])
    expect(galleries[1]!.images[0]).toEqual({ id: 3, caption: 'Then.' })
  })

  it('reads a picture that was stored with its whole record', () => {
    const [gallery] = readAsGalleries(body({ type: 'upload', value: { id: 7 } }, picture(8)))!
    expect(gallery!.images.map((image) => image.id)).toEqual([7, 8])
  })

  it('leaves a text alone that has fewer than two pictures, or parts a gallery cannot hold', () => {
    expect(readAsGalleries(body(heading('History'), sentence('Since 1971.'), picture(1)))).toBeUndefined()
    expect(readAsGalleries(body(picture(1), picture(2), { type: 'list', children: [] }))).toBeUndefined()
    expect(readAsGalleries(undefined)).toBeUndefined()
  })
})
