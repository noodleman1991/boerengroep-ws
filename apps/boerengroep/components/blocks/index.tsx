'use client'

import type { Page } from '@sites/cms/types'
import type { CalendarEvent, GlobalSettings } from '@/lib/cms-adapters'
import { CallToAction } from './call-to-action'
import { Callout } from './callout'
import { Content } from './content'
import { EventsCalendarPreview } from './events-calendar-preview'
import { Features } from './features'
import { Hero } from './hero'
import { ImageText } from './image-text'
import { NewsletterSignupBlock } from './newsletter-signup-block'
import { Stats } from './stats'
import { Testimonial } from './testimonial'
import { Video } from './video'

type AnyBlock = NonNullable<Page['blocks']>[number]

interface BlocksProps {
  blocks?: AnyBlock[] | null
  events?: CalendarEvent[]
  globalData?: GlobalSettings
}

export const Blocks = ({ blocks, events = [], globalData }: BlocksProps) => {
  if (!blocks) return null
  return (
    <>
      {blocks.map((block, i) => (
        <div key={block.id ?? i}>
          <Block block={block} events={events} globalData={globalData} />
        </div>
      ))}
    </>
  )
}

const Block = ({
  block,
  events,
  globalData,
}: {
  block: AnyBlock
  events: CalendarEvent[]
  globalData?: GlobalSettings
}) => {
  switch (block.blockType) {
    case 'video':
      return <Video data={block} />
    case 'hero':
      return <Hero data={block} />
    case 'callout':
      return <Callout data={block} />
    case 'stats':
      return <Stats data={block} />
    case 'content':
      return <Content data={block} />
    case 'features':
      return <Features data={block} />
    case 'testimonial':
      return <Testimonial data={block} />
    case 'cta':
      return <CallToAction data={block} />
    case 'imageText':
      return <ImageText data={block} />
    case 'newsletterSignup':
      return <NewsletterSignupBlock data={block} />
    case 'eventsCalendarPreview':
      return <EventsCalendarPreview data={block} events={events} globalData={globalData} />
    default:
      return null
  }
}
