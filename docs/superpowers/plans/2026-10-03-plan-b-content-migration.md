# Plan B: Tina to Payload Content Migration Tool

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a rerunnable script that imports one site's Tina content and uploads into one Payload tenant, and writes a report of everything it could not import cleanly.

**Architecture:** A workspace tool, `tools/migrate-tina`, reads `content/` and `public/uploads` from disk and writes through Payload's Local API using the config from `@sites/cms`. Pure functions do the planning and transforming and are unit tested. Thin importers do the writes and are covered by one integration test on a fixture site. Every document is keyed by its Tina file path, so a second run updates instead of duplicating.

**Tech Stack:** TypeScript, Payload 3.90.2 Local API, `@payloadcms/richtext-lexical` markdown conversion, `gray-matter`, `mime-types`, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-03-payload-multi-tenant-migration-design.md`, sections 10 and 16.

**Depends on:** Plan A complete. The collections, field names and block slugs used here are the ones Plan A produces.

## Global Constraints

- The tool never deletes documents and never touches a tenant other than the one named by `TENANT_SLUG`.
- Every write passes `context: { disableRevalidate: true }` and `overrideAccess: true`.
- Every imported document carries `legacyId`, the file path relative to `content/`, for example `events/en/Boerengroep-Break.mdx`. Media carries `legacyPath`, for example `/uploads/1030.jpeg`.
- Files and folders whose name starts with a dot are skipped silently.
- A document that fails to import adds an `error` entry and the run continues. The process exits 1 if any `error` entry exists.
- The tool is configured only by environment variables: `TENANT_SLUG`, `CONTENT_DIR`, `UPLOADS_DIR`, `REPORT_PATH`, plus `PAYLOAD_SECRET` and `PAYLOAD_DATABASE_URL`.
- Page slugs must match `^[a-z0-9]+(-[a-z0-9]+)*$`. Other slugs must match `^[A-Za-z0-9][A-Za-z0-9-]*$` and keep their capitals, because existing URLs contain them.
- Payload API calls were written against the 3.90 documentation and were not executed. If a signature differs, keep the behaviour and the test.

## Review Focus

1. **The script runs twice.** Expected: document counts are identical after the second run. Pinned in Task 8.
2. **A page folder has no index file, such as `activities/calendar-sections`.** Expected: child URLs stay the same, through a draft placeholder parent. Pinned in Task 6.
3. **A Dutch page has no English counterpart, or the reverse.** Expected: it is imported in its one language and listed in the report. Pinned in Task 6.
4. **An image path in content points to a file that is not in `uploads`.** Expected: the field is left empty, the document still imports, and the report names the file and the path. Pinned in Task 4.
5. **Rich text contains an inline image or an MDX component.** Expected: the text imports, and the report lists it for manual repair. Pinned in Task 3.

## File Structure

```
tools/migrate-tina/
  package.json, tsconfig.json, vitest.config.ts
  src/payload.config.ts     Payload config for this tool
  src/report.ts             Report class
  src/read.ts               listContent, readTinaFile
  src/slug.ts               fileSlug, pageSlug
  src/context.ts            Ctx type, upsert, refId
  src/richtext.ts           scanMarkdown, makeToLexical
  src/media.ts              uploadAll, resolveMedia
  src/blocks.ts             transformBlocks
  src/collections.ts        importPeople, importEvents, importVacancies,
                            importNewsletters, importPastEvents
  src/pages-plan.ts         SEGMENT_NL, planPages (pure)
  src/pages.ts              importPages
  src/settings.ts           importSettings, importRedirects
  src/migrate.ts            migrate(): runs everything in order
  src/run.ts                CLI entry
  test/setup-env.ts
  test/fixtures/site/...    a tiny Tina site
  test/migrate.int.test.ts
packages/cms/package.json   gains a "./testing" export
```

---

### Task 1: Tool scaffold, report and file reading

**Files:**
- Create: `tools/migrate-tina/package.json`, `tsconfig.json`, `vitest.config.ts`, `test/setup-env.ts`
- Create: `tools/migrate-tina/src/payload.config.ts`, `src/report.ts`, `src/read.ts`, `src/slug.ts`
- Modify: `packages/cms/package.json`
- Test: `tools/migrate-tina/src/report.test.ts`, `src/read.test.ts`, `src/slug.test.ts`

**Interfaces:**
- Produces:
  - `type ReportKind = 'error' | 'unpaired-locale' | 'unresolved-reference' | 'unknown-mdx' | 'inline-image' | 'missing-media' | 'shadowed-file' | 'placeholder-parent' | 'slug-changed' | 'skipped'`
  - `class Report { entries: ReportEntry[]; add(kind: ReportKind, legacyId: string, message: string): void; count(kind?: ReportKind): number; get failed(): boolean; toMarkdown(): string }`
  - `type TinaFile = { legacyId: string; data: Record<string, any>; body: string }`
  - `listContent(contentDir: string, sub: string): string[]` returns paths relative to `contentDir`, posix separators, sorted
  - `readTinaFile(contentDir: string, relPath: string): TinaFile`
  - `fileSlug(relPath: string): string`, `pageSlug(segment: string): string`

- [ ] **Step 1: Write the package files**

`tools/migrate-tina/package.json`:

```json
{
  "name": "@sites/migrate-tina",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run --project unit",
    "test:int": "vitest run --project int",
    "migrate": "PAYLOAD_CONFIG_PATH=src/payload.config.ts payload run src/run.ts"
  },
  "dependencies": {
    "@payloadcms/richtext-lexical": "catalog:",
    "@sites/cms": "workspace:*",
    "gray-matter": "^4.0.3",
    "mime-types": "^3.0.1",
    "payload": "catalog:"
  },
  "devDependencies": {
    "@types/mime-types": "^3.0.1",
    "@types/node": "^22.16.0",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

`tools/migrate-tina/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": ["src", "test", "vitest.config.ts"]
}
```

`tools/migrate-tina/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      { test: { name: 'unit', environment: 'node', include: ['src/**/*.test.ts'] } },
      {
        test: {
          name: 'int',
          environment: 'node',
          include: ['test/**/*.int.test.ts'],
          setupFiles: ['test/setup-env.ts'],
          fileParallelism: false,
          hookTimeout: 120_000,
          testTimeout: 120_000,
        },
      },
    ],
  },
})
```

`tools/migrate-tina/test/setup-env.ts`:

```ts
process.env.PAYLOAD_DATABASE_URL ??= 'postgres://payload:payload@127.0.0.1:54329/payload_test'
process.env.PAYLOAD_SECRET ??= 'test-secret-not-for-production'
process.env.TENANT_SLUG ??= 'boerengroep'
```

`tools/migrate-tina/src/payload.config.ts`:

```ts
import { createPayloadConfig } from '@sites/cms'

export default createPayloadConfig({ tenantSlug: process.env.TENANT_SLUG ?? 'boerengroep' })
```

In `packages/cms/package.json` add one line to `exports`:

```json
"./testing": "./test/helpers.ts"
```

- [ ] **Step 2: Write the failing tests**

`tools/migrate-tina/src/report.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { Report } from './report'

describe('Report', () => {
  it('counts entries by kind', () => {
    const r = new Report()
    r.add('missing-media', 'pages/en/home.mdx', '/uploads/x.jpg not found')
    r.add('missing-media', 'pages/en/a.mdx', '/uploads/y.jpg not found')
    r.add('unpaired-locale', 'pages/nl/b.mdx', 'no English counterpart')
    expect(r.count()).toBe(3)
    expect(r.count('missing-media')).toBe(2)
  })

  it('fails only when an error was recorded', () => {
    const r = new Report()
    r.add('inline-image', 'a', 'x')
    expect(r.failed).toBe(false)
    r.add('error', 'b', 'boom')
    expect(r.failed).toBe(true)
  })

  it('renders a markdown section per kind with errors first', () => {
    const r = new Report()
    r.add('skipped', 'pages/about.mdx', 'outside a locale folder')
    r.add('error', 'events/en/x.mdx', 'startDate missing')
    const md = r.toMarkdown()
    expect(md.indexOf('## error (1)')).toBeLessThan(md.indexOf('## skipped (1)'))
    expect(md).toContain('- `events/en/x.mdx`: startDate missing')
  })

  it('says so when there is nothing to report', () => {
    expect(new Report().toMarkdown()).toContain('Nothing to report.')
  })
})
```

`tools/migrate-tina/src/slug.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { fileSlug, pageSlug } from './slug'

describe('fileSlug', () => {
  it('uses the file name without folder or extension and keeps capitals', () => {
    expect(fileSlug('events/en/Boerengroep-Break-Samhain.mdx')).toBe('Boerengroep-Break-Samhain')
  })
  it('replaces characters that are not allowed in a URL segment', () => {
    expect(fileSlug('events/en/What is this?.mdx')).toBe('What-is-this')
  })
  it('keeps repeated hyphens that exist in current URLs', () => {
    expect(fileSlug('events/en/Critical-Perspectives-at-WUR---Meet-Greet--Chill.mdx')).toBe(
      'Critical-Perspectives-at-WUR---Meet-Greet--Chill',
    )
  })
})

describe('pageSlug', () => {
  it('leaves a valid segment alone', () => {
    expect(pageSlug('over-ons')).toBe('over-ons')
  })
  it('lowercases and collapses separators', () => {
    expect(pageSlug('About_Us  Page')).toBe('about-us-page')
  })
  it('keeps digits', () => {
    expect(pageSlug('50-years-bg')).toBe('50-years-bg')
  })
})
```

`tools/migrate-tina/src/read.test.ts`:

```ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { listContent, readTinaFile } from './read'

let dir: string

beforeAll(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'tina-'))
  mkdirSync(path.join(dir, 'events/en/past events'), { recursive: true })
  mkdirSync(path.join(dir, 'global'), { recursive: true })
  writeFileSync(path.join(dir, 'events/en/b.mdx'), '---\ntitle: B\nfeatured: true\n---\n\nBody **text**\n')
  writeFileSync(path.join(dir, 'events/en/a.md'), '---\ntitle: A\n---\n')
  writeFileSync(path.join(dir, 'events/en/past events/.gitkeep.mdx'), '')
  writeFileSync(path.join(dir, 'events/.DS_Store'), 'junk')
  writeFileSync(path.join(dir, 'global/index.json'), '{"theme":{"font":"lato"}}')
})

describe('listContent', () => {
  it('lists content files recursively, sorted, without dotfiles', () => {
    expect(listContent(dir, 'events')).toEqual(['events/en/a.md', 'events/en/b.mdx'])
  })
  it('returns an empty list for a folder that does not exist', () => {
    expect(listContent(dir, 'vacancies')).toEqual([])
  })
})

describe('readTinaFile', () => {
  it('splits front matter from the body', () => {
    const file = readTinaFile(dir, 'events/en/b.mdx')
    expect(file.legacyId).toBe('events/en/b.mdx')
    expect(file.data).toEqual({ title: 'B', featured: true })
    expect(file.body.trim()).toBe('Body **text**')
  })
  it('reads a JSON file as data with an empty body', () => {
    const file = readTinaFile(dir, 'global/index.json')
    expect(file.data.theme.font).toBe('lato')
    expect(file.body).toBe('')
  })
})
```

- [ ] **Step 3: Run them and watch them fail**

Run: `pnpm install && pnpm --filter @sites/migrate-tina test`
Expected: FAIL, modules `./report`, `./slug`, `./read` not found.

- [ ] **Step 4: Write `src/report.ts`**

```ts
export type ReportKind =
  | 'error'
  | 'unpaired-locale'
  | 'unresolved-reference'
  | 'unknown-mdx'
  | 'inline-image'
  | 'missing-media'
  | 'shadowed-file'
  | 'placeholder-parent'
  | 'slug-changed'
  | 'skipped'

export type ReportEntry = { kind: ReportKind; legacyId: string; message: string }

const ORDER: ReportKind[] = [
  'error',
  'unresolved-reference',
  'missing-media',
  'unknown-mdx',
  'inline-image',
  'slug-changed',
  'unpaired-locale',
  'placeholder-parent',
  'shadowed-file',
  'skipped',
]

export class Report {
  entries: ReportEntry[] = []

  add(kind: ReportKind, legacyId: string, message: string): void {
    this.entries.push({ kind, legacyId, message })
  }

  count(kind?: ReportKind): number {
    return kind ? this.entries.filter((e) => e.kind === kind).length : this.entries.length
  }

  get failed(): boolean {
    return this.count('error') > 0
  }

  toMarkdown(): string {
    const lines = ['# Migration report', '']
    if (this.entries.length === 0) lines.push('Nothing to report.', '')
    for (const kind of ORDER) {
      const items = this.entries.filter((e) => e.kind === kind)
      if (items.length === 0) continue
      lines.push(`## ${kind} (${items.length})`, '')
      for (const e of items) lines.push(`- \`${e.legacyId}\`: ${e.message}`)
      lines.push('')
    }
    return lines.join('\n')
  }
}
```

- [ ] **Step 5: Write `src/slug.ts`**

```ts
import path from 'node:path'

