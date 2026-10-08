'use client'

import { useTenantSelection } from '@payloadcms/plugin-multi-tenant/client'
import { useAuth, useConfig } from '@payloadcms/ui'
import { SiteTabs } from './site-tabs'

const SHORTCUTS = [
  { to: '/collections/events/create', title: 'Add an event', text: 'A talk, workshop, excursion or shared meal. It gets its own page that people can share.' },
  { to: '/collections/pages', title: 'Change a page', text: 'Text, pictures and blocks. Every page exists in English and in Dutch.' },
  { to: '/collections/media/create', title: 'Upload pictures and files', text: 'Photos, posters and documents. You can crop a picture after uploading.' },
  { to: '/collections/newsletters/create', title: 'Write a news item', text: 'Your own news, or news from friends. You choose which at "Whose news".' },
  { to: '/collections/past-events/create', title: 'Tell how an event went', text: 'A short story with the photos of the day.' },
  { to: '/collections/vacancies/create', title: 'Post a vacancy', text: 'Volunteers, interns or board members wanted. It leaves the website by itself after its last day.' },
  { to: '/collections/site-settings', title: 'Menu, footer and newsletter', text: 'What shows on every page. The Menu tab is where you arrange the navigation.' },
  { to: '/collections/form-submissions', title: 'Read form answers', text: 'What people filled in on the forms of this website.' },
]

/** Short answers to what people ask most. Each names the screen and the button, in order. */
const HOW = [
  {
    q: 'How do I change the order of the menu, or add something to it?',
    a: 'Open Site settings and click the tab Menu. Every row is one menu item. Drag a row by the six dots on its left to move it. Click a row to change its words or where it leads. "Add Menu item" under the last row adds one. Press Save.',
  },
  {
    q: 'Where is the news from friends?',
    a: 'In the same list as your own news: News and vacancies, News. Above the list are three links: All news, Our own news, News from friends. When you write an item, "Whose news" decides which of the two it is.',
  },
  {
    q: 'A list is empty, but I know there is content.',
    a: 'Look at the top of this screen: which website is chosen? Each website has its own pages, events, news and pictures. Click the other name to see the other website.',
  },
  {
    q: 'I saved, but the website did not change.',
    a: 'Pages, news and stories have two buttons. "Save draft" keeps your work to yourself. "Publish changes" puts it on the website.',
  },
  {
    q: 'How do I write the Dutch version?',
    a: 'At the top right of every screen is a switch between English and Dutch. Switch it, and fill in the same boxes in the other language.',
  },
  {
    q: 'I made a mistake. Can I go back?',
    a: 'For a page, a news item or a story: open it and click Versions at the top. Open the version you want back and press "Restore this version".',
  },
  {
    q: 'How do I let a colleague in?',
    a: 'Open People and websites, People who can log in, and press Create New. Fill in their email address and a first password, add a row under "Websites this person works on", and choose what they may do.',
  },
]

const first = (label: unknown): string =>
  typeof label === 'string' ? label : label && typeof label === 'object' ? String(Object.values(label)[0] ?? '') : ''

/** The first thing people see after logging in: which website, what to do, and how. */
export function DashboardIntro() {
  const { user } = useAuth<{ name?: string | null }>()
  const { config } = useConfig()
  const { options, selectedTenantID } = useTenantSelection()
  const admin = config.routes.admin
  const site = first(options.find((option) => String(option.value) === String(selectedTenantID))?.label)
  const several = options.length > 1

  return (
    <section className="dashboard-intro" aria-labelledby="dashboard-intro-title">
      <h2 id="dashboard-intro-title">{user?.name ? `Hello ${user.name}` : 'Hello'}</h2>

      {several ? (
        <div className="dashboard-intro__step">
          <h3>
            <span aria-hidden="true">1</span> Which website do you want to work on?
          </h3>
          {/* People with two sites choose here. With one site this says which one it is. */}
          <SiteTabs variant="welcome" />
        </div>
      ) : (
        site && (
          <p className="dashboard-intro__site">
            You are working on <strong>{site}</strong>.
          </p>
        )
      )}

      <div className="dashboard-intro__step">
        <h3>
          {several && <span aria-hidden="true">2</span>} What do you want to do?
        </h3>
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
      </div>

      <div className="dashboard-intro__step">
        <h3>How do I…?</h3>
        <div className="dashboard-intro__how">
          {HOW.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
