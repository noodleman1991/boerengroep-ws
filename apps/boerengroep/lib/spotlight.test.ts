import { describe, expect, it } from 'vitest'
import { spotlightCards } from './spotlight'

const picture = (name: string) => ({ id: 1, url: `/media/${name}.jpg`, mimeType: 'image/jpeg', sizes: { card: { url: `/media/${name}-card.jpg` } } })
const text = (words: string) => ({ root: { children: [{ type: 'paragraph', children: [{ text: words }] }] } })
const cards = (...items: unknown[]) => spotlightCards(items as never)

describe('what is in the spotlight', () => {
  it('shows a page with its title, its opening line and its first picture', () => {
    const page = { id: 3, title: 'Farm Experience Internship', path: '/activities/fei', _status: 'published', blocks: [{ blockType: 'hero', tagline: 'A summer on a farm.', image: { src: picture('fei') } }] }
    expect(cards({ id: 'a', what: { relationTo: 'pages', value: page } })).toEqual([
      { key: 'a', kind: 'pages', href: '/activities/fei', external: false, title: 'Farm Experience Internship', text: 'A summer on a farm.', picture: '/media/fei-card.jpg', date: undefined, language: undefined, buttonLabel: undefined },
    ])
  })
  it('shows an event with its day and links to its page in the calendar', () => {
    const event = { id: 5, title: 'Seed swap', slug: 'seed-swap-2026-03-01', description: 'Bring seeds.', startDate: '2026-03-01T13:00:00.000Z', language: 'nl', image: picture('seeds') }
    expect(cards({ what: { relationTo: 'events', value: event } })[0]).toMatchObject({
      kind: 'events', href: '/activities/calendar/seed-swap-2026-03-01', title: 'Seed swap', text: 'Bring seeds.', picture: '/media/seeds-card.jpg', date: '2026-03-01T13:00:00.000Z', language: 'nl',
    })
  })
  it('sends a news item that only links elsewhere to the other website', () => {
    const item = { id: 9, title: 'A story', slug: 'a-story', type: 'link', organization: 'friends', publishDate: '2026-02-01T00:00:00.000Z', externalLink: 'https://example.org/a', linkDescription: 'About seeds.', _status: 'published' }
    expect(cards({ what: { relationTo: 'newsletters', value: item } })[0]).toMatchObject({ href: 'https://example.org/a', external: true, text: 'About seeds.' })
  })
  it('shows a story of a past event and a vacancy, each at its own address', () => {
    const story = { id: 2, title: 'How it went', slug: 'how-it-went', date: '2026-01-10T00:00:00.000Z', excerpt: text('It went well.'), heroImg: picture('went') }
    const vacancy = { id: 4, title: 'Board member', slug: 'board-member', description: text('Join the board.') }
    const [a, b] = cards({ what: { relationTo: 'past-events', value: story } }, { what: { relationTo: 'vacancies', value: vacancy } })
    expect(a).toMatchObject({ href: '/activities/past-events/how-it-went', text: 'It went well.', picture: '/media/went-card.jpg' })
    expect(b).toMatchObject({ href: '/vacancies#vacancy-board-member', title: 'Board member', text: 'Join the board.', picture: undefined })
  })
  it('prefers the words, the picture and the button the editor gave here', () => {
    const event = { id: 5, title: 'Seed swap', slug: 'seed-swap', description: 'Bring seeds.', startDate: '2026-03-01T13:00:00.000Z', language: 'nl', image: picture('seeds') }
    const row = { what: { relationTo: 'events', value: event }, title: ' Come swap seeds ', text: 'Everyone is welcome.', picture: picture('own'), buttonLabel: 'Sign up' }
    expect(cards(row)[0]).toMatchObject({ title: 'Come swap seeds', text: 'Everyone is welcome.', picture: '/media/own-card.jpg', buttonLabel: 'Sign up', language: undefined })
  })
  it('cuts a long text at a word', () => {
    const vacancy = { id: 4, title: 'Board member', slug: 'board', description: text('word '.repeat(90)) }
    const out = cards({ what: { relationTo: 'vacancies', value: vacancy } })[0]!.text!
    expect(out.length).toBeLessThanOrEqual(220)
    expect(out.endsWith('…')).toBe(true)
  })
  it('leaves out what was removed, what is not published, and an event without an address', () => {
    expect(
      cards(
        { what: { relationTo: 'pages', value: 12 } },
        { what: { relationTo: 'pages', value: { id: 3, title: 'Draft', path: '/draft', _status: 'draft' } } },
        { what: { relationTo: 'events', value: { id: 5, title: 'No address', startDate: '2026-03-01T13:00:00.000Z' } } },
        { what: { relationTo: 'pages', value: { id: 6, title: 'No address yet', _status: 'published' } } },
        {},
      ),
    ).toEqual([])
  })
  it('is empty without rows', () => {
    expect(spotlightCards(null)).toEqual([])
  })
})
