import type { Block } from 'payload'
import { Callout } from './callout'
import { Content } from './content'
import { Cta } from './cta'
import { Documents } from './documents'
import { EventsCalendarPreview } from './events-calendar-preview'
import { Features } from './features'
import { FormBlock } from './form'
import { Gallery } from './gallery'
import { Hero } from './hero'
import { ImageText } from './image-text'
import { Item } from './item'
import { NewsletterSignup } from './newsletter-signup'
import { Podcast } from './podcast'
import { Stats } from './stats'
import { Testimonial } from './testimonial'
import { Video } from './video'

/** Puts the block's own explanation as the first thing an editor sees when opening it. */
function withHelp(block: Block): Block {
  const text = (block.admin?.custom as { description?: string } | undefined)?.description
  if (!text) return block
  return {
    ...block,
    fields: [
      {
        name: 'help',
        type: 'ui',
        admin: { components: { Field: { path: '@/components/admin/block-help#BlockHelp', clientProps: { text } } } },
      },
      ...block.fields,
    ],
  }
}

/** Every block an editor can add to a page. The first ten existed before the migration. */
export const pageBlocks: Block[] = [
  Hero,
  EventsCalendarPreview,
  Callout,
  Features,
  Stats,
  Cta,
  Content,
  Testimonial,
  Video,
  ImageText,
  Gallery,
  Documents,
  Podcast,
  NewsletterSignup,
  FormBlock,
  Item,
].map(withHelp)

const PAGE_ONLY = ['eventsCalendarPreview', 'newsletterSignup']

/** Blocks allowed in newsletters and past events. */
export const articleBlocks: Block[] = pageBlocks.filter((b) => !PAGE_ONLY.includes(b.slug))
