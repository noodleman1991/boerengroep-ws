import type { Ctx } from './context'
import { resolveMedia } from './media'

type Raw = Record<string, any>

const PRESETS = ['white', 'mist', 'leaf', 'harvest', 'sky', 'dark']

/** Old sections had a typed Tailwind class as background. New ones choose a preset. */
export function mapBackground(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') return 'white'
  if (PRESETS.includes(value)) return value
  const v = value.toUpperCase()
  if (v.includes('#44AD39')) return Number(/\/(\d+)$/.exec(value)?.[1] ?? 100) >= 30 ? 'leaf' : 'mist'
  if (v.includes('#F28F07')) return 'harvest'
  if (v.includes('#4169E1')) return 'sky'
  if (v.includes('#F5F5F0')) return 'mist'
  return 'white'
}

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
        background: mapBackground(b.background),
        // Heroes made in the old editor were centred. New ones default to text beside the picture.
        layout: 'centered',
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
      return { blockType: 'content', background: mapBackground(b.background), body: await ctx.toLexical(b.body, legacyId) }
    case 'callout':
      return { blockType: 'callout', background: mapBackground(b.background), text: b.text, url: b.url }
    case 'features': {
      const items = []
      for (const item of (b.items ?? []) as Raw[]) {
        items.push({ icon: icon(item.icon), title: item.title, text: await ctx.toLexical(item.text, legacyId) })
      }
      return { blockType: 'features', background: mapBackground(b.background), title: b.title, description: b.description, items }
    }
    case 'stats':
      return {
        blockType: 'stats',
        background: mapBackground(b.background),
        title: b.title,
        description: b.description,
        stats: ((b.stats ?? []) as Raw[]).map((s) => ({ stat: s.stat, type: s.type })),
      }
    case 'cta':
      return { blockType: 'cta', title: b.title, description: b.description, actions: actions(b.actions) }
    case 'testimonial':
      return {
        blockType: 'testimonial',
        background: mapBackground(b.background),
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
        background: mapBackground(b.background),
        color: b.color,
        url: b.url,
        autoPlay: b.autoPlay,
        loop: b.loop,
      }
    case 'imageText':
      return {
        blockType: 'imageText',
        background: mapBackground(b.background),
        image: { src: resolveMedia(ctx, b.image?.src, legacyId), alt: b.image?.alt },
        content: await ctx.toLexical(b.content, legacyId),
        layout: chosen(b.layout),
        imageSize: chosen(b.imageSize),
        verticalAlignment: chosen(b.verticalAlignment),
      }
    case 'eventsCalendarPreview':
      return {
        blockType: 'eventsCalendarPreview',
        background: mapBackground(b.background),
        title: b.title,
        description: b.description,
      }
    default:
      ctx.report.add('error', legacyId, `unknown block template "${b._template}"`)
      return null
  }
}

/** A choice an editor left empty counts as not made, so the default applies. */
const chosen = (value: unknown) => (typeof value === 'string' && value.trim() ? value : undefined)

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