/** Slug for events, newsletters, vacancies and past events. Capitals are kept. */
export function fileSlug(relPath: string): string {
  const name = path.posix.basename(relPath).replace(/\.(mdx?|json)$/, '')
  return name.replace(/[^A-Za-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
}

/** Slug for one page URL segment. Lowercase, single hyphens. */
export function pageSlug(segment: string): string {
  return segment
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 6: Write `src/read.ts`**

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export type TinaFile = { legacyId: string; data: Record<string, any>; body: string }

const CONTENT_EXT = /\.(mdx?|json)$/

export function listContent(contentDir: string, sub: string): string[] {
  const root = path.join(contentDir, sub)
  if (!existsSync(root)) return []
  const out: string[] = []
  const walk = (abs: string) => {
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const child = path.join(abs, entry.name)
      if (entry.isDirectory()) walk(child)
      else if (CONTENT_EXT.test(entry.name)) out.push(path.relative(contentDir, child).split(path.sep).join('/'))
    }
  }
  walk(root)
  return out.sort()
}

export function readTinaFile(contentDir: string, relPath: string): TinaFile {
  const raw = readFileSync(path.join(contentDir, relPath), 'utf8')
  if (relPath.endsWith('.json')) return { legacyId: relPath, data: JSON.parse(raw), body: '' }
  const parsed = matter(raw)
  return { legacyId: relPath, data: parsed.data, body: parsed.content }
}
```

- [ ] **Step 7: Run the tests**

Run: `pnpm --filter @sites/migrate-tina test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(migrate): tool scaffold, report and Tina file reader"
```

---

### Task 2: Migration context, upsert and reference lookup

**Files:**
- Create: `tools/migrate-tina/src/context.ts`
- Test: `tools/migrate-tina/src/context.test.ts`

**Interfaces:**
- Consumes: `Report`.
- Produces:
  - `type Id = number | string`
  - `type Lexical = Record<string, unknown>`
  - `type Ctx = { payload: Payload; tenantId: Id; report: Report; media: Map<string, Id>; ids: Map<string, Id>; pageByEnPath: Map<string, Id>; toLexical: (markdown: unknown, legacyId: string) => Promise<Lexical | undefined> }`
  - `upsert(ctx: Ctx, collection: string, legacyId: string, data: Record<string, unknown>, locale?: 'en' | 'nl'): Promise<Id>` which also records `ctx.ids.set(legacyId, id)`
  - `refId(ctx: Ctx, value: unknown, legacyId: string): Id | undefined`

- [ ] **Step 1: Write the failing test `src/context.test.ts`**

`upsert` is exercised by the integration test in Task 8. This unit test pins the reference lookup.

```ts
import { describe, expect, it } from 'vitest'
import { refId, type Ctx } from './context'
import { Report } from './report'

function ctx(): Ctx {
  return {
    payload: {} as never,
    tenantId: 1,
    report: new Report(),
    media: new Map(),
    ids: new Map([['speakers/marcha.md', 42]]),
    pageByEnPath: new Map(),
    toLexical: async () => undefined,
  }
}

describe('refId', () => {
  it('resolves a Tina reference that starts with content/', () => {
    expect(refId(ctx(), 'content/speakers/marcha.md', 'events/en/a.mdx')).toBe(42)
  })
  it('treats an empty string as no reference without reporting', () => {
    const c = ctx()
    expect(refId(c, '', 'events/en/a.mdx')).toBeUndefined()
    expect(c.report.count()).toBe(0)
  })
  it('reports a reference to a file that was not imported', () => {
    const c = ctx()
    expect(refId(c, 'content/speakers/ghost.md', 'events/en/a.mdx')).toBeUndefined()
    expect(c.report.entries[0]).toEqual({
      kind: 'unresolved-reference',
      legacyId: 'events/en/a.mdx',
      message: 'content/speakers/ghost.md was not imported',
    })
  })
  it('reports a reference that is not a string', () => {
    const c = ctx()
    expect(refId(c, { nope: true }, 'events/en/a.mdx')).toBeUndefined()
    expect(c.report.count('unresolved-reference')).toBe(1)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/migrate-tina test`
Expected: FAIL, module `./context` not found.

- [ ] **Step 3: Write `src/context.ts`**

```ts
import type { Payload } from 'payload'
import type { Report } from './report'

export type Id = number | string
export type Lexical = Record<string, unknown>

export type Ctx = {
  payload: Payload
  tenantId: Id
  report: Report
  /** `/uploads/...` path to media id. */
  media: Map<string, Id>
  /** Tina file path (relative to content/) to Payload id. */
  ids: Map<string, Id>
  /** English page path such as `/about-us/history` to page id. */
  pageByEnPath: Map<string, Id>
  toLexical: (markdown: unknown, legacyId: string) => Promise<Lexical | undefined>
}

const WRITE = { overrideAccess: true, context: { disableRevalidate: true } } as const

/** Creates the document, or updates the one previously imported from the same Tina file. */
export async function upsert(
  ctx: Ctx,
  collection: string,
  legacyId: string,
  data: Record<string, unknown>,
  locale?: 'en' | 'nl',
): Promise<Id> {
  const existing = await ctx.payload.find({
    collection: collection as never,
    where: { and: [{ legacyId: { equals: legacyId } }, { tenant: { equals: ctx.tenantId } }] },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })
  const found = existing.docs[0] as { id: Id } | undefined
  const doc = found
    ? await ctx.payload.update({
        collection: collection as never,
        id: found.id,
        data: data as never,
        locale: locale as never,
        ...WRITE,
      })
    : await ctx.payload.create({
        collection: collection as never,
        data: { ...data, legacyId, tenant: ctx.tenantId } as never,
        locale: locale as never,
        ...WRITE,
      })
  const id = (doc as { id: Id }).id
  ctx.ids.set(legacyId, id)
  return id
}

/** Resolves a Tina reference such as `content/speakers/x.md` to a Payload id. */
export function refId(ctx: Ctx, value: unknown, legacyId: string): Id | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') {
    ctx.report.add('unresolved-reference', legacyId, `reference is not a path: ${JSON.stringify(value)}`)
    return undefined
  }
  const key = value.replace(/^content\//, '')
  const id = ctx.ids.get(key)
  if (id === undefined) ctx.report.add('unresolved-reference', legacyId, `${value} was not imported`)
  return id
}
```

- [ ] **Step 4: Run the tests and commit**

Run: `pnpm --filter @sites/migrate-tina test`
Expected: all pass.

```bash
git add -A
git commit -m "feat(migrate): context, idempotent upsert and reference lookup"
```

---

### Task 3: Markdown to Lexical conversion

**Files:**
- Create: `tools/migrate-tina/src/richtext.ts`
- Test: `tools/migrate-tina/src/richtext.test.ts`

**Interfaces:**
- Consumes: `Report`, `Lexical`.
- Produces:
  - `scanMarkdown(markdown: string): { components: string[]; images: string[] }`
  - `makeToLexical(payload: Payload, report: Report): Promise<Ctx['toLexical']>`. The returned function gives `undefined` for empty input, reports `unknown-mdx` and `inline-image`, reports `error` for non-string input, and otherwise returns a Lexical editor state.

- [ ] **Step 1: Write the failing test `src/richtext.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { scanMarkdown } from './richtext'

describe('scanMarkdown', () => {
  it('finds nothing in plain markdown', () => {
    expect(scanMarkdown('Since **1971** we [connect](https://x.org) people.')).toEqual({
      components: [],
      images: [],
    })
  })
  it('finds MDX components by their capitalised tag', () => {
    const md = 'Intro\n\n<BlockQuote authorName="A">Hi</BlockQuote>\n\n<DateTime format="iso" />'
    expect(scanMarkdown(md).components).toEqual(['BlockQuote', 'DateTime'])
  })
  it('does not mistake an autolink or a comparison for a component', () => {
    expect(scanMarkdown('See <https://example.org> when a < B').components).toEqual([])
  })
  it('finds inline images with their target', () => {
    expect(scanMarkdown('Text ![A cow](/uploads/cow.jpg) more').images).toEqual(['/uploads/cow.jpg'])
  })
  it('lists a component once even when it repeats', () => {
    expect(scanMarkdown('<Video url="a" />\n<Video url="b" />').components).toEqual(['Video'])
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/migrate-tina test`
Expected: FAIL, module `./richtext` not found.

- [ ] **Step 3: Write `src/richtext.ts`**

```ts
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import type { Payload } from 'payload'
import type { Ctx, Lexical } from './context'
import type { Report } from './report'

export function scanMarkdown(markdown: string): { components: string[]; images: string[] } {
  const components = [...markdown.matchAll(/<([A-Z][A-Za-z0-9]*)(?=[\s/>])/g)].map((m) => m[1]!)
  const images = [...markdown.matchAll(/!\[[^\]]*\]\(\s*([^)\s]+)[^)]*\)/g)].map((m) => m[1]!)
  return { components: [...new Set(components)], images }
}

export async function makeToLexical(payload: Payload, report: Report): Promise<Ctx['toLexical']> {
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  return async (markdown, legacyId) => {
    if (markdown === undefined || markdown === null) return undefined
    if (typeof markdown !== 'string') {
      report.add('error', legacyId, 'rich text value is not a markdown string')
      return undefined
    }
    if (markdown.trim() === '') return undefined

    const found = scanMarkdown(markdown)
    for (const name of found.components) {
      report.add('unknown-mdx', legacyId, `<${name}> was imported as plain text and needs manual repair`)
    }
    for (const src of found.images) {
      report.add('inline-image', legacyId, `inline image ${src} must be re-inserted by hand`)
    }

    return convertMarkdownToLexical({ editorConfig, markdown }) as unknown as Lexical
  }
}
```

- [ ] **Step 4: Run the tests and commit**

Run: `pnpm --filter @sites/migrate-tina test`
Expected: all pass. `makeToLexical` itself is exercised in Task 8.

```bash
git add -A
git commit -m "feat(migrate): markdown to Lexical conversion with MDX and image detection"
```

---

### Task 4: Media upload and lookup

**Files:**
- Create: `tools/migrate-tina/src/media.ts`
- Test: `tools/migrate-tina/src/media.test.ts`

**Interfaces:**
- Consumes: `Ctx`, `Id`, `Report`.
- Produces:
  - `listUploads(uploadsDir: string): string[]` returns legacy paths such as `/uploads/branding/logo.png`, sorted, without dotfiles
  - `uploadAll(input: { payload: Payload; tenantId: Id; report: Report }, uploadsDir: string): Promise<Map<string, Id>>`
  - `resolveMedia(ctx: Ctx, value: unknown, legacyId: string): Id | undefined`

- [ ] **Step 1: Write the failing test `src/media.test.ts`**

```ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Ctx } from './context'
import { listUploads, resolveMedia } from './media'
import { Report } from './report'

function ctx(): Ctx {
  return {
    payload: {} as never,
    tenantId: 1,
    report: new Report(),
    media: new Map([
      ['/uploads/1030.jpeg', 7],
      ['/uploads/past events/a b.jpg', 8],
    ]),
    ids: new Map(),
    pageByEnPath: new Map(),
    toLexical: async () => undefined,
  }
}

describe('listUploads', () => {
  it('lists files as /uploads paths and skips dotfiles', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'up-'))
    mkdirSync(path.join(dir, 'branding'))
    writeFileSync(path.join(dir, 'b.png'), 'x')
    writeFileSync(path.join(dir, 'branding/logo.png'), 'x')
    writeFileSync(path.join(dir, '.DS_Store'), 'x')
    expect(listUploads(dir)).toEqual(['/uploads/b.png', '/uploads/branding/logo.png'])
  })
})

describe('resolveMedia', () => {
  it('returns the media id for a known upload path', () => {
    expect(resolveMedia(ctx(), '/uploads/1030.jpeg', 'events/en/a.mdx')).toBe(7)
  })
  it('matches a path that is percent-encoded in content', () => {
    expect(resolveMedia(ctx(), '/uploads/past%20events/a%20b.jpg', 'x')).toBe(8)
  })
  it('returns nothing for an empty value without reporting', () => {
    const c = ctx()
    expect(resolveMedia(c, '', 'x')).toBeUndefined()
    expect(resolveMedia(c, undefined, 'x')).toBeUndefined()
    expect(c.report.count()).toBe(0)
  })
  it('reports a path that is not in uploads and leaves the field empty', () => {
    const c = ctx()
    expect(resolveMedia(c, '/uploads/1234.jpg', 'pages/en/about-us/history.mdx')).toBeUndefined()
    expect(c.report.entries[0]).toEqual({
      kind: 'missing-media',
      legacyId: 'pages/en/about-us/history.mdx',
      message: '/uploads/1234.jpg is not in the uploads folder',
    })
  })
  it('reports an external image URL', () => {
    const c = ctx()
    expect(resolveMedia(c, 'https://assets.tina.io/abc/x.png', 'x')).toBeUndefined()
    expect(c.report.entries[0]!.message).toBe('external image https://assets.tina.io/abc/x.png was not imported')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/migrate-tina test`
Expected: FAIL, module `./media` not found.

- [ ] **Step 3: Write `src/media.ts`**

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import mime from 'mime-types'
import type { Payload } from 'payload'
import type { Ctx, Id } from './context'
import type { Report } from './report'

export function listUploads(uploadsDir: string): string[] {
  if (!existsSync(uploadsDir)) return []
  const out: string[] = []
  const walk = (abs: string) => {
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const child = path.join(abs, entry.name)
      if (entry.isDirectory()) walk(child)
      else out.push(`/uploads/${path.relative(uploadsDir, child).split(path.sep).join('/')}`)
    }
  }
  walk(uploadsDir)
  return out.sort()
}

/** Uploads every file once. A file already uploaded for this tenant is reused. */
export async function uploadAll(
  input: { payload: Payload; tenantId: Id; report: Report },
  uploadsDir: string,
): Promise<Map<string, Id>> {
  const { payload, tenantId, report } = input
  const map = new Map<string, Id>()

  for (const legacyPath of listUploads(uploadsDir)) {
    try {
      const existing = await payload.find({
        collection: 'media',
        where: { and: [{ legacyPath: { equals: legacyPath } }, { tenant: { equals: tenantId } }] },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (existing.docs[0]) {
        map.set(legacyPath, existing.docs[0].id)
        continue
      }
      const abs = path.join(uploadsDir, legacyPath.replace(/^\/uploads\//, ''))
      const data = readFileSync(abs)
      const created = await payload.create({
        collection: 'media',
        data: { alt: '', legacyPath, tenant: tenantId } as never,
        file: {
          data,
          name: path.basename(abs),
          mimetype: mime.lookup(abs) || 'application/octet-stream',
          size: data.length,
        },
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
      map.set(legacyPath, created.id)
    } catch (err) {
      report.add('error', legacyPath, `upload failed: ${(err as Error).message}`)
    }
  }
  return map
}

export function resolveMedia(ctx: Ctx, value: unknown, legacyId: string): Id | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') {
    ctx.report.add('missing-media', legacyId, `image value is not a path: ${JSON.stringify(value)}`)
    return undefined
  }
  if (/^https?:\/\//.test(value)) {
    ctx.report.add('missing-media', legacyId, `external image ${value} was not imported`)
    return undefined
  }
  let key = value
  try {
    key = decodeURI(value)
  } catch {
    // keep the raw value when it is not valid percent-encoding
  }
  const id = ctx.media.get(key)
  if (id === undefined) ctx.report.add('missing-media', legacyId, `${value} is not in the uploads folder`)
  return id
}
```

- [ ] **Step 4: Allow the one HEIC file**

`public/uploads` holds one `.heic` file. Its MIME type is `image/heic`, which the `image/*` rule in the `media` collection already accepts, and Payload stores it without resizing. No schema change is needed. Confirm with:

Run: `node -e "import('mime-types').then(m=>console.log(m.default.lookup('x.heic')))"` from `tools/migrate-tina`
Expected: `image/heic`

- [ ] **Step 5: Run the tests and commit**

Run: `pnpm --filter @sites/migrate-tina test`
Expected: all pass.

```bash
git add -A
git commit -m "feat(migrate): media upload and upload path lookup"
```

---

### Task 5: Block transformers

**Files:**
- Create: `tools/migrate-tina/src/blocks.ts`
- Test: `tools/migrate-tina/src/blocks.test.ts`

**Interfaces:**
- Consumes: `Ctx`, `resolveMedia`.
- Produces: `transformBlocks(ctx: Ctx, blocks: unknown, legacyId: string): Promise<Record<string, unknown>[]>`. Each output object has `blockType` equal to the Tina `_template` value. An unknown template adds an `error` entry and is dropped.

- [ ] **Step 1: Write the failing test `src/blocks.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { transformBlocks } from './blocks'
import type { Ctx } from './context'
import { Report } from './report'

function ctx(): Ctx {
  return {
    payload: {} as never,
    tenantId: 1,
    report: new Report(),
    media: new Map([['/uploads/hero.jpg', 5]]),
    ids: new Map(),
    pageByEnPath: new Map(),
    toLexical: async (md) => (typeof md === 'string' && md.trim() ? { lexicalOf: md.trim() } : undefined),
  }
}

describe('transformBlocks', () => {
  it('returns an empty list when the page has no blocks', async () => {
    expect(await transformBlocks(ctx(), undefined, 'p')).toEqual([])
  })

  it('maps a hero block and links its image', async () => {
    const out = await transformBlocks(
      ctx(),
      [
        {
          _template: 'hero',
          background: 'bg-[#F28F07]/20',
          headline: 'Our History',
          tagline: 'Since 1971',
          actions: [{ label: 'Read more...', type: 'link', link: '/about-us', icon: { name: 'ArrowRight' } }],
          image: { src: '/uploads/hero.jpg', alt: 'Field' },
        },
      ],
      'p',
    )
    expect(out).toEqual([
      {
        blockType: 'hero',
        background: 'bg-[#F28F07]/20',
        headline: 'Our History',
        tagline: 'Since 1971',
        actions: [
          {
            label: 'Read more...',
            type: 'link',
            link: '/about-us',
            icon: { name: 'ArrowRight', color: undefined, style: undefined },
          },
        ],
        image: { src: 5, alt: 'Field', videoUrl: undefined },
      },
    ])
  })

  it('converts rich text in content, features and image-text blocks', async () => {
    const out = await transformBlocks(
      ctx(),
      [
        { _template: 'content', body: 'Hello **world**\n' },
        { _template: 'features', title: 'T', items: [{ title: 'One', text: 'Body one' }] },
        { _template: 'imageText', content: 'Side text', layout: 'image-right', image: { src: '', alt: 'x' } },
      ],
      'p',
    )
    expect(out[0]).toMatchObject({ blockType: 'content', body: { lexicalOf: 'Hello **world**' } })
    expect((out[1] as any).items[0]).toMatchObject({ title: 'One', text: { lexicalOf: 'Body one' } })
    expect(out[2]).toMatchObject({
      blockType: 'imageText',
      content: { lexicalOf: 'Side text' },
      layout: 'image-right',
      image: { src: undefined, alt: 'x' },
    })
  })

  it('maps the simple blocks field by field', async () => {
    const out = await transformBlocks(
      ctx(),
      [
        { _template: 'callout', text: 'Join us', url: 'https://x.org', background: 'bg-background' },
        { _template: 'stats', title: 'Numbers', stats: [{ stat: '50', type: 'years' }] },
        { _template: 'cta', title: 'Go', description: 'Now', actions: [] },
        { _template: 'video', url: 'https://youtu.be/x', autoPlay: true, loop: false, color: 'tint' },
        { _template: 'eventsCalendarPreview', title: '', description: '' },
        {
          _template: 'testimonial',
          title: 'Voices',
          testimonials: [{ quote: 'Great', author: 'A', role: 'Farmer', avatar: '/uploads/hero.jpg' }],
        },
      ],
      'p',
    )
    expect(out.map((b) => b.blockType)).toEqual([
      'callout',
      'stats',
      'cta',
      'video',
      'eventsCalendarPreview',
      'testimonial',
    ])
    expect(out[1]).toMatchObject({ stats: [{ stat: '50', type: 'years' }] })
    expect(out[3]).toMatchObject({ url: 'https://youtu.be/x', autoPlay: true, loop: false, color: 'tint' })
    expect((out[5] as any).testimonials[0].avatar).toBe(5)
  })

  it('drops an unknown template and records an error', async () => {
    const c = ctx()
    const out = await transformBlocks(c, [{ _template: 'carousel' }, { _template: 'callout', text: 'ok' }], 'p')
    expect(out).toHaveLength(1)
    expect(c.report.entries[0]).toEqual({
      kind: 'error',
      legacyId: 'p',
      message: 'unknown block template "carousel"',
    })
  })

  it('reports a missing hero image but keeps the block', async () => {
    const c = ctx()
    const out = await transformBlocks(c, [{ _template: 'hero', image: { src: '/uploads/1234.jpg' } }], 'p')
    expect((out[0] as any).image.src).toBeUndefined()
    expect(c.report.count('missing-media')).toBe(1)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/migrate-tina test`
Expected: FAIL, module `./blocks` not found.

- [ ] **Step 3: Write `src/blocks.ts`**

```ts
import type { Ctx } from './context'
import { resolveMedia } from './media'

type Raw = Record<string, any>

function icon(raw: Raw | undefined) {
  return raw ? { name: raw.name, color: raw.color, style: raw.style } : undefined
}

function actions(list: Raw[] | undefined) {
  return (list ?? []).map((a) => ({ label: a.label, type: a.type, link: a.link, icon: icon(a.icon) }))
}

async function transformBlock(ctx: Ctx, b: Raw, legacyId: string): Promise<Record<string, unknown> | null> {
  switch (b._template) {
    case 'hero':
      return {
        blockType: 'hero',
        background: b.background,
        headline: b.headline,
        tagline: b.tagline,
        actions: actions(b.actions),
        image: {
          src: resolveMedia(ctx, b.image?.src, legacyId),
          alt: b.image?.alt,
          videoUrl: b.image?.videoUrl,
        },
      }
    case 'content':
      return { blockType: 'content', background: b.background, body: await ctx.toLexical(b.body, legacyId) }
    case 'callout':
      return { blockType: 'callout', background: b.background, text: b.text, url: b.url }
    case 'features': {
      const items = []
      for (const item of (b.items ?? []) as Raw[]) {
        items.push({ icon: icon(item.icon), title: item.title, text: await ctx.toLexical(item.text, legacyId) })
      }
      return { blockType: 'features', background: b.background, title: b.title, description: b.description, items }
    }
    case 'stats':
      return {
        blockType: 'stats',
        background: b.background,
        title: b.title,
        description: b.description,
        stats: ((b.stats ?? []) as Raw[]).map((s) => ({ stat: s.stat, type: s.type })),
      }
    case 'cta':
      return { blockType: 'cta', title: b.title, description: b.description, actions: actions(b.actions) }
    case 'testimonial':
      return {
        blockType: 'testimonial',
        background: b.background,
        title: b.title,
        description: b.description,
        testimonials: ((b.testimonials ?? []) as Raw[]).map((t) => ({
          quote: t.quote,
          author: t.author,
          role: t.role,
          avatar: resolveMedia(ctx, t.avatar, legacyId),
        })),
      }
    case 'video':
      return {
        blockType: 'video',
        background: b.background,
        color: b.color,
        url: b.url,
        autoPlay: b.autoPlay,
        loop: b.loop,
      }
    case 'imageText':
      return {
        blockType: 'imageText',
        background: b.background,
        image: { src: resolveMedia(ctx, b.image?.src, legacyId), alt: b.image?.alt },
        content: await ctx.toLexical(b.content, legacyId),
        layout: b.layout,
        imageSize: b.imageSize,
        verticalAlignment: b.verticalAlignment,
      }
    case 'eventsCalendarPreview':
      return {
        blockType: 'eventsCalendarPreview',
        background: b.background,
        title: b.title,
        description: b.description,
      }
    default:
      ctx.report.add('error', legacyId, `unknown block template "${b._template}"`)
      return null
  }
}

export async function transformBlocks(
  ctx: Ctx,
  blocks: unknown,
  legacyId: string,
): Promise<Record<string, unknown>[]> {
  if (!Array.isArray(blocks)) return []
  const out: Record<string, unknown>[] = []
  for (const raw of blocks) {
    const block = await transformBlock(ctx, raw as Raw, legacyId)
    if (block) out.push(block)
  }
  return out
}
```

- [ ] **Step 4: Run the tests and commit**

Run: `pnpm --filter @sites/migrate-tina test`
Expected: all pass.

```bash
git add -A
git commit -m "feat(migrate): transformers for the ten layout blocks"
```

---

### Task 6: Page planning

**Files:**
- Create: `tools/migrate-tina/src/pages-plan.ts`
- Test: `tools/migrate-tina/src/pages-plan.test.ts`

**Interfaces:**
- Consumes: `Report`, `pageSlug`.
- Produces:
  - `SEGMENT_NL: Record<string, string>`, the English to Dutch segment table copied from the old page route.
  - `type PagePlan = { key: string; enFile?: string; nlFile?: string; enSegments?: string[]; nlSegments?: string[]; parentKey?: string; placeholder: boolean }`
  - `planPages(files: string[], report: Report): PagePlan[]`. `files` are paths relative to `content/`, for example `pages/en/about-us/history.mdx`. The result is ordered parents first.
- Rules:
  - `key` is the English path without a leading slash. The home page has key `home`.
  - `x/index` is the page `x`. When `x.mdx` and `x/index.mdx` both exist, `x.mdx` wins and the index is reported as `shadowed-file`. This matches the lookup order of the old route.
  - A root `index` is the home page only when no root `home` exists. Otherwise it is reported as `shadowed-file`.
  - A Dutch file pairs with an English file when translating each English segment through `SEGMENT_NL` gives the Dutch path.
  - A Dutch file without a partner gets a key built by translating its segments back to English.
  - A folder without its own page gets a placeholder plan so child URLs do not change.
  - Files directly under `pages/`, outside `en/` and `nl/`, are reported as `skipped`.

- [ ] **Step 1: Write the failing test `src/pages-plan.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { planPages } from './pages-plan'
import { Report } from './report'

const byKey = (plans: ReturnType<typeof planPages>) => Object.fromEntries(plans.map((p) => [p.key, p]))

describe('planPages', () => {
  it('pairs English and Dutch files through the segment table', () => {
    const report = new Report()
    const plans = byKey(
      planPages(
        [
          'pages/en/about-us/index.mdx',
          'pages/en/about-us/history.mdx',
          'pages/nl/over-ons/index.mdx',
          'pages/nl/over-ons/geschiedenis.mdx',
        ],
        report,
      ),
    )
    expect(plans['about-us']).toMatchObject({
      enFile: 'pages/en/about-us/index.mdx',
      nlFile: 'pages/nl/over-ons/index.mdx',
      enSegments: ['about-us'],
      nlSegments: ['over-ons'],
      placeholder: false,
    })
    expect(plans['about-us/history']).toMatchObject({
      nlFile: 'pages/nl/over-ons/geschiedenis.mdx',
      nlSegments: ['over-ons', 'geschiedenis'],
      parentKey: 'about-us',
    })
    expect(report.count()).toBe(0)
  })

  it('pairs files whose path is the same in both languages', () => {
    const plans = byKey(planPages(['pages/en/contact.mdx', 'pages/nl/contact.mdx'], new Report()))
    expect(plans.contact).toMatchObject({ enSegments: ['contact'], nlSegments: ['contact'] })
  })

  it('treats root home files as the home page', () => {
    const plans = byKey(planPages(['pages/en/home.mdx', 'pages/nl/home.mdx'], new Report()))
    expect(plans.home).toMatchObject({ enSegments: ['home'], nlSegments: ['home'], parentKey: undefined })
  })

  it('reports a root index that is shadowed by home', () => {
    const report = new Report()
    const plans = planPages(['pages/en/home.mdx', 'pages/en/index.mdx'], report)
    expect(plans).toHaveLength(1)
    expect(report.entries).toEqual([
      { kind: 'shadowed-file', legacyId: 'pages/en/index.mdx', message: 'not imported: pages/en/home.mdx is the home page' },
      { kind: 'unpaired-locale', legacyId: 'pages/en/home.mdx', message: 'no Dutch counterpart' },
    ])
  })

  it('uses a root index as home when there is no home file', () => {
    const plans = byKey(planPages(['pages/en/index.mdx'], new Report()))
    expect(plans.home?.enFile).toBe('pages/en/index.mdx')
  })

  it('lets x.mdx win over x/index.mdx as the old route did', () => {
    const report = new Report()
    const plans = byKey(
      planPages(['pages/en/inspringtheater.mdx', 'pages/en/inspringtheater/index.mdx'], report),
    )
    expect(plans.inspringtheater?.enFile).toBe('pages/en/inspringtheater.mdx')
    expect(report.count('shadowed-file')).toBe(1)
  })

  it('adds a draft placeholder for a folder without its own page', () => {
    const report = new Report()
    const plans = planPages(
      [
        'pages/en/activities/index.mdx',
        'pages/en/activities/calendar-sections/breaks.mdx',
        'pages/nl/activiteiten/index.mdx',
        'pages/nl/activiteiten/agenda-secties/breaks.mdx',
      ],
      report,
    )
    const map = byKey(plans)
    expect(map['activities/calendar-sections']).toMatchObject({
      placeholder: true,
      enSegments: ['activities', 'calendar-sections'],
      nlSegments: ['activiteiten', 'agenda-secties'],
      parentKey: 'activities',
    })
    expect(map['activities/calendar-sections/breaks']?.parentKey).toBe('activities/calendar-sections')
    expect(report.count('placeholder-parent')).toBe(1)
  })

  it('orders parents before children', () => {
    const plans = planPages(
      ['pages/en/a/b/c.mdx', 'pages/en/a/index.mdx', 'pages/en/a/b/index.mdx'],
      new Report(),
    )
    expect(plans.map((p) => p.key)).toEqual(['a', 'a/b', 'a/b/c'])
  })

  it('imports a Dutch-only page under a key translated back to English', () => {
    const report = new Report()
    const plans = byKey(planPages(['pages/nl/over-ons/index.mdx', 'pages/nl/over-ons/vrijwilligers.mdx'], report))
    expect(plans['about-us/vrijwilligers']).toMatchObject({
      enFile: undefined,
      nlFile: 'pages/nl/over-ons/vrijwilligers.mdx',
      nlSegments: ['over-ons', 'vrijwilligers'],
      parentKey: 'about-us',
    })
    expect(report.count('unpaired-locale')).toBe(2)
  })

  it('reports an English page without a Dutch counterpart', () => {
    const report = new Report()
    planPages(['pages/en/accessibility.mdx'], report)
    expect(report.entries).toEqual([
      { kind: 'unpaired-locale', legacyId: 'pages/en/accessibility.mdx', message: 'no Dutch counterpart' },
    ])
  })

  it('skips files that are outside a locale folder', () => {
    const report = new Report()
    const plans = planPages(['pages/about.mdx', 'pages/test-page.en.mdx'], report)
    expect(plans).toEqual([])
    expect(report.count('skipped')).toBe(2)
  })

  it('reports a segment that had to change to become a valid slug', () => {
    const report = new Report()
    const plans = byKey(planPages(['pages/en/Our_Team.mdx'], report))
    expect(plans['our-team']?.enSegments).toEqual(['our-team'])
    expect(report.count('slug-changed')).toBe(1)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/migrate-tina test`
Expected: FAIL, module `./pages-plan` not found.

- [ ] **Step 3: Write `src/pages-plan.ts`**

```ts
import type { Report } from './report'
import { pageSlug } from './slug'

/** English to Dutch URL segments, copied from the old catch-all page route. */
export const SEGMENT_NL: Record<string, string> = {
  'about-us': 'over-ons',
  activities: 'activiteiten',
  news: 'nieuws',
  vacancies: 'vacatures',
  library: 'bibliotheek',
  newsletters: 'nieuwsbrieven',
  newsletter: 'nieuwsbrief',
  'what-is-boerengroep': 'wat-is-boerengroep',
  history: 'geschiedenis',
  'who-are-we': 'wie-zijn-wij',
  network: 'netwerk',
  calendar: 'agenda',
  'past-events': 'terugblik',
  'group-studies': 'groepsstudies',
  teachers: 'docenten',
  'forum-reader': 'forumlezer',
  'soup-kitchen': 'soepkeuken',
  'calendar-sections': 'agenda-secties',
  'friends-news': 'vrienden-nieuws',
  '50-years-bg': '50-jaar-bg',
  archive: 'archief',
  'privacy-policy': 'privacybeleid',
  'terms-conditions': 'algemene-voorwaarden',
  accessibility: 'toegankelijkheid',
  events: 'evenementen',
  'export-data': 'exporteer-gegevens',
  'delete-data': 'verwijder-gegevens',
}

const SEGMENT_EN: Record<string, string> = Object.fromEntries(
  Object.entries(SEGMENT_NL).map(([en, nl]) => [nl, en]),
)

export type PagePlan = {
  key: string
  enFile?: string
  nlFile?: string
  enSegments?: string[]
  nlSegments?: string[]
  parentKey?: string
  placeholder: boolean
}

type Source = { file: string; segments: string[] }

/** Normalises the files of one locale to a map of path to source file. */
function collect(files: string[], locale: 'en' | 'nl', report: Report): Map<string, Source> {
  const prefix = `pages/${locale}/`
  const direct = new Map<string, Source>()
  const index = new Map<string, Source>()
  let rootIndex: string | undefined

  for (const file of files) {
    if (!file.startsWith(prefix)) continue
    const raw = file.slice(prefix.length).replace(/\.mdx?$/, '').split('/')
    const isIndex = raw[raw.length - 1] === 'index'
    const parts = isIndex ? raw.slice(0, -1) : raw
    if (parts.length === 0) {
      rootIndex = file
      continue
    }
    const segments = parts.map((part) => {
      const slug = pageSlug(part)
      if (slug !== part) report.add('slug-changed', file, `segment "${part}" becomes "${slug}"`)
      return slug
    })
    ;(isIndex ? index : direct).set(segments.join('/'), { file, segments })
  }

  const out = new Map(direct)
  for (const [p, source] of index) {
    const winner = direct.get(p)
    if (winner) report.add('shadowed-file', source.file, `not imported: ${winner.file} serves the same URL`)
    else out.set(p, source)
  }
  if (rootIndex) {
    const home = out.get('home')
    if (home) report.add('shadowed-file', rootIndex, `not imported: ${home.file} is the home page`)
    else out.set('home', { file: rootIndex, segments: ['home'] })
  }
  return out
}

export function planPages(files: string[], report: Report): PagePlan[] {
  for (const file of files) {
    if (file.startsWith('pages/') && !file.startsWith('pages/en/') && !file.startsWith('pages/nl/')) {
      report.add('skipped', file, 'outside a locale folder')
    }
  }

  const en = collect(files, 'en', report)
  const nl = collect(files, 'nl', report)
  const plans = new Map<string, PagePlan>()

  for (const [key, source] of en) {
    const translated = source.segments.map((s) => SEGMENT_NL[s] ?? s).join('/')
    const partner = nl.get(translated) ?? nl.get(key)
    if (partner) nl.delete(partner.segments.join('/'))
    else report.add('unpaired-locale', source.file, 'no Dutch counterpart')
    plans.set(key, {
      key,
      enFile: source.file,
      enSegments: source.segments,
      nlFile: partner?.file,
      nlSegments: partner?.segments,
      placeholder: false,
    })
  }

  for (const source of nl.values()) {
    const key = source.segments.map((s) => SEGMENT_EN[s] ?? s).join('/')
    report.add('unpaired-locale', source.file, 'no English counterpart')
    plans.set(key, { key, nlFile: source.file, nlSegments: source.segments, placeholder: false })
  }

  // Add placeholders for folders without their own page, deepest first so chains resolve.
  const queue = [...plans.values()]
  while (queue.length > 0) {
    const plan = queue.shift()!
    const keyParts = plan.key.split('/')
    if (keyParts.length < 2) continue
    const parentKey = keyParts.slice(0, -1).join('/')
    plan.parentKey = parentKey
    if (plans.has(parentKey)) continue
    const depth = keyParts.length - 1
    const placeholder: PagePlan = {
      key: parentKey,
      enSegments: plan.enSegments?.slice(0, depth) ?? keyParts.slice(0, depth),
      nlSegments: plan.nlSegments?.slice(0, depth),
      placeholder: true,
    }
    plans.set(parentKey, placeholder)
    queue.push(placeholder)
    report.add('placeholder-parent', plan.enFile ?? plan.nlFile!, `created a draft page for /${parentKey}`)
  }

  // A placeholder created from an English-only child may still lack Dutch segments
  // that a later sibling can provide.
  for (const plan of plans.values()) {
    if (!plan.parentKey) continue
    const parent = plans.get(plan.parentKey)
    if (parent?.placeholder && !parent.nlSegments && plan.nlSegments) {
      parent.nlSegments = plan.nlSegments.slice(0, plan.key.split('/').length - 1)
    }
  }

  return [...plans.values()].sort(
    (a, b) => a.key.split('/').length - b.key.split('/').length || a.key.localeCompare(b.key),
  )
}
```

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @sites/migrate-tina test`
Expected: all pass.

- [ ] **Step 5: Check the plan against the real content**

```bash
cd tools/migrate-tina && npx tsx -e "
import { listContent } from './src/read.ts'
import { planPages } from './src/pages-plan.ts'
import { Report } from './src/report.ts'
const report = new Report()
const plans = planPages(listContent('../../apps/boerengroep/content', 'pages'), report)
for (const p of plans) console.log(p.placeholder ? 'DRAFT' : 'page ', '/' + (p.enSegments ?? []).join('/'), '|', '/' + (p.nlSegments ?? []).join('/'))
console.log(report.toMarkdown())
" && cd ../..
```

Expected: every English path listed in the current `apps/boerengroep/i18n/routing.ts` appears once, with the Dutch path the routing file gives for it. If a pair is wrong, add the missing segment to `SEGMENT_NL`, add a test case for it, and rerun.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(migrate): page planning with locale pairing and placeholder parents"
```

---

### Task 7: Importers

**Files:**
- Create: `tools/migrate-tina/src/collections.ts`, `src/pages.ts`, `src/settings.ts`

**Interfaces:**
- Consumes: `Ctx`, `upsert`, `refId`, `resolveMedia`, `transformBlocks`, `planPages`, `listContent`, `readTinaFile`, `fileSlug`.
- Produces, each `(ctx: Ctx, contentDir: string) => Promise<void>`: `importPeople`, `importEvents`, `importVacancies`, `importNewsletters`, `importPastEvents`, `importPages`, `importSettings`, `importRedirects`.
- These functions only write. Their behaviour is verified by the integration test in Task 8, which is written first in that task. This task has no test of its own, so it is not committed alone: Task 8 commits both.

- [ ] **Step 1: Write `src/collections.ts`**

```ts
import { type Ctx, refId, upsert } from './context'
import { transformBlocks } from './blocks'
import { resolveMedia } from './media'
import { listContent, readTinaFile, type TinaFile } from './read'
import { fileSlug } from './slug'

/** `events/en/x.mdx` gives `en`. A file outside a locale folder gives undefined. */
function languageOf(legacyId: string): 'en' | 'nl' | undefined {
  const second = legacyId.split('/')[1]
  return second === 'en' || second === 'nl' ? second : undefined
}

async function each(
  ctx: Ctx,
  contentDir: string,
  folder: string,
  fn: (file: TinaFile) => Promise<void>,
): Promise<void> {
  for (const rel of listContent(contentDir, folder)) {
    try {
      await fn(readTinaFile(contentDir, rel))
    } catch (err) {
      ctx.report.add('error', rel, (err as Error).message)
    }
  }
}

export async function importPeople(ctx: Ctx, contentDir: string): Promise<void> {
  await each(ctx, contentDir, 'authors', async (f) => {
    await upsert(ctx, 'authors', f.legacyId, {
      name: f.data.name,
      avatar: resolveMedia(ctx, f.data.avatar, f.legacyId),
    })
  })
  await each(ctx, contentDir, 'speakers', async (f) => {
    await upsert(ctx, 'speakers', f.legacyId, {
      name: f.data.name,
      avatar: resolveMedia(ctx, f.data.avatar, f.legacyId),
      affiliation: f.data.affiliation,
      bio: await ctx.toLexical(f.data.bio, f.legacyId),
    })
  })
  await each(ctx, contentDir, 'tags', async (f) => {
    await upsert(ctx, 'tags', f.legacyId, { name: f.data.name })
  })
}

export async function importEvents(ctx: Ctx, contentDir: string): Promise<void> {
  await each(ctx, contentDir, 'events', async (f) => {
    const d = f.data
    await upsert(ctx, 'events', f.legacyId, {
      title: d.title,
      slug: fileSlug(f.legacyId),
      language: languageOf(f.legacyId),
      description: d.description,
      location: {
        address: d.location?.address,
        mapsLink: d.location?.mapsLink,
        callLink: d.location?.callLink,
      },
      startDate: d.startDate,
      endDate: d.endDate || undefined,
      eventType: d.eventType,
      speakers: ((d.speakers ?? []) as any[]).map((s) => ({
        speaker: refId(ctx, s.speaker, f.legacyId),
        role: s.role,
      })),
      image: resolveMedia(ctx, d.image, f.legacyId),
      coverImage: resolveMedia(ctx, d.coverImage, f.legacyId),
      featured: Boolean(d.featured),
      registrationLink: await ctx.toLexical(d.registrationLink, f.legacyId),
    })
  })
}

export async function importVacancies(ctx: Ctx, contentDir: string): Promise<void> {
  await each(ctx, contentDir, 'vacancies', async (f) => {
    const d = f.data
    await upsert(ctx, 'vacancies', f.legacyId, {
      title: d.title,
      slug: fileSlug(f.legacyId),
      language: languageOf(f.legacyId),
      opportunityType: d.opportunityType,
      location: { type: d.location?.type, cityRegion: d.location?.cityRegion },
      startDate: d.startDate || undefined,
      duration: d.duration,
      openApplication: Boolean(d.openApplication),
      applicationDeadline: d.applicationDeadline || undefined,
      description: await ctx.toLexical(d.description, f.legacyId),
      responsibilities: await ctx.toLexical(d.responsibilities, f.legacyId),
      requiredSkills: d.requiredSkills ?? [],
      preferredQualities: await ctx.toLexical(d.preferredQualities, f.legacyId),
      languagesRequired: d.languagesRequired ?? [],
      compensation: { details: d.compensation?.details },
      accessibilityNotes: d.accessibilityNotes,
      howToApply: await ctx.toLexical(d.howToApply, f.legacyId),
      contactInfo: {
        name: d.contactInfo?.name,
        email: d.contactInfo?.email,
        phone: d.contactInfo?.phone,
      },
      supportingDocument: resolveMedia(ctx, d.supportingDocument, f.legacyId),
      valuesStatement: await ctx.toLexical(d.valuesStatement, f.legacyId),
      openToNontraditional: Boolean(d.openToNontraditional),
    })
  })
}

export async function importNewsletters(ctx: Ctx, contentDir: string): Promise<void> {
  await each(ctx, contentDir, 'newsletters', async (f) => {
    const d = f.data
    await upsert(ctx, 'newsletters', f.legacyId, {
      title: d.title,
      slug: fileSlug(f.legacyId),
      language: languageOf(f.legacyId),
      type: d.type,
      organization: d.organization,
      publishDate: d.publishDate,
      tags: d.tags ?? [],
      externalLink: d.externalLink,
      linkDescription: d.linkDescription,
      author: refId(ctx, d.author, f.legacyId),
      featuredImage: resolveMedia(ctx, d.featuredImage, f.legacyId),
      excerpt: await ctx.toLexical(d.excerpt, f.legacyId),
      body: await transformBlocks(ctx, d.body, f.legacyId),
      featured: Boolean(d.featured),
      _status: d.published === false ? 'draft' : 'published',
    })
  })
}

export async function importPastEvents(ctx: Ctx, contentDir: string): Promise<void> {
  await each(ctx, contentDir, 'past-events', async (f) => {
    const d = f.data
    const tags = ((d.tags ?? []) as any[])
      .map((t) => refId(ctx, t?.tag, f.legacyId))
      .filter((id) => id !== undefined)
    await upsert(ctx, 'past-events', f.legacyId, {
      title: d.title,
      slug: fileSlug(f.legacyId),
      language: languageOf(f.legacyId),
      heroImg: resolveMedia(ctx, d.heroImg, f.legacyId),
      excerpt: await ctx.toLexical(d.excerpt, f.legacyId),
      author: refId(ctx, d.author, f.legacyId),
      date: d.date,
      relatedEvent: refId(ctx, d.relatedEvent, f.legacyId),
      tags,
      blocks: await transformBlocks(ctx, d.blocks, f.legacyId),
      body: await ctx.toLexical(f.body, f.legacyId),
      _status: 'published',
    })
  })
}
```

- [ ] **Step 2: Write `src/pages.ts`**

```ts
import { transformBlocks } from './blocks'
import { type Ctx, upsert } from './context'
import { planPages, type PagePlan } from './pages-plan'
import { listContent, readTinaFile } from './read'

async function localeData(ctx: Ctx, contentDir: string, file: string, slug: string) {
  const f = readTinaFile(contentDir, file)
  return {
    data: {
      title: f.data.title,
      slug,
      blocks: await transformBlocks(ctx, f.data.blocks, f.legacyId),
      body: await ctx.toLexical(f.body, f.legacyId),
    },
    previousUrls: (f.data.previousUrls ?? []) as string[],
  }
}

function enPath(plan: PagePlan): string | undefined {
  if (!plan.enSegments) return undefined
  return plan.key === 'home' ? '/' : `/${plan.enSegments.join('/')}`
}

async function importOne(ctx: Ctx, contentDir: string, plan: PagePlan): Promise<void> {
  const legacyId = `pages/${plan.key}`
  const parent = plan.parentKey ? ctx.ids.get(`pages/${plan.parentKey}`) : undefined
  const last = (segments: string[]) => segments[segments.length - 1]!
  const oldUrls: string[] = []

  if (plan.placeholder) {
    const title = last(plan.enSegments ?? plan.nlSegments!)
    if (plan.enSegments) {
      await upsert(ctx, 'pages', legacyId, { title, slug: last(plan.enSegments), parent, _status: 'draft' }, 'en')
    }
    if (plan.nlSegments) {
      await upsert(ctx, 'pages', legacyId, { title, slug: last(plan.nlSegments), parent, _status: 'draft' }, 'nl')
    }
  } else {
    if (plan.enFile) {
      const en = await localeData(ctx, contentDir, plan.enFile, last(plan.enSegments!))
      oldUrls.push(...en.previousUrls)
      await upsert(ctx, 'pages', legacyId, { ...en.data, parent, _status: 'published' }, 'en')
    }
    if (plan.nlFile) {
      const nl = await localeData(ctx, contentDir, plan.nlFile, last(plan.nlSegments!))
      oldUrls.push(...nl.previousUrls)
      await upsert(ctx, 'pages', legacyId, { ...nl.data, parent, _status: 'published' }, 'nl')
    }
  }

  const id = ctx.ids.get(legacyId)!
  const target = enPath(plan)
  if (target) ctx.pageByEnPath.set(target, id)

  for (const from of oldUrls) {
    if (!target || !from.startsWith('/')) continue
    const existing = await ctx.payload.find({
      collection: 'redirects',
      where: { and: [{ from: { equals: from } }, { tenant: { equals: ctx.tenantId } }] },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.totalDocs === 0) {
      await ctx.payload.create({
        collection: 'redirects',
        data: { from, to: target, permanent: true, note: 'Previous URL of a page', tenant: ctx.tenantId } as never,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
    }
  }
}

export async function importPages(ctx: Ctx, contentDir: string): Promise<void> {
  const plans = planPages(listContent(contentDir, 'pages'), ctx.report)
  for (const plan of plans) {
    try {
      await importOne(ctx, contentDir, plan)
    } catch (err) {
      ctx.report.add('error', plan.enFile ?? plan.nlFile ?? `pages/${plan.key}`, (err as Error).message)
    }
  }
}
```

- [ ] **Step 3: Write `src/settings.ts`**

```ts
import { existsSync } from 'node:fs'
import path from 'node:path'
import type { Ctx } from './context'
import { resolveMedia } from './media'
import { listContent, readTinaFile } from './read'

type Raw = Record<string, any>
const WRITE = { overrideAccess: true, context: { disableRevalidate: true } } as const
const SETTINGS_FILE = 'global/index.json'

/** Links to a page when the href is exactly a known English page path. */
function link(ctx: Ctx, item: Raw) {
  return { page: ctx.pageByEnPath.get(item.href), href: item.href, label: item.label }
}

function navItem(ctx: Ctx, item: Raw, locale: 'en' | 'nl'): Raw {
  return {
    ...link(ctx, item),
    labelText: locale === 'en' ? item.labelEn : item.labelNl,
    submenu: ((item.submenu ?? []) as Raw[]).map((sub) => ({
      ...link(ctx, sub),
      labelText: locale === 'en' ? sub.labelEn : sub.labelNl,
    })),
  }
}

export async function importSettings(ctx: Ctx, contentDir: string): Promise<void> {
  if (!existsSync(path.join(contentDir, SETTINGS_FILE))) {
    ctx.report.add('skipped', SETTINGS_FILE, 'no global settings file')
    return
  }
  try {
    const d = readTinaFile(contentDir, SETTINGS_FILE).data
    const base = (locale: 'en' | 'nl') => ({
      header: {
        logo: resolveMedia(ctx, d.header?.logo, SETTINGS_FILE),
        logoAlt: d.header?.logoAlt ?? d.header?.name ?? 'Logo',
        name: d.header?.name ?? '',
        color: d.header?.color,
        nav: ((d.header?.nav ?? []) as Raw[]).map((item) => navItem(ctx, item, locale)),
      },
      homepage: { showCalendarWidget: Boolean(d.homepage?.showCalendarWidget) },
      footer: {
        social: ((d.footer?.social ?? []) as Raw[]).map((s) => ({ platform: s.platform, url: s.url })),
        quickLinks: ((d.footer?.quickLinks ?? []) as Raw[]).map((q) => ({
          title: q.title,
          links: ((q.links ?? []) as Raw[]).map((l) => link(ctx, l)),
        })),
      },
      theme: { color: d.theme?.color, font: d.theme?.font, darkMode: d.theme?.darkMode },
    })

    const existing = await ctx.payload.find({
      collection: 'site-settings',
      where: { tenant: { equals: ctx.tenantId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const found = existing.docs[0] as { id: number | string } | undefined
    const saved = found
      ? await ctx.payload.update({
          collection: 'site-settings',
          id: found.id,
          locale: 'en',
          data: base('en') as never,
          ...WRITE,
        })
      : await ctx.payload.create({
          collection: 'site-settings',
          locale: 'en',
          data: { ...base('en'), tenant: ctx.tenantId } as never,
          ...WRITE,
        })

    // Dutch labels live on the same array rows, so the rows are addressed by id.
    const hasDutch = ((d.header?.nav ?? []) as Raw[]).some(
      (item) => item.labelNl || ((item.submenu ?? []) as Raw[]).some((s) => s.labelNl),
    )
    if (hasDutch) {
      const savedNav = ((saved as Raw).header?.nav ?? []) as Raw[]
      const nlNav = base('nl').header.nav.map((item, i) => ({
        ...item,
        id: savedNav[i]?.id,
        submenu: (item.submenu as Raw[]).map((sub, j) => ({ ...sub, id: savedNav[i]?.submenu?.[j]?.id })),
      }))
      await ctx.payload.update({
        collection: 'site-settings',
        id: (saved as { id: number | string }).id,
        locale: 'nl',
        data: { header: { nav: nlNav } } as never,
        ...WRITE,
      })
    }
  } catch (err) {
    ctx.report.add('error', SETTINGS_FILE, (err as Error).message)
  }
}

export async function importRedirects(ctx: Ctx, contentDir: string): Promise<void> {
  for (const rel of listContent(contentDir, 'redirects')) {
    try {
      const d = readTinaFile(contentDir, rel).data
      const existing = await ctx.payload.find({
        collection: 'redirects',
        where: { and: [{ from: { equals: d.from } }, { tenant: { equals: ctx.tenantId } }] },
        limit: 1,
        overrideAccess: true,
      })
      const data = { from: d.from, to: d.to, permanent: Boolean(d.permanent), note: d.note }
      if (existing.docs[0]) {
        await ctx.payload.update({ collection: 'redirects', id: existing.docs[0].id, data: data as never, ...WRITE })
      } else {
        await ctx.payload.create({
          collection: 'redirects',
          data: { ...data, tenant: ctx.tenantId } as never,
          ...WRITE,
        })
      }
    } catch (err) {
      ctx.report.add('error', rel, (err as Error).message)
    }
  }
}
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @sites/migrate-tina typecheck`
Expected: exit code 0. Do not commit yet. Task 8 adds the test and commits both.

---

### Task 8: Runner and end-to-end test on a fixture site

**Files:**
- Create: `tools/migrate-tina/src/migrate.ts`, `src/run.ts`
- Create: `tools/migrate-tina/test/fixtures/site/content/**`, `test/fixtures/site/uploads/**`
- Test: `tools/migrate-tina/test/migrate.int.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 1 to 7, and `testPayload`, `resetDb`, `createTenant` from `@sites/cms/testing`.
- Produces:
  - `migrate(input: { payload: Payload; tenantSlug: string; contentDir: string; uploadsDir: string }): Promise<Report>`
  - CLI: `pnpm --filter @sites/migrate-tina migrate`, configured by `TENANT_SLUG`, `CONTENT_DIR`, `UPLOADS_DIR`, `REPORT_PATH`.

- [ ] **Step 1: Create the fixture site**

```bash
cd tools/migrate-tina
F=test/fixtures/site
mkdir -p $F/content/pages/en/about-us $F/content/pages/nl/over-ons \
  $F/content/pages/en/activities/calendar-sections $F/content/pages/nl/activiteiten/agenda-secties \
  $F/content/events/en $F/content/events/nl $F/content/speakers $F/content/authors $F/content/tags \
  $F/content/past-events $F/content/newsletters/en $F/content/vacancies/en \
  $F/content/global $F/content/redirects $F/uploads/branding

printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' \
  | base64 -d > $F/uploads/hero.png
cp $F/uploads/hero.png $F/uploads/branding/logo.png

cat > $F/content/pages/en/home.mdx <<'MD'
---
title: Home
blocks:
  - headline: Who is Boerengroep?
    tagline: Welcome
    image:
      src: /uploads/hero.png
      alt: Field
    _template: hero
---
MD
cat > $F/content/pages/nl/home.mdx <<'MD'
---
title: Start
blocks:
  - headline: Wie is Boerengroep?
    _template: hero
---
MD
cat > $F/content/pages/en/about-us/index.mdx <<'MD'
---
title: About us
---
MD
cat > $F/content/pages/nl/over-ons/index.mdx <<'MD'
---
title: Over ons
---
MD
cat > $F/content/pages/en/about-us/history.mdx <<'MD'
---
title: Our History
previousUrls:
  - /history
blocks:
  - body: >
      Since **1971** we connect people.
    _template: content
  - image:
      src: /uploads/missing.jpg
    _template: hero
---
MD
cat > $F/content/pages/nl/over-ons/geschiedenis.mdx <<'MD'
---
title: Geschiedenis
blocks:
  - body: >
      Sinds **1971** verbinden wij mensen.
    _template: content
---
MD
cat > $F/content/pages/en/activities/calendar-sections/breaks.mdx <<'MD'
---
title: Breaks
---

Body with ![a cow](/uploads/hero.png) inline.
MD
cat > $F/content/pages/nl/activiteiten/agenda-secties/breaks.mdx <<'MD'
---
title: Pauzes
---
MD
cat > $F/content/pages/en/accessibility.mdx <<'MD'
---
title: Accessibility
---
MD
cat > $F/content/speakers/maria.md <<'MD'
---
name: Dr. Maria van der Meer
affiliation: WUR
---
MD
cat > $F/content/authors/Cami.md <<'MD'
---
name: Cami
---
MD
cat > $F/content/tags/weekend.mdx <<'MD'
---
name: weekend
---
MD
cat > $F/content/events/en/Boerengroep-Weekend.mdx <<'MD'
---
title: Boerengroep Weekend
startDate: 2025-09-01T10:00:00.000Z
eventType: workshop
image: /uploads/hero.png
speakers:
  - speaker: content/speakers/maria.md
    role: Host
  - speaker: content/speakers/ghost.md
---
MD
cat > $F/content/events/nl/soepkeuken.mdx <<'MD'
---
title: Soepkeuken
startDate: 2025-10-01T17:00:00.000Z
eventType: soup-kitchen
---
MD
cat > $F/content/past-events/Boerengroep-Weekend.mdx <<'MD'
---
title: Weekend recap
date: 2025-09-03T10:00:00.000Z
author: content/authors/Cami.md
relatedEvent: content/events/en/Boerengroep-Weekend.mdx
tags:
  - tag: content/tags/weekend.mdx
---

It was **great**.
MD
cat > $F/content/newsletters/en/Newsletter-1.mdx <<'MD'
---
title: Newsletter 1
type: article
organization: Boerengroep
publishDate: 2026-01-10T09:00:00.000Z
published: false
body:
  - text: Read on
    url: https://example.org
    _template: callout
---
MD
cat > $F/content/vacancies/en/General-Board-Member.mdx <<'MD'
---
title: General Board Member
opportunityType: board
requiredSkills:
  - organising
description: >
  Join the **board**.
---
MD
cat > $F/content/global/index.json <<'JSON'
{
  "header": {
    "logo": "/uploads/branding/logo.png",
    "logoAlt": "Boerengroep",
    "name": "Stichting Boerengroep",
    "nav": [
      {
        "href": "/about-us",
        "label": "about-us",
        "submenu": [
          { "href": "/about-us/history", "label": "history" },
          { "href": "/activities/calendar", "label": "calendar" }
        ]
      }
    ]
  },
  "footer": {
    "social": [{ "platform": "Instagram", "url": "https://instagram.com/x" }],
    "quickLinks": [{ "title": "about-us", "links": [{ "href": "/about-us/history", "label": "history" }] }]
  },
  "theme": { "color": "green", "font": "lato", "darkMode": "light" }
}
JSON
cat > $F/content/redirects/old-contact.json <<'JSON'
{ "from": "/old-contact", "to": "/contact", "permanent": true, "note": "renamed" }
JSON
cd ../..
```

- [ ] **Step 2: Write the failing test `test/migrate.int.test.ts`**

```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createTenant, resetDb, testPayload } from '@sites/cms/testing'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { migrate } from '../src/migrate'
import type { Report } from '../src/report'

const site = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/site')
const input = (payload: Payload) => ({
  payload,
  tenantSlug: 'boerengroep',
  contentDir: path.join(site, 'content'),
  uploadsDir: path.join(site, 'uploads'),
})

const COLLECTIONS = [
  'pages',
  'events',
  'past-events',
  'newsletters',
  'vacancies',
  'speakers',
  'authors',
  'tags',
  'media',
  'redirects',
  'site-settings',
] as const

async function counts(payload: Payload) {
  const out: Record<string, number> = {}
  for (const c of COLLECTIONS) {
    out[c] = (await payload.find({ collection: c, limit: 0, draft: true, overrideAccess: true })).totalDocs
  }
  return out
}

async function pageByLegacy(payload: Payload, key: string, locale: 'en' | 'nl') {
  const res = await payload.find({
    collection: 'pages',
    where: { legacyId: { equals: `pages/${key}` } },
    locale,
    fallbackLocale: false as never,
    depth: 1,
    draft: true,
    overrideAccess: true,
  })
  return res.docs[0] as any
}

let payload: Payload
let report: Report
let otherTenant: number | string

describe('migrate', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    await createTenant(payload, 'boerengroep')
    otherTenant = (await createTenant(payload, 'inspringtheater')).id
    await payload.create({
      collection: 'tags',
      data: { name: 'untouched', tenant: otherTenant } as never,
      overrideAccess: true,
    })
    report = await migrate(input(payload))
  })
  afterAll(async () => resetDb(payload))

  it('imports every collection', async () => {
    expect(await counts(payload)).toEqual({
      pages: 7,
      events: 2,
      'past-events': 1,
      newsletters: 1,
      vacancies: 1,
      speakers: 1,
      authors: 1,
      tags: 2,
      media: 2,
      redirects: 2,
      'site-settings': 1,
    })
  })

  it('builds localized paths for a paired page', async () => {
    expect((await pageByLegacy(payload, 'about-us/history', 'en')).path).toBe('/about-us/history')
    const nl = await pageByLegacy(payload, 'about-us/history', 'nl')
    expect(nl.path).toBe('/over-ons/geschiedenis')
    expect(nl.title).toBe('Geschiedenis')
  })

  it('maps the home page to the root in both locales', async () => {
    expect((await pageByLegacy(payload, 'home', 'en')).path).toBe('/')
    expect((await pageByLegacy(payload, 'home', 'nl')).path).toBe('/')
  })

  it('keeps child URLs under a folder without its own page', async () => {
    const parent = await pageByLegacy(payload, 'activities/calendar-sections', 'en')
    expect(parent._status).toBe('draft')
    expect((await pageByLegacy(payload, 'activities/calendar-sections/breaks', 'en')).path).toBe(
      '/activities/calendar-sections/breaks',
    )
    expect((await pageByLegacy(payload, 'activities/calendar-sections/breaks', 'nl')).path).toBe(
      '/activiteiten/agenda-secties/breaks',
    )
  })

  it('links block images and converts block rich text', async () => {
    const home = await pageByLegacy(payload, 'home', 'en')
    expect(home.blocks[0].blockType).toBe('hero')
    expect(home.blocks[0].image.src.legacyPath).toBe('/uploads/hero.png')
    const history = await pageByLegacy(payload, 'about-us/history', 'en')
    expect(JSON.stringify(history.blocks[0].body)).toContain('1971')
  })

  it('keeps different block lists per locale', async () => {
    expect((await pageByLegacy(payload, 'about-us/history', 'en')).blocks).toHaveLength(2)
    expect((await pageByLegacy(payload, 'about-us/history', 'nl')).blocks).toHaveLength(1)
  })

  it('resolves references between collections', async () => {
    const events = await payload.find({
      collection: 'events',
      where: { slug: { equals: 'Boerengroep-Weekend' } },
      depth: 1,
    })
    const event = events.docs[0] as any
    expect(event.language).toBe('en')
    expect(event.speakers[0].speaker.name).toBe('Dr. Maria van der Meer')
    expect(event.speakers[0].role).toBe('Host')

    const recap = (await payload.find({ collection: 'past-events', depth: 1 })).docs[0] as any
    expect(recap.author.name).toBe('Cami')
    expect(recap.relatedEvent.slug).toBe('Boerengroep-Weekend')
    expect(recap.tags[0].name).toBe('weekend')
    expect(recap.language).toBeFalsy()
    expect(JSON.stringify(recap.body)).toContain('great')
  })

  it('imports an unpublished newsletter as a draft', async () => {
    const res = await payload.find({ collection: 'newsletters', draft: true, overrideAccess: true })
    expect((res.docs[0] as any)._status).toBe('draft')
    expect((res.docs[0] as any).body[0].blockType).toBe('callout')
  })

  it('links navigation items to pages when the href is a page path', async () => {
    const settings = (await payload.find({ collection: 'site-settings', depth: 1 })).docs[0] as any
    const about = settings.header.nav[0]
    expect(about.page.path).toBe('/about-us')
    expect(about.submenu[0].page.path).toBe('/about-us/history')
    expect(about.submenu[1].page).toBeFalsy()
    expect(about.submenu[1].href).toBe('/activities/calendar')
    expect(settings.header.logo.legacyPath).toBe('/uploads/branding/logo.png')
    expect(settings.theme.font).toBe('lato')
  })

  it('creates redirects from the redirects folder and from previous page URLs', async () => {
    const res = await payload.find({ collection: 'redirects', sort: 'from' })
    expect(res.docs.map((d: any) => [d.from, d.to])).toEqual([
      ['/history', '/about-us/history'],
      ['/old-contact', '/contact'],
    ])
  })

  it('reports what needs a human', () => {
    const kinds = (k: string) => report.entries.filter((e) => e.kind === k).map((e) => e.legacyId)
    expect(kinds('missing-media')).toEqual(['pages/en/about-us/history.mdx'])
    expect(kinds('unresolved-reference')).toEqual(['events/en/Boerengroep-Weekend.mdx'])
    expect(kinds('inline-image')).toEqual(['pages/en/activities/calendar-sections/breaks.mdx'])
    expect(kinds('unpaired-locale')).toEqual(['pages/en/accessibility.mdx'])
    expect(kinds('placeholder-parent')).toHaveLength(2)
    expect(report.failed).toBe(false)
  })

  it('changes nothing when it runs a second time', async () => {
    const before = await counts(payload)
    const second = await migrate(input(payload))
    expect(await counts(payload)).toEqual(before)
    expect(second.failed).toBe(false)
  })

  it('leaves the other tenant alone', async () => {
    const res = await payload.find({ collection: 'tags', where: { tenant: { equals: otherTenant } } })
    expect(res.docs.map((d: any) => d.name)).toEqual(['untouched'])
  })

  it('refuses to run for a tenant that does not exist', async () => {
    await expect(migrate({ ...input(payload), tenantSlug: 'nope' })).rejects.toThrow(/Tenant "nope" not found/)
  })
})
```

The page count of 7 is: `home`, `about-us`, `about-us/history`, `accessibility`, the placeholder `activities`, the placeholder `activities/calendar-sections`, and `activities/calendar-sections/breaks`. The tag count of 2 is one imported tag plus the other tenant's tag.

- [ ] **Step 3: Run it and watch it fail**

Run: `pnpm --filter @sites/cms exec docker compose up -d --wait && pnpm --filter @sites/migrate-tina test:int`
Expected: FAIL, module `../src/migrate` not found.

- [ ] **Step 4: Write `src/migrate.ts`**

```ts
import type { Payload } from 'payload'
import {
  importEvents,
  importNewsletters,
  importPastEvents,
  importPeople,
  importVacancies,
} from './collections'
import type { Ctx } from './context'
import { uploadAll } from './media'
import { importPages } from './pages'
import { Report } from './report'
import { makeToLexical } from './richtext'
import { importRedirects, importSettings } from './settings'

export type MigrateInput = {
  payload: Payload
  tenantSlug: string
  contentDir: string
  uploadsDir: string
}

export async function migrate(input: MigrateInput): Promise<Report> {
  const { payload, tenantSlug, contentDir, uploadsDir } = input
  const tenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: tenantSlug } },
    limit: 1,
    overrideAccess: true,
  })
  const tenant = tenants.docs[0]
  if (!tenant) throw new Error(`Tenant "${tenantSlug}" not found. Run the seed first.`)

  const report = new Report()
  const ctx: Ctx = {
    payload,
    tenantId: tenant.id,
    report,
    media: await uploadAll({ payload, tenantId: tenant.id, report }, uploadsDir),
    ids: new Map(),
    pageByEnPath: new Map(),
    toLexical: await makeToLexical(payload, report),
  }

  // Order matters: referenced collections first, pages before settings.
  await importPeople(ctx, contentDir)
  await importEvents(ctx, contentDir)
  await importVacancies(ctx, contentDir)
  await importNewsletters(ctx, contentDir)
  await importPastEvents(ctx, contentDir)
  await importPages(ctx, contentDir)
  await importSettings(ctx, contentDir)
  await importRedirects(ctx, contentDir)

  return report
}
```

- [ ] **Step 5: Write `src/run.ts`**

```ts
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import { migrate } from './migrate'
import config from './payload.config'

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}`)
  return value
}

const payload = await getPayload({ config })
const report = await migrate({
  payload,
  tenantSlug: env('TENANT_SLUG'),
  contentDir: path.resolve(env('CONTENT_DIR')),
  uploadsDir: path.resolve(env('UPLOADS_DIR')),
})

const reportPath = path.resolve(process.env.REPORT_PATH ?? 'migration-report.md')
writeFileSync(reportPath, report.toMarkdown())
payload.logger.info(`Migration finished with ${report.count()} report entries. Report: ${reportPath}`)
process.exit(report.failed ? 1 : 0)
```

