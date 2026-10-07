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

type Rel<T> = number | string | T | null | undefined

/** A relation is populated when it is an object. Otherwise it is only an id. */
function populated<T>(value: Rel<T>): T | undefined {
  return value && typeof value === 'object' ? (value as T) : undefined
}

export function mediaUrl(value: Rel<Media>): string | undefined {
  return populated(value)?.url ?? undefined
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
    image: mediaUrl(e.image),
    coverImage: mediaUrl(e.coverImage),
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

type LinkRow = { page?: Rel<Page>; href?: string | null; label?: string | null }

function linkHref(row: LinkRow): string | undefined {
  return populated(row.page)?.path ?? row.href ?? undefined
}

/** Shape consumed by the layout context, header and footer. */
export function toGlobalSettings(s: SiteSetting | null) {
  const nav = (rows: NonNullable<NonNullable<SiteSetting['header']>['nav']> | null | undefined) =>
    (rows ?? []).map((item) => ({
      href: linkHref(item),
      label: item.label ?? undefined,
      labelText: item.labelText ?? undefined,
      submenu: ((item as { submenu?: (LinkRow & { labelText?: string | null })[] | null }).submenu ?? []).map(
        (sub) => ({ href: linkHref(sub), label: sub.label ?? undefined, labelText: sub.labelText ?? undefined }),
      ),
    }))

  return {
    header: {
      logo: mediaUrl(s?.header?.logo),
      logoAlt: s?.header?.logoAlt ?? '',
      name: s?.header?.name ?? '',
      color: s?.header?.color ?? 'default',
      nav: nav(s?.header?.nav),
    },
    homepage: { showCalendarWidget: Boolean(s?.homepage?.showCalendarWidget) },
    footer: {
      social: (s?.footer?.social ?? []).map((row) => ({ platform: row.platform, url: row.url })),
      quickLinks: (s?.footer?.quickLinks ?? []).map((section) => ({
        title: section.title,
        links: (section.links ?? []).map((l) => ({ href: linkHref(l), label: l.label ?? undefined })),
      })),
    },
    theme: {
      color: s?.theme?.color ?? 'blue',
      font: s?.theme?.font ?? undefined,
      darkMode: s?.theme?.darkMode ?? 'system',
    },
  }
}

export type GlobalSettings = ReturnType<typeof toGlobalSettings>
export type CalendarEvent = ReturnType<typeof toCalendarEvent>
