# Payload migration and shared two-site platform: design

Date: 2026-10-03
Status: draft, awaiting review
Repos affected: `boerengroep-ws` (this repo), `inspringtheater-ws` (fork of this repo)

## 1. Goal

Replace TinaCMS with Payload on the Boerengroep and Inspringtheater sites, and
run both from one shared codebase and one shared backend, while each site keeps
its own frontend app, domain and design.

Success means:

- Both sites are served by Payload content. TinaCMS, Tina Cloud and the
  git-backed MDX content are gone.
- There is one repository. A schema, block or bug fix is made once and reaches
  both sites.
- Each organisation's editors log in on their own site and see only their own
  content. One super-admin can manage both.
- Every public URL that works today still works, in both Dutch and English.
- Existing content and media are migrated by script, not re-entered by hand.

## 2. Decisions already made

| Topic | Decision |
|---|---|
| Sharing model | One Payload data set, two tenants, plus a shared codebase |
| Data access | Payload embedded in both frontends, read through the Local API |
| Editors | Separate teams per site, one super-admin across both |
| Hosting | Vercel for both apps, Neon Postgres, Vercel Blob for media |
| Rollout | Boerengroep first, Inspringtheater second |

## 3. Current state

- Both sites are Next 15.3 and React 18 apps derived from the Tina cloud
  starter. Inspringtheater is a fork of Boerengroep.
- Content is MDX and JSON in `content/`, edited through Tina Cloud and
  committed to git. Media is 38 MB in `public/uploads` (32 MB on Inspringtheater).
- Boerengroep has ten Tina collections: page, event, pastEvent, speaker,
  vacancy, newsletter, author, tag, redirect and the `global` settings file.
  Inspringtheater has the same set with `post` in addition.
- Pages use eleven layout blocks defined in `components/blocks`.
- Locales are `en` (default) and `nl`. Each locale has its own folder and file
  per page. Dutch URL segments are produced by a hardcoded switch statement in
  `app/[locale]/[...urlSegments]/page.tsx` and by `scripts/generate-pathnames.ts`,
  which rewrites `i18n/routing.ts` at build time.
- Newsletter subscribers, consent logs and GDPR records live in a separate Neon
  database through Drizzle (`lib/db`). Email goes through Resend and Brevo.
- The forks have drifted: `lib`, `styles.css` and the Tailwind config are
  identical, but 42 of 117 component files and 13 of 19 Tina schema files differ.

## 4. Target architecture

### 4.1 Repository layout

This repository becomes a pnpm and Turborepo monorepo. Its git history is kept.

```
apps/
  boerengroep/        Next app: public site + Payload admin at /admin
  inspringtheater/    Next app: public site + Payload admin at /admin  (phase 5)
packages/
  cms/                Payload config factory, collections, blocks schema,
                      access rules, hooks, migrations, generated types, queries
  ui/                 Shared React components, block renderers, calendar
  core/               next-intl setup, newsletter logic, Drizzle subscriber db,
                      email, podcast feed
  config/             Shared tsconfig, Biome and Tailwind presets
tools/
  migrate-tina/       One-off content and media migration script
```

Each unit has one job:

- `packages/cms` is the only place that knows Payload's schema. It exports
  `createPayloadConfig({ tenantSlug })` and a typed query layer. Nothing else
  imports `payload` directly.
- `packages/ui` renders. It receives typed data and has no data fetching.
- `packages/core` holds everything unrelated to the CMS that both sites share.
- Each app holds only routes, its theme, its `site.config.ts`, its messages and
  any component overrides.

### 4.2 Runtime

```
 boerengroep.nl  --> Vercel project A (apps/boerengroep) --+
                       site routes + /admin + /api          |   Local API
                                                            +--> Neon: payload db
 inspringtheater --> Vercel project B (apps/inspringtheater)+--> Vercel Blob: media
                       site routes + /admin + /api
```

- Both apps load the same Payload config and connect to the same Postgres
  database and the same Blob store.
- Each app is bound to one tenant through the `TENANT_SLUG` environment
  variable.
- The existing subscriber databases stay as they are, one per site, reached
  through `packages/core`. Payload does not touch them.

### 4.3 Versions

- Payload 3.90.x, all `@payloadcms/*` packages pinned to one identical version
  through a pnpm catalog.
- React 19 and Next 15.4.x at the latest patch that Payload supports
  (15.4.11 or newer). Moving to Next 16 is out of scope.
- Node 22, as in `.nvmrc`.

## 5. Content model

### 5.1 Tenancy

The official `@payloadcms/plugin-multi-tenant` plugin provides a `tenants`
collection and adds a `tenant` field to every scoped collection.

