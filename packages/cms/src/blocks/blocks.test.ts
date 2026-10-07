import { describe, expect, it } from 'vitest'
import { articleBlocks, pageBlocks } from './index'

const names = (b: { fields: { name?: string }[] }) => b.fields.map((f) => f.name)

describe('blocks', () => {
  it('exposes the ten page blocks with their Tina slugs', () => {
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
    ])
  })

  it('leaves the calendar preview out of article blocks', () => {
    expect(articleBlocks.map((b) => b.slug)).not.toContain('eventsCalendarPreview')
    expect(articleBlocks).toHaveLength(9)
  })

  it('keeps Tina field names on the hero block', () => {
    const hero = pageBlocks.find((b) => b.slug === 'hero')!
    expect(names(hero as never)).toEqual(['background', 'headline', 'tagline', 'actions', 'image'])
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