- [ ] **Step 6: Run all tests**

Run: `pnpm --filter @sites/migrate-tina test && pnpm --filter @sites/migrate-tina test:int`
Expected: all pass.

If a second-run assertion fails on `pages`, the usual cause is the `clash` check in `computePath` matching the document against itself in the other locale. The check excludes `originalDoc.id`, so confirm `upsert` found the existing document by `legacyId` with `draft: true`.

- [ ] **Step 7: Add the int tests to CI and commit**

In `.github/workflows/ci.yml` add this step after the existing `vitest run --project int` step:

```yaml
      - run: pnpm --filter @sites/migrate-tina exec vitest run --project int
```

```bash
git add -A
git commit -m "feat(migrate): importers, runner and end-to-end test on a fixture site"
```

---

### Task 9: Dry run against the real Boerengroep content

**Files:**
- Create: `docs/migration/2026-boerengroep-dry-run-report.md` (the generated report, committed for review)

**Interfaces:**
- Consumes: the CLI from Task 8, the seed from Plan A Task 10.
- Produces: a local database holding the full Boerengroep content, and a reviewed report. Plan C develops the frontend against this database.

- [ ] **Step 1: Create a fresh local database and apply the migrations**

```bash
docker exec $(docker compose -f packages/cms/docker-compose.yml ps -q postgres) \
  psql -U payload -d postgres -c 'DROP DATABASE IF EXISTS payload_dev;' -c 'CREATE DATABASE payload_dev;'
export PAYLOAD_SECRET=dev
export PAYLOAD_DATABASE_URL=postgres://payload:payload@127.0.0.1:54329/payload_dev
export TENANT_SLUG=boerengroep
cd packages/cms
PAYLOAD_CONFIG_PATH=src/dev.config.ts NODE_ENV=production pnpm payload migrate
SEED_TENANT_NAME="Stichting Boerengroep" SEED_SITE_URL=http://localhost:3000 REVALIDATE_SECRET=local \
  SEED_ADMIN_EMAIL=you@example.org SEED_ADMIN_PASSWORD=change-me-now pnpm seed
cd ../..
```

