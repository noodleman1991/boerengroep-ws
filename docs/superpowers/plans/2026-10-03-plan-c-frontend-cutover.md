# Plan C: Frontend Swap to Payload and Boerengroep Cutover

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Boerengroep public site read everything from Payload, remove TinaCMS, prove that every existing URL still works, and cut production over.

**Architecture:** One tenant-bound query layer in `@sites/cms/queries` is the only way the app reads content. Small adapters in the app reshape Payload documents into the shapes the existing calendar, list and layout components already accept, so most components change only where they render rich text or images. Page URLs are resolved against the localized `path` field, with a fallback that redirects legacy English-path links. Collection hooks refresh the right site's cache.

**Tech Stack:** Next 15.4 App Router, React 19, Payload 3.90.2 Local API, `next-intl` 4, `@payloadcms/richtext-lexical/react`, `@payloadcms/live-preview-react`, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-03-payload-multi-tenant-migration-design.md`, sections 6, 7, 11, 12, 13 and 16.

**Depends on:** Plans A and B complete. The local `payload_dev` database from Plan B Task 9 holds the Boerengroep content.

## Global Constraints

- The app never calls `payload.find` or `getPayload` outside `lib/cms.ts`, the Payload route group, and the preview route. All content reads go through `cms.*`.
- Every query filters by the tenant resolved from `TENANT_SLUG`. Collections with drafts also filter `_status = published` unless draft mode is on.
- Cache tags have the form `<tenantSlug>:<collectionSlug>`. Every cached query also carries `<tenantSlug>:media`.
- Locale type is `'en' | 'nl'`. Default is `en`.
- A failed remote revalidation never fails a save. Cached queries also expire after 3600 seconds.
- No file under `apps/boerengroep` may import from `tinacms`, `@tinacms/*` or `tina/__generated__` once Task 9 is done.
- Existing behaviour is preserved even where it looks odd. In particular, the newsletter routes keep comparing the organization to the literal `'Inspiratietheater'`.
- Environment variables added in this plan: `REVALIDATE_SECRET`, `NEXT_PUBLIC_SITE_URL`.
- Payload API calls were written against the 3.90 documentation and were not executed. If a signature differs, keep the behaviour and the test.

## Review Focus

1. **A query returns another tenant's document.** Expected: never, for every query function, including lookups by slug and by path. Pinned in Task 1.
2. **A visitor follows an old Dutch link that uses English segments, such as `/nl/about-us/history`.** Expected: a permanent redirect to `/nl/over-ons/geschiedenis`, and no redirect loop when a page has no Dutch version. Pinned in Task 1 and Task 6.
3. **A draft page or an unpublished newsletter is requested by a visitor.** Expected: 404. With draft mode on, it renders. Pinned in Task 1.
4. **The revalidation endpoint is called with a wrong secret or with another tenant's tags.** Expected: 401 for the secret, and foreign tags are ignored. Pinned in Task 3.
5. **The preview endpoint is given an off-site redirect target.** Expected: 400. Pinned in Task 8.

## File Structure

```
packages/cms/src/queries/index.ts          createQueries (the only read API)
packages/cms/src/hooks/revalidate.ts       revalidateTenant, withRevalidation
packages/cms/test/queries.int.test.ts
packages/cms/src/hooks/revalidate.test.ts

apps/boerengroep/
  lib/cms.ts                               the bound query layer for this app
  lib/cms-adapters.ts                      Payload docs to existing component shapes
  lib/cms-adapters.test.ts
  lib/revalidate-auth.ts                   secret check + tag filter (pure)
  lib/revalidate-auth.test.ts
  lib/safe-path.ts                         isSafeInternalPath (pure)
  lib/safe-path.test.ts
  components/rich-text.tsx                 Lexical renderer
  components/live-preview-listener.tsx
  app/api/revalidate/route.ts
  app/api/preview/route.ts
  app/api/exit-preview/route.ts
  app/uploads/[...path]/route.ts           legacy media redirects
  i18n/routing.ts                          hand-written, fixed routes only
  e2e/smoke.spec.ts, playwright.config.ts
tools/url-parity/                          collect and check scripts
docs/migration/cutover-runbook.md
docs/EDITING-GUIDE.md                      rewritten for Payload
```

---

### Task 1: The tenant-bound query layer

**Files:**
- Create: `packages/cms/src/queries/index.ts`
- Test: `packages/cms/test/queries.int.test.ts`

**Interfaces:**
- Consumes: generated types from `packages/cms/src/payload-types.ts`, test helpers.
- Produces `createQueries(deps: QueryDeps)` returning:
  - `resolvePage(locale: Locale, path: string): Promise<{ page?: Page; redirectTo?: string } | null>`
  - `getPageByEnglishPath(path: string, locale: Locale): Promise<Page | null>`
  - `listPagePaths(): Promise<{ locale: Locale; path: string }[]>`
  - `getSiteSettings(locale: Locale): Promise<SiteSetting | null>`
  - `listEvents(): Promise<Event[]>`
  - `listNewsletters(): Promise<Newsletter[]>`
  - `getNewsletter(slug: string, locale: Locale): Promise<Newsletter | null>`
  - `listPastEvents(locale: Locale): Promise<PastEvent[]>`
  - `getPastEvent(slug: string): Promise<PastEvent | null>`
  - `listVacancies(): Promise<Vacancy[]>`
  - `findRedirect(from: string): Promise<Redirect | null>`
  - `getMediaByLegacyPath(legacyPath: string): Promise<Media | null>`
- Types:
  - `type Locale = 'en' | 'nl'`
  - `type CacheFn = <T>(fn: () => Promise<T>, key: string[], tags: string[]) => () => Promise<T>`
  - `type QueryDeps = { getPayload: () => Promise<Payload>; tenantSlug: string; isDraft?: () => Promise<boolean>; cache?: CacheFn }`

- [ ] **Step 1: Write the failing test `packages/cms/test/queries.int.test.ts`**

```ts
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createQueries } from '../src/queries'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let bg: number | string
let other: number | string
let draftMode = false

const queries = (tenantSlug: string) =>
  createQueries({ getPayload: async () => payload, tenantSlug, isDraft: async () => draftMode })

async function page(
  tenant: number | string,
  en: { title: string; slug: string },
  nl?: { title: string; slug: string },
  extra: Record<string, unknown> = {},
) {
  const doc = await payload.create({
    collection: 'pages',
    locale: 'en',
    data: { ...en, tenant, _status: 'published', ...extra } as never,
  })
  if (nl) await payload.update({ collection: 'pages', id: doc.id, locale: 'nl', data: nl as never })
  return doc
}

describe('queries', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    bg = (await createTenant(payload, 'boerengroep')).id
    other = (await createTenant(payload, 'inspringtheater')).id

    await page(bg, { title: 'Home', slug: 'home' }, { title: 'Start', slug: 'home' })
    const about = await page(bg, { title: 'About us', slug: 'about-us' }, { title: 'Over ons', slug: 'over-ons' })
    await page(
      bg,
      { title: 'History', slug: 'history' },
      { title: 'Geschiedenis', slug: 'geschiedenis' },
      { parent: about.id },
    )
    await page(bg, { title: 'Accessibility', slug: 'accessibility' })
    await page(bg, { title: 'Secret', slug: 'secret' }, undefined, { _status: 'draft' })
    await page(other, { title: 'Other contact', slug: 'contact' })
    await page(other, { title: 'Other about', slug: 'about-us' })

    for (const [tenant, title] of [
      [bg, 'BG event'],
      [other, 'IT event'],
    ] as const) {
      await payload.create({
        collection: 'events',
        data: { title, slug: 'same-slug', startDate: '2026-01-01T10:00:00.000Z', eventType: 'talk', tenant } as never,
      })
      await payload.create({
        collection: 'vacancies',
        data: { title: `${title} vacancy`, slug: 'same-slug', opportunityType: 'board', tenant } as never,
      })
      await payload.create({
        collection: 'redirects',
        data: { from: '/old', to: tenant === bg ? '/bg-new' : '/it-new', tenant } as never,
      })
      await payload.create({
        collection: 'site-settings',
        data: { header: { logoAlt: 'x', name: `${title} site` }, tenant } as never,
      })
      await payload.create({
        collection: 'newsletters',
        data: {
          title: `${title} news`,
          slug: 'Issue-1',
          type: 'article',
          organization: 'Boerengroep',
          publishDate: '2026-02-01T10:00:00.000Z',
          tenant,
          _status: 'published',
        } as never,
      })
      await payload.create({
        collection: 'past-events',
        data: { title: `${title} recap`, slug: 'Recap', date: '2026-01-05T10:00:00.000Z', tenant, _status: 'published' } as never,
      })
    }
    await payload.create({
      collection: 'newsletters',
      data: {
        title: 'Unpublished',
        slug: 'Unpublished',
        type: 'article',
        organization: 'Boerengroep',
        publishDate: '2026-03-01T10:00:00.000Z',
        tenant: bg,
        _status: 'draft',
      } as never,
    })
    await payload.create({
      collection: 'past-events',
      data: { title: 'Dutch recap', slug: 'Terugblik', language: 'nl', date: '2026-01-06T10:00:00.000Z', tenant: bg, _status: 'published' } as never,
    })
  })
  afterAll(async () => resetDb(payload))

  describe('resolvePage', () => {
    it('finds a page by its path in the requested locale', async () => {
      const q = queries('boerengroep')
      expect((await q.resolvePage('en', '/about-us/history'))?.page?.title).toBe('History')
      expect((await q.resolvePage('nl', '/over-ons/geschiedenis'))?.page?.title).toBe('Geschiedenis')
    })

    it('finds the home page at the root', async () => {
      expect((await queries('boerengroep').resolvePage('nl', '/'))?.page?.title).toBe('Start')
    })

    it('redirects an English path requested in Dutch to the Dutch path', async () => {
      expect(await queries('boerengroep').resolvePage('nl', '/about-us/history')).toEqual({
        redirectTo: '/over-ons/geschiedenis',
      })
    })

    it('redirects a Dutch path requested in English to the English path', async () => {
      expect(await queries('boerengroep').resolvePage('en', '/over-ons')).toEqual({ redirectTo: '/about-us' })
    })

    it('serves the English content without a redirect loop when there is no Dutch version', async () => {
      const res = await queries('boerengroep').resolvePage('nl', '/accessibility')
      expect(res?.redirectTo).toBeUndefined()
      expect(res?.page?.title).toBe('Accessibility')
    })

    it('returns null for an unknown path', async () => {
      expect(await queries('boerengroep').resolvePage('en', '/nope')).toBeNull()
    })

    it('never returns another tenant page with the same path', async () => {
      expect((await queries('boerengroep').resolvePage('en', '/about-us'))?.page?.title).toBe('About us')
      expect((await queries('inspringtheater').resolvePage('en', '/about-us'))?.page?.title).toBe('Other about')
      expect(await queries('boerengroep').resolvePage('en', '/contact')).toBeNull()
    })

    it('hides a draft page unless draft mode is on', async () => {
      expect(await queries('boerengroep').resolvePage('en', '/secret')).toBeNull()
      draftMode = true
      expect((await queries('boerengroep').resolvePage('en', '/secret'))?.page?.title).toBe('Secret')
      draftMode = false
    })
  })

  it('looks a page up by its English path and returns it in Dutch', async () => {
    const res = await queries('boerengroep').getPageByEnglishPath('/about-us/history', 'nl')
    expect(res?.title).toBe('Geschiedenis')
  })

  it('lists published page paths per locale for this tenant only', async () => {
    const paths = await queries('boerengroep').listPagePaths()
    expect(paths).toContainEqual({ locale: 'nl', path: '/over-ons/geschiedenis' })
    expect(paths).toContainEqual({ locale: 'en', path: '/' })
    expect(paths.some((p) => p.path === '/secret')).toBe(false)
    expect(paths.some((p) => p.path === '/contact')).toBe(false)
    expect(paths.filter((p) => p.locale === 'nl' && p.path === '/accessibility')).toHaveLength(0)
  })

  it('scopes every list and lookup to the tenant', async () => {
    const q = queries('boerengroep')
    expect((await q.listEvents()).map((d) => d.title)).toEqual(['BG event'])
    expect((await q.listVacancies()).map((d) => d.title)).toEqual(['BG event vacancy'])
    expect((await q.listNewsletters()).map((d) => d.title)).toEqual(['BG event news'])
    expect((await q.getNewsletter('Issue-1', 'en'))?.title).toBe('BG event news')
    expect((await q.getPastEvent('Recap'))?.title).toBe('BG event recap')
    expect((await q.findRedirect('/old'))?.to).toBe('/bg-new')
    expect((await q.getSiteSettings('en'))?.header?.name).toBe('BG event site')
  })

  it('hides an unpublished newsletter from lists and lookups', async () => {
    const q = queries('boerengroep')
    expect(await q.getNewsletter('Unpublished', 'en')).toBeNull()
    draftMode = true
    expect((await q.getNewsletter('Unpublished', 'en'))?.title).toBe('Unpublished')
    draftMode = false
  })

  it('shows past events of the locale and those without a language', async () => {
    const q = queries('boerengroep')
    expect((await q.listPastEvents('en')).map((d) => d.title)).toEqual(['BG event recap'])
    expect((await q.listPastEvents('nl')).map((d) => d.title)).toEqual(['Dutch recap', 'BG event recap'])
  })

  it('fails clearly for a tenant that does not exist', async () => {
    await expect(queries('ghost').listEvents()).rejects.toThrow(/Tenant "ghost" not found/)
  })

  it('uses the cache function with tenant-prefixed tags when not in draft mode', async () => {
    const seen: { key: string[]; tags: string[] }[] = []
    const q = createQueries({
      getPayload: async () => payload,
      tenantSlug: 'boerengroep',
      isDraft: async () => false,
      cache: (fn, key, tags) => {
        seen.push({ key, tags })
        return fn
      },
    })
    await q.listEvents()
    expect(seen[0]!.tags).toEqual(['boerengroep:events', 'boerengroep:media'])
    expect(seen[0]!.key.slice(0, 2)).toEqual(['boerengroep', 'listEvents'])
  })

  it('bypasses the cache in draft mode', async () => {
    let cached = 0
    const q = createQueries({
      getPayload: async () => payload,
      tenantSlug: 'boerengroep',
      isDraft: async () => true,
      cache: (fn) => {
        cached++
        return fn
      },
    })
    await q.listNewsletters()
    expect(cached).toBe(0)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/cms test:int`
Expected: FAIL, cannot resolve `../src/queries`.

- [ ] **Step 3: Write `packages/cms/src/queries/index.ts`**

```ts
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
```

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @sites/cms test:int`
Expected: all pass.

If "serves the English content without a redirect loop" fails because `localized.path` is empty, the fallback did not apply to `path`. In that case return `{ page: localized }` whenever `localized.path` is empty, which the code already does, and check that `localization.fallback` is `true` in `config.ts`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(cms): tenant-bound query layer with localized path resolution"
```

---

### Task 2: Cache revalidation hooks and live preview URL

**Files:**
- Create: `packages/cms/src/hooks/revalidate.ts`
- Modify: `packages/cms/src/config.ts`, `packages/cms/src/collections/pages.ts`
- Test: `packages/cms/src/hooks/revalidate.test.ts`

**Interfaces:**
- Consumes: `CmsCustom`, `relId`.
- Produces:
  - `revalidateTenant(args: { payload: PayloadLike; tenant: Ref; collection: string; fetchImpl?: typeof fetch }): Promise<'local' | 'remote' | 'skipped' | 'failed'>`
  - `withRevalidation(collection: CollectionConfig): CollectionConfig`, which appends `afterChange` and `afterDelete` hooks. The hooks do nothing when `req.context.disableRevalidate` is set.
  - Remote call: `POST <siteUrl>/api/revalidate`, header `x-revalidate-secret: <tenant.revalidateSecret>`, JSON body `{ "tags": ["<slug>:<collection>"] }`.
  - Pages get `admin.livePreview.url` pointing at `/api/preview?path=/<locale><path>`.

- [ ] **Step 1: Write the failing test `packages/cms/src/hooks/revalidate.test.ts`**

```ts
import { describe, expect, it, vi } from 'vitest'
import { revalidateTenant } from './revalidate'

function fakePayload(opts: { own: string; revalidateLocal?: (tags: string[]) => void; tenant?: object | null }) {
  const errors: string[] = []
  return {
    errors,
    payload: {
      config: { custom: { tenantSlug: opts.own, revalidateLocal: opts.revalidateLocal } },
      logger: { error: (msg: string) => errors.push(msg) },
      findByID: async () => {
        if (opts.tenant === null) throw new Error('not found')
        return opts.tenant ?? { id: 1, slug: opts.own, siteUrl: 'https://bg.test', revalidateSecret: 's' }
      },
    },
  }
}

describe('revalidateTenant', () => {
  it('refreshes the local cache for a document of this app tenant', async () => {
    const local = vi.fn()
    const { payload } = fakePayload({ own: 'boerengroep', revalidateLocal: local })
    const fetchImpl = vi.fn()
    const out = await revalidateTenant({ payload, tenant: 1, collection: 'pages', fetchImpl })
    expect(out).toBe('local')
    expect(local).toHaveBeenCalledWith(['boerengroep:pages'])
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('calls the other site for a document of the other tenant', async () => {
    const local = vi.fn()
    const { payload } = fakePayload({
      own: 'boerengroep',
      revalidateLocal: local,
      tenant: { id: 2, slug: 'inspringtheater', siteUrl: 'https://it.test/', revalidateSecret: 'it-secret' },
    })
    const fetchImpl = vi.fn(async () => new Response(null, { status: 200 }))
    const out = await revalidateTenant({ payload, tenant: { id: 2 }, collection: 'events', fetchImpl })
    expect(out).toBe('remote')
    expect(local).not.toHaveBeenCalled()
    expect(fetchImpl).toHaveBeenCalledWith('https://it.test/api/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': 'it-secret' },
      body: JSON.stringify({ tags: ['inspringtheater:events'] }),
    })
  })

  it('retries a failed remote call once and then gives up without throwing', async () => {
    const { payload, errors } = fakePayload({
      own: 'boerengroep',
      tenant: { id: 2, slug: 'inspringtheater', siteUrl: 'https://it.test', revalidateSecret: 'x' },
    })
    const fetchImpl = vi.fn(async () => new Response(null, { status: 500 }))
    const out = await revalidateTenant({ payload, tenant: 2, collection: 'pages', fetchImpl })
    expect(out).toBe('failed')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(errors[0]).toMatch(/inspringtheater.*500/)
  })

  it('succeeds when the retry works', async () => {
    const { payload } = fakePayload({
      own: 'boerengroep',
      tenant: { id: 2, slug: 'inspringtheater', siteUrl: 'https://it.test', revalidateSecret: 'x' },
    })
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
    expect(await revalidateTenant({ payload, tenant: 2, collection: 'pages', fetchImpl })).toBe('remote')
  })

  it('skips a document without a tenant', async () => {
    const { payload } = fakePayload({ own: 'boerengroep' })
    expect(await revalidateTenant({ payload, tenant: undefined, collection: 'pages' })).toBe('skipped')
  })

  it('does not throw when the tenant cannot be loaded', async () => {
    const { payload, errors } = fakePayload({ own: 'boerengroep', tenant: null })
    expect(await revalidateTenant({ payload, tenant: 9, collection: 'pages' })).toBe('failed')
    expect(errors).toHaveLength(1)
  })

  it('does not throw when the local refresh throws', async () => {
    const { payload, errors } = fakePayload({
      own: 'boerengroep',
      revalidateLocal: () => {
        throw new Error('static generation store missing')
      },
    })
    expect(await revalidateTenant({ payload, tenant: 1, collection: 'pages' })).toBe('failed')
    expect(errors[0]).toMatch(/static generation store missing/)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/cms test`
Expected: FAIL, cannot resolve `./revalidate`.

- [ ] **Step 3: Write `packages/cms/src/hooks/revalidate.ts`**

```ts
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'
import { type Ref, relId } from '../access/roles'
import type { CmsCustom } from '../config'

type TenantDoc = { slug: string; siteUrl: string; revalidateSecret: string }

/** The part of Payload this module needs. Lets the unit test pass a small fake. */
export type PayloadLike = {
  config: { custom?: unknown }
  logger: { error: (msg: string) => void }
  findByID: (args: {
    collection: 'tenants'
    id: number | string
    depth: 0
    overrideAccess: true
  }) => Promise<unknown>
}

