import type { Payload, Where } from 'payload'
import type {
  Event,
  Media,
  Newsletter,
  Page,
  PastEvent,
  Redirect,
  SiteSetting,
  Vacancy,
} from '../payload-types'

export type Locale = 'en' | 'nl'
const LOCALES: Locale[] = ['en', 'nl']

export type CacheFn = <T>(fn: () => Promise<T>, key: string[], tags: string[]) => () => Promise<T>

export type QueryDeps = {
  getPayload: () => Promise<Payload>
  /** The tenant this app serves. Every query is filtered by it. */
  tenantSlug: string
  isDraft?: () => Promise<boolean>
  cache?: CacheFn
}

type FindOptions = {
  where?: Where[]
  locale?: Locale
  sort?: string
  limit?: number
  depth?: number
  /** Collections with drafts must filter on published status for visitors. */
  hasDrafts: boolean
}

export function createQueries(deps: QueryDeps) {
  const tag = (collection: string) => `${deps.tenantSlug}:${collection}`

  let tenantIdPromise: Promise<number | string> | undefined
  const tenantId = () => {
    tenantIdPromise ??= (async () => {
      const payload = await deps.getPayload()
      const res = await payload.find({
        collection: 'tenants',
        where: { slug: { equals: deps.tenantSlug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const tenant = res.docs[0]
      if (!tenant) throw new Error(`Tenant "${deps.tenantSlug}" not found`)
      return tenant.id
    })().catch((err) => {
      tenantIdPromise = undefined
      throw err
    })
    return tenantIdPromise
  }

  /** Runs a query through the cache, unless draft mode is on. */
  async function run<T>(
    name: string,
    args: string[],
    collections: string[],
    fn: (draft: boolean) => Promise<T>,
  ): Promise<T> {
    const draft = (await deps.isDraft?.()) ?? false
    if (draft || !deps.cache) return fn(draft)
    const tags = [...collections, 'media'].map(tag)
    return deps.cache(() => fn(false), [deps.tenantSlug, name, ...args], tags)()
  }

  /** The single place where the tenant filter and the published filter are applied. */
  async function find<T>(collection: string, draft: boolean, opts: FindOptions): Promise<T[]> {
    const payload = await deps.getPayload()
    const where: Where = {
      and: [
        { tenant: { equals: await tenantId() } },
        ...(opts.hasDrafts && !draft ? [{ _status: { equals: 'published' } }] : []),
        ...(opts.where ?? []),
      ],
    }
    const res = await payload.find({
      collection: collection as never,
      where,
      locale: opts.locale as never,
      sort: opts.sort,
      limit: opts.limit ?? 1000,
      depth: opts.depth ?? 2,
      draft,
      overrideAccess: true,
      pagination: false,
    })
    return res.docs as T[]
  }

  async function pageByPath(draft: boolean, locale: Locale, path: string): Promise<Page | null> {
    const docs = await find<Page>('pages', draft, {
      hasDrafts: true,
      locale,
      limit: 1,
      where: [{ path: { equals: path } }],
    })
    return docs[0] ?? null
  }

  async function pageById(draft: boolean, locale: Locale, id: number | string): Promise<Page | null> {
    const docs = await find<Page>('pages', draft, {
      hasDrafts: true,
      locale,
      limit: 1,
      where: [{ id: { equals: id } }],
    })
    return docs[0] ?? null
  }

  return {
    /**
     * Resolves a URL path to a page.
     * 1. A page whose path in this locale matches is returned.
     * 2. Otherwise a page whose path in the other locale matches is looked up. If it has a
     *    different path in this locale, the caller should redirect there. If it has no version
     *    in this locale, it is returned as is, served from the fallback locale.
     */
    resolvePage(locale: Locale, path: string): Promise<{ page?: Page; redirectTo?: string } | null> {
      return run('resolvePage', [locale, path], ['pages'], async (draft) => {
        const direct = await pageByPath(draft, locale, path)
        if (direct) return { page: direct }
        for (const other of LOCALES.filter((l) => l !== locale)) {
          const match = await pageByPath(draft, other, path)
          if (!match) continue
          const localized = await pageById(draft, locale, match.id)
          if (!localized) continue
          if (localized.path && localized.path !== path) return { redirectTo: localized.path }
          return { page: localized }
        }
        return null
      })
    },

    getPageByEnglishPath(path: string, locale: Locale): Promise<Page | null> {
      return run('getPageByEnglishPath', [path, locale], ['pages'], async (draft) => {
        const match = await pageByPath(draft, 'en', path)
        return match ? pageById(draft, locale, match.id) : null
      })
    },

    /** Published paths per locale. A page without a version in a locale is left out for it. */
    async listPagePaths(): Promise<{ locale: Locale; path: string }[]> {
      const payload = await deps.getPayload()
      const out: { locale: Locale; path: string }[] = []
      for (const locale of LOCALES) {
        const res = await payload.find({
          collection: 'pages',
          where: {
            and: [{ tenant: { equals: await tenantId() } }, { _status: { equals: 'published' } }],
          },
          locale,
          fallbackLocale: false as never,
          depth: 0,
          limit: 10_000,
          pagination: false,
          overrideAccess: true,
        })
        for (const doc of res.docs as Page[]) if (doc.path) out.push({ locale, path: doc.path })
      }
      return out
    },

    getSiteSettings(locale: Locale): Promise<SiteSetting | null> {
      return run('getSiteSettings', [locale], ['site-settings', 'pages'], async (draft) => {
        const docs = await find<SiteSetting>('site-settings', draft, { hasDrafts: false, locale, limit: 1 })
        return docs[0] ?? null
      })
    },

    listEvents(): Promise<Event[]> {
      return run('listEvents', [], ['events'], (draft) =>
        find<Event>('events', draft, { hasDrafts: false, sort: 'startDate' }),
      )
    },

    listNewsletters(): Promise<Newsletter[]> {
      return run('listNewsletters', [], ['newsletters'], (draft) =>
        find<Newsletter>('newsletters', draft, { hasDrafts: true, sort: '-publishDate' }),
      )
    },

    /** Prefers the issue written in the requested language when two share a slug. */
    getNewsletter(slug: string, locale: Locale): Promise<Newsletter | null> {
      return run('getNewsletter', [slug, locale], ['newsletters'], async (draft) => {
        const docs = await find<Newsletter>('newsletters', draft, {
          hasDrafts: true,
          where: [{ slug: { equals: slug } }],
        })
        return docs.find((d) => d.language === locale) ?? docs[0] ?? null
      })
    },

    listPastEvents(locale: Locale): Promise<PastEvent[]> {
      return run('listPastEvents', [locale], ['past-events'], (draft) =>
        find<PastEvent>('past-events', draft, {
          hasDrafts: true,
          sort: '-date',
          where: [{ or: [{ language: { equals: locale } }, { language: { exists: false } }] }],
        }),
      )
    },

    getPastEvent(slug: string): Promise<PastEvent | null> {
      return run('getPastEvent', [slug], ['past-events'], async (draft) => {
        const docs = await find<PastEvent>('past-events', draft, {
          hasDrafts: true,
          limit: 1,
          where: [{ slug: { equals: slug } }],
        })
        return docs[0] ?? null
      })
    },

    listVacancies(): Promise<Vacancy[]> {
      return run('listVacancies', [], ['vacancies'], (draft) =>
        find<Vacancy>('vacancies', draft, { hasDrafts: false }),
      )
    },

    findRedirect(from: string): Promise<Redirect | null> {
      return run('findRedirect', [from], ['redirects'], async (draft) => {
        const docs = await find<Redirect>('redirects', draft, {
          hasDrafts: false,
          depth: 0,
          limit: 1,
          where: [{ from: { equals: from } }],
        })
        return docs[0] ?? null
      })
    },

    getMediaByLegacyPath(legacyPath: string): Promise<Media | null> {
      return run('getMediaByLegacyPath', [legacyPath], [], async (draft) => {
        const docs = await find<Media>('media', draft, {
          hasDrafts: false,
          depth: 0,
          limit: 1,
          where: [{ legacyPath: { equals: legacyPath } }],
        })
        return docs[0] ?? null
      })
    },
  }
}

export type Queries = ReturnType<typeof createQueries>
