import { describe, expect, it } from 'vitest'
import { pageParts } from './page-parts'

const word = { type: 'text', text: 'x' }
const text = (tag?: string) => ({ root: { children: [tag ? { type: 'heading', tag, children: [word] } : { type: 'paragraph', children: [word] }] } })
const hero = { blockType: 'hero', headline: 'Welcome' }
const content = (body: unknown) => ({ blockType: 'content', body })

describe('the parts of a page, in the order they show', () => {
  it('opens with the hero, then the page’s own text, then the other blocks', () => {
    const parts = pageParts({ title: 'About', body: text(), blocks: [hero, content(text())] } as never)
    expect(parts.lead).toEqual([hero])
    expect(parts.showBody).toBe(true)
    expect(parts.rest).toHaveLength(1)
    expect(parts.showTitle).toBe(false)
  })

  it('shows the title as the heading of a page that has none', () => {
    expect(pageParts({ title: 'Contact', body: text(), blocks: [] } as never)).toMatchObject({ showTitle: true, showBody: true, lead: [], rest: [] })
    expect(pageParts({ title: 'Privacy', blocks: [content(text('h2'))] } as never).showTitle).toBe(true)
  })

  it('does not add a second main heading when the text already has one', () => {
    expect(pageParts({ title: 'Privacy', blocks: [content(text('h1'))] } as never).showTitle).toBe(false)
    expect(pageParts({ title: 'Theatre', body: text('h1'), blocks: [] } as never).showTitle).toBe(false)
    expect(pageParts({ title: 'Later hero', blocks: [content(text()), hero] } as never).showTitle).toBe(false)
  })

  it('knows a page that is only a picture, such as a poster, so it can be centred', () => {
    const picture = { type: 'upload', relationTo: 'media', value: 1 }
    const poster = { root: { children: [picture, { type: 'paragraph', children: [] }] } }
    expect(pageParts({ title: 'Contact', body: poster, blocks: [] } as never).visualOnly).toBe(true)
    expect(pageParts({ title: 'Contact', body: { root: { children: [picture, picture] } }, blocks: null } as never).visualOnly).toBe(true)
    // Words beside the picture, or blocks on the page, make it an ordinary page.
    expect(pageParts({ title: 'Contact', body: { root: { children: [picture, { type: 'paragraph', children: [word] }] } }, blocks: [] } as never).visualOnly).toBe(false)
    expect(pageParts({ title: 'Contact', body: poster, blocks: [hero] } as never).visualOnly).toBe(false)
    expect(pageParts({ title: 'Contact', body: text(), blocks: [] } as never).visualOnly).toBe(false)
  })

  it('knows a page with nothing on it, so its sub-pages can be listed instead', () => {
    expect(pageParts({ title: 'Activities', blocks: [] } as never).empty).toBe(true)
    expect(pageParts({ title: 'Activities', body: { root: { children: [{ type: 'paragraph', children: [] }] } }, blocks: null } as never).empty).toBe(true)
    expect(pageParts({ title: 'Contact', body: text(), blocks: [] } as never).empty).toBe(false)
  })
})
