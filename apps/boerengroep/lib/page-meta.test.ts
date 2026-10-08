import { describe, expect, it } from 'vitest'
import { excerpt, firstParagraph, pageDescription, pageMeta, shorten } from './page-meta'

const word = (text: string) => ({ type: 'text', text })
const rich = (...nodes: unknown[]) => ({ root: { children: nodes } })
const paragraph = (...texts: string[]) => ({ type: 'paragraph', children: texts.map(word) })
const heading = (text: string) => ({ type: 'heading', tag: 'h2', children: [word(text)] })

describe('what a page tells browsers and search engines about itself', () => {
  it('names the page first and the site after it', () => {
    const meta = pageMeta({ title: 'Our History', site: 'Stichting Boerengroep', url: 'https://example.org/en/about-us/history' })
    expect(meta.title).toBe('Our History - Stichting Boerengroep')
    expect(meta.alternates).toEqual({ canonical: 'https://example.org/en/about-us/history' })
    expect(meta.openGraph).toMatchObject({ title: 'Our History', siteName: 'Stichting Boerengroep', url: 'https://example.org/en/about-us/history' })
  })

  it('leaves the title to the site-wide one when the page has none of its own, as on the home page', () => {
    const home = pageMeta({ site: 'Boerengroep', url: 'https://example.org/en' })
    expect('title' in home).toBe(false)
    expect(home.openGraph).toMatchObject({ title: 'Boerengroep' })
    expect('title' in pageMeta({ title: 'Boerengroep', site: 'Boerengroep', url: 'https://example.org/en' })).toBe(false)
  })

  it('leaves the description out when there is none, so the site-wide one applies', () => {
    const meta = pageMeta({ title: 'Contact', site: 'Site', url: 'https://example.org/en/contact' })
    expect('description' in meta).toBe(false)
    expect(pageMeta({ title: 'Contact', site: 'Site', url: 'u', description: '  Write   to us. ' }).description).toBe('Write to us.')
  })

  it('offers a large preview only when the page has a picture', () => {
    const plain = pageMeta({ title: 'A', site: 'S', url: 'u' })
    expect(plain.twitter).toMatchObject({ card: 'summary' })
    const withPicture = pageMeta({ title: 'A', site: 'S', url: 'u', image: { url: 'https://example.org/p.jpg', alt: 'A field' } })
    expect(withPicture.twitter).toMatchObject({ card: 'summary_large_image', images: ['https://example.org/p.jpg'] })
    expect(withPicture.openGraph).toMatchObject({ images: [{ url: 'https://example.org/p.jpg', alt: 'A field' }] })
  })

  it('keeps a page out of search engines when asked, and says nothing about it otherwise', () => {
    expect(pageMeta({ title: 'Test', site: 'S', url: 'u', index: false }).robots).toEqual({ index: false, follow: false })
    expect('robots' in pageMeta({ title: 'A', site: 'S', url: 'u' })).toBe(false)
  })
})

describe('shortening a description', () => {
  it('leaves a short text alone and tidies its spaces', () => {
    expect(shorten('  Two   words \n here. ')).toBe('Two words here.')
  })

  it('cuts a long text at a word and marks the cut', () => {
    const long = 'Since 1971 Stichting Boerengroep connects the university with the reality and the challenges of farmers and peasants in the Netherlands and far beyond its borders, worldwide.'
    const short = shorten(long, 80)
    expect(short.length).toBeLessThanOrEqual(80)
    expect(short.endsWith('…')).toBe(true)
    expect(long.startsWith(short.slice(0, -1))).toBe(true)
    expect(long[short.length - 1]).toBe(' ')
  })
})

describe('the description of a page, taken from what is on it', () => {
  it('reads the first paragraph of a text and skips headings and empty lines', () => {
    expect(firstParagraph(rich(heading('History'), paragraph(' '), paragraph('It began ', 'in 1971.'), paragraph('Later.')))).toBe('It began in 1971.')
    expect(firstParagraph(rich(heading('Only a heading')))).toBeUndefined()
    expect(firstParagraph(null)).toBeUndefined()
  })

  it('prefers the line under the headline of the opening block', () => {
    const page = { body: rich(paragraph('The body.')), blocks: [{ blockType: 'hero', tagline: 'The story since 1971' }, { blockType: 'content', body: rich(paragraph('A block.')) }] }
    expect(pageDescription(page as never)).toBe('The story since 1971')
  })

  it('then the page’s own text, then the first block with text', () => {
    expect(pageDescription({ body: rich(paragraph('The body.')), blocks: [{ blockType: 'content', body: rich(paragraph('A block.')) }] } as never)).toBe('The body.')
    expect(pageDescription({ blocks: [{ blockType: 'hero', headline: 'No tagline' }, { blockType: 'imageText', content: rich(paragraph('Beside a picture.')) }] } as never)).toBe('Beside a picture.')
    expect(pageDescription({ blocks: [{ blockType: 'cta', title: 'Join', description: 'Come along.' }] } as never)).toBe('Come along.')
  })

  it('says nothing when the page holds no words to use', () => {
    expect(pageDescription({ blocks: [{ blockType: 'gallery' }] } as never)).toBeUndefined()
    expect(pageDescription({ blocks: null } as never)).toBeUndefined()
  })
})

describe('the opening of a longer text, for a list', () => {
  it('leaves a short text as it is', () => {
    expect(excerpt('Bring seeds to swap.')).toBe('Bring seeds to swap.')
    expect(excerpt('  Bring   seeds\n\nto swap. ')).toBe('Bring seeds to swap.')
    expect(excerpt(null)).toBe('')
  })
  it('stops at the end of a sentence when whole sentences fit', () => {
    const text = 'Come and hang out with us next week Thursday! Are you curious who the people behind Boerengroep are? Come to Onder de Linden at 19.30 and bring whatever you like to talk about with us.'
    expect(excerpt(text, 110)).toBe('Come and hang out with us next week Thursday! Are you curious who the people behind Boerengroep are?')
  })
  it('cuts at a word, with a mark, when the first sentence alone is too long', () => {
    const text = 'We are organising a lecture series on the role of peasant farming in the agricultural transition with speakers from many countries and many fields of work'
    const out = excerpt(text, 80)
    expect(out.length).toBeLessThanOrEqual(80)
    expect(out.endsWith('…')).toBe(true)
    expect(text.startsWith(out.slice(0, -1))).toBe(true)
    // The word before the mark is whole.
    expect(text[out.length - 1]).toBe(' ')
  })
  it('does not stop at a sentence that would leave only a few words', () => {
    const text = `Hi! ${'word '.repeat(60)}`
    expect(excerpt(text, 100).endsWith('…')).toBe(true)
  })
  it('does not take the dot of a time or a number for the end of a sentence', () => {
    const text = 'Come to Onder de Linden at 19.30 for drinks and a talk about what we could do together this coming year, and bring a friend along if you like to do so.'
    expect(excerpt(text, 60)).not.toBe('Come to Onder de Linden at 19.')
  })
})
