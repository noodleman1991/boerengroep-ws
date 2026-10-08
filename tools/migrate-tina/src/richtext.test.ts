import { describe, expect, it } from 'vitest'
import { extractInlineImages, linkUploads, placeUploads, scanMarkdown, uploadedFileKey } from './richtext'

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
  it('reads an address that escapes its own brackets', () => {
    const out = extractInlineImages('![](/uploads/Website%20jump%20in%20\\(1\\).png) and more')
    expect(out.images[0]!.src).toBe('/uploads/Website jump in (1).png')
    expect(out.markdown).toBe('\n\nTINAIMAGE0TOKEN\n\n and more')
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

describe('uploadedFileKey', () => {
  it('reads the uploads path from an address on the old file server', () => {
    expect(uploadedFileKey('https://assets.tina.io/fbba-70ea/Year%20Plan%202026.pdf')).toBe('/uploads/Year Plan 2026.pdf')
    expect(uploadedFileKey('https://assets.tina.io/fbba-70ea/vacancies/documents/a.pdf?x=1')).toBe('/uploads/vacancies/documents/a.pdf')
  })
  it('reads an address inside the uploads folder', () => {
    expect(uploadedFileKey('/uploads/Year%20Report%202025.pdf#page=2')).toBe('/uploads/Year Report 2025.pdf')
  })
  it('leaves any other address alone', () => {
    expect(uploadedFileKey('https://example.org/uploads/a.pdf')).toBeUndefined()
    expect(uploadedFileKey('/about-us')).toBeUndefined()
    expect(uploadedFileKey('mailto:info@example.org')).toBeUndefined()
  })
})

describe('linkUploads', () => {
  const link = (url: string) => ({ type: 'link', fields: { linkType: 'custom', url, newTab: false }, children: [{ type: 'text', text: 'the plan' }] })
  const state = (...links: unknown[]) => ({ root: { type: 'root', children: [{ type: 'list', children: [{ type: 'listitem', children: links }] }] } })
  const first = (s: unknown) => (s as { root: { children: { children: { children: { type: string; fields: Record<string, unknown> }[] }[] }[] } }).root.children[0]!.children[0]!.children[0]!

  it('points a link to the old file server at the imported file, however deep it sits', () => {
    const media = new Map<string, number | string>([['/uploads/Year Plan 2026.pdf', 69]])
    const out = linkUploads(state(link('https://assets.tina.io/abc/Year%20Plan%202026.pdf')), media)
    expect(first(out).fields).toEqual({ linkType: 'internal', doc: { relationTo: 'media', value: 69 }, newTab: false })
  })
  it('does the same for a link into the uploads folder', () => {
    const media = new Map<string, number | string>([['/uploads/a.pdf', 3]])
    expect(first(linkUploads(state(link('/uploads/a.pdf')), media)).fields.doc).toEqual({ relationTo: 'media', value: 3 })
  })
  it('reports a link to the old file server when the file is not here, and keeps it', () => {
    const missing: string[] = []
    const out = linkUploads(state(link('https://assets.tina.io/abc/gone.pdf')), new Map(), (url) => missing.push(url))
    expect(missing).toEqual(['https://assets.tina.io/abc/gone.pdf'])
    expect(first(out).fields.url).toBe('https://assets.tina.io/abc/gone.pdf')
  })
  it('leaves other links alone', () => {
    const missing: string[] = []
    const out = linkUploads(state(link('https://example.org/a.pdf'), link('/about-us')), new Map(), (url) => missing.push(url))
    expect(first(out).fields).toEqual({ linkType: 'custom', url: 'https://example.org/a.pdf', newTab: false })
    expect(missing).toEqual([])
  })
})
