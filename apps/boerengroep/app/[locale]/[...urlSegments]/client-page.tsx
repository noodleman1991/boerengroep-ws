'use client'

import type { Page } from '@sites/cms/types'
import { Blocks } from '@/components/blocks'
import ErrorBoundary from '@/components/error-boundary'
import type { CalendarEvent, GlobalSettings } from '@/lib/cms-adapters'

export interface ClientPageProps {
  page: Page
  events?: CalendarEvent[]
  globalData?: GlobalSettings
}

export default function ClientPage({ page, events = [], globalData }: ClientPageProps) {
  return (
    <ErrorBoundary>
      <Blocks blocks={page.blocks} events={events} globalData={globalData} />
    </ErrorBoundary>
  )
}