Expected: `migrate` reports the `initial` migration as applied, and the seed logs a tenant id and an admin id.

- [ ] **Step 2: Run the migration**

```bash
mkdir -p docs/migration
CONTENT_DIR=apps/boerengroep/content UPLOADS_DIR=apps/boerengroep/public/uploads \
REPORT_PATH=docs/migration/2026-boerengroep-dry-run-report.md \
pnpm --filter @sites/migrate-tina migrate
echo "exit code: $?"
```

Expected: exit code 0. If it is 1, open the report, fix the cause of each `error` entry in the tool, add a unit test for that case, and rerun. Do not edit content to make an error go away without recording it in the report review below.

- [ ] **Step 3: Check the counts against the source**

```bash
count() { find "apps/boerengroep/content/$1" -type f \( -name '*.md' -o -name '*.mdx' -o -name '*.json' \) ! -name '.*' | wc -l; }
for c in events newsletters vacancies past-events speakers authors; do echo "$c source=$(count $c)"; done
echo "uploads source=$(find apps/boerengroep/public/uploads -type f ! -name '.*' | wc -l)"
docker exec $(docker compose -f packages/cms/docker-compose.yml ps -q postgres) psql -U payload -d payload_dev -Atc "
select 'events', count(*) from events union all
select 'newsletters', count(*) from newsletters union all
select 'vacancies', count(*) from vacancies union all
select 'past-events', count(*) from past_events union all
select 'speakers', count(*) from speakers union all
select 'authors', count(*) from authors union all
select 'media', count(*) from media union all
select 'pages', count(*) from pages;"
```

