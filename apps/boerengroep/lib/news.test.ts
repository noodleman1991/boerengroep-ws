import { describe, expect, it } from 'vitest'
import { isOwnNews, latestNews, type NewsCard, newsItemPath, toNewsCard } from './news'

const item = (over: Record<string, unknown> = {}) =>
  ({ id: 7, title: 'Seed swap', slug: 'seed-swap', type: 'article', organization: 'Boerengroep', publishDate: '2026-03-01T10:00:00.000Z', ...over }) as never

const card = (id: string, date: string, over: Partial<NewsCard> = {}): NewsCard => ({ id, title: id, href: `/news/newsletter/${id}`, external: false, date, own: true, featured: false, ...over })

describe('a news item as a card', () => {
  it('links to its own page on the site', () => {
    expect(toNewsCard(item())).toMatchObject({ id: '7', href: '/news/newsletter/seed-swap', external: false, own: true, featured: false })
  })
  it('puts news from friends under its own list', () => {
    expect(toNewsCard(item({ organization: 'friends' }))).toMatchObject({ href: '/news/friends-news/seed-swap', own: false })
  })
  it('links straight to the other website for an item that only links elsewhere', () => {
    expect(toNewsCard(item({ type: 'link', externalLink: ' https://example.org/story ', linkDescription: 'A story about seeds.' }))).toMatchObject({
      href: 'https://example.org/story',
      external: true,
      summary: 'A story about seeds.',
    })
  })
  it('leaves out an item that should link elsewhere and has no link', () => {
    expect(toNewsCard(item({ type: 'link', externalLink: '  ' }))).toBeNull()
  })
  it('takes the summary from the short summary and cuts a long one at a word', () => {
    const excerpt = { root: { children: [{ type: 'paragraph', children: [{ text: 'word '.repeat(80) }] }] } }
    const summary = toNewsCard(item({ excerpt }))!.summary!
    expect(summary.length).toBeLessThanOrEqual(180)
    expect(summary.endsWith('…')).toBe(true)
  })
  it('knows the site’s own news by every name it has had', () => {
    expect(['Boerengroep', 'Inspringtheater', 'Inspiratietheater'].map(isOwnNews)).toEqual([true, true, true])
    expect([isOwnNews('friends'), isOwnNews(null)]).toEqual([false, false])
    expect(newsItemPath({ slug: 'a', organization: 'Inspringtheater' })).toBe('/news/newsletter/a')
  })
})

describe('the news a page shows', () => {
  const cards = [card('old', '2026-01-01'), card('new', '2026-03-01'), card('mid', '2026-02-01'), card('friend', '2026-02-15', { own: false })]

  it('shows the newest first, as many as asked', () => {
    expect(latestNews(cards, { count: 2 }).rest.map((c) => c.id)).toEqual(['new', 'friend'])
  })
  it('shows three without a number', () => {
    expect(latestNews(cards, {}).rest).toHaveLength(3)
  })
  it('shows only the site’s own news, or only news from friends', () => {
    expect(latestNews(cards, { which: 'own', count: 9 }).rest.map((c) => c.id)).toEqual(['new', 'mid', 'old'])
    expect(latestNews(cards, { which: 'friends', count: 9 }).rest.map((c) => c.id)).toEqual(['friend'])
  })
  it('leads with the item in the spotlight, and counts it', () => {
    const withSpot = [...cards, card('spot', '2025-12-01', { featured: true })]
    const out = latestNews(withSpot, { count: 3 })
    expect(out.lead?.id).toBe('spot')
    expect(out.rest.map((c) => c.id)).toEqual(['new', 'friend'])
  })
  it('leads with the newest when several are in the spotlight', () => {
    const out = latestNews([card('a', '2026-01-01', { featured: true }), card('b', '2026-02-01', { featured: true })], { count: 3 })
    expect(out.lead?.id).toBe('b')
    expect(out.rest.map((c) => c.id)).toEqual(['a'])
  })
  it('has no lead when the page does not want one, or nothing is in the spotlight', () => {
    expect(latestNews([card('spot', '2026-01-01', { featured: true })], { spotlightFirst: false }).lead).toBeUndefined()
    expect(latestNews(cards, {}).lead).toBeUndefined()
  })
  it('does not lead with a friend’s item on a list of own news', () => {
    const out = latestNews([card('friend', '2026-02-15', { own: false, featured: true }), card('own', '2026-01-01')], { which: 'own' })
    expect(out.lead).toBeUndefined()
    expect(out.rest.map((c) => c.id)).toEqual(['own'])
  })
  it('is empty without news', () => {
    expect(latestNews([], {})).toEqual({ lead: undefined, rest: [] })
  })
})