`tenants` fields: `name`, `slug`, `siteUrl`, `revalidateSecret`.

All collections below are tenant-scoped except `users` and `tenants`.

### 5.2 Collections

| Payload collection | Source in Tina | Notes |
|---|---|---|
| `pages` | `page`, `privacy` | Nested through the nested-docs plugin. Localized `title`, `slug`, `body`, `blocks`. Drafts and versions on. |
| `events` | `event` | Localized text fields. `speakers` becomes an array of relation plus role. |
| `past-events` | `pastEvent` | Recaps. `relatedEvent` relation to `events`. |
| `posts` | `post` (Inspringtheater only) | Present in the schema for both tenants. Boerengroep leaves it empty. |
| `speakers` | `speaker` | |
| `authors` | `author` | |
| `tags` | `tag` | |
| `vacancies` | `vacancy` | Fields carried over one to one. |
| `newsletters` | `newsletter` | Newsletter issues, not subscribers. |
| `redirects` | `redirect`, `page.previousUrls` | Redirects plugin. |
| `media` | `public/uploads` | Vercel Blob adapter with client uploads. Keeps `legacyPath`. |
| `site-settings` | `content/global/index.json` | One document per tenant, using the plugin's `isGlobal` option. Header, nav, footer, theme. |
| `users` | Tina Cloud users | Auth collection. |
| `tenants` | new | |

The schema is a superset. A site that does not use a collection hides it in the
admin through its `site.config.ts`.

### 5.3 Localization

- Payload localization with locales `en` and `nl`, default `en`, fallback on.
  This matches the current next-intl default.
- A page that exists as two files today becomes one document with two locales.
- The Dutch URL is a localized `slug` field. With nested docs the full path per
  locale is computed from the parent chain. This replaces `urlSlug`,
  `urlSlugNl`, the switch statement and the folder convention.
- Navigation labels `labelEn` and `labelNl` collapse into one localized `label`.

### 5.4 Blocks and rich text

- The eleven layout blocks become Payload `blocks` field definitions in
  `packages/cms/blocks`, one file each, paired by name with a renderer in
  `packages/ui/blocks`.
- Rich text uses the Lexical editor. The inline MDX templates used in recap
  bodies, `BlockQuote`, `DateTime` and `NewsletterSignup`, become Lexical
  blocks. `mermaid` becomes a Lexical block too.
- `TinaMarkdown` renderers (12 files) are replaced by one shared Lexical
  renderer in `packages/ui`.

## 6. Access control

Roles:

- `super-admin`: a flag on the user. Full access to both tenants, to `tenants`
  and to `users`.
- `tenant-admin`: per tenant. Manages content, settings and that tenant's users.
- `editor`: per tenant. Manages content. Cannot change settings or users.

Rules:

- A user holds a list of `{ tenant, role }` entries. The plugin filters every
  admin list and relation picker by the user's tenants.
- Public read access returns published documents only.
- The Local API bypasses access rules by default. For that reason the frontends
  never call `payload.find` directly. They call `packages/cms/queries`, which
  takes the tenant from `TENANT_SLUG` and always adds the tenant filter and
  the draft flag. This is the single place tenant isolation for public pages
  is enforced, and it is covered by tests.

## 7. Frontend data flow

### 7.1 Reading

- Server components call the query layer, for example
  `getPageByPath({ locale, segments })`, `listUpcomingEvents({ locale })`.
- Each query is wrapped in Next's cache with tags of the form
  `tenant:collection` and `tenant:collection:id`.
- Pages are statically generated with `generateStaticParams` from Payload.

### 7.2 Routing and localized paths

- `scripts/generate-pathnames.ts` and the generated `pathnames` map are
  removed. `i18n/routing.ts` keeps only locales and the default locale.
- The catch-all route resolves `/{locale}/{...segments}` by looking up the page
  whose localized full path equals the segments.
- The language switcher asks the query layer for the same document's path in
  the other locale.
- Fixed feature routes (calendar, past events, podcast, newsletter flows,
  vacancies) stay as explicit routes. Their Dutch segment names move from the
  switch statement into a small static map in `packages/core`.
- The middleware keeps its root redirect based on `Accept-Language`, and keeps
  skipping `/admin` and `/api`.

### 7.3 Redirects and legacy media URLs

- `redirects` documents and migrated `previousUrls` are served from the
  middleware through a cached lookup.
- `/uploads/*` stays alive: a route handler looks up `media.legacyPath` and
  answers with a permanent redirect to the Blob URL. External links and old
  newsletters keep working.

### 7.4 Preview and revalidation

