'use client'

import type { Page } from '@sites/cms/types'
import { Blocks } from '@/components/blocks'
import ErrorBoundary from '@/components/error-boundary'
import { Section } from '@/components/layout/section'
import { RichText } from '@/components/rich-text'
import { Link } from '@/i18n/navigation'
import type { BlockData } from '@/lib/block-data'
import { pageParts } from '@/lib/page-parts'

export interface ClientPageProps {
  page: Page
  data?: BlockData
  /** The pages directly under this one. Listed when the page itself has nothing on it. */
  subPages?: { title: string; path: string }[]
}

/**
 * A page from the admin panel: its opening block, then its own text, then the other blocks.
 * A page without a main heading gets its title as one.
 */
export default function ClientPage({ page, data, subPages = [] }: ClientPageProps) {
  const parts = pageParts(page)
  return (
    <ErrorBoundary>
      {parts.showTitle && (
        <Section className="page-title">
          <h1>{page.title}</h1>
        </Section>
      )}
      <Blocks blocks={parts.lead} data={data} />
      {parts.showBody && (
        <Section>
          <RichText data={page.body} className="rich rich--normal" />
        </Section>
      )}
      <Blocks blocks={parts.rest} data={data} />
      {parts.empty && subPages.length > 0 && (
        <Section>
          <ul className="sub-pages">
            {subPages.map((sub) => (
              <li key={sub.path}>
                <Link href={sub.path}>{sub.title}</Link>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </ErrorBoundary>
  )
}
