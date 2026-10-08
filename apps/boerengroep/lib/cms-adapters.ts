import type {
  Author,
  Event,
  Media,
  Newsletter,
  Page,
  PastEvent,
  SiteSetting,
  Speaker,
  Tag,
  Vacancy,
} from '@sites/cms/types'
import { type LinkValue, resolveLink } from '@sites/cms/links'

type Rel<T> = number | string | T | null | undefined

/** A relation is populated when it is an object. Otherwise it is only an id. */
function populated<T>(value: Rel<T>): T | undefined {
  return value && typeof value === 'object' ? (value as T) : undefined
}

export type MediaSize = 'thumbnail' | 'card' | 'square' | 'wide' | 'og'

/**
 * Address of a picture or file. With a size, the cut made for that use is preferred
 * and the original is the fallback, for files that have no cuts such as PDFs.
 */
export function mediaUrl(value: Rel<Media>, size?: MediaSize): string | undefined {
  const doc = populated(value)
  if (!doc) return undefined
  const sized = size ? (doc.sizes as Record<string, { url?: string | null } | undefined> | null | undefined)?.[size]?.url : undefined
  return sized ?? doc.url ?? undefined
}

export function asConnection<T>(nodes: T[]): { edges: { node: T }[] } {
  return { edges: nodes.map((node) => ({ node })) }
}

function person(
  value: Rel<Author | Speaker>,
): { name: string; avatar: string | undefined; affiliation: string | undefined } | undefined {
  const doc = populated(value)
  if (!doc) return undefined
  const affiliation = 'affiliation' in doc ? (doc.affiliation ?? undefined) : undefined
  return { name: doc.name, avatar: mediaUrl(doc.avatar), affiliation }
}

/** Shape consumed by the calendar and by the events preview block. */
export function toCalendarEvent(e: Event) {
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? '',
    startDate: e.startDate,
    endDate: e.endDate ?? undefined,
    eventType: e.eventType,
    location: e.location ?? undefined,
    speakers: (e.speakers ?? []).flatMap((row) => {
      const speaker = populated<Speaker>(row.speaker)
      if (!speaker) return []
      return [
        {
          role: row.role ?? undefined,
          speaker: {
            id: speaker.id,
            name: speaker.name,
            affiliation: speaker.affiliation ?? undefined,
            avatar: mediaUrl(speaker.avatar),
          },
        },
      ]
    }),
    image: mediaUrl(e.image, 'card'),
    // Kept under the old name too, for components that still read it.
    coverImage: mediaUrl(e.image, 'card'),
    slug: e.slug,
    status: e.status ?? 'scheduled',
    statusNote: e.statusNote ?? undefined,
    featured: Boolean(e.featured),
    registrationLink: e.registrationLink ?? undefined,
  }
}

/** Shape consumed by NewsletterList, FriendNewsPage and the newsletter detail page. */
export function toNewsletterNode(n: Newsletter) {
  return {
    id: String(n.id),
    title: n.title,
    type: n.type,
    organization: n.organization,
    publishDate: n.publishDate,
    tags: n.tags ?? [],
    externalLink: n.externalLink ?? undefined,
    linkDescription: n.linkDescription ?? undefined,
    author: person(n.author),
    featuredImage: mediaUrl(n.featuredImage),
    excerpt: n.excerpt ?? undefined,
    body: n.body ?? [],
    featured: Boolean(n.featured),
    // Only published issues reach visitors, so the old flag is always true here.
    published: true,
    _sys: { breadcrumbs: [n.language ?? '', n.slug] },
  }
}

export function toVacancyNode(v: Vacancy) {
  return { ...v, id: String(v.id), supportingDocument: mediaUrl(v.supportingDocument) }
}

export function toPastEventNode(p: PastEvent) {
  return {
    id: String(p.id),
    title: p.title,
    date: p.date,
    heroImg: mediaUrl(p.heroImg),
    excerpt: p.excerpt ?? undefined,
    author: person(p.author),
    tags: (p.tags ?? []).flatMap((t) => {
      const tag = populated<Tag>(t)
      return tag ? [{ tag: { name: tag.name } }] : []
    }),
    blocks: p.blocks ?? [],
    body: p.body ?? undefined,
    _sys: { breadcrumbs: [p.slug], filename: p.slug },
  }
}

export type SiteLink = { label: string; href: string; external: boolean }

/** A link from the admin, ready to render. Links without a label or a target are left out. */
function siteLink(row: (LinkValue & { label?: string | null }) | null | undefined): SiteLink | undefined {
  const href = resolveLink(row)
  const label = row?.label?.trim()
  if (!href || !label) return undefined
  return { label, href, external: /^https?:\/\//.test(href) }
}

function siteLinks(rows: unknown): SiteLink[] {
  return (Array.isArray(rows) ? rows : []).flatMap((row) => {
    const link = siteLink(row as LinkValue)
    return link ? [link] : []
  })
}

/** Everything the layout needs from Site settings, in the language of the page. */
export function toGlobalSettings(s: SiteSetting | null) {
  const general = s?.general
  const newsletter = s?.newsletter
  return {
    name: general?.name ?? '',
    tagline: general?.tagline ?? undefined,
    logo: mediaUrl(general?.logo),
    contact: {
      addressLines: (general?.contact?.address ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      email: general?.contact?.email ?? undefined,
      phone: general?.contact?.phone ?? undefined,
    },
    social: (general?.social ?? []).map((row) => ({ platform: row.platform, url: row.url })),
    nav: (s?.header?.nav ?? []).flatMap((item) => {
      const link = siteLink(item)
      return link ? [{ ...link, highlight: Boolean(item.highlight), children: siteLinks(item.children) }] : []
    }),
    footer: {
      columns: (s?.footer?.columns ?? [])
        .map((column) => ({ title: column.title ?? '', links: siteLinks(column.links) }))
        .filter((column) => column.links.length > 0),
      legalLinks: siteLinks(s?.footer?.legalLinks),
      showNewsletter: s?.footer?.showNewsletter ?? true,
    },
    newsletter: {
      heading: newsletter?.heading ?? undefined,
      intro: newsletter?.intro ?? undefined,
      placeholder: newsletter?.placeholder ?? undefined,
      buttonLabel: newsletter?.buttonLabel ?? undefined,
      consentText: newsletter?.consentText ?? undefined,
      thanksTitle: newsletter?.thanksTitle ?? undefined,
      thanksMessage: newsletter?.thanksMessage ?? undefined,
      confirmedTitle: newsletter?.confirmedTitle ?? undefined,
      confirmedMessage: newsletter?.confirmedMessage ?? undefined,
    },
    calendar: {
      intro: s?.calendar?.intro ?? undefined,
      defaultView: (s?.calendar?.defaultView ?? 'list') as 'list' | 'month',
      showSubscribe: s?.calendar?.showSubscribe ?? true,
    },
    // Older components pick colours by this name. The look now comes from the stylesheet.
    theme: { color: 'green', font: undefined as string | undefined, darkMode: 'light' },
  }
}

export type GlobalSettings = ReturnType<typeof toGlobalSettings>
export type CalendarEvent = ReturnType<typeof toCalendarEvent>