export async function revalidateTenant(args: {
  payload: PayloadLike
  tenant: Ref
  collection: string
  fetchImpl?: typeof fetch
}): Promise<'local' | 'remote' | 'skipped' | 'failed'> {
  const { payload, collection } = args
  const id = relId(args.tenant)
  if (id === undefined) return 'skipped'
  const custom = (payload.config.custom ?? {}) as Partial<CmsCustom>

  try {
    const tenant = (await payload.findByID({
      collection: 'tenants',
      id,
      depth: 0,
      overrideAccess: true,
    })) as TenantDoc
    const tags = [`${tenant.slug}:${collection}`]

    if (tenant.slug === custom.tenantSlug) {
      await custom.revalidateLocal?.(tags)
      return 'local'
    }

    const doFetch = args.fetchImpl ?? fetch
    const url = `${tenant.siteUrl.replace(/\/$/, '')}/api/revalidate`
    let lastError = ''
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await doFetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-revalidate-secret': tenant.revalidateSecret },
          body: JSON.stringify({ tags }),
        })
        if (res.ok) return 'remote'
        lastError = `status ${res.status}`
      } catch (err) {
        lastError = (err as Error).message
      }
    }
    payload.logger.error(`Revalidation of ${tenant.slug} failed for ${collection}: ${lastError}`)
    return 'failed'
  } catch (err) {
    payload.logger.error(`Revalidation failed for ${collection}: ${(err as Error).message}`)
    return 'failed'
  }
}

