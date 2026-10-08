import { describe, expect, it } from 'vitest'
import { transformBlocks } from './blocks'
import type { Ctx } from './context'
import { Report } from './report'

function ctx(): Ctx {
  return {
    payload: {} as never,
    tenantId: 1,
    report: new Report(),
    media: new Map([['/uploads/hero.jpg', 5]]),
    ids: new Map(),
    pageByEnPath: new Map(),
    reservedPaths: new Set(),
    fixups: { removePages: [], pageOverrides: {}, redirects: [] },
    messages: {},
    toLexical: async (md) => (typeof md === 'string' && md.trim() ? { lexicalOf: md.trim() } : undefined),
  }
}

describe('transformBlocks', () => {
  it('returns an empty list when the page has no blocks', async () => {
    expect(await transformBlocks(ctx(), undefined, 'p')).toEqual([])
  })

  it('maps a hero block and links its image', async () => {
    const out = await transformBlocks(
      ctx(),
      [
        {
          _template: 'hero',
          background: 'bg-[#F28F07]/20',
          headline: 'Our History',
          tagline: 'Since 1971',
          actions: [{ label: 'Read more...', type: 'link', link: '/about-us', icon: { name: 'ArrowRight' } }],
          image: { src: '/uploads/hero.jpg', alt: 'Field' },
        },
      ],
      'p',
    )
    expect(out).toEqual([
      {
        blockType: 'hero',
        background: 'harvest',
        layout: 'centered',
        headline: 'Our History',
        tagline: 'Since 1971',
        actions: [
          {
            label: 'Read more...',
            type: 'link',
            link: '/about-us',
            icon: { name: 'ArrowRight', color: undefined, style: undefined },
          },
        ],
        image: { src: 5, alt: 'Field', videoUrl: undefined },
      },
    ])
  })

  it('converts rich text in content, features and image-text blocks', async () => {
    const out = await transformBlocks(
      ctx(),
      [
        { _template: 'content', body: 'Hello **world**\n' },
        { _template: 'features', title: 'T', items: [{ title: 'One', text: 'Body one' }] },
        { _template: 'imageText', content: 'Side text', layout: 'image-right', image: { src: '', alt: 'x' } },
      ],
      'p',
    )
    expect(out[0]).toMatchObject({ blockType: 'content', body: { lexicalOf: 'Hello **world**' } })
    expect((out[1] as any).items[0]).toMatchObject({ title: 'One', text: { lexicalOf: 'Body one' } })
    expect(out[2]).toMatchObject({
      blockType: 'imageText',
      content: { lexicalOf: 'Side text' },
      layout: 'image-right',
      image: { src: undefined, alt: 'x' },
    })
  })

  it('maps the simple blocks field by field', async () => {
    const out = await transformBlocks(
      ctx(),
      [
        { _template: 'callout', text: 'Join us', url: 'https://x.org', background: 'bg-background' },
        { _template: 'stats', title: 'Numbers', stats: [{ stat: '50', type: 'years' }] },
        { _template: 'cta', title: 'Go', description: 'Now', actions: [] },
        { _template: 'video', url: 'https://youtu.be/x', autoPlay: true, loop: false, color: 'tint' },
        { _template: 'eventsCalendarPreview', title: '', description: '' },
        {
          _template: 'testimonial',
          title: 'Voices',
          testimonials: [{ quote: 'Great', author: 'A', role: 'Farmer', avatar: '/uploads/hero.jpg' }],
        },
      ],
      'p',
    )
    expect(out.map((b) => b.blockType)).toEqual([
      'callout',
      'stats',
      'cta',
      'video',
      'eventsCalendarPreview',
      'testimonial',
    ])
    expect(out[1]).toMatchObject({ stats: [{ stat: '50', type: 'years' }] })
    expect(out[3]).toMatchObject({ url: 'https://youtu.be/x', autoPlay: true, loop: false, color: 'tint' })
    expect((out[5] as any).testimonials[0].avatar).toBe(5)
  })

  it('drops an unknown template and records an error', async () => {
    const c = ctx()
    const out = await transformBlocks(c, [{ _template: 'carousel' }, { _template: 'callout', text: 'ok' }], 'p')
    expect(out).toHaveLength(1)
    expect(c.report.entries[0]).toEqual({
      kind: 'error',
      legacyId: 'p',
      message: 'unknown block template "carousel"',
    })
  })

  it('reports a missing hero image but keeps the block', async () => {
    const c = ctx()
    const out = await transformBlocks(c, [{ _template: 'hero', image: { src: '/uploads/1234.jpg' } }], 'p')
    expect((out[0] as any).image.src).toBeUndefined()
    expect(c.report.count('missing-media')).toBe(1)
  })
})
