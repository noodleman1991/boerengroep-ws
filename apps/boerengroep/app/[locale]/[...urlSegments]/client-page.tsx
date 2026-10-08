'use client'

import type { Page } from '@sites/cms/types'
import { Blocks } from '@/components/blocks'
import ErrorBoundary from '@/components/error-boundary'
import type { BlockData } from '@/lib/block-data'

export interface ClientPageProps {
  page: Page
  data?: BlockData
}

export default function ClientPage({ page, data }: ClientPageProps) {
  return (
    <ErrorBoundary>
      <Blocks blocks={page.blocks} data={data} />
    </ErrorBoundary>
  )
}