/** Adds cache-refresh hooks to a tenant-scoped collection. */
export function withRevalidation(collection: CollectionConfig): CollectionConfig {
  const afterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
    if (!req.context?.disableRevalidate) {
      await revalidateTenant({ payload: req.payload as never, tenant: doc.tenant, collection: collection.slug })
    }
    return doc
  }
  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    if (!req.context?.disableRevalidate) {
      await revalidateTenant({ payload: req.payload as never, tenant: doc.tenant, collection: collection.slug })
    }
    return doc
  }
  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [...(collection.hooks?.afterChange ?? []), afterChange],
      afterDelete: [...(collection.hooks?.afterDelete ?? []), afterDelete],
    },
  }
}
```

- [ ] **Step 4: Apply the hooks in `config.ts`**

Add the import:

```ts
import { withRevalidation } from './hooks/revalidate'
```

In `createPayloadConfig`, change the `collections` line to:

```ts
collections: [...tenantScoped.map(withRevalidation), Users, Tenants],
```

- [ ] **Step 5: Add the live preview URL to `pages.ts`**

Change the `admin` block of the `Pages` collection to:

```ts
admin: {
  useAsTitle: 'title',
  defaultColumns: ['title', 'path', '_status'],
  group: 'Content',
  livePreview: {
    url: ({ data, locale }) => {
      const path = typeof data?.path === 'string' ? data.path : '/'
      const target = `/${locale?.code ?? 'en'}${path === '/' ? '' : path}`
      return `/api/preview?path=${encodeURIComponent(target)}`
    },
  },
},
```

- [ ] **Step 6: Run everything and commit**

```bash
pnpm --filter @sites/cms test && pnpm --filter @sites/cms test:int && pnpm --filter @sites/cms typecheck
git add -A
git commit -m "feat(cms): cache revalidation hooks and live preview URL"
```

Expected: all pass. The integration tests still pass because the test helpers set `disableRevalidate` only in `resetDb`, and without a `revalidateLocal` function the local branch is a no-op.

---

### Task 3: Bind the query layer in the app, adapters and the revalidate endpoint

**Files:**
- Create: `apps/boerengroep/lib/cms.ts`, `lib/cms-adapters.ts`, `lib/revalidate-auth.ts`, `app/api/revalidate/route.ts`, `vitest.config.ts`
- Modify: `apps/boerengroep/payload.config.ts`, `apps/boerengroep/package.json`
- Test: `apps/boerengroep/lib/cms-adapters.test.ts`, `lib/revalidate-auth.test.ts`

**Interfaces:**
- Consumes: `createQueries`, generated types.
- Produces:
  - `cms` (type `Queries`) from `@/lib/cms`
  - From `@/lib/cms-adapters`: `mediaUrl(m)`, `asConnection(nodes)`, `toCalendarEvent(e)`, `toNewsletterNode(n)`, `toVacancyNode(v)`, `toPastEventNode(p)`, `toGlobalSettings(s)`, and `type GlobalSettings = ReturnType<typeof toGlobalSettings>`
  - From `@/lib/revalidate-auth`: `secretMatches(given: string | null, expected: string | undefined): boolean`, `ownTags(tags: unknown, tenantSlug: string): string[]`

- [ ] **Step 1: Add Vitest to the app**

```bash
pnpm --filter boerengroep add -D vitest@catalog:
```

`apps/boerengroep/vitest.config.ts`:

```ts
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname) } },
  test: { environment: 'node', include: ['lib/**/*.test.ts'] },
})
```

Add to `apps/boerengroep/package.json` scripts:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write the failing tests**

`apps/boerengroep/lib/revalidate-auth.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { ownTags, secretMatches } from './revalidate-auth'

describe('secretMatches', () => {
  it('accepts the exact secret', () => {
    expect(secretMatches('abc123', 'abc123')).toBe(true)
  })
  it('rejects a wrong secret, including one of a different length', () => {
    expect(secretMatches('abc124', 'abc123')).toBe(false)
    expect(secretMatches('abc', 'abc123')).toBe(false)
  })
  it('rejects a missing header', () => {
    expect(secretMatches(null, 'abc123')).toBe(false)
  })
  it('rejects everything when no secret is configured', () => {
    expect(secretMatches('', undefined)).toBe(false)
    expect(secretMatches('', '')).toBe(false)
  })
})

describe('ownTags', () => {
  it('keeps only tags of this tenant', () => {
    expect(ownTags(['boerengroep:pages', 'inspringtheater:pages', 'boerengroep:events'], 'boerengroep')).toEqual([
      'boerengroep:pages',
      'boerengroep:events',
    ])
  })
  it('returns nothing for input that is not a list of strings', () => {
    expect(ownTags('boerengroep:pages', 'boerengroep')).toEqual([])
    expect(ownTags([1, null, { a: 1 }], 'boerengroep')).toEqual([])
    expect(ownTags(undefined, 'boerengroep')).toEqual([])
  })
  it('does not accept a tag that only starts with the tenant name', () => {
    expect(ownTags(['boerengroep-evil:pages'], 'boerengroep')).toEqual([])
  })
})
```

`apps/boerengroep/lib/cms-adapters.test.ts`:

```ts
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
    expect(out.theme).toEqual({ color: undefined, font: undefined, darkMode: 'system' })
  })
})
```

- [ ] **Step 3: Run them and watch them fail**

Run: `pnpm --filter boerengroep test`
Expected: FAIL, modules `./revalidate-auth` and `./cms-adapters` not found.

- [ ] **Step 4: Write `apps/boerengroep/lib/revalidate-auth.ts`**

```ts
import { timingSafeEqual } from 'node:crypto'

export function secretMatches(given: string | null, expected: string | undefined): boolean {
  if (!expected || given === null) return false
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Keeps only well-formed tags that belong to this tenant. */
export function ownTags(tags: unknown, tenantSlug: string): string[] {
  if (!Array.isArray(tags)) return []
  return tags.filter((t): t is string => typeof t === 'string' && t.startsWith(`${tenantSlug}:`))
}
```

- [ ] **Step 5: Write `apps/boerengroep/lib/cms-adapters.ts`**

```ts
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

function person(value: Rel<Author | Speaker>): { name: string; avatar: string | undefined } | undefined {
  const doc = populated(value)
  return doc ? { name: doc.name, avatar: mediaUrl(doc.avatar) } : undefined
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
      color: s?.theme?.color ?? undefined,
      font: s?.theme?.font ?? undefined,
      darkMode: s?.theme?.darkMode ?? 'system',
    },
  }
}

export type GlobalSettings = ReturnType<typeof toGlobalSettings>
export type CalendarEvent = ReturnType<typeof toCalendarEvent>
```

- [ ] **Step 6: Write `apps/boerengroep/lib/cms.ts`**

```ts
import config from '@payload-config'
import { createQueries } from '@sites/cms/queries'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

export const TENANT_SLUG = process.env.TENANT_SLUG ?? 'boerengroep'

export const cms = createQueries({
  getPayload: () => getPayload({ config }),
  tenantSlug: TENANT_SLUG,
  isDraft: async () => {
    try {
      return (await draftMode()).isEnabled
    } catch {
      // Outside a request, for example in generateStaticParams.
      return false
    }
  },
  cache: (fn, key, tags) => unstable_cache(fn, key, { tags, revalidate: 3600 }),
})

export type { Locale } from '@sites/cms/queries'
```

- [ ] **Step 7: Pass `revalidateLocal` in `apps/boerengroep/payload.config.ts`**

```ts
import { createPayloadConfig } from '@sites/cms'
import { revalidateTag } from 'next/cache'

export default createPayloadConfig({
  tenantSlug: process.env.TENANT_SLUG ?? 'boerengroep',
  revalidateLocal: (tags) => {
    for (const tag of tags) revalidateTag(tag)
  },
})
```

- [ ] **Step 8: Write `apps/boerengroep/app/api/revalidate/route.ts`**

```ts
import { revalidateTag } from 'next/cache'
import { TENANT_SLUG } from '@/lib/cms'
import { ownTags, secretMatches } from '@/lib/revalidate-auth'

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get('x-revalidate-secret'), process.env.REVALIDATE_SECRET)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null
  const tags = ownTags(body?.tags, TENANT_SLUG)
  for (const tag of tags) revalidateTag(tag)
  return Response.json({ revalidated: tags })
}
```

- [ ] **Step 9: Run the tests and try the endpoint**

Run: `pnpm --filter boerengroep test`
Expected: all pass.

Point the app at the migrated database by setting in `apps/boerengroep/.env.local`:

```
PAYLOAD_DATABASE_URL=postgres://payload:payload@127.0.0.1:54329/payload_dev
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
pnpm --filter boerengroep dev &
sleep 30
S=$(grep '^REVALIDATE_SECRET=' apps/boerengroep/.env.local | cut -d= -f2)
curl -s -o /dev/null -w 'wrong secret: %{http_code}\n' -X POST localhost:3000/api/revalidate -H 'x-revalidate-secret: nope' -d '{"tags":["boerengroep:pages"]}'
curl -s -X POST localhost:3000/api/revalidate -H "x-revalidate-secret: $S" -H 'content-type: application/json' \
  -d '{"tags":["boerengroep:pages","inspringtheater:pages"]}'; echo
kill %1
```

Expected: `wrong secret: 401`, then `{"revalidated":["boerengroep:pages"]}`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(app): bound query layer, adapters and revalidate endpoint"
```

---

### Task 4: Rich text renderer and block renderers on Payload data

**Files:**
- Create: `apps/boerengroep/components/rich-text.tsx`
- Modify: `apps/boerengroep/components/blocks/index.tsx` and the ten block files in `apps/boerengroep/components/blocks/`
- Modify: `apps/boerengroep/components/layout/section.tsx`, `components/magicui/script-copy-btn.tsx`
- Delete: `apps/boerengroep/components/blocks/mermaid.tsx`, `components/mdx-components.tsx`

**Interfaces:**
- Consumes: `mediaUrl`, block types `HeroBlock`, `ContentBlock`, `CalloutBlock`, `FeaturesBlock`, `StatsBlock`, `CtaBlock`, `TestimonialBlock`, `VideoBlock`, `ImageTextBlock`, `EventsCalendarPreviewBlock` from `@sites/cms/types`.
- Produces:
  - `RichText({ data, className }: { data?: unknown; className?: string })` from `@/components/rich-text`
  - `Blocks({ blocks, events, globalData })` switching on `block.blockType`
- This task changes rendering only. It is verified by typecheck here and by the page routes in Task 6.

- [ ] **Step 1: Write `apps/boerengroep/components/rich-text.tsx`**

```tsx
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const doc = linkNode.fields.doc?.value
      return doc && typeof doc === 'object' && 'path' in doc && typeof doc.path === 'string' ? doc.path : '/'
    },
  }),
})

export function RichText({ data, className }: { data?: unknown; className?: string }) {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  return <LexicalRichText data={data as SerializedEditorState} converters={converters} className={className} />
}
```

- [ ] **Step 2: Replace `apps/boerengroep/components/blocks/index.tsx`**

```tsx
'use client'

import type { Page } from '@sites/cms/types'
import type { CalendarEvent, GlobalSettings } from '@/lib/cms-adapters'
import { CallToAction } from './call-to-action'
import { Callout } from './callout'
import { Content } from './content'
import { EventsCalendarPreview } from './events-calendar-preview'
import { Features } from './features'
import { Hero } from './hero'
import { ImageText } from './image-text'
import { Stats } from './stats'
import { Testimonial } from './testimonial'
import { Video } from './video'

type AnyBlock = NonNullable<Page['blocks']>[number]

interface BlocksProps {
  blocks?: AnyBlock[] | null
  events?: CalendarEvent[]
  globalData?: GlobalSettings
}

export const Blocks = ({ blocks, events = [], globalData }: BlocksProps) => {
  if (!blocks) return null
  return (
    <>
      {blocks.map((block, i) => (
        <div key={block.id ?? i}>
          <Block block={block} events={events} globalData={globalData} />
        </div>
      ))}
    </>
  )
}

const Block = ({
  block,
  events,
  globalData,
}: {
  block: AnyBlock
  events: CalendarEvent[]
  globalData?: GlobalSettings
}) => {
  switch (block.blockType) {
    case 'video':
      return <Video data={block} />
    case 'hero':
      return <Hero data={block} />
    case 'callout':
      return <Callout data={block} />
    case 'stats':
      return <Stats data={block} />
    case 'content':
      return <Content data={block} />
    case 'features':
      return <Features data={block} />
    case 'testimonial':
      return <Testimonial data={block} />
    case 'cta':
      return <CallToAction data={block} />
    case 'imageText':
      return <ImageText data={block} />
    case 'eventsCalendarPreview':
      return <EventsCalendarPreview data={block} events={events} globalData={globalData} />
    default:
      return null
  }
}
```

- [ ] **Step 3: Convert each block file with these five rules**

Apply all five rules to every file in the table. The JSX structure and class names do not change.

