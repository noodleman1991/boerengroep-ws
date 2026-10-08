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
import type { EventKind, EventStatus, SiteEvent } from './events/types'
import { fileInfo } from './files'
import { toPhotos } from './photos'

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

const text = (value: string | null | undefined) => value?.trim() || undefined

/** The kind of an event, when it was loaded along with the event. */
function eventKind(value: Event['kind']): EventKind | undefined {
  const kind = populated<{ id: number | string; name?: string | null; colour?: string | null }>(value as never)
  const name = kind?.name?.trim()
  return kind && name ? { id: String(kind.id), name, colour: kind.colour ?? 'grey' } : undefined
}

/** An event in the one shape every part of the site reads. */
export function toSiteEvent(e: Event): SiteEvent {
  const picture = populated<Media>(e.image)
  const title = e.title.trim()
  const end = e.endDate && new Date(e.endDate).getTime() > new Date(e.startDate).getTime() ? e.endDate : null
  return {
    id: e.id,
    slug: e.slug || String(e.id),
    title,
    description: e.description?.trim() ?? '',
    start: e.startDate,
    end,
    kind: eventKind(e.kind),
    status: (e.status ?? 'scheduled') as EventStatus,
    statusNote: text(e.statusNote),
    language: e.language ?? undefined,
    place: e.location
      ? { address: text(e.location.address), mapsLink: text(e.location.mapsLink), callLink: text(e.location.callLink) }
      : {},
    image: picture?.url
      ? {
          thumbnail: mediaUrl(picture, 'thumbnail'),
          card: mediaUrl(picture, 'card'),
          wide: mediaUrl(picture, 'wide'),
          share: mediaUrl(picture, 'og'),
          original: picture.url,
          width: picture.width ?? undefined,
          height: picture.height ?? undefined,
          alt: text(picture.alt) ?? title,
        }
      : undefined,
    people: (e.speakers ?? []).flatMap((row) => {
      const speaker = populated<Speaker>(row.speaker)
      if (!speaker) return []
      return [
        {
          name: speaker.name,
          role: text(row.role),
          affiliation: text(speaker.affiliation),
          avatar: mediaUrl(speaker.avatar),
        },
      ]
    }),
    registration: e.registrationLink ?? undefined,
    featured: Boolean(e.featured),
    updatedAt: e.updatedAt ?? undefined,
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
  return {
    ...v,
    id: String(v.id),
    supportingDocument: mediaUrl(v.supportingDocument),
    /** The job description as a download card. */
    document: fileInfo(v.supportingDocument),
  }
}

/** The calendar event a story belongs to, when it was loaded and has a page of its own. */
function relatedEvent(value: Rel<Event>): { slug: string; title: string } | undefined {
  const event = populated<Event>(value)
  return event?.slug ? { slug: event.slug, title: event.title } : undefined
}

export function toPastEventNode(p: PastEvent) {
  return {
    id: String(p.id),
    title: p.title,
    date: p.date,
    slug: p.slug,
    heroImg: mediaUrl(p.heroImg),
    heroWide: mediaUrl(p.heroImg, 'wide'),
    excerpt: p.excerpt ?? undefined,
    author: person(p.author),
    tags: (p.tags ?? []).flatMap((t) => {
      const tag = populated<Tag>(t)
      return tag ? [{ tag: { name: tag.name } }] : []
    }),
    blocks: p.blocks ?? [],
    body: p.body ?? undefined,
    photos: toPhotos(p.photos),
    videos: (p.videos ?? []).map((row) => ({ url: row.url, caption: row.caption ?? null })),
    relatedEvent: relatedEvent(p.relatedEvent),
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
    logoOnDark: mediaUrl(general?.logoOnDark),
    symbol: mediaUrl(general?.symbol),
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
