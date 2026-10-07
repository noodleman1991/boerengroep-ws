import type { Block } from 'payload'
import { Callout } from './callout'
import { Content } from './content'
import { Cta } from './cta'
import { EventsCalendarPreview } from './events-calendar-preview'
import { Features } from './features'
import { Hero } from './hero'
import { ImageText } from './image-text'
import { Stats } from './stats'
import { Testimonial } from './testimonial'
import { Video } from './video'

/** Order matches the Tina page template list. */
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
]

/** Blocks allowed in newsletters and past events. */
export const articleBlocks: Block[] = pageBlocks.filter((b) => b.slug !== 'eventsCalendarPreview')