1. **Delete the schema.** Remove the whole `export const <name>BlockSchema: TinaTemplate = { ... }` statement, any constant used only by it (such as `defaultFeature`), and the imports of `TinaTemplate`, `iconSchema`, `sectionBlockSchemaField` and `scriptCopyBlockSchema`.
2. **Delete edit markers.** Remove every `data-tina-field={...}` attribute and the `tinaField` import.
3. **Swap the data type.** Replace the `tina/__generated__/types` import with a type import from `@sites/cms/types`, using the type in the table.
4. **Render rich text with `RichText`.** Replace `<TinaMarkdown content={X} ... />` with `<RichText data={X} />`, drop the `components` prop, and import `RichText` from `@/components/rich-text`. Remove the `TinaMarkdown` import.
5. **Resolve images.** Wrap each image field in `mediaUrl(...)`, imported from `@/lib/cms-adapters`.

| File | Data type | Rich text fields (rule 4) | Image fields (rule 5) |
|---|---|---|---|
| `hero.tsx` | `HeroBlock` | none | `data.image?.src` |
| `content.tsx` | `ContentBlock` | `data.body` | none |
| `callout.tsx` | `CalloutBlock` | none | none |
| `features.tsx` | `FeaturesBlock` | `data.text` of each item | none |
| `stats.tsx` | `StatsBlock` | none | none |
| `call-to-action.tsx` | `CtaBlock` | none | none |
| `testimonial.tsx` | `TestimonialBlock` | none | `testimonial.avatar` |
| `video.tsx` | `VideoBlock` | none | none |
| `image-text.tsx` | `ImageTextBlock` | `data.content` (three places) | `data.image?.src` |
| `events-calendar-preview.tsx` | `EventsCalendarPreviewBlock` | none | none |

For nested item types, derive them from the block type instead of importing Tina's nested types:

```ts
// hero.tsx, replaces PageBlocksHeroImage
type HeroImage = NonNullable<HeroBlock['image']>
// testimonial.tsx, replaces PageBlocksTestimonialTestimonials
type TestimonialItem = NonNullable<TestimonialBlock['testimonials']>[number]
// features.tsx, replaces the Tina feature item type
type FeatureItem = NonNullable<FeaturesBlock['items']>[number]
```

In `events-calendar-preview.tsx` also change the props to use the adapter types, because events now arrive already flattened:

```ts
import type { EventsCalendarPreviewBlock } from '@sites/cms/types'
import type { CalendarEvent, GlobalSettings } from '@/lib/cms-adapters'

// props
{ data: EventsCalendarPreviewBlock; events?: CalendarEvent[]; globalData?: GlobalSettings }
```

Leave its internal mapping of `event.speakers?.[0]?.speaker?.avatar`, `event.image` and `event.coverImage` as it is. Those are already URL strings.

- [ ] **Step 4: Clean up the three helper files**

- `components/layout/section.tsx`: delete the `sectionBlockSchemaField` export and the `tailwindBackgroundOptions` constant if nothing else in the file uses it.
- `components/magicui/script-copy-btn.tsx`: delete the `scriptCopyBlockSchema` export and the `TinaTemplate` import. Keep the component.
- Delete `components/blocks/mermaid.tsx` and `components/mdx-components.tsx`. Spec amendment 3 drops the embed components. Other files that import `components` from `mdx-components` are fixed in Task 7.

- [ ] **Step 5: Verify the block folder is free of Tina**

Run: `grep -rnE "tinacms|tina/|TinaMarkdown|tinaField|TinaTemplate|BlockSchema" apps/boerengroep/components/blocks apps/boerengroep/components/rich-text.tsx apps/boerengroep/components/layout/section.tsx`
Expected: no output.

Run: `pnpm --filter boerengroep exec tsc --noEmit 2>&1 | grep "components/blocks" `
Expected: no output. Errors in other folders are expected until Task 9 and are not part of this check.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(app): render blocks and rich text from Payload data"
```

---

### Task 5: Layout, header and footer on site settings

**Files:**
- Modify: `apps/boerengroep/components/layout/layout.tsx`, `components/layout/layout-context.tsx`, `components/layout/nav/header.tsx`, `components/layout/nav/footer.tsx`

**Interfaces:**
- Consumes: `cms.getSiteSettings`, `toGlobalSettings`, `GlobalSettings`.
- Produces: `Layout({ children, rawPageData })`, unchanged signature. `useLayout()` returns `globalSettings: GlobalSettings`.

- [ ] **Step 1: Replace `components/layout/layout.tsx`**

```tsx
import { getLocale } from 'next-intl/server'
import React, { type PropsWithChildren } from 'react'
import { cms, type Locale } from '@/lib/cms'
import { toGlobalSettings } from '@/lib/cms-adapters'
import { LayoutProvider } from './layout-context'
import { Footer } from './nav/footer'
import { Header } from './nav/header'

type LayoutProps = PropsWithChildren & {
  rawPageData?: unknown
}

export default async function Layout({ children, rawPageData }: LayoutProps) {
  const locale = (await getLocale()) as Locale
  const settings = toGlobalSettings(await cms.getSiteSettings(locale))

  return (
    <LayoutProvider globalSettings={settings} pageData={rawPageData ?? {}}>
      <Header />
      <main className="overflow-x-hidden pt-20">{children}</main>
      <Footer />
    </LayoutProvider>
  )
}
```

- [ ] **Step 2: Update the types in `components/layout/layout-context.tsx`**

Replace the import

```ts
import { GlobalQuery } from "../../tina/__generated__/types";
```

with

```ts
import type { GlobalSettings } from "@/lib/cms-adapters";
```

Then replace every occurrence of `GlobalQuery["global"]["theme"]` with `GlobalSettings["theme"]`, and every remaining `GlobalQuery["global"]` with `GlobalSettings`. Change both `pageData: {}` type annotations to `pageData: unknown` and `useState<{}>` to `useState<unknown>`.

- [ ] **Step 3: Show the editable label in the header**

In `components/layout/nav/header.tsx` there are six places that render a navigation label. Change each of them:

```tsx
// before
{t(`items.${item.label}`)}
// after
{item.labelText || t(`items.${item.label}`)}
```

```tsx
// before
{t(`items.${subItem.label}`)}
// after
{subItem.labelText || t(`items.${subItem.label}`)}
```

Confirm all six were changed:

Run: `grep -c 'labelText || t(`items' apps/boerengroep/components/layout/nav/header.tsx`
Expected: `6`

The `href` expressions stay as they are. The adapter already puts the localized page path in `href`.

- [ ] **Step 4: Check the footer compiles against the new shape**

`components/layout/nav/footer.tsx` reads `footer.quickLinks[].title`, `links[].href`, `links[].label`, `footer.social[].platform` and `.url`. The adapter provides exactly these names, so no edit is expected.

Run: `pnpm --filter boerengroep exec tsc --noEmit 2>&1 | grep "components/layout"`
Expected: no output. If the footer or the logo reports a type error, the cause is a nullable field: add `?? ''` at that use, and do not change the adapter.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(app): layout, header and footer read site settings from Payload"
```

---

### Task 6: Page routes, redirects and static routing

**Files:**
- Modify: `apps/boerengroep/app/[locale]/[...urlSegments]/page.tsx`, `app/[locale]/[...urlSegments]/client-page.tsx`, `app/[locale]/page.tsx`
- Replace: `apps/boerengroep/i18n/routing.ts`
- Delete: `apps/boerengroep/scripts/generate-pathnames.ts`
- Modify: `apps/boerengroep/package.json`
- Create: `tools/url-parity/package.json`, `routing-keys.mjs`, `routing-keys.test.mjs`, `candidates.mjs`
- Create: `docs/migration/boerengroep-url-candidates.txt`

**Interfaces:**
- Consumes: `cms.resolvePage`, `cms.findRedirect`, `cms.listPagePaths`, `cms.listEvents`, `cms.getSiteSettings`, `toCalendarEvent`, `toGlobalSettings`, `Blocks`.
- Produces:
  - `parseRoutingKeys(source: string): string[]` in `tools/url-parity/routing-keys.mjs`
  - `docs/migration/boerengroep-url-candidates.txt`, one URL path per line, used by Task 10
  - A hand-maintained `i18n/routing.ts` that only lists routes with their own folder under `app/[locale]`

- [ ] **Step 1: Capture the URL candidates before the generated routing file is replaced**

`tools/url-parity/package.json`:

```json
{
  "name": "@sites/url-parity",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": { "test": "node --test" }
}
```

`tools/url-parity/routing-keys.test.mjs`:

```js
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseRoutingKeys } from './routing-keys.mjs'

const src = `
export const routing = defineRouting({
    locales: ['en', 'nl'],
    pathnames: {
        '/': "/",
        '/about-us/history': "/about-us/history",
        '/activiteiten/soepkeuken': "/activiteiten/soepkeuken",
        '/news/newsletter/[...slug]': "/news/newsletter/[...slug]",
        '/library': { en: '/library', nl: '/bibliotheek' },
    },
});`

test('returns static pathname keys', () => {
  assert.deepEqual(parseRoutingKeys(src), ['/', '/about-us/history', '/activiteiten/soepkeuken', '/library'])
})

test('leaves out dynamic routes', () => {
  assert.ok(!parseRoutingKeys(src).some((k) => k.includes('[')))
})

test('returns nothing for a file without pathnames', () => {
  assert.deepEqual(parseRoutingKeys("export const routing = defineRouting({ locales: ['en'] })"), [])
})
```

Run: `node --test tools/url-parity/`
Expected: FAIL, cannot find `./routing-keys.mjs`.

`tools/url-parity/routing-keys.mjs`:

```js
/** Reads the static keys of the `pathnames` object in an i18n/routing.ts source. */
export function parseRoutingKeys(source) {
  const start = source.indexOf('pathnames:')
  if (start === -1) return []
  const keys = []
  for (const match of source.slice(start).matchAll(/^\s*'(\/[^']*)'\s*:/gm)) {
    if (!match[1].includes('[')) keys.push(match[1])
  }
  return keys
}
```

`tools/url-parity/candidates.mjs`:

```js
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { parseRoutingKeys } from './routing-keys.mjs'

const app = process.argv[2] ?? 'apps/boerengroep'
const urls = new Set()

// Every routing key is tried under both locales. The collector keeps the ones that work today.
for (const key of parseRoutingKeys(readFileSync(path.join(app, 'i18n/routing.ts'), 'utf8'))) {
  for (const locale of ['en', 'nl']) urls.add(`/${locale}${key === '/' ? '' : key}`)
}

const names = (dir) => {
  try {
    return readdirSync(path.join(app, dir)).filter((f) => /\.mdx?$/.test(f) && !f.startsWith('.'))
  } catch {
    return []
  }
}
const slug = (f) => encodeURIComponent(f.replace(/\.mdx?$/, ''))

for (const locale of ['en', 'nl']) {
  for (const f of names(`content/newsletters/${locale}`)) {
    urls.add(`/${locale}/news/newsletter/${slug(f)}`)
    urls.add(`/${locale}/news/friends-news/${slug(f)}`)
  }
  for (const f of names('content/past-events')) urls.add(`/${locale}/activities/past-events/${slug(f)}`)
}

const walk = (dir, base) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, `${base}/${entry.name}`)
    else urls.add(encodeURI(`${base}/${entry.name}`))
  }
}
walk(path.join(app, 'public/uploads'), '/uploads')

console.log([...urls].sort().join('\n'))
```

```bash
node --test tools/url-parity/
mkdir -p docs/migration
node tools/url-parity/candidates.mjs apps/boerengroep > docs/migration/boerengroep-url-candidates.txt
wc -l docs/migration/boerengroep-url-candidates.txt
```

