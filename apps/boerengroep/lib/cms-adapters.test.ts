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
      status: 'full',
      statusNote: 'Waiting list',
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
      coverImage: 'https://blob/i.jpg',
      slug: 'Break',
      status: 'full',
      statusNote: 'Waiting list',
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
    general: {
      name: 'Stichting Boerengroep',
      tagline: 'Since 1971',
      logo: media('https://blob/logo.png'),
      contact: { address: 'Generaal Foulkesweg 37\n6703 BL Wageningen\n', email: 'st.boerengroep@wur.nl', phone: '+31 6 57' },
      social: [{ platform: 'instagram', url: 'https://instagram.com/x' }],
    },
    header: {
      nav: [
        {
          label: 'Over ons',
          linkType: 'page',
          page: { id: 1, path: '/over-ons' },
          children: [
            { label: 'Agenda', linkType: 'section', section: 'calendar', anchor: 'open-meetings' },
            { label: 'No target', linkType: 'page', page: null },
            { label: '', linkType: 'section', section: 'news' },
          ],
        },
        { label: 'WUR', linkType: 'custom', url: 'https://wur.nl', highlight: true },
        { label: 'Broken', linkType: 'custom', url: '' },
      ],
    },
    footer: {
      columns: [
        { title: 'Doe mee', links: [{ label: 'Vacatures', linkType: 'section', section: 'vacancies', anchor: 'volunteers' }] },
        { title: 'Empty column', links: [] },
      ],
      legalLinks: [{ label: 'Privacy', linkType: 'page', page: { id: 2, path: '/privacybeleid' } }],
      showNewsletter: false,
    },
    newsletter: { heading: 'Blijf op de hoogte', thanksTitle: 'Bijna klaar', thanksMessage: { root: {} }, brevoListId: 7 },
    calendar: { defaultView: 'month', showSubscribe: false, intro: 'Alles wat er speelt' },
  } as never

  it('resolves menu links to addresses and keeps the order', () => {
    const out = toGlobalSettings(settings)
    expect(out.nav).toEqual([
      {
        label: 'Over ons',
        href: '/over-ons',
        external: false,
        highlight: false,
        children: [{ label: 'Agenda', href: '/activities/calendar#open-meetings', external: false }],
      },
      { label: 'WUR', href: 'https://wur.nl', external: true, highlight: true, children: [] },
    ])
  })

  it('leaves out links that have no label or no target', () => {
    const out = toGlobalSettings(settings)
    expect(out.nav.map((n) => n.label)).not.toContain('Broken')
    expect(out.nav[0]!.children.map((c) => c.label)).toEqual(['Agenda'])
  })

  it('builds footer columns and drops empty ones', () => {
    const out = toGlobalSettings(settings)
    expect(out.footer.columns).toEqual([
      { title: 'Doe mee', links: [{ label: 'Vacatures', href: '/vacancies#volunteers', external: false }] },
    ])
    expect(out.footer.legalLinks).toEqual([{ label: 'Privacy', href: '/privacybeleid', external: false }])
    expect(out.footer.showNewsletter).toBe(false)
  })

  it('splits the address into lines and exposes name, tagline, logo and social links', () => {
    const out = toGlobalSettings(settings)
    expect(out.name).toBe('Stichting Boerengroep')
    expect(out.tagline).toBe('Since 1971')
    expect(out.logo).toBe('https://blob/logo.png')
    expect(out.contact).toEqual({
      addressLines: ['Generaal Foulkesweg 37', '6703 BL Wageningen'],
      email: 'st.boerengroep@wur.nl',
      phone: '+31 6 57',
    })
    expect(out.social).toEqual([{ platform: 'instagram', url: 'https://instagram.com/x' }])
  })

  it('passes newsletter and calendar settings through, without the Brevo list number', () => {
    const out = toGlobalSettings(settings)
    expect(out.newsletter).toMatchObject({ heading: 'Blijf op de hoogte', thanksTitle: 'Bijna klaar' })
    expect(out.newsletter).not.toHaveProperty('brevoListId')
    expect(out.calendar).toEqual({ intro: 'Alles wat er speelt', defaultView: 'month', showSubscribe: false })
  })

  it('returns safe defaults when there are no settings yet', () => {
    const out = toGlobalSettings(null)
    expect(out.nav).toEqual([])
    expect(out.footer).toEqual({ columns: [], legalLinks: [], showNewsletter: true })
    expect(out.contact).toEqual({ addressLines: [], email: undefined, phone: undefined })
    expect(out.calendar).toEqual({ intro: undefined, defaultView: 'list', showSubscribe: true })
    // Components index colour maps by theme.color, so it must never be undefined.
    expect(out.theme.color).toBe('green')
  })
})
