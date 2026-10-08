'use client'

import type { Page } from '@sites/cms/types'
import type { BlockData } from '@/lib/block-data'
import { BlockDataProvider } from './block-data-context'
import { CallToAction } from './call-to-action'
import { Callout } from './callout'
import { Content } from './content'
import { DocumentsBlock } from './documents'
import { EventsCalendarPreview } from './events-calendar-preview'
import { Features } from './features'
import { FormBlock } from './form'
import { GalleryBlock } from './gallery'
import { Hero } from './hero'
import { ImageText } from './image-text'
import { ItemBlock } from './item'
import { NewsPreview } from './news-preview'
import { NewsletterSignupBlock } from './newsletter-signup-block'
import { PodcastBlock } from './podcast'
import { Spotlight } from './spotlight'
import { Stats } from './stats'
import { Testimonial } from './testimonial'
import { VacanciesPreview } from './vacancies-preview'
import { Video } from './video'

type AnyBlock = NonNullable<Page['blocks']>[number]

interface BlocksProps {
  blocks?: AnyBlock[] | null
  /** Events and other shared content the page loaded for its blocks. */
  data?: BlockData
  /** True for the blocks a page starts with. Only there an opening shows the symbol of the logo. */
  top?: boolean
}

export const Blocks = ({ blocks, data, top = false }: BlocksProps) => {
  if (!blocks) return null
  const list = blocks.map((block, i) => <Block key={block.id ?? i} block={block} first={top && i === 0} />)
  // Blocks nested inside another page's blocks keep the data of the page around them.
  return data ? <BlockDataProvider value={data}>{list}</BlockDataProvider> : <>{list}</>
}

const Block = ({ block, first }: { block: AnyBlock; first: boolean }) => {
  switch (block.blockType) {
    case 'video':
      return <Video data={block} />
    case 'hero':
      return <Hero data={block} first={first} />
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
    case 'gallery':
      return <GalleryBlock data={block} />
    case 'documents':
      return <DocumentsBlock data={block} />
    case 'podcast':
      return <PodcastBlock data={block} />
    case 'form':
      return <FormBlock data={block} />
    case 'item':
      return <ItemBlock data={block} />
    case 'newsletterSignup':
      return <NewsletterSignupBlock data={block} />
    case 'eventsCalendarPreview':
      return <EventsCalendarPreview data={block} />
    case 'newsPreview':
      return <NewsPreview data={block} />
    case 'vacanciesPreview':
      return <VacanciesPreview data={block} />
    case 'spotlight':
      return <Spotlight data={block} />
    default:
      return null
  }
}
