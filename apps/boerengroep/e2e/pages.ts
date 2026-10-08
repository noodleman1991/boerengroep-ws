import type { Page } from '@playwright/test'

/** One of each kind of page the site has. Shared by the screen-size and accessibility tests. */
export const PAGE_KINDS: { name: string; path: string }[] = [
  { name: 'home', path: '/en' },
  { name: 'home in Dutch', path: '/nl' },
  { name: 'content page with an opening picture', path: '/en/about-us/what-is-boerengroep' },
  { name: 'content page with only its own text', path: '/en/contact' },
  { name: 'page that lists its sub-pages', path: '/en/activities' },
  { name: 'photo page', path: '/en/library/media' },
  { name: 'calendar', path: '/en/activities/calendar' },
  { name: 'calendar, month view', path: '/en/activities/calendar?view=month' },
  { name: 'calendar, past', path: '/en/activities/calendar?view=past' },
  { name: 'event', path: 'first-event' },
  { name: 'stories of past events', path: '/en/activities/past-events' },
  { name: 'story of a past event', path: 'first-story' },
  { name: 'news from friends', path: '/en/news/friends-news' },
  { name: 'vacancies', path: '/en/vacancies' },
  { name: 'podcast', path: '/en/library/podcast' },
  { name: 'newsletter: delete my data', path: '/en/newsletter/delete-data' },
  { name: 'newsletter: confirm without a link', path: '/en/newsletter/verify' },
  { name: 'page that does not exist', path: '/en/this-page-does-not-exist' },
  { name: 'test page with every block', path: '/en/test-blocks' },
]

/**
 * Opens a kind of page. Returns false when it does not exist in this database, for example
 * the test page for blocks on a fresh import. The 404 page is expected to answer 404.
 */
export async function openKind(page: Page, kind: { name: string; path: string }): Promise<boolean> {
  let path = kind.path
  if (path === 'first-event') {
    await page.goto('/en/activities/calendar?view=past')
    const href = await page.locator('.event-row__title a').first().getAttribute('href')
    if (!href) return false
    path = href
  }
  if (path === 'first-story') {
    await page.goto('/en/activities/past-events')
    const href = await page.locator('main a[href*="/activities/past-events/"]').first().getAttribute('href')
    if (!href) return false
    path = href
  }
  const res = await page.goto(path)
  const expected = kind.name === 'page that does not exist' ? 404 : 200
  return res?.status() === expected
}
