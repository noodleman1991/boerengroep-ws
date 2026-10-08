import { describe, expect, it } from 'vitest'
import { articleBlocks, pageBlocks } from './index'

/** The fields that hold content. The help line at the top of a block stores nothing. */
const names = (b: { fields: { name?: string; type?: string }[] }) => b.fields.filter((f) => f.type !== 'ui').map((f) => f.name)

describe('blocks', () => {
  it('offers every page-building block, the migrated ones first', () => {
    expect(pageBlocks.map((b) => b.slug)).toEqual([
      'hero',
      'eventsCalendarPreview',
      'callout',
      'features',
      'stats',
      'cta',
      'content',
      'testimonial',
      'video',
      'imageText',
      'gallery',
      'documents',
      'podcast',
      'newsletterSignup',
      'form',
      'item',
    ])
  })

  it('leaves blocks that only make sense on a page out of articles', () => {
    const slugs = articleBlocks.map((b) => b.slug)
    expect(slugs).not.toContain('eventsCalendarPreview')
    expect(slugs).not.toContain('newsletterSignup')
    expect(slugs).toContain('gallery')
    expect(slugs).toContain('documents')
  })

  it('gives every block a name and an explanation an editor can read', () => {
    for (const block of pageBlocks) {
      const labels = block.labels as { singular?: string } | undefined
      expect(labels?.singular, block.slug).toBeTruthy()
      expect(block.admin?.custom?.description ?? '', block.slug).toMatch(/\w{3,}/)
    }
  })

  it('offers background presets instead of typed colour codes', () => {
    const hero = pageBlocks.find((b) => b.slug === 'hero')!
    const background = (hero.fields as any[]).find((f) => f.name === 'background')
    expect(background.type).toBe('select')
    expect(background.options.map((o: any) => o.value)).toEqual(['white', 'mist', 'leaf', 'harvest', 'sky', 'dark'])
  })

  it('starts every block with a line that says what it is for', () => {
    for (const block of pageBlocks) {
      const first = block.fields[0] as { type?: string; admin?: { components?: { Field?: { clientProps?: { text?: string } } } } }
      expect(first.type, block.slug).toBe('ui')
      expect(first.admin?.components?.Field?.clientProps?.text?.length ?? 0, block.slug).toBeGreaterThan(20)
    }
  })

  it('keeps Tina field names on the hero block', () => {
    const hero = pageBlocks.find((b) => b.slug === 'hero')!
    expect(names(hero as never)).toEqual(['background', 'layout', 'headline', 'tagline', 'actions', 'image'])
  })

  it('keeps Tina field names on the image and text block', () => {
    const block = pageBlocks.find((b) => b.slug === 'imageText')!
    expect(names(block as never)).toEqual([
      'background',
      'image',
      'content',
      'layout',
      'imageSize',
      'verticalAlignment',
    ])
  })
})
