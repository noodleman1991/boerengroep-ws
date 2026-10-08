'use client'

import { useConfig } from '@payloadcms/ui'
import { useSearchParams } from 'next/navigation'

const VIEWS = [
  { label: 'All news', whose: '' },
  { label: 'Our own news', whose: 'own' },
  { label: 'News from friends', whose: 'friends' },
]

/**
 * Three links above the list of news: everything, the site's own news, or news from friends.
 * Both kinds live in one list, and without this people look for friends' news in vain.
 */
export function NewsFilter() {
  const { config } = useConfig()
  const params = useSearchParams()
  const base = `${config.routes.admin}/collections/newsletters`
  const filter = params.get('where[organization][equals]')
  const own = params.get('where[organization][not_equals]') === 'friends'
  const current = filter === 'friends' ? 'friends' : own ? 'own' : ''
  const href = (whose: string) =>
    whose === 'friends' ? `${base}?where[organization][equals]=friends` : whose === 'own' ? `${base}?where[organization][not_equals]=friends` : base

  return (
    <nav className="news-filter" aria-label="Whose news to show">
      {VIEWS.map((view) => (
        <a key={view.whose} href={href(view.whose)} aria-current={view.whose === current ? 'page' : undefined}>
          {view.label}
        </a>
      ))}
    </nav>
  )
}
