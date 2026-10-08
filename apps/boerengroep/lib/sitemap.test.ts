import { describe, expect, it } from 'vitest'
import { emptyLists, newsItemPath, sitemapEntries } from './sitemap'

const base = 'https://example.org'
const urls = (input: Partial<Parameters<typeof sitemapEntries>[0]>) =>
  sitemapEntries({ base, pages: [], events: [], stories: [], news: [], ...input }).map((entry) => entry.url)

describe('the list of addresses offered to search engines', () => {
  it('lists every published page in each language it exists in, the home page without a trailing slash', () => {
    const list = urls({ pages: [{ locale: 'en', path: '/' }, { locale: 'nl', path: '/' }, { locale: 'en', path: '/about-us/history' }, { locale: 'nl', path: '/over-ons/geschiedenis' }] })
    expect(list).toEqual(expect.arrayContaining([`${base}/en`, `${base}/nl`, `${base}/en/about-us/history`, `${base}/nl/over-ons/geschiedenis`]))
  })

  it('always lists the built-in pages, once, in both languages', () => {
    const list = urls({ pages: [{ locale: 'en', path: '/vacancies' }] })
    for (const path of ['/activities/calendar', '/activities/past-events', '/library/podcast', '/news/friends-news', '/news/newsletter', '/vacancies']) {
      expect(list.filter((url) => url === `${base}/en${path}`), path).toHaveLength(1)
      expect(list.filter((url) => url === `${base}/nl${path}`), path).toHaveLength(1)
    }
  })

  it('leaves out the built-in lists that are named as empty, and keeps the rest', () => {
    const list = urls({ empty: ['/news', '/library/podcast'] })
    expect(list.some((url) => url.endsWith('/news') || url.endsWith('/library/podcast'))).toBe(false)
    expect(list).toContain(`${base}/en/activities/calendar`)
    expect(list).toContain(`${base}/nl/news/newsletter`)
  })

  it('leaves out the test page and the personal newsletter pages', () => {
    const list = urls({ pages: [{ locale: 'en', path: '/test-blocks' }, { locale: 'en', path: '/newsletter/verify' }, { locale: 'en', path: '/contact' }] })
    expect(list).toContain(`${base}/en/contact`)
    expect(list.some((url) => url.includes('test-blocks') || url.includes('/newsletter/verify'))).toBe(false)
  })

  it('lists an event under its own language, or under both when it has none', () => {
    const list = urls({ events: [{ slug: 'open-pot-2026-10-13', language: 'nl' }, { slug: 'excursion-2026-10-24', language: null }, { slug: null }] })
    expect(list).toContain(`${base}/nl/activities/calendar/open-pot-2026-10-13`)
    expect(list).not.toContain(`${base}/en/activities/calendar/open-pot-2026-10-13`)
    expect(list).toContain(`${base}/en/activities/calendar/excursion-2026-10-24`)
    expect(list).toContain(`${base}/nl/activities/calendar/excursion-2026-10-24`)
  })

  it('lists stories of past events and says when each was last changed', () => {
    const entries = sitemapEntries({ base, pages: [], events: [], news: [], stories: [{ slug: 'Weekend', language: 'en', updatedAt: '2026-09-21T10:00:00.000Z' }] })
    expect(entries.find((entry) => entry.url === `${base}/en/activities/past-events/Weekend`)?.lastModified).toEqual(new Date('2026-09-21T10:00:00.000Z'))
  })

  it('lists news written on the site under the right list, and skips items that only link elsewhere', () => {
    const list = urls({
      news: [
        { slug: 'Issue-1', language: 'en', organization: 'Boerengroep', type: 'article' },
        { slug: 'Summer-School', language: 'en', organization: 'friends', type: 'event' },
        { slug: 'Elsewhere', language: 'en', organization: 'friends', type: 'link' },
      ],
    })
    expect(list).toContain(`${base}/en/news/newsletter/Issue-1`)
    expect(list).toContain(`${base}/en/news/friends-news/Summer-School`)
    expect(list.some((url) => url.includes('Elsewhere'))).toBe(false)
  })

  it('names no address twice', () => {
    const list = urls({ pages: [{ locale: 'en', path: '/vacancies' }, { locale: 'en', path: '/vacancies' }] })
    expect(new Set(list).size).toBe(list.length)
  })
})

describe('where a news item lives', () => {
  it('puts the organisation’s own news under the newsletter and the rest under news from friends', () => {
    expect(newsItemPath({ slug: 'A', organization: 'Boerengroep' })).toBe('/news/newsletter/A')
    expect(newsItemPath({ slug: 'B', organization: 'friends' })).toBe('/news/friends-news/B')
  })
})

describe('which built-in lists are empty', () => {
  it('names every list on a site that has nothing yet, but never the calendar', () => {
    expect(emptyLists({ news: [], stories: 0, vacancies: 0, podcast: false })).toEqual([
      '/news', '/news/newsletter', '/news/friends-news', '/activities/past-events', '/vacancies', '/library/podcast',
    ])
  })
  it('names none on a site that uses all of them', () => {
    expect(emptyLists({ news: [{ organization: 'Boerengroep' }, { organization: 'friends' }], stories: 3, vacancies: 8, podcast: true })).toEqual([])
  })
  it('keeps the news page when only friends have news, and leaves out the own list', () => {
    expect(emptyLists({ news: [{ organization: 'friends' }], stories: 1, vacancies: 1, podcast: true })).toEqual(['/news/newsletter'])
  })
})
