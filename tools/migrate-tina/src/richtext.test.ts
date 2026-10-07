import { describe, expect, it } from 'vitest'
import { scanMarkdown } from './richtext'

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