- Editors get Payload live preview with draft mode. `useTina` and `tinaField`
  (15 files) are removed.
- A shared `afterChange` and `afterDelete` hook calls
  `revalidateTenant(tenant, tags)`:
  - If the document's tenant is this app's tenant, it calls `revalidateTag`
    locally.
  - Otherwise it sends a signed POST to the other site's `/api/revalidate`
    using that tenant's `siteUrl` and `revalidateSecret`.
- This covers the super-admin editing one site's content from the other site's
  admin. A failed remote call is logged and retried once. Pages also carry a
  time-based revalidation of one hour as a backstop.

## 8. Schema changes with two apps on one database

This is the main risk of the embedded model, so the rules are explicit.

- Production never uses schema push. Changes ship as committed migrations in
  `packages/cms/migrations`.
- Exactly one place runs migrations: the Boerengroep app's production build
  runs `payload migrate` before `next build`. The Inspringtheater build never
  migrates.
- Both Vercel projects build from the same commit of the same repository, so
  they converge within one deploy cycle.
- Migrations follow expand then contract. A release may add tables and columns.
  Removing or renaming a column happens in a later release, after both apps
  have deployed code that no longer reads it. CI rejects a migration that drops
  or renames in the same pull request that changes the field.
- Preview deployments use a separate Neon branch, never the production
  database. Local development uses a personal Neon branch or local Postgres.

## 9. Sharing code between two similar sites

`packages/ui` starts from the Boerengroep components. Differences between the
sites are expressed in this order, and the next level is used only when the
previous one cannot express the difference:

1. Theme tokens. Colors, fonts and radii are CSS variables in each app's
   `globals.css`.
2. Site config. `site.config.ts` in each app declares logo, enabled sections,
   hidden collections, feature flags such as the calendar sections view, and
   email sender details.
3. Override. An app may supply its own version of a component through a small
   registry for header, footer, logo and individual blocks.

Phase 5 opens with a triage of the 42 differing component files into these
three levels, plus a fourth outcome: drift that should simply be unified.

## 10. Content migration

A script in `tools/migrate-tina` reads `content/` and `public/uploads` from a
repo checkout and writes to Payload through the Local API. It takes a tenant
slug and a content directory, so the same tool serves both sites.

Steps, in order:

1. Upload every file in `public/uploads` to `media`, recording `legacyPath`.
   Build a path to id map.
2. Import flat collections: authors, speakers, tags.
3. Import events, vacancies, newsletters, past events, posts. Replace image
   paths with media relations and name references with document relations.
4. Import pages. Pair `en` and `nl` files into one document using, in order:
   matching `urlSlug`, the existing segment translation table, then matching
   position in the folder tree. Unpaired files become single-locale documents.
5. Convert MDX bodies to Lexical with Payload's markdown converter, mapping the
   known MDX templates to Lexical blocks.
6. Convert block lists field by field through one transformer per block.
7. Import `site-settings` and redirects, including each page's `previousUrls`.

Properties:

- Idempotent. Every document stores a `legacyId` holding its Tina path, and a
  rerun updates instead of duplicating.
- It writes a report listing unpaired locale files, unresolved references,
  unknown MDX elements and images missing from `uploads`. The report is
  reviewed before cutover and must be empty or explained.
- Tina starter leftovers (`content/posts`, the sample tags) are skipped for
  Boerengroep.

## 11. Rollout

Work happens on a long-lived `payload-migration` branch. Production keeps
deploying from `main` with Tina until cutover.

| Phase | Outcome |
|---|---|
| 0. Foundation | Monorepo layout, app moved to `apps/boerengroep`, React 19 and Next 15.4 upgrade, still on Tina, build green |
| 1. CMS package | `packages/cms` with tenants, collections, blocks, access rules; Payload admin running in the Boerengroep app against a dev database |
| 2. Migration | Migration tool, Boerengroep content and media imported into a staging database, report clean |
| 3. Frontend swap | Query layer, block and rich text renderers, routing without generated pathnames, preview, revalidation, redirects |
| 4. Boerengroep cutover | Content freeze in Tina, final migration run against production, Vercel root directory switched, editors onboarded, Tina and `content/` removed |
| 5. Inspringtheater | Component triage, `apps/inspringtheater`, second tenant, content migration, cross-app revalidation live, cutover, fork repository archived |

Cutover for each site:

1. Announce a content freeze to the editors.
2. Run the migration against the production database and review the report.
3. Run the URL parity check against a preview deployment.
4. Promote. The domain does not change, so there is no DNS step.
5. Keep the previous Tina deployment available for instant rollback for two
   weeks. Rollback is a Vercel promotion of the old deployment.