Expected: each database count equals its source count. `tags` is excluded because the three Tina starter tags are imported but unused. `pages` equals the number of plans printed in Task 6 Step 5.

- [ ] **Step 4: Run it a second time**

Run the command from Step 2 again, then the SQL from Step 3.
Expected: identical counts.

- [ ] **Step 5: Review the report with the site owner**

Open `docs/migration/2026-boerengroep-dry-run-report.md`. For every entry, write one of these directly under it:

- `fixed in tool`, when the tool was wrong and has been corrected.
- `fix in admin after cutover`, for inline images and missing media.
- `accepted`, for unpaired locales, placeholders and skipped files that are intended.

Known entries to expect: `content/pages/about.mdx` and `content/pages/test-page.en.mdx` skipped, `pages/en/index.mdx` shadowed by `home`, three inline images, a placeholder for `activities/calendar-sections`, and `/uploads/1234.jpg` missing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs(migrate): reviewed dry-run report for Boerengroep content"
```

---

## Done when

- `pnpm --filter @sites/migrate-tina test` and `test:int` pass.
- The local `payload_dev` database holds all Boerengroep content, and counts match the source.
- A second run changes nothing.
- The report has no `error` entries and every other entry has a written decision.

Next: Plan C switches the public site to read from Payload and cuts over.