Expected: 3 tests pass, and the candidates file has more than 150 lines.

- [ ] **Step 2: Replace `i18n/routing.ts` with a hand-maintained file**

List the routes that have their own folder:

Run: `cd apps/boerengroep && find "app/[locale]" -name page.tsx | sed 's|app/\[locale\]||; s|/page.tsx$||' | grep -v '^\[\.\.\.' | sort && cd ../..`

From the current generated `i18n/routing.ts`, keep exactly the `pathnames` entries whose key appears in that list, plus `'/'`. Keep each kept entry's value as it is today. Delete every other entry. Those were CMS pages, and they are now resolved from the database.

Replace the four header comment lines with:

```ts
// Hand-maintained. Lists only routes that have their own folder under app/[locale].
// CMS pages are not listed here. They are resolved by path in app/[locale]/[...urlSegments].
```

The `defineRouting` call, `locales: ['en', 'nl']` and `defaultLocale: 'en'` stay unchanged.

- [ ] **Step 3: Remove the pathname generator**

```bash
git rm apps/boerengroep/scripts/generate-pathnames.ts
```

In `apps/boerengroep/package.json` delete the `generate:pathnames` script and remove ` && tsx scripts/generate-pathnames.ts` from `build`, `build-local` and any other script that contains it.

- [ ] **Step 4: Replace `app/[locale]/[...urlSegments]/client-page.tsx`**

```tsx
'use client'

import type { Page } from '@sites/cms/types'
import { Blocks } from '@/components/blocks'
import ErrorBoundary from '@/components/error-boundary'
import type { CalendarEvent, GlobalSettings } from '@/lib/cms-adapters'

export interface ClientPageProps {
  page: Page
  events?: CalendarEvent[]
  globalData?: GlobalSettings
}

export default function ClientPage({ page, events = [], globalData }: ClientPageProps) {
  return (
    <ErrorBoundary>
      <Blocks blocks={page.blocks} events={events} globalData={globalData} />
    </ErrorBoundary>
  )
}
```

- [ ] **Step 5: Replace `app/[locale]/[...urlSegments]/page.tsx`**

```tsx
import { notFound, permanentRedirect, redirect } from 'next/navigation'
import Layout from '@/components/layout/layout'
import { Section } from '@/components/layout/section'
import { cms, type Locale } from '@/lib/cms'
import ClientPage from './client-page'

export const revalidate = 3600

type Params = { locale: Locale; urlSegments: string[] }

const withLocale = (locale: Locale, path: string) => `/${locale}${path === '/' ? '' : path}`

export default async function Page({ params }: { params: Promise<Params> }) {
  const { locale, urlSegments } = await params

  // Static assets and internal paths never match a CMS page.
  if (urlSegments.some((s) => s.includes('.') || s.startsWith('_'))) notFound()

  const path = `/${urlSegments.map((s) => decodeURIComponent(s)).join('/')}`
  const resolved = await cms.resolvePage(locale, path)

  if (resolved?.redirectTo) permanentRedirect(withLocale(locale, resolved.redirectTo))

  if (!resolved?.page) {
    const rule = (await cms.findRedirect(path)) ?? (await cms.findRedirect(withLocale(locale, path)))
    if (rule) {
      const target = /^https?:\/\//.test(rule.to) ? rule.to : withLocale(locale, rule.to)
      if (rule.permanent) permanentRedirect(target)
      redirect(target)
    }
    notFound()
  }

  return (
    <Layout rawPageData={resolved.page}>
      <Section>
        <ClientPage page={resolved.page} />
      </Section>
    </Layout>
  )
}

export async function generateStaticParams(): Promise<Params[]> {
  const paths = await cms.listPagePaths()
  return paths
    .filter((p) => p.path !== '/')
    .map((p) => ({ locale: p.locale, urlSegments: p.path.slice(1).split('/') }))
}
```

- [ ] **Step 6: Replace `app/[locale]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import Layout from '@/components/layout/layout'
import { cms, type Locale } from '@/lib/cms'
import { toCalendarEvent, toGlobalSettings } from '@/lib/cms-adapters'
import ClientPage from './[...urlSegments]/client-page'

export const revalidate = 3600

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const [resolved, events, settings] = await Promise.all([
    cms.resolvePage(locale, '/'),
    cms.listEvents(),
    cms.getSiteSettings(locale),
  ])
  if (!resolved?.page) notFound()

  return (
    <Layout rawPageData={resolved.page}>
      <ClientPage
        page={resolved.page}
        events={events.map(toCalendarEvent)}
        globalData={toGlobalSettings(settings)}
      />
    </Layout>
  )
}
```

- [ ] **Step 7: Check the routes against the migrated database**

```bash
pnpm --filter boerengroep dev &
sleep 30
probe() { curl -s -o /dev/null -w "$1 %{http_code} %{redirect_url}\n" "http://localhost:3000$1"; }
probe /en
probe /nl
probe /en/about-us/history
probe /nl/over-ons/geschiedenis
probe /nl/about-us/history
probe /en/over-ons/geschiedenis
probe /en/accessibility
probe /nl/accessibility
probe /en/activities/calendar-sections
probe /en/this-does-not-exist
kill %1
```

Expected:

```
/en 200
/nl 200
/en/about-us/history 200
/nl/over-ons/geschiedenis 200
/nl/about-us/history 308 http://localhost:3000/nl/over-ons/geschiedenis
/en/over-ons/geschiedenis 308 http://localhost:3000/en/about-us/history
/en/accessibility 200
/nl/accessibility 200
/en/activities/calendar-sections 404
/en/this-does-not-exist 404
```

`/nl/accessibility` is 200 only if the Dutch file is missing in the content, which the migration report shows. If the report lists a Dutch counterpart, expect a 308 to its Dutch path instead.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(app): resolve pages, redirects and home from Payload, static routing file"
```

---

### Task 7: Feature routes on the query layer

**Files:**
- Modify: `apps/boerengroep/app/[locale]/activities/calendar/page.tsx`, `components/calendar/calendar-sections.tsx`, `components/calendar/dialogs/event-details-dialog.tsx`, `components/calendar/interfaces.ts`
- Modify: `apps/boerengroep/app/[locale]/news/newsletter/page.tsx`, `news/newsletter/[...slug]/page.tsx`, `news/newsletter/[...slug]/client-page.tsx`
- Modify: `apps/boerengroep/app/[locale]/news/friends-news/page.tsx`, `news/friends-news/[...slug]/page.tsx`, `news/friends-news/[...slug]/client-page.tsx`
- Modify: `apps/boerengroep/app/[locale]/activities/past-events/page.tsx`, `past-events/client-page.tsx`, `past-events/[...urlSegments]/page.tsx`, `past-events/[...urlSegments]/client-page.tsx`
- Modify: `apps/boerengroep/app/[locale]/vacancies/page.tsx`, `components/vacancies-page.tsx`

**Interfaces:**
- Consumes: `cms.*`, the adapters, `RichText`, `Blocks`.
- Produces: the same routes and the same component props as today. Detail pages are found by slug.

- [ ] **Step 1: Calendar page**

In `app/[locale]/activities/calendar/page.tsx`:

Replace the Tina import with:

```ts
import { cms } from '@/lib/cms';
import { toCalendarEvent } from '@/lib/cms-adapters';
```

Replace the whole `getCalendarData` function with:

```ts
async function getCalendarData() {
    try {
        return { events: (await cms.listEvents()).map(toCalendarEvent) };
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        return { events: [] };
    }
}
```

Delete the `mockLayoutData` constant and change `<Layout rawPageData={mockLayoutData}>` to `<Layout>`. Change the link text `TinaCMS admin panel` to `admin panel`.

- [ ] **Step 2: Calendar sections**

Replace `components/calendar/calendar-sections.tsx` with:

```tsx
import React from 'react';
import { Blocks } from '@/components/blocks';
import { Section } from '@/components/layout/section';
import { RichText } from '@/components/rich-text';
import { cms, type Locale } from '@/lib/cms';

interface CalendarSectionsProps {
    locale: string;
}

// English paths identify the section pages. The page is returned in the requested locale.
const SECTIONS = [
    { id: 'breaks', path: '/activities/calendar-sections/breaks' },
    { id: 'soup-kitchen', path: '/activities/calendar-sections/soup-kitchen' },
    { id: 'open-meetings', path: '/activities/calendar-sections/open-meetings' },
];

export async function CalendarSections({ locale }: CalendarSectionsProps) {
    const sections = [];
    for (const section of SECTIONS) {
        try {
            const page = await cms.getPageByEnglishPath(section.path, locale as Locale);
            if (page) sections.push({ id: section.id, page });
        } catch (error) {
            console.error(`Error loading calendar section ${section.id}:`, error);
        }
    }
    if (sections.length === 0) return null;

    return (
        <div className="mt-12 space-y-12">
            {sections.map(({ id, page }) => (
                <div key={id} id={id} className="scroll-mt-20">
                    <Section className="py-8">
                        <div className="container mx-auto px-4 sm:px-6">
                            {page.title && <h2 className="text-2xl font-bold mb-6">{page.title}</h2>}
                            {page.blocks && page.blocks.length > 0 && (
                                <div className="mb-6">
                                    <Blocks blocks={page.blocks} />
                                </div>
                            )}
                            {page.body && (
                                <div className="prose dark:prose-dark max-w-none">
                                    <RichText data={page.body} />
                                </div>
                            )}
                        </div>
                    </Section>
                </div>
            ))}
        </div>
    );
}

export default CalendarSections;
```

This changes one behaviour on purpose: the old code asked for Dutch files named `pauzes.mdx` and `open-vergaderingen.mdx`, which do not exist, so the Dutch calendar page showed no sections. The Dutch sections now appear.

- [ ] **Step 3: Event dialog and calendar types**

In `components/calendar/dialogs/event-details-dialog.tsx` replace

```tsx
import { TinaMarkdown } from 'tinacms/dist/rich-text';
```

with

```tsx
import { RichText } from '@/components/rich-text';
```

and replace `<TinaMarkdown content={event.registrationLink} />` with `<RichText data={event.registrationLink} />`.

In `components/calendar/interfaces.ts` change the comment on `registrationLink` to `// Lexical editor state`.

- [ ] **Step 4: Newsletter list pages**

In both `app/[locale]/news/newsletter/page.tsx` and `app/[locale]/news/friends-news/page.tsx`:

Replace the Tina import with:

```ts
import { cms } from '@/lib/cms';
import { asConnection, toNewsletterNode } from '@/lib/cms-adapters';
```

Replace the body of the data function (`getNewsletterData` and `getFriendNewsData` respectively) with:

```ts
    try {
        return { newsletters: asConnection((await cms.listNewsletters()).map(toNewsletterNode)) };
    } catch (error) {
        console.error('Error fetching newsletter data:', error);
        return { newsletters: { edges: [] } };
    }
```

Delete `mockLayoutData` and change `<Layout rawPageData={mockLayoutData}>` to `<Layout>`.

`components/newsletter-list.tsx` and `components/friend-news-page.tsx` need no change. The adapter supplies `published`, `organization`, `featuredImage` as a URL, and `_sys.breadcrumbs` as `[language, slug]`, which is what they read.

- [ ] **Step 5: Newsletter detail routes**

Replace `app/[locale]/news/newsletter/[...slug]/page.tsx` with:

