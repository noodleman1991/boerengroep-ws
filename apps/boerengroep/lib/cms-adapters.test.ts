import { describe, expect, it } from 'vitest'
import {
  asConnection,
  mediaUrl,
  toCalendarEvent,
  toGlobalSettings,
  toNewsletterNode,
  toPastEventNode,
  toVacancyNode,
} from './cms-adapters'

const media = (url: string) => ({ id: 1, url }) as never

describe('mediaUrl', () => {
  it('returns the url of a populated media document', () => {
    expect(mediaUrl(media('https://blob/x.jpg'))).toBe('https://blob/x.jpg')
  })
  it('returns undefined for an id, null or undefined', () => {
    expect(mediaUrl(5)).toBeUndefined()
    expect(mediaUrl(null)).toBeUndefined()
    expect(mediaUrl(undefined)).toBeUndefined()
  })
})

describe('asConnection', () => {
  it('wraps nodes in the edges shape the list components expect', () => {
    expect(asConnection([{ id: 1 }, { id: 2 }])).toEqual({ edges: [{ node: { id: 1 } }, { node: { id: 2 } }] })
  })
})

describe('toCalendarEvent', () => {
  it('flattens images and speakers to the calendar shape', () => {
    const out = toCalendarEvent({
      id: 7,
      title: 'Break',
      slug: 'Break',
      description: 'Come',
      startDate: '2026-01-01T10:00:00.000Z',
      endDate: null,
      eventType: 'workshop',
      location: { address: 'Veerweg 121' },
      speakers: [{ speaker: { id: 3, name: 'Maria', affiliation: 'WUR', avatar: media('https://blob/m.jpg') }, role: 'Host' }],
      image: media('https://blob/i.jpg'),
      coverImage: 9,
      featured: true,
      registrationLink: { root: {} },
    } as never)
    expect(out).toMatchObject({
      id: 7,
      title: 'Break',
      startDate: '2026-01-01T10:00:00.000Z',
      endDate: undefined,
      eventType: 'workshop',
      location: { address: 'Veerweg 121' },
      speakers: [{ role: 'Host', speaker: { id: 3, name: 'Maria', affiliation: 'WUR', avatar: 'https://blob/m.jpg' } }],
      image: 'https://blob/i.jpg',
      coverImage: undefined,
      featured: true,
      registrationLink: { root: {} },
    })
  })
  it('drops a speaker row whose speaker is not populated', () => {
    const out = toCalendarEvent({ id: 1, title: 't', speakers: [{ speaker: 4, role: 'x' }] } as never)
    expect(out.speakers).toEqual([])
  })
})

describe('toNewsletterNode', () => {
  it('keeps the breadcrumbs shape used to build links', () => {
    const out = toNewsletterNode({
      id: 2,
      title: 'Issue 1',
      slug: 'Newsletter-1',
      language: 'en',
      type: 'article',
      organization: 'Boerengroep',
      publishDate: '2026-02-01T10:00:00.000Z',
      featuredImage: media('https://blob/f.jpg'),
      author: { id: 1, name: 'Maria', avatar: null },
    } as never)
    expect(out._sys.breadcrumbs).toEqual(['en', 'Newsletter-1'])
    expect(out.featuredImage).toBe('https://blob/f.jpg')
    expect(out.published).toBe(true)
    expect(out.author).toEqual({ name: 'Maria', avatar: undefined })
  })
  it('passes the author affiliation through for the byline', () => {
    const out = toNewsletterNode({
      id: 3,
      slug: 'X',
      author: { id: 1, name: 'Maria', affiliation: 'WUR', avatar: null },
    } as never)
    expect(out.author?.affiliation).toBe('WUR')
  })

  it('uses an empty first breadcrumb when the issue has no language', () => {
    expect(toNewsletterNode({ id: 1, slug: 'X' } as never)._sys.breadcrumbs).toEqual(['', 'X'])
  })
})

describe('toVacancyNode', () => {
  it('turns the supporting document into a URL string', () => {
    const out = toVacancyNode({ id: 4, title: 'Board', supportingDocument: media('https://blob/job.pdf') } as never)
    expect(out.id).toBe('4')
    expect(out.supportingDocument).toBe('https://blob/job.pdf')
  })
})

describe('toPastEventNode', () => {
  it('flattens the hero image and author', () => {
    const out = toPastEventNode({
      id: 5,
      title: 'Weekend',
      slug: 'Boerengroep-Weekend',
      date: '2025-09-01T10:00:00.000Z',
      heroImg: media('https://blob/h.jpg'),
      author: { id: 1, name: 'Cami', avatar: media('https://blob/c.jpg') },
      tags: [{ id: 1, name: 'weekend' }, 8],
    } as never)
    expect(out.heroImg).toBe('https://blob/h.jpg')
    expect(out.author).toEqual({ name: 'Cami', avatar: 'https://blob/c.jpg' })
    expect(out.tags).toEqual([{ tag: { name: 'weekend' } }])
    expect(out._sys).toEqual({ breadcrumbs: ['Boerengroep-Weekend'], filename: 'Boerengroep-Weekend' })
  })
})

describe('toGlobalSettings', () => {
  const settings = {
    header: {
      logo: media('https://blob/logo.png'),
      logoAlt: 'Boerengroep',
      name: 'Stichting Boerengroep',
      color: 'default',
      nav: [
        {
          page: { id: 1, path: '/over-ons' },
          href: '/about-us',
          label: 'about-us',
          labelText: 'Over ons',
          submenu: [{ page: null, href: '/activities/calendar', label: 'calendar', labelText: null }],
        },
      ],
    },
    homepage: { showCalendarWidget: true },
    footer: {
      social: [{ platform: 'Instagram', url: 'https://instagram.com/x' }],
      quickLinks: [{ title: 'about-us', links: [{ page: { id: 2, path: '/over-ons/geschiedenis' }, href: '/about-us/history', label: 'history' }] }],
    },
    theme: { color: 'green', font: 'lato', darkMode: 'light' },
  } as never

  it('prefers the linked page path over the stored href', () => {
    const out = toGlobalSettings(settings)
    expect(out.header.nav[0]).toMatchObject({ href: '/over-ons', label: 'about-us', labelText: 'Over ons' })
    expect(out.footer.quickLinks[0]!.links[0]!.href).toBe('/over-ons/geschiedenis')
  })
  it('keeps the stored href when no page is linked', () => {
    expect(toGlobalSettings(settings).header.nav[0]!.submenu[0]).toMatchObject({
      href: '/activities/calendar',
      label: 'calendar',
      labelText: undefined,
    })
  })
  it('exposes the logo as a URL string', () => {
    expect(toGlobalSettings(settings).header.logo).toBe('https://blob/logo.png')
  })
  it('returns safe defaults when there are no settings yet', () => {
    const out = toGlobalSettings(null)
    expect(out.header.nav).toEqual([])
    expect(out.footer.social).toEqual([])
    // Components index colour maps by theme.color, so it must never be undefined.
    expect(out.theme).toEqual({ color: 'blue', font: undefined, darkMode: 'system' })
  })
})
