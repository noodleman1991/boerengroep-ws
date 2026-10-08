import { describe, expect, it } from 'vitest'
import { extractInlineImages, placeUploads, scanMarkdown } from './richtext'

describe('scanMarkdown', () => {
  it('finds nothing in plain markdown', () => {
    expect(scanMarkdown('Since **1971** we [connect](https://x.org) people.')).toEqual({
      components: [],
      images: [],
    })
  })
  it('finds MDX components by their capitalised tag', () => {
    const md = 'Intro\n\n<BlockQuote authorName="A">Hi</BlockQuote>\n\n<DateTime format="iso" />'
    expect(scanMarkdown(md).components).toEqual(['BlockQuote', 'DateTime'])
  })
  it('does not mistake an autolink or a comparison for a component', () => {
    expect(scanMarkdown('See <https://example.org> when a < B').components).toEqual([])
  })
  it('finds inline images with their target', () => {
    expect(scanMarkdown('Text ![A cow](/uploads/cow.jpg) more').images).toEqual(['/uploads/cow.jpg'])
  })
  it('lists a component once even when it repeats', () => {
    expect(scanMarkdown('<Video url="a" />\n<Video url="b" />').components).toEqual(['Video'])
  })
})

describe('extractInlineImages', () => {
  it('moves each image to its own paragraph as a token and keeps the text', () => {
    const out = extractInlineImages('Before ![A cow](/uploads/cow.jpg) after.')
    expect(out.images).toEqual([{ token: 'TINAIMAGE0TOKEN', alt: 'A cow', src: '/uploads/cow.jpg' }])
    expect(out.markdown).toBe('Before \n\nTINAIMAGE0TOKEN\n\n after.')
  })
  it('reads an address written in angle brackets, with spaces', () => {
    const out = extractInlineImages('![](</uploads/FEI poster.png>)')
    expect(out.images[0]).toMatchObject({ alt: '', src: '/uploads/FEI poster.png' })
  })
  it('decodes a percent-encoded address and drops a title', () => {
    const out = extractInlineImages('![x](/uploads/FEI%20poster.png "Poster")')
    expect(out.images[0]!.src).toBe('/uploads/FEI poster.png')
  })
  it('numbers several images in order', () => {
    const out = extractInlineImages('![a](/uploads/1.png)\n\n![b](/uploads/2.png)')
    expect(out.images.map((i) => [i.token, i.src])).toEqual([
      ['TINAIMAGE0TOKEN', '/uploads/1.png'],
      ['TINAIMAGE1TOKEN', '/uploads/2.png'],
    ])
  })
  it('leaves markdown without images untouched', () => {
    expect(extractInlineImages('Plain [link](https://x.org) text')).toEqual({
      markdown: 'Plain [link](https://x.org) text',
      images: [],
    })
  })
})

describe('placeUploads', () => {
  const paragraph = (text: string) => ({ type: 'paragraph', children: [{ type: 'text', text }] })
  const state = (children: unknown[]) => ({ root: { type: 'root', children } })

  it('replaces a token paragraph with an upload node for the media id', () => {
    const out = placeUploads(state([paragraph('Intro'), paragraph('TINAIMAGE0TOKEN'), paragraph('Outro')]), {
      TINAIMAGE0TOKEN: 42,
    }) as any
    expect(out.root.children.map((n: any) => n.type)).toEqual(['paragraph', 'upload', 'paragraph'])
    expect(out.root.children[1]).toMatchObject({ type: 'upload', relationTo: 'media', value: 42 })
  })
  it('removes the token paragraph when the image could not be resolved', () => {
    const out = placeUploads(state([paragraph('TINAIMAGE0TOKEN'), paragraph('Text')]), {}) as any
    expect(out.root.children).toHaveLength(1)
    expect(out.root.children[0].children[0].text).toBe('Text')
  })
  it('keeps surrounding text that ended up in the same paragraph', () => {
    const out = placeUploads(state([paragraph('See TINAIMAGE0TOKEN here')]), { TINAIMAGE0TOKEN: 7 }) as any
    expect(out.root.children.map((n: any) => n.type)).toEqual(['paragraph', 'upload'])
    expect(out.root.children[0].children[0].text).toBe('See  here')
  })
})
