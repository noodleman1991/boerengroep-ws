'use client'

import { useTenantSelection } from '@payloadcms/plugin-multi-tenant/client'
import { useAuth, useConfig } from '@payloadcms/ui'
import { SiteTabs } from './site-tabs'

const SHORTCUTS = [
  { to: '/collections/events/create', title: 'Add an event', text: 'A talk, workshop, excursion or shared meal. It gets its own page that people can share.' },
  { to: '/collections/pages', title: 'Change a page', text: 'Text, pictures and blocks. Every page exists in English and in Dutch.' },
  { to: '/collections/media/create', title: 'Upload pictures and files', text: 'Photos, posters and documents. You can crop a picture after uploading.' },
  { to: '/collections/newsletters/create', title: 'Write a news item', text: 'An article of your own, or a link to news from friends.' },
  { to: '/collections/past-events/create', title: 'Tell how an event went', text: 'A short story with the photos of the day.' },
  { to: '/collections/site-settings', title: 'Menu, footer and newsletter', text: 'What shows on every page, and whether sign-ups reach Brevo.' },
  { to: '/collections/form-submissions', title: 'Read form answers', text: 'What people filled in on the forms of this site.' },
]

const first = (label: unknown): string =>
  typeof label === 'string' ? label : label && typeof label === 'object' ? String(Object.values(label)[0] ?? '') : ''

/** The first thing people see after logging in: where they are, and the things they come here to do. */
export function DashboardIntro() {
  const { user } = useAuth<{ name?: string | null }>()
  const { config } = useConfig()
  const { options, selectedTenantID } = useTenantSelection()
  const admin = config.routes.admin
  const site = first(options.find((option) => String(option.value) === String(selectedTenantID))?.label)

  return (
    <section className="dashboard-intro" aria-labelledby="dashboard-intro-title">
      <h2 id="dashboard-intro-title">{user?.name ? `Hello ${user.name}` : 'Hello'}</h2>
      {/* People with two sites choose here. With one site this says which one it is. */}
      <SiteTabs variant="welcome" />
      <p>
        {site && options.length < 2 ? (
          <>
            You are working on <strong>{site}</strong>.{' '}
          </>
        ) : null}
        Pages, news and stories stay a draft until you press Publish. Events and site settings are live as soon as you save.
      </p>
      <ul className="dashboard-intro__list">
        {SHORTCUTS.map((item) => (
          <li key={item.to}>
            <a href={`${admin}${item.to}`}>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