```tsx
import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import { cms, type Locale } from '@/lib/cms';
import { toNewsletterNode } from '@/lib/cms-adapters';
import NewsletterClientPage from './client-page';

export const revalidate = 3600;

// Kept from the previous implementation, including the 'Inspiratietheater' spelling.
const isMainOrganization = (organization: string) =>
    organization === 'Boerengroep' || organization === 'Inspiratietheater';

export default async function NewsletterDetailPage({
    params,
}: {
    params: Promise<{ locale: Locale; slug: string[] }>;
}) {
    const { locale, slug } = await params;
    const newsletter = await cms.getNewsletter(decodeURIComponent(slug[slug.length - 1]!), locale);
    if (!newsletter || !isMainOrganization(newsletter.organization)) notFound();

    return (
        <Layout rawPageData={newsletter}>
            <NewsletterClientPage newsletter={toNewsletterNode(newsletter)} backPath="/news/newsletter" />
        </Layout>
    );
}

export async function generateStaticParams() {
    const newsletters = await cms.listNewsletters();
    return newsletters
        .filter((n) => isMainOrganization(n.organization))
        .flatMap((n) => (n.language ? [n.language] : ['en', 'nl']).map((locale) => ({ locale, slug: [n.slug] })));
}
```

Replace `app/[locale]/news/friends-news/[...slug]/page.tsx` with the same file, with these four differences:

```tsx
// component name
export default async function FriendsNewsletterDetailPage({
// guard: friends are everything that is not a main organization
    if (!newsletter || isMainOrganization(newsletter.organization)) notFound();
// back link
            <NewsletterClientPage newsletter={toNewsletterNode(newsletter)} backPath="/news/friends-news" />
// static params filter
        .filter((n) => !isMainOrganization(n.organization))
```

- [ ] **Step 6: Newsletter detail client pages**

Apply the same edit to `news/newsletter/[...slug]/client-page.tsx` and `news/friends-news/[...slug]/client-page.tsx`:

1. Remove the imports of `tinaField`, `useTina`, `TinaMarkdown` and `NewsletterQuery`. Add:

```tsx
import { Blocks } from '@/components/blocks';
import { RichText } from '@/components/rich-text';
import type { toNewsletterNode } from '@/lib/cms-adapters';
```

2. Replace the props interface and the first lines of the component with:

```tsx
interface ClientNewsletterProps {
  newsletter: ReturnType<typeof toNewsletterNode>;
  backPath: string;
}

export default function NewsletterClientPage({ newsletter, backPath }: ClientNewsletterProps) {
```

and delete the `useTina` call and the `const newsletter = tinaData.newsletter;` line.

3. Remove every `data-tina-field={...}` attribute.
4. Replace each `<TinaMarkdown content={X} ... />` with `<RichText data={X} />`.
5. Where the file renders the newsletter `body` blocks, render them with `<Blocks blocks={newsletter.body} />`.
6. `newsletter.author.avatar` and `newsletter.featuredImage` are already URL strings. Leave those uses as they are.

Run: `grep -nE "tinacms|TinaMarkdown|tinaField|useTina|__generated__" "apps/boerengroep/app/[locale]/news"/*/"[...slug]"/client-page.tsx`
Expected: no output.

- [ ] **Step 7: Past events list**

Replace `app/[locale]/activities/past-events/page.tsx` with:

```tsx
import Layout from '@/components/layout/layout';
import { cms, type Locale } from '@/lib/cms';
import { toPastEventNode } from '@/lib/cms-adapters';
import PastEventsClientPage from './client-page';

export const revalidate = 3600;

export default async function PastEventsPage({ params }: { params: Promise<{ locale: Locale }> }) {
    const { locale } = await params;
    // The query already returns this locale's recaps plus those without a language, newest first.
    const pastEvents = (await cms.listPastEvents(locale)).map(toPastEventNode);

    return (
        <Layout rawPageData={pastEvents}>
            <PastEventsClientPage pastEvents={pastEvents} />
        </Layout>
    );
}
```

In `app/[locale]/activities/past-events/client-page.tsx`:

1. Remove the imports of `TinaMarkdown`, `PastEventConnectionQuery` and `PastEventConnectionQueryVariables`. Add:

```tsx
import { RichText } from '@/components/rich-text';
import type { toPastEventNode } from '@/lib/cms-adapters';
```

2. Change the props to `{ pastEvents: ReturnType<typeof toPastEventNode>[] }` and build the list from `props.pastEvents` directly, instead of from `props.data?.pastEventConnection.edges!.map(...)`. Each item is already the node, so `pastEventData.node` becomes the item itself.
3. Keep the URL expression. `pastEvent._sys.breadcrumbs.join('/')` now yields the slug.
4. Replace `<TinaMarkdown content={pastEvent.excerpt} />` with `<RichText data={pastEvent.excerpt} />`.

- [ ] **Step 8: Past event detail**

Replace `app/[locale]/activities/past-events/[...urlSegments]/page.tsx` with:

```tsx
import { notFound } from 'next/navigation';
import Layout from '@/components/layout/layout';
import { cms, type Locale } from '@/lib/cms';
import { toPastEventNode } from '@/lib/cms-adapters';
import PastEventClientPage from './client-page';

export const revalidate = 3600;

export default async function PastEventPage({
    params,
}: {
    params: Promise<{ locale: Locale; urlSegments: string[] }>;
}) {
    const { urlSegments } = await params;
    const pastEvent = await cms.getPastEvent(decodeURIComponent(urlSegments[urlSegments.length - 1]!));
    if (!pastEvent) notFound();

    return (
        <Layout rawPageData={pastEvent}>
            <PastEventClientPage pastEvent={toPastEventNode(pastEvent)} />
        </Layout>
    );
}

export async function generateStaticParams() {
    const params: { locale: Locale; urlSegments: string[] }[] = [];
    for (const locale of ['en', 'nl'] as const) {
        for (const p of await cms.listPastEvents(locale)) params.push({ locale, urlSegments: [p.slug] });
    }
    return params;
}
```

In `app/[locale]/activities/past-events/[...urlSegments]/client-page.tsx`:

1. Remove the imports of `tinaField`, `useTina`, `TinaMarkdown`, `PastEventQuery` and `components` from `mdx-components`. Add:

```tsx
import { Blocks } from '@/components/blocks';
import { RichText } from '@/components/rich-text';
import type { toPastEventNode } from '@/lib/cms-adapters';
```

2. Change the props to `{ pastEvent: ReturnType<typeof toPastEventNode> }`, delete the `useTina` call, and read `pastEvent` from props.
3. Remove every `data-tina-field={...}` attribute.
4. Replace the `<TinaMarkdown content={pastEvent._body} components={...} />` element with `<RichText data={pastEvent.body} />`.
5. Render blocks with `<Blocks blocks={pastEvent.blocks} />`.
6. `pastEvent.heroImg` and `pastEvent.author.avatar` are already URL strings.

- [ ] **Step 9: Vacancies**

In `app/[locale]/vacancies/page.tsx` replace the Tina import with:

```ts
import { cms } from '@/lib/cms';
import { asConnection, toVacancyNode } from '@/lib/cms-adapters';
```

Replace the body of `getVacanciesData` with:

```ts
    try {
        return { vacancies: asConnection((await cms.listVacancies()).map(toVacancyNode)) };
    } catch (error) {
        console.error('Error fetching vacancies data:', error);
        return { vacancies: { edges: [] } };
    }
```

Delete `mockLayoutData` and change `<Layout rawPageData={mockLayoutData}>` to `<Layout>`.

In `components/vacancies-page.tsx` replace the `TinaMarkdown` import with `import { RichText } from '@/components/rich-text';` and replace each of the five `<TinaMarkdown content={X} ... />` elements with `<RichText data={X} />`.

Run: `grep -c "<RichText" apps/boerengroep/components/vacancies-page.tsx`
Expected: `5`

- [ ] **Step 10: Verify no route still reads from Tina, then probe**

Run: `grep -rlE "tinacms|tina/__generated__" apps/boerengroep/app apps/boerengroep/components`
Expected: no output.

```bash
pnpm --filter boerengroep typecheck
pnpm --filter boerengroep dev &
sleep 30
for p in /en/activities/calendar /nl/activiteiten/agenda /en/news/newsletter /en/news/friends-news \
  /en/activities/past-events /en/activities/past-events/Boerengroep-Weekend /en/vacancies /nl/vacatures \
  /en/news/newsletter/Newsletter-1; do
  echo "$p $(curl -s -o /dev/null -w '%{http_code}' -L http://localhost:3000$p)"
done
kill %1
```

Expected: typecheck exits 0, and every probe prints `200`. If `/nl/activiteiten/agenda` or `/nl/vacatures` is not 200, the entry for that route was removed from `i18n/routing.ts` by mistake in Task 6 Step 2.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat(app): calendar, newsletters, past events and vacancies read from Payload"
```

---

### Task 8: Legacy upload URLs and draft preview

**Files:**
- Create: `apps/boerengroep/lib/safe-path.ts`, `app/uploads/[...path]/route.ts`, `app/api/preview/route.ts`, `app/api/exit-preview/route.ts`, `components/live-preview-listener.tsx`
- Modify: `apps/boerengroep/app/[locale]/layout.tsx`, `apps/boerengroep/middleware.ts`
- Test: `apps/boerengroep/lib/safe-path.test.ts`

**Interfaces:**
- Consumes: `cms.getMediaByLegacyPath`.
- Produces:
  - `isSafeInternalPath(value: string | null): value is string`
  - `GET /uploads/<path>` answers 308 to the media URL, or 404.
  - `GET /api/preview?path=/nl/over-ons` enables draft mode for a logged-in CMS user and redirects to the path.
  - `GET /api/exit-preview` disables draft mode.

- [ ] **Step 1: Write the failing test `apps/boerengroep/lib/safe-path.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { isSafeInternalPath } from './safe-path'

describe('isSafeInternalPath', () => {
  it('accepts a normal site path', () => {
    expect(isSafeInternalPath('/nl/over-ons/geschiedenis')).toBe(true)
    expect(isSafeInternalPath('/en')).toBe(true)
  })
  it('rejects a missing value', () => {
    expect(isSafeInternalPath(null)).toBe(false)
    expect(isSafeInternalPath('')).toBe(false)
  })
  it('rejects an absolute URL', () => {
    expect(isSafeInternalPath('https://evil.example/x')).toBe(false)
  })
  it('rejects a protocol-relative URL', () => {
    expect(isSafeInternalPath('//evil.example/x')).toBe(false)
  })
  it('rejects a backslash trick that browsers treat as a host', () => {
    expect(isSafeInternalPath('/\\evil.example')).toBe(false)
  })
  it('rejects a path that does not start with a slash', () => {
    expect(isSafeInternalPath('nl/over-ons')).toBe(false)
  })
})
```

Run: `pnpm --filter boerengroep test`
Expected: FAIL, module `./safe-path` not found.

- [ ] **Step 2: Write `apps/boerengroep/lib/safe-path.ts`**

```ts
/** True for a same-site path. Guards redirect targets taken from a query string. */
export function isSafeInternalPath(value: string | null): value is string {
  if (!value || !value.startsWith('/')) return false
  if (value.startsWith('//') || value.includes('\\')) return false
  return true
}
```

Run: `pnpm --filter boerengroep test`
Expected: all pass.

- [ ] **Step 3: Write `apps/boerengroep/app/uploads/[...path]/route.ts`**

```ts
import { cms } from '@/lib/cms'

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const legacyPath = `/uploads/${path.map((segment) => decodeURIComponent(segment)).join('/')}`
  const media = await cms.getMediaByLegacyPath(legacyPath)
  if (!media?.url) return new Response('Not found', { status: 404 })

  return new Response(null, {
    status: 308,
    headers: {
      Location: media.url,
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000',
    },
  })
}
```

While `public/uploads` still exists, the static file wins and this route is not reached. Task 9 removes the folder.

- [ ] **Step 4: Write the preview routes**

`apps/boerengroep/app/api/preview/route.ts`:

```ts
import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { isSafeInternalPath } from '@/lib/safe-path'

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path')
  if (!isSafeInternalPath(path)) return new Response('Invalid path', { status: 400 })

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Log in to the admin panel to preview drafts.', { status: 401 })

  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
