import { describe, expect, it } from 'vitest'
import {
  asConnection,
  mediaUrl,
  toSiteEvent,
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

describe('toSiteEvent', () => {
  const picture = {
    id: 1,
    url: 'https://blob/poster.jpg',
    alt: 'Poster with a tractor',
    width: 1200,
    height: 1600,
    sizes: {
      thumbnail: { url: 'https://blob/poster-400x300.jpg' },
      card: { url: 'https://blob/poster-800x600.jpg' },
      wide: { url: 'https://blob/poster-1600x900.jpg' },
      og: { url: 'https://blob/poster-1200x630.jpg' },
    },
  }
  const base = {
    id: 7,
    title: ' Boerengroep Break  ',
    slug: 'boerengroep-break-2026-10-08',
    description: 'Come',
    startDate: '2026-10-08T17:30:00.000Z',
    endDate: '2026-10-08T19:00:00.000Z',
    eventType: 'workshop',
    language: 'en',
    location: { address: 'Veerweg 121', mapsLink: null, callLink: '' },
    speakers: [
      { speaker: { id: 3, name: 'Maria', affiliation: 'WUR', avatar: media('https://blob/m.jpg') }, role: 'Host' },
      { speaker: 4, role: 'Unknown' },
    ],
    image: picture,
    status: 'full',
    statusNote: 'Waiting list',
    featured: true,
    registrationLink: { root: { children: [] } },
    updatedAt: '2026-09-30T10:00:00.000Z',
  }

  it('gives the site one tidy shape for an event', () => {
    expect(toSiteEvent(base as never)).toEqual({
      id: 7,
      slug: 'boerengroep-break-2026-10-08',
      title: 'Boerengroep Break',
      description: 'Come',
      start: '2026-10-08T17:30:00.000Z',
      end: '2026-10-08T19:00:00.000Z',
      type: 'workshop',
      status: 'full',
      statusNote: 'Waiting list',
      language: 'en',
      place: { address: 'Veerweg 121', mapsLink: undefined, callLink: undefined },
      image: {
        thumbnail: 'https://blob/poster-400x300.jpg',
        card: 'https://blob/poster-800x600.jpg',
        wide: 'https://blob/poster-1600x900.jpg',
        share: 'https://blob/poster-1200x630.jpg',
        original: 'https://blob/poster.jpg',
        width: 1200,
        height: 1600,
        alt: 'Poster with a tractor',
      },
      people: [{ name: 'Maria', role: 'Host', affiliation: 'WUR', avatar: 'https://blob/m.jpg' }],
      registration: { root: { children: [] } },
      featured: true,
      updatedAt: '2026-09-30T10:00:00.000Z',
    })
  })

  it('drops an end that lies before the start, which old content has', () => {
    expect(toSiteEvent({ ...base, endDate: '2026-09-30T19:00:00.000Z' } as never).end).toBeNull()
    expect(toSiteEvent({ ...base, endDate: null } as never).end).toBeNull()
  })

  it('copes with an event that has only the required fields', () => {
    const out = toSiteEvent({ id: 1, title: 'x', startDate: '2026-10-08T17:30:00.000Z', eventType: 'talk' } as never)
    expect(out).toMatchObject({ slug: '1', status: 'scheduled', description: '', place: {}, people: [], featured: false })
    expect(out.image).toBeUndefined()
  })

  it('falls back to the whole picture when a cut does not exist, and to the title for the description', () => {
    const out = toSiteEvent({ ...base, image: { id: 2, url: 'https://blob/small.png' } } as never)
    expect(out.image).toMatchObject({ card: 'https://blob/small.png', share: 'https://blob/small.png', alt: 'Boerengroep Break' })
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

describe('what a story about a past event carries', () => {
  it('brings its photos, a wide hero picture and the calendar event it belongs to', () => {
    const out = toPastEventNode({
      id: 5,
      title: 'Weekend',
      slug: 'Boerengroep-Weekend',
      date: '2025-09-01T10:00:00.000Z',
      heroImg: { id: 1, url: 'https://blob/h.jpg', sizes: { wide: { url: 'https://blob/h-1600x900.jpg' } } },
      photos: [{ id: 2, url: 'https://blob/p.jpg', mimeType: 'image/jpeg', caption: 'Around the fire' }, 9],
      relatedEvent: { id: 3, slug: 'weekend-2025-09-20', title: 'Boerengroep Weekend' },
    } as never)
    expect(out.heroWide).toBe('https://blob/h-1600x900.jpg')
    expect(out.photos).toMatchObject([{ id: 2, full: 'https://blob/p.jpg', caption: 'Around the fire' }])
    expect(out.relatedEvent).toEqual({ slug: 'weekend-2025-09-20', title: 'Boerengroep Weekend' })
  })

  it('has no event link when the event was not loaded or has no address', () => {
    expect(toPastEventNode({ id: 5, title: 'x', slug: 'x', date: 'x', relatedEvent: 3 } as never).relatedEvent).toBeUndefined()
    expect(toPastEventNode({ id: 5, title: 'x', slug: 'x', date: 'x' } as never).photos).toEqual([])
  })
})

describe('the document of a vacancy', () => {
  it('comes with its name, kind and size for a download card', () => {
    const out = toVacancyNode({
      id: 4,
      title: 'Board member',
      supportingDocument: { id: 8, url: 'https://blob/Board_profile.pdf', filename: 'Board_profile.pdf', mimeType: 'application/pdf', filesize: 240_000 },
    } as never)
    expect(out.document).toEqual({ url: 'https://blob/Board_profile.pdf', name: 'Board profile', kind: 'PDF', size: '240 kB', filename: 'Board_profile.pdf' })
    expect(toVacancyNode({ id: 4, title: 'x' } as never).document).toBeNull()
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
