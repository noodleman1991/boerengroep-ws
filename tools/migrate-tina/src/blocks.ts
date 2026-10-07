import type { Ctx } from './context'
import { resolveMedia } from './media'

type Raw = Record<string, any>

function icon(raw: Raw | undefined) {
  return raw ? { name: raw.name, color: raw.color, style: raw.style } : undefined
}

function actions(list: Raw[] | undefined) {
  return (list ?? []).map((a) => ({ label: a.label, type: a.type, link: a.link, icon: icon(a.icon) }))
}

async function transformBlock(ctx: Ctx, b: Raw, legacyId: string): Promise<Record<string, unknown> | null> {
  switch (b._template) {
    case 'hero':
      return {
        blockType: 'hero',
        background: b.background,
        headline: b.headline,
        tagline: b.tagline,
        actions: actions(b.actions),
        image: {
          src: resolveMedia(ctx, b.image?.src, legacyId),
          alt: b.image?.alt,
          videoUrl: b.image?.videoUrl,
        },
      }
    case 'content':
      return { blockType: 'content', background: b.background, body: await ctx.toLexical(b.body, legacyId) }
    case 'callout':
      return { blockType: 'callout', background: b.background, text: b.text, url: b.url }
    case 'features': {
      const items = []
      for (const item of (b.items ?? []) as Raw[]) {
        items.push({ icon: icon(item.icon), title: item.title, text: await ctx.toLexical(item.text, legacyId) })
      }
      return { blockType: 'features', background: b.background, title: b.title, description: b.description, items }
    }
    case 'stats':
      return {
        blockType: 'stats',
        background: b.background,
        title: b.title,
        description: b.description,
        stats: ((b.stats ?? []) as Raw[]).map((s) => ({ stat: s.stat, type: s.type })),
      }
    case 'cta':
      return { blockType: 'cta', title: b.title, description: b.description, actions: actions(b.actions) }
    case 'testimonial':
      return {
        blockType: 'testimonial',
        background: b.background,
        title: b.title,
        description: b.description,
        testimonials: ((b.testimonials ?? []) as Raw[]).map((t) => ({
          quote: t.quote,
          author: t.author,
          role: t.role,
          avatar: resolveMedia(ctx, t.avatar, legacyId),
        })),
      }
    case 'video':
      return {
        blockType: 'video',
        background: b.background,
        color: b.color,
        url: b.url,
        autoPlay: b.autoPlay,
        loop: b.loop,
      }
    case 'imageText':
      return {
        blockType: 'imageText',
        background: b.background,
        image: { src: resolveMedia(ctx, b.image?.src, legacyId), alt: b.image?.alt },
        content: await ctx.toLexical(b.content, legacyId),
        layout: b.layout,
        imageSize: b.imageSize,
        verticalAlignment: b.verticalAlignment,
      }
    case 'eventsCalendarPreview':
      return {
        blockType: 'eventsCalendarPreview',
        background: b.background,
        title: b.title,
        description: b.description,
      }
    default:
      ctx.report.add('error', legacyId, `unknown block template "${b._template}"`)
      return null
  }
}

export async function transformBlocks(
  ctx: Ctx,
  blocks: unknown,
  legacyId: string,
): Promise<Record<string, unknown>[]> {
  if (!Array.isArray(blocks)) return []
  const out: Record<string, unknown>[] = []
  for (const raw of blocks) {
    const block = await transformBlock(ctx, raw as Raw, legacyId)
    if (block) out.push(block)
  }
  return out
}