```

`apps/boerengroep/app/api/exit-preview/route.ts`:

```ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { isSafeInternalPath } from '@/lib/safe-path'

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path')
  const draft = await draftMode()
  draft.disable()
  redirect(isSafeInternalPath(path) ? path : '/')
}
```

- [ ] **Step 5: Refresh the page when an editor saves**

`apps/boerengroep/components/live-preview-listener.tsx`:

```tsx
'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

export function LivePreviewListener() {
  const router = useRouter()
  return (
    <RefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={process.env.NEXT_PUBLIC_SITE_URL ?? ''}
    />
  )
}
```

In `apps/boerengroep/app/[locale]/layout.tsx` add the imports:

```tsx
import { draftMode } from 'next/headers';
import { LivePreviewListener } from '@/components/live-preview-listener';
```

Inside the layout component, before the `return`, add:

```tsx
const { isEnabled: isPreview } = await draftMode();
```

and as the first child inside `<body>` add:

```tsx
{isPreview && <LivePreviewListener />}
```

- [ ] **Step 6: Tidy the middleware**

In `apps/boerengroep/middleware.ts` the two comments that say `TinaCMS admin` now refer to the Payload admin. Change them to `CMS admin`. The matcher already excludes `api`, `admin` and `uploads`, so no logic changes.

- [ ] **Step 7: Check preview by hand**

```bash
pnpm --filter boerengroep dev &
sleep 30
curl -s -o /dev/null -w 'anonymous preview: %{http_code}\n' "http://localhost:3000/api/preview?path=/en"
curl -s -o /dev/null -w 'off-site target:   %{http_code}\n' "http://localhost:3000/api/preview?path=//evil.example"
kill %1
```

Expected: `anonymous preview: 401`, `off-site target: 400`.

Then start the app again, log in at `/admin`, open a page, click Live Preview, change the title and save a draft. The preview pane shows the new title. A private browser window on the same URL still shows the published title.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(app): legacy upload redirects and draft preview"
```

---

### Task 9: Remove TinaCMS

**Files:**
- Delete: `apps/boerengroep/tina/`, `apps/boerengroep/content/`, `apps/boerengroep/public/uploads/`, `apps/boerengroep/public/admin/`, `apps/boerengroep/public/blocks/`, `apps/boerengroep/graphql.config.js`, `apps/boerengroep/generate-block-previews.sh`
- Modify: `apps/boerengroep/package.json`, `apps/boerengroep/next.config.base.js`, `apps/boerengroep/vercel.json`

**Interfaces:**
- Produces: an app with no Tina dependency and no content in git. The migration tool still needs the old content for the final cutover run, so it reads it from the `main` branch through a git worktree. Plan the cutover around that: see Task 11.

- [ ] **Step 1: Confirm nothing imports Tina**

Run: `grep -rlE "tinacms|@tinacms|tina/__generated__|TinaMarkdown|tinaField|useTina" apps/boerengroep --include=*.ts --include=*.tsx --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=tina`
Expected: no output. If a file is listed, fix it with the rules from Task 4 Step 3 before continuing.

- [ ] **Step 2: Delete Tina files, content and uploads**

```bash
cd apps/boerengroep
git rm -r -q tina content public/uploads public/admin public/blocks graphql.config.js generate-block-previews.sh
rm -rf tina content public/uploads public/admin public/blocks
cd ../..
```

- [ ] **Step 3: Remove Tina from `apps/boerengroep/package.json`**

```bash
pnpm --filter boerengroep remove tinacms @tinacms/cli
```

Then set the scripts to exactly:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "node scripts/migrate-if-production.mjs && next build",
  "start": "next start",
  "lint": "biome lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "payload": "payload",
  "generate:importmap": "payload generate:importmap"
}
```

Remove `@udecode/plate-core` from the root `package.json` `pnpm.overrides`. It existed only for Tina's editor. If `overrides` is then empty, delete the `pnpm` key.

- [ ] **Step 4: Clean `next.config.base.js`**

- Remove the `assets.tina.io` entry from `images.remotePatterns`.
- Remove the whole `rewrites()` function. Both of its `beforeFiles` rules existed to stop Tina from handling font and manifest requests.
- Remove the two `headers()` entries whose `source` starts with `/uploads/`. The upload route sets its own cache header.
- Remove `domains: []` from `images`.

- [ ] **Step 5: Clean `apps/boerengroep/vercel.json`**

Replace the file with:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

- [ ] **Step 6: Build and run the whole suite**

```bash
pnpm install
pnpm lint && pnpm typecheck && pnpm test
pnpm --filter @sites/cms test:int
pnpm --filter boerengroep build
```

Expected: every command exits 0. The build prints the page routes as statically generated, with one entry per page path in each locale.

- [ ] **Step 7: Confirm a legacy upload URL redirects**

```bash
pnpm --filter boerengroep start &
sleep 10
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:3000/uploads/1030.jpeg
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/uploads/does-not-exist.jpg
kill %1
```

Expected: `308` followed by the media URL, then `404`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: remove TinaCMS, git-backed content and static uploads"
```

---

### Task 10: URL parity check and browser smoke tests

**Files:**
- Create: `tools/url-parity/outcome.mjs`, `outcome.test.mjs`, `probe.mjs`, `collect.mjs`, `check.mjs`
- Create: `apps/boerengroep/playwright.config.ts`, `apps/boerengroep/e2e/smoke.spec.ts`
- Create: `docs/migration/boerengroep-urls.txt`
- Modify: `apps/boerengroep/package.json`

**Interfaces:**
- Consumes: `docs/migration/boerengroep-url-candidates.txt` from Task 6.
- Produces:
  - `outcome(chain: { status: number; location?: string }[]): 'ok' | 'redirect-ok' | 'broken' | 'loop'`
  - `node tools/url-parity/collect.mjs <oldBaseUrl> <candidates> <out>` writes the candidates that work on the old site.
  - `node tools/url-parity/check.mjs <newBaseUrl> <urls>` exits 1 if any of them is broken on the new site.

- [ ] **Step 1: Write the failing test `tools/url-parity/outcome.test.mjs`**

```js
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { outcome } from './outcome.mjs'

test('a direct 200 is ok', () => {
  assert.equal(outcome([{ status: 200 }]), 'ok')
})

test('a redirect that ends in 200 is acceptable', () => {
  assert.equal(outcome([{ status: 308, location: '/nl/over-ons' }, { status: 200 }]), 'redirect-ok')
})

test('a 404 is broken', () => {
  assert.equal(outcome([{ status: 404 }]), 'broken')
})

test('a redirect that ends in 404 is broken', () => {
  assert.equal(outcome([{ status: 301, location: '/x' }, { status: 404 }]), 'broken')
})

test('a 500 is broken', () => {
  assert.equal(outcome([{ status: 500 }]), 'broken')
})

test('a chain that never settles is a loop', () => {
  const hop = { status: 308, location: '/a' }
  assert.equal(outcome([hop, hop, hop, hop, hop, hop]), 'loop')
})

test('an empty chain is broken', () => {
  assert.equal(outcome([]), 'broken')
})
```

Run: `node --test tools/url-parity/`
Expected: FAIL, cannot find `./outcome.mjs`.

- [ ] **Step 2: Write the parity tool**

`tools/url-parity/outcome.mjs`:

```js
const isRedirect = (status) => status >= 300 && status < 400

/** Classifies the chain of responses that a URL produced. */
export function outcome(chain) {
  const last = chain[chain.length - 1]
  if (!last) return 'broken'
  if (isRedirect(last.status)) return 'loop'
  if (last.status !== 200) return 'broken'
  return chain.length === 1 ? 'ok' : 'redirect-ok'
}
```

`tools/url-parity/probe.mjs`:

```js
const MAX_HOPS = 6

/** Requests a path and follows redirects by hand so every hop is recorded. */
export async function probe(base, path) {
  const chain = []
  let url = new URL(path, base).toString()
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    let res
    try {
      res = await fetch(url, { redirect: 'manual', headers: { 'accept-language': 'en' } })
    } catch {
      chain.push({ status: 0 })
      return chain
    }
    const location = res.headers.get('location') ?? undefined
    chain.push({ status: res.status, location })
    if (res.status < 300 || res.status >= 400 || !location) return chain
    url = new URL(location, url).toString()
  }
  return chain
}
```

`tools/url-parity/collect.mjs`:

```js
import { readFileSync, writeFileSync } from 'node:fs'
import { outcome } from './outcome.mjs'
import { probe } from './probe.mjs'

const [base, input, output] = process.argv.slice(2)
if (!base || !input || !output) {
  console.error('usage: collect.mjs <oldBaseUrl> <candidatesFile> <outFile>')
  process.exit(2)
}

const candidates = readFileSync(input, 'utf8').split('\n').filter(Boolean)
const working = []
for (const path of candidates) {
  const result = outcome(await probe(base, path))
  if (result === 'ok' || result === 'redirect-ok') working.push(path)
}
writeFileSync(output, `${working.join('\n')}\n`)
console.log(`${working.length} of ${candidates.length} candidate URLs work on ${base}`)
```

`tools/url-parity/check.mjs`:

```js
import { readFileSync } from 'node:fs'
import { outcome } from './outcome.mjs'
import { probe } from './probe.mjs'

const [base, input] = process.argv.slice(2)
if (!base || !input) {
  console.error('usage: check.mjs <newBaseUrl> <urlsFile>')
  process.exit(2)
}

const urls = readFileSync(input, 'utf8').split('\n').filter(Boolean)
const failures = []
let redirected = 0
for (const path of urls) {
  const chain = await probe(base, path)
  const result = outcome(chain)
  if (result === 'redirect-ok') redirected++
  if (result === 'broken' || result === 'loop') {
    failures.push(`${result.padEnd(6)} ${path}  [${chain.map((c) => c.status).join(' -> ')}]`)
  }
}

console.log(`${urls.length} URLs checked on ${base}: ${redirected} redirected, ${failures.length} failed`)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
```

Run: `node --test tools/url-parity/`
Expected: all tests pass, including the three from Task 6.

- [ ] **Step 3: Collect the working URLs from the current production site**

```bash
node tools/url-parity/collect.mjs https://<current production domain> \
  docs/migration/boerengroep-url-candidates.txt docs/migration/boerengroep-urls.txt
```

Use the live Tina site as the base URL. Expected: a line such as `N of M candidate URLs work`, where N is at least the number of pages times two plus the number of uploads. Commit the output file. It is the acceptance list for cutover.

- [ ] **Step 4: Run the check against the local build**

```bash
pnpm --filter boerengroep build && pnpm --filter boerengroep start &
sleep 10
node tools/url-parity/check.mjs http://localhost:3000 docs/migration/boerengroep-urls.txt
kill %1
```

Expected: `0 failed`. For each failure decide: a bug in the route or the migration, which you fix and cover with a test, or a page that the migration report already lists as skipped or shadowed, which you remove from `boerengroep-urls.txt` with a note in the dry-run report.

- [ ] **Step 5: Add browser smoke tests**

```bash
pnpm --filter boerengroep add -D @playwright/test
pnpm --filter boerengroep exec playwright install chromium
```

Add to `apps/boerengroep/package.json` scripts: `"e2e": "playwright test"`.

`apps/boerengroep/playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  retries: 0,
  use: { baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000' },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: 'pnpm start', url: 'http://localhost:3000/en', reuseExistingServer: true, timeout: 120_000 },
})
```