Phase 0 to 4 and phase 5 are separate implementation plans. Phase 5 is planned
once phase 4 is live.

## 12. Error handling

- Query layer: a missing document returns `null` and the route calls
  `notFound()`. A database error is thrown and reaches the error boundary, so a
  cached page keeps being served instead of an empty one.
- Remote revalidation failure never fails the editor's save. It is logged, and
  the time-based revalidation covers the gap.
- Migration: a failing document is logged in the report and the run continues.
  The run exits non-zero if anything failed.
- Media upload failures surface in the admin through the Blob adapter's own
  errors. No custom handling.

## 13. Testing

- Unit tests (Vitest): migration transformers for each block, MDX to Lexical
  conversion, locale pairing, path building, the redirect lookup.
- Integration tests against a throwaway Postgres: tenant isolation in the
  query layer, role rules for editor, tenant-admin and super-admin, the
  `site-settings` one-per-tenant rule, cross-tenant revalidation choosing
  local or remote correctly.
- URL parity check: a script takes every URL from the current sitemap and the
  current `i18n/routing.ts`, requests each against the new build, and fails on
  anything that is not a 200 or an expected redirect.
- End to end smoke (Playwright): home, a nested page in both locales, language
  switch, calendar, an event, newsletter signup, admin login as an editor of
  each tenant.
- CI runs lint, typecheck, unit and integration tests on every pull request,
  and the migration-safety check from section 8.

## 14. Out of scope

- Redesign of either site.
- Moving newsletter subscribers into Payload.
- Upgrading to Next 16.
- A third tenant, or a public API for other consumers.
- Changing email providers.

## 15. Open items to settle during planning

- The production domain and Vercel project names for both sites, needed for
  `siteUrl` and environment setup.
- The initial list of editors and their roles for each organisation.
- Whether the Boerengroep `/inspringtheater` pages stay on the Boerengroep site
  or become a redirect to the Inspringtheater site after phase 5.
- Whether TinaCMS 2.8 runs on React 19. If it does not, phase 0 keeps React 18
  and the framework upgrade moves to the start of phase 3, when Tina's runtime
  is removed from the app.

## 16. Amendments from planning (2026-10-03)

Reading the content and schemas in detail changed these points. Where this
section and an earlier section disagree, this section wins.

1. **Only pages and site settings are localized.** Events, newsletters,
   vacancies and past events are not translated pairs today. Each file exists in
   one language, and the calendar shows all of them in both locales. They become
   single-language documents with an optional `language` field (`en`, `nl`, or
   empty for both). This replaces "localized text fields" in section 5.2.
2. **No nested-docs plugin.** Its breadcrumb URLs cannot be queried for an exact
   page path, because every descendant also carries the ancestor's URL. Pages
   get a `parent` relation and a localized, indexed `path` field maintained by
   two small hooks.
3. **No Lexical embed blocks.** `BlockQuote`, `DateTime`, `NewsletterSignup`,
   `scriptCopyBlock` and `mermaid` have zero uses in Boerengroep content, so
   they are not ported. The migration reports any use it finds. Three inline
   markdown images exist and are reported for manual re-insertion.
4. **Redirects are a plain four-field collection, resolved in the catch-all
   route** when no page matches, not in the middleware. The Local API cannot
   run in middleware on Next 15.4.
5. **Legacy internal links keep working.** Links inside content use English
   paths in both locales today. When a path is not found in the current locale,
   the route looks it up as an English path and redirects to the localized one.
6. **Database adapter is `@payloadcms/db-postgres`.** It works with Neon and
   with a plain local Postgres for tests, which the Vercel adapter does not.
   The Payload connection string is `PAYLOAD_DATABASE_URL`, because
   `DATABASE_URL` is already the subscriber database.
7. **Staging is a second Vercel project** with root directory
   `apps/boerengroep`. Cutover moves the production domain to it, and rollback
   moves the domain back. This replaces "root directory switched" in section 11.
8. **`posts` is defined in the Inspringtheater plan**, where its Tina schema is
   read. Boerengroep has no posts.
9. **`packages/ui` and `packages/core` are extracted in the Inspringtheater plan**, as its
   first task. Until a second app exists there is nothing to share with, and the
   triage of the 42 differing components decides what belongs in the shared package.
   In the Boerengroep plans the app keeps its components and only `packages/cms` is shared.
10. **Icon and colour pickers become plain fields in the first version.** Block
    backgrounds are free text because content uses arbitrary Tailwind values
    such as `bg-[#F28F07]/20`.
11. **TinaCMS accepts React 19** by its peer dependency range, so the framework
    upgrade stays in phase 0. A build verifies it.