`apps/boerengroep/e2e/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('home page renders its hero in both languages', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('main')).toContainText('Boerengroep')
  await page.goto('/nl')
  await expect(page.locator('main')).toContainText('Boerengroep')
})

test('the root redirects by browser language', async ({ browser }) => {
  const dutch = await browser.newContext({ locale: 'nl-NL' })
  const page = await dutch.newPage()
  await page.goto('/')
  await expect(page).toHaveURL(/\/nl$/)
  await dutch.close()
})

test('a nested page renders in English and in Dutch', async ({ page }) => {
  await page.goto('/en/about-us/history')
  await expect(page.locator('main')).toContainText('1971')
  await page.goto('/nl/over-ons/geschiedenis')
  await expect(page.locator('main')).toContainText('1971')
})

test('an old Dutch link with English segments lands on the Dutch URL', async ({ page }) => {
  await page.goto('/nl/about-us/history')
  await expect(page).toHaveURL(/\/nl\/over-ons\/geschiedenis$/)
})

test('the language switcher keeps the visitor on the same page', async ({ page }) => {
  await page.goto('/en/about-us/history')
  await page.getByRole('link', { name: 'Switch to Dutch' }).first().click()
  await expect(page).toHaveURL(/\/nl\/over-ons\/geschiedenis$/)
  await page.getByRole('link', { name: 'Switch to English' }).first().click()
  await expect(page).toHaveURL(/\/en\/about-us\/history$/)
})

test('the navigation menu links to localized page paths', async ({ page }) => {
  await page.goto('/nl')
  const hrefs = await page.locator('header a').evaluateAll((links) => links.map((a) => a.getAttribute('href')))
  expect(hrefs.some((h) => h?.startsWith('/nl/over-ons'))).toBe(true)
  expect(hrefs.some((h) => h?.startsWith('/nl/about-us'))).toBe(false)
})

test('the calendar lists events and opens one', async ({ page }) => {
  await page.goto('/en/activities/calendar')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('main')).not.toContainText('admin panel')
})

test('the newsletter list links to an issue that opens', async ({ page }) => {
  await page.goto('/en/news/newsletter')
  const first = page.locator('main a[href*="/news/newsletter/"]').first()
  await first.click()
  await expect(page).toHaveURL(/\/news\/newsletter\/.+/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('the vacancies page renders', async ({ page }) => {
  await page.goto('/en/vacancies')
  await expect(page.locator('main')).toContainText('Board')
})

test('an unknown page gives a 404', async ({ page }) => {
  const res = await page.goto('/en/this-does-not-exist')
  expect(res?.status()).toBe(404)
})

test('the admin panel shows a login form', async ({ page }) => {
  await page.goto('/admin')
  await expect(page.locator('input[type="password"]')).toBeVisible()
})

test('the newsletter signup form is present in the footer', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('footer input[type="email"]')).toBeVisible()
})
```

- [ ] **Step 6: Run the smoke tests**

Run: `pnpm --filter boerengroep build && pnpm --filter boerengroep e2e`
Expected: 12 tests pass against the migrated local database.

If "the language switcher" fails because the switcher links to `/nl/about-us/history`, that is correct behaviour followed by the redirect, and the final URL assertion still holds. If it fails on the accessible name, read the `aria-label` in `components/layout/language-switcher.tsx` and match it.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: URL parity tool and browser smoke tests"
```

---

### Task 11: Staging, cutover runbook and editor guide

**Files:**
- Create: `docs/migration/cutover-runbook.md`
- Replace: `docs/EDITING-GUIDE.md`

**Interfaces:**
- Consumes: everything above.
- Produces: a live Boerengroep site on Payload, and written instructions for rollback and for editors.
- Steps marked **(owner)** need access to Vercel, Neon and DNS and are done by the repository owner, not by an agent.

- [ ] **Step 1: Write `docs/migration/cutover-runbook.md`**

````markdown
# Boerengroep cutover runbook

## One-time setup (owner)

1. **Neon.** Create a project `sites-platform` with a database `payload`. Create a branch `staging`
   from `main`. Note the pooled connection string of each branch.
2. **Vercel Blob.** Create one public Blob store `sites-media`. Note its read-write token.
3. **Vercel project.** Create a project `boerengroep-payload` from this repository with
   - Root Directory: `apps/boerengroep`
   - Production Branch: `main`
   - Framework: Next.js, Node 22
4. **Environment variables** on that project:

   | Name | Production | Preview |
   |---|---|---|
   | `PAYLOAD_DATABASE_URL` | Neon `main` | Neon `staging` |
   | `PAYLOAD_SECRET` | `openssl rand -hex 32` | a different value |
   | `TENANT_SLUG` | `boerengroep` | `boerengroep` |
   | `REVALIDATE_SECRET` | `openssl rand -hex 32` | a different value |
   | `NEXT_PUBLIC_SITE_URL` | the production origin | the preview origin |
   | `BLOB_READ_WRITE_TOKEN` | Blob token | Blob token |
   | `RUN_MIGRATIONS` | not set | `1` |
   | every existing variable of the old project | copy | copy |

   The existing variables are `DATABASE_URL`, `RESEND_BOERENGROEP`, `FROM_EMAIL`, `FROM_NAME`,
   `REPLY_TO_EMAIL`, `NEWSLETTER_SECRET`, `BASE_URL`, `BASE_PATH`, `PODCAST_RSS_URL`,
   `NEXT_PUBLIC_BASE_URL`, `BREVO_API_KEY`, `BREVO_LIST_ID`. Do not copy the four `TINA` variables.

## Staging rehearsal

1. Push `payload-migration`. The preview deployment runs the migrations against Neon `staging`.
2. Seed the tenant and the first admin against staging:

   ```bash
   cd packages/cms
   PAYLOAD_SECRET=<preview secret> PAYLOAD_DATABASE_URL=<staging url> TENANT_SLUG=boerengroep \
   SEED_TENANT_NAME="Stichting Boerengroep" SEED_SITE_URL=<preview origin> REVALIDATE_SECRET=<preview value> \
   SEED_ADMIN_EMAIL=<owner email> SEED_ADMIN_PASSWORD=<strong password> pnpm seed
   ```

3. Check out the old content next to the branch and migrate it into staging:

   ```bash
   git worktree add ../bg-main main
   PAYLOAD_SECRET=<preview secret> PAYLOAD_DATABASE_URL=<staging url> TENANT_SLUG=boerengroep \
   BLOB_READ_WRITE_TOKEN=<blob token> \
   CONTENT_DIR=../bg-main/content UPLOADS_DIR=../bg-main/public/uploads \
   REPORT_PATH=docs/migration/staging-report.md pnpm --filter @sites/migrate-tina migrate
   ```

   On `main` the app is still at the repository root, so the content is at `../bg-main/content`.
4. Compare `staging-report.md` with the reviewed dry-run report. They must list the same entries.
5. Redeploy the preview so pages are generated from the migrated data.
6. `node tools/url-parity/check.mjs <preview origin> docs/migration/boerengroep-urls.txt` must report 0 failed.
7. `E2E_BASE_URL=<preview origin> pnpm --filter boerengroep e2e` must pass.
8. Create one editor account per person in the admin under Users, with role Editor on Boerengroep.
   Ask each editor to log in on the preview and edit a draft page.

## Cutover day

1. Announce the content freeze. From now on nobody edits in Tina.
2. `git -C ../bg-main pull` to get the last Tina content commits.
3. Seed production: repeat staging step 2 with the production values and the production origin.
4. Migrate into production: repeat staging step 3 with the production values. Review the report.
5. Merge `payload-migration` into `main`. The production deployment of `boerengroep-payload` runs
   the migrations, which is a no-op because step 3 already applied them, and builds.
6. Run the parity check and the smoke tests against the production deployment URL of
   `boerengroep-payload`, before it has the domain.
7. Move the production domain from the old Vercel project to `boerengroep-payload`.
8. Run the parity check once more against the real domain.
9. Set the tenant's Site URL in the admin to the real domain if it differs.

## Rollback

Move the domain back to the old Vercel project. Its last deployment still serves the Tina site from
the commit before the merge. Nothing in the old project was changed. Keep the old project and its
Tina Cloud app for two weeks, then delete both and remove the `bg-main` worktree.

Content edited in Payload after cutover is not copied back. If a rollback happens after editors
started working, list their changes from the admin's version history before deciding.

## After cutover

- Fix the entries marked `fix in admin after cutover` in the dry-run report: three inline images and
  the missing hero image on the History page.
- Remove the old GitHub Pages workflow secrets if any exist.
````

- [ ] **Step 2: Replace `docs/EDITING-GUIDE.md`**

````markdown
# Editing guide

The site content is managed in the admin panel at `/admin` on the site's own address.

## Logging in

Open `https://<site address>/admin` and log in with your email and password. Use "Forgot password"
on the login screen if you need a new one. You only see the content of your own organisation.

## Pages

- **Title** is shown in the browser tab and in menus that link to the page.
- **Slug** is the last part of the page address, in the language you are editing. Use lowercase
  letters, numbers and hyphens. The home page has the slug `home`.
- **Parent** places the page under another page. A page with the slug `history` under the page
  `about-us` gets the address `/about-us/history`.
- **Path** shows the full address. It is filled in for you.
- **Blocks** are the sections of the page, from top to bottom. Add, reorder and remove them with the
  controls on each block.

### Two languages

Use the language selector at the top of the edit screen to switch between English and Dutch. Title,
slug and blocks are separate per language, so the Dutch page can have a different address and
different sections. A page with no Dutch version shows the English content to Dutch visitors.

### Changing an address

When you change a slug, pages underneath it move with it. Old links stop working unless you add a
redirect: go to Settings, Redirects, and add the old address as "From" and the new one as "To".
Only site admins can add redirects.

## Drafts and preview

"Save draft" keeps your changes private. "Publish" makes them public. Live Preview, at the top of a
page's edit screen, shows the page as it will look, including unpublished changes.

## Events, newsletters, vacancies and past events

Each of these is written in one language. Set **Language** to English or Dutch, or leave it empty to
show the item in both. The **Slug** is the last part of the item's address. Do not change the slug
of an item that has already been shared.

## Images and files

Upload under Content, Media, or directly from any image field. Give every image an alt text.

## Menus, footer and theme

Site admins find these under Settings, Site settings. A menu item can point to a page, which keeps
working when that page's address changes, or to a manual URL. Fill in **Label** per language.

## Who to ask

Your site admin can add editors and reset access.
````

- [ ] **Step 3: Commit the documents**

```bash
git add -A
git commit -m "docs: cutover runbook and editor guide for Payload"
```

- [ ] **Step 4: Staging rehearsal (owner)**

Follow "One-time setup" and "Staging rehearsal" in the runbook. Record the result of the parity check and the smoke tests at the bottom of the runbook under a heading `## Rehearsal log` with the date.

Expected: parity reports 0 failed, 12 smoke tests pass, every editor has logged in once.

- [ ] **Step 5: Cutover (owner)**

Follow "Cutover day". Do not start it unless the rehearsal log shows a clean run.

- [ ] **Step 6: Close out**

After two weeks without a rollback: delete the old Vercel project and the Tina Cloud app, remove the `bg-main` worktree with `git worktree remove ../bg-main`, and delete the `payload-migration` branch.

---

## Done when

- The production domain serves the site from Payload, and `/admin` is the Payload admin.
- `tools/url-parity/check.mjs` reports 0 failed against production.
- No file in the repository imports from Tina, and `content/` is gone from `main`.
- Editors have accounts and the new guide.

Next: the Inspringtheater plan. It starts by extracting `packages/ui` and `packages/core` from this app, adds `apps/inspringtheater` as the second tenant, defines the `posts` collection, and turns on cross-site revalidation.
