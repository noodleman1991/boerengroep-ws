# Plan A: Monorepo Foundation and Shared CMS Package

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn this repository into a monorepo, upgrade the Boerengroep app to React 19, and build the shared, multi-tenant Payload package with a working admin panel at `/admin`.

**Architecture:** The existing Next app moves unchanged to `apps/boerengroep` and keeps running on TinaCMS. A new `packages/cms` holds the whole Payload schema behind one factory, `createPayloadConfig`, and is mounted in the app. Nothing on the public site reads from Payload yet. That happens in Plan C.

**Tech Stack:** pnpm workspaces with a catalog, Turborepo, Next 15.4, React 19, Payload 3.90.2, `@payloadcms/db-postgres`, `@payloadcms/plugin-multi-tenant`, `@payloadcms/storage-vercel-blob`, Lexical, Vitest, Docker Postgres for tests.

**Spec:** `docs/superpowers/specs/2026-10-03-payload-multi-tenant-migration-design.md`. Section 16 of the spec overrides earlier sections.

**Plan series:** A (this file), then `2026-10-03-plan-b-content-migration.md`, then `2026-10-03-plan-c-frontend-cutover.md`.

## Global Constraints

- All work happens on the branch `payload-migration`. `main` keeps deploying the Tina site.
- Every `@payloadcms/*` package and `payload` are pinned to exactly `3.90.2` through the pnpm catalog. Never add one with a caret.
- Next is `~15.4.11`. React and React DOM are `^19.1.0`. Node is 22.
- Package names: `boerengroep` (app), `@sites/cms`, later `@sites/ui`, `@sites/core`, `@sites/migrate-tina`.
- Only `packages/cms` imports `payload` or `@payloadcms/*` schema APIs. The app imports `@sites/cms`.
- Environment variable names: `PAYLOAD_SECRET`, `PAYLOAD_DATABASE_URL`, `TENANT_SLUG`, `BLOB_READ_WRITE_TOKEN`. `DATABASE_URL` stays reserved for the subscriber database.
- Locales are `en` and `nl`, default `en`, fallback on.
- Tenant slugs are `boerengroep` and `inspringtheater`.
- Production never pushes schema. Migrations are committed in `packages/cms/src/migrations`.
- Payload API calls in this plan were written against the 3.90 documentation and were not executed. If an installed type signature differs, keep the behaviour and the test, and adapt the call.
- Commit after every task with the message given. Do not push unless asked.

## Review Focus

1. **A tenant admin grants access to a tenant they do not administer.** Expected: the save is rejected. Pinned in Task 4.
2. **Two pages in one tenant end up with the same path in one locale.** Expected: the second save fails with a readable message. Pinned in Task 7.
3. **A parent page's slug changes.** Expected: every descendant's path updates in that locale, and other locales are untouched. Pinned in Task 7.
4. **An editor of one tenant reads or edits the other tenant's documents through the API.** Expected: nothing is returned and writes are refused. Pinned in Task 4.
5. **A migration drops or renames a column while the other app still reads it.** Expected: CI fails unless the migration is explicitly marked as a contract step. Pinned in Task 10.

## File Structure

```
package.json                      root workspace scripts
pnpm-workspace.yaml               workspaces + version catalog
turbo.json
apps/boerengroep/                 the existing app, moved
  payload.config.ts               calls createPayloadConfig
  app/(payload)/...               Payload admin and REST routes
  scripts/migrate-if-production.mjs
packages/cms/
  package.json, tsconfig.json, vitest.config.ts, docker-compose.yml
  src/index.ts                    public exports
  src/config.ts                   createPayloadConfig
  src/dev.config.ts               config used by CLI, type generation, tests
  src/env.ts                      requireEnv
  src/access/roles.ts             pure role helpers
  src/access/index.ts             Payload access functions
  src/fields/shared.ts            background, icon, actions, language, slug, legacyId
  src/blocks/*.ts                 one file per block + index.ts
  src/collections/*.ts            one file per collection
  src/hooks/page-path.ts          buildPath, computePath, resaveChildren
  src/seed.ts                     ensureTenantAndAdmin
  src/bin/seed.ts                 CLI entry for the seed
  src/migrations/                 generated
  src/payload-types.ts            generated
  test/setup-env.ts, test/helpers.ts, test/*.int.test.ts
tools/check-migrations/
  find-destructive.mjs, find-destructive.test.mjs, run.mjs
.github/workflows/ci.yml
```

---

### Task 1: Convert the repository to a monorepo

**Files:**
- Create: `package.json` (new root), `pnpm-workspace.yaml`, `turbo.json`
- Move: everything app-related into `apps/boerengroep/`
- Modify: `apps/boerengroep/package.json`, `.gitignore`

**Interfaces:**
- Produces: workspace package `boerengroep` with scripts `dev`, `build`, `build-local`, `typecheck`. Root scripts `pnpm build`, `pnpm typecheck`, `pnpm test`.

- [ ] **Step 1: Record the baseline on `main`**

Run: `pnpm install && pnpm build-local`
Expected: the build finishes with exit code 0. If it fails, stop and report the output. Do not continue on a broken baseline.

- [ ] **Step 2: Create the branch and move the app**

```bash
git checkout -b payload-migration
mkdir -p apps/boerengroep packages tools
git mv app components content i18n lib messages public scripts tina drizzle apps/boerengroep/
git mv components.json drizzle.config.ts generate-block-previews.sh graphql.config.js \
  middleware.ts next.config.base.js next.config.ts postcss.config.js styles.css \
  tailwind.config.ts tsconfig.json vercel.json package.json apps/boerengroep/
git rm --cached tsconfig.tsbuildinfo build.log dev.log
rm -f tsconfig.tsbuildinfo build.log dev.log
[ -f .env ] && mv .env apps/boerengroep/.env
[ -f .env.local ] && mv .env.local apps/boerengroep/.env.local
rm -rf node_modules .next
```

`biome.json`, `.nvmrc`, `LICENSE`, `docs/`, `.github/` and `pnpm-lock.yaml` stay at the root.

- [ ] **Step 3: Write the root `package.json`**

```json
{
  "name": "sites-platform",
  "private": true,
  "packageManager": "pnpm@10.18.2",
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "test:int": "turbo run test:int",
    "lint": "biome lint"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4",
    "turbo": "^2.5.0",
    "typescript": "^5.8.3"
  },
  "pnpm": {
    "overrides": {
      "@udecode/plate-core": "^48.0.5"
    }
  }
}
```

- [ ] **Step 4: Write `pnpm-workspace.yaml`**

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tools/*"

catalog:
  payload: 3.90.2
  "@payloadcms/next": 3.90.2
  "@payloadcms/db-postgres": 3.90.2
  "@payloadcms/richtext-lexical": 3.90.2
  "@payloadcms/plugin-multi-tenant": 3.90.2
  "@payloadcms/storage-vercel-blob": 3.90.2
  "@payloadcms/live-preview-react": 3.90.2
  "@payloadcms/ui": 3.90.2
  next: ~15.4.11
  react: ^19.1.0
  react-dom: ^19.1.0
  typescript: ^5.8.3
  vitest: ^3.2.0
```

- [ ] **Step 5: Write `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "!.next/cache/**"] },
    "dev": { "cache": false, "persistent": true },
    "typecheck": { "dependsOn": ["^typecheck"] },
    "test": {},
    "test:int": { "cache": false }
  }
}
```

- [ ] **Step 6: Edit `apps/boerengroep/package.json`**

Change `"name": "Stichting Boerengroep"` to `"name": "boerengroep"`. Delete the whole `"resolutions"` block, because it now lives in the root `pnpm.overrides`. Remove `@biomejs/biome` from `devDependencies`. Add this script next to the others:

```json
"typecheck": "tsc --noEmit"
```

- [ ] **Step 7: Replace `.gitignore` at the root**

```gitignore
node_modules
.pnp
.pnp.js
coverage
.next/
out/
build/
next-env.d.ts
*.tsbuildinfo
.turbo
.DS_Store
.env
.env.local
.env.*.local
.idea
*.log
# Payload local uploads used when no Blob token is set
media/
```

- [ ] **Step 8: Install and verify the moved app still builds**

Run: `pnpm install && pnpm --filter boerengroep build-local`
Expected: exit code 0, same route list as the baseline in Step 1.

Run: `pnpm --filter boerengroep typecheck`
Expected: exit code 0. If the baseline had type errors, record their count here and treat that count as the ceiling for later tasks.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: convert repository to pnpm monorepo, app moves to apps/boerengroep"
```

---

### Task 2: Upgrade the app to React 19 and Next 15.4

**Files:**
- Modify: `apps/boerengroep/package.json`

**Interfaces:**
- Produces: an app on `react@19`, `next@~15.4.11` that still builds with Tina.

- [ ] **Step 1: Point the framework dependencies at the catalog**

In `apps/boerengroep/package.json` set these exact values:

```json
"next": "catalog:",
"react": "catalog:",
"react-dom": "catalog:"
```

and in `devDependencies`:

```json
"@types/react": "^19.1.0",
"@types/react-dom": "^19.1.0",
"typescript": "catalog:"
```

- [ ] **Step 2: Install and run the React 19 type codemod**

```bash
pnpm install
npx types-react-codemod@latest preset-19 apps/boerengroep
```

- [ ] **Step 3: Build**

Run: `pnpm --filter boerengroep build-local`
Expected: exit code 0.

If the build fails inside `tinacms` or `@tinacms/cli`, run
`pnpm --filter boerengroep add tinacms@latest && pnpm --filter boerengroep add -D @tinacms/cli@latest`
and build again. If it still fails, stop and report the error. Do not work around it.

- [ ] **Step 4: Smoke test the running site**

```bash
pnpm --filter boerengroep dev &
sleep 25
for p in /en /nl /en/about-us/history /nl/over-ons/geschiedenis /en/activities/calendar; do
  echo "$p $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000$p)"
done
kill %1
```

Expected: every line ends in `200`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: upgrade boerengroep app to React 19 and Next 15.4"
```

---

### Task 3: CMS package skeleton with tenants, users and a test database

**Files:**
- Create: `packages/cms/package.json`, `packages/cms/tsconfig.json`, `packages/cms/vitest.config.ts`, `packages/cms/docker-compose.yml`
- Create: `packages/cms/src/env.ts`, `packages/cms/src/config.ts`, `packages/cms/src/dev.config.ts`, `packages/cms/src/index.ts`
- Create: `packages/cms/src/collections/tenants.ts`, `packages/cms/src/collections/users.ts`
- Create: `packages/cms/test/setup-env.ts`, `packages/cms/test/helpers.ts`
- Test: `packages/cms/test/boot.int.test.ts`

**Interfaces:**
- Produces:
  - `createPayloadConfig(opts: CreateConfigOptions): Promise<SanitizedConfig>` where
    `type CreateConfigOptions = { tenantSlug: string; revalidateLocal?: (tags: string[]) => void | Promise<void> }`
  - `testPayload(): Promise<Payload>` and `resetDb(payload: Payload): Promise<void>` in `test/helpers.ts`
  - `createTenant(payload, slug): Promise<Tenant>` in `test/helpers.ts`
  - Collections `tenants` and `users`

- [ ] **Step 1: Write `packages/cms/package.json`**

```json
{
  "name": "@sites/cms",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/payload-types.ts",
    "./queries": "./src/queries/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run --project unit",
    "test:int": "docker compose up -d --wait && vitest run --project int",
    "generate:types": "PAYLOAD_CONFIG_PATH=src/dev.config.ts payload generate:types",
    "migrate:create": "PAYLOAD_CONFIG_PATH=src/dev.config.ts payload migrate:create"
  },
  "dependencies": {
    "@payloadcms/db-postgres": "catalog:",
    "@payloadcms/plugin-multi-tenant": "catalog:",
    "@payloadcms/richtext-lexical": "catalog:",
    "@payloadcms/storage-vercel-blob": "catalog:",
    "payload": "catalog:",
    "sharp": "^0.34.0"
  },
  "devDependencies": {
    "@types/node": "^22.16.0",
    "typescript": "catalog:",
    "vitest": "catalog:"
  }
}
```

- [ ] **Step 2: Write `packages/cms/tsconfig.json`**

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

- [ ] **Step 3: Write `packages/cms/docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_USER: payload
      POSTGRES_PASSWORD: payload
      POSTGRES_DB: payload_test
    ports:
      - "54329:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U payload -d payload_test"]
      interval: 2s
      timeout: 3s
      retries: 20
```

- [ ] **Step 4: Write `packages/cms/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: { name: 'unit', environment: 'node', include: ['src/**/*.test.ts'] },
      },
      {
        test: {
          name: 'int',
          environment: 'node',
          include: ['test/**/*.int.test.ts'],
          setupFiles: ['test/setup-env.ts'],
          fileParallelism: false,
          hookTimeout: 120_000,
          testTimeout: 30_000,
        },
      },
    ],
  },
})
```

- [ ] **Step 5: Write `packages/cms/test/setup-env.ts`**

```ts
process.env.PAYLOAD_DATABASE_URL ??= 'postgres://payload:payload@127.0.0.1:54329/payload_test'
process.env.PAYLOAD_SECRET ??= 'test-secret-not-for-production'
process.env.TENANT_SLUG ??= 'boerengroep'
```

- [ ] **Step 6: Write `packages/cms/src/env.ts`**

```ts
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}`)
  return value
}
```

- [ ] **Step 7: Write `packages/cms/src/collections/tenants.ts`**

Access rules are added in Task 4. Until then the collection is open to logged-in users.

```ts
import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: { useAsTitle: 'name', group: 'Platform' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'siteUrl',
      type: 'text',
      required: true,
      admin: { description: 'Public origin of this site, for example https://www.example.org' },
    },
    {
      name: 'revalidateSecret',
      type: 'text',
      required: true,
      admin: { description: 'Shared secret the other site sends when it asks this site to refresh its cache.' },
    },
  ],
}
```

- [ ] **Step 8: Write `packages/cms/src/collections/users.ts`**

```ts
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email', group: 'Platform' },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['user'],
      saveToJWT: true,
      options: [
        { label: 'Super admin', value: 'super-admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ],
}
```

- [ ] **Step 9: Write `packages/cms/src/config.ts`**

```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig, type CollectionConfig } from 'payload'
import sharp from 'sharp'
import { Tenants } from './collections/tenants'
import { Users } from './collections/users'
import { requireEnv } from './env'

export type CreateConfigOptions = {
  /** The tenant this app serves. */
  tenantSlug: string
  /** Called with cache tags when a document of this app's own tenant changes. */
  revalidateLocal?: (tags: string[]) => void | Promise<void>
}

export type CmsCustom = CreateConfigOptions

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** Collections that carry a `tenant` field. Extended in later tasks. */
export const tenantScoped: CollectionConfig[] = []

/** Slugs of tenant-scoped collections that hold exactly one document per tenant. */
export const onePerTenant: string[] = []

export function createPayloadConfig(opts: CreateConfigOptions) {
  const scoped = Object.fromEntries(
    tenantScoped.map((c) => [c.slug, onePerTenant.includes(c.slug) ? { isGlobal: true } : {}]),
  )

  return buildConfig({
    secret: requireEnv('PAYLOAD_SECRET'),
    custom: opts satisfies CmsCustom,
    admin: { user: Users.slug },
    collections: [...tenantScoped, Users, Tenants],
    editor: lexicalEditor(),
    db: postgresAdapter({
      pool: { connectionString: requireEnv('PAYLOAD_DATABASE_URL') },
      migrationDir: path.resolve(dirname, 'migrations'),
    }),
    localization: {
      locales: [
        { code: 'en', label: 'English' },
        { code: 'nl', label: 'Nederlands' },
      ],
      defaultLocale: 'en',
      fallback: true,
    },
    plugins: [
      multiTenantPlugin({
        tenantsSlug: Tenants.slug,
        collections: scoped,
        tenantsArrayField: {
          rowFields: [
            {
              name: 'roles',
              type: 'select',
              hasMany: true,
              required: true,
              defaultValue: ['editor'],
              options: [
                { label: 'Tenant admin', value: 'tenant-admin' },
                { label: 'Editor', value: 'editor' },
              ],
            },
          ],
        },
        userHasAccessToAllTenants: (user) =>
          Array.isArray((user as { roles?: string[] } | null)?.roles) &&
          (user as { roles: string[] }).roles.includes('super-admin'),
      }),
    ],
    typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
    sharp,
  })
}
```

- [ ] **Step 10: Write `packages/cms/src/dev.config.ts` and `packages/cms/src/index.ts`**

`dev.config.ts`:

```ts
import { createPayloadConfig } from './config'

export default createPayloadConfig({ tenantSlug: process.env.TENANT_SLUG ?? 'boerengroep' })
```

`index.ts`:

```ts
export { createPayloadConfig } from './config'
export type { CreateConfigOptions, CmsCustom } from './config'
```

- [ ] **Step 11: Write `packages/cms/test/helpers.ts`**

```ts
import { getPayload, type Payload } from 'payload'
import config from '../src/dev.config'

let cached: Payload | undefined

export async function testPayload(): Promise<Payload> {
  if (!cached) cached = await getPayload({ config })
  return cached
}

/** Deletes every document. Content collections go first, tenants and users last. */
export async function resetDb(payload: Payload): Promise<void> {
  const slugs = payload.config.collections.map((c) => c.slug)
  const last = ['users', 'tenants']
  const ordered = [...slugs.filter((s) => !last.includes(s)), ...last.filter((s) => slugs.includes(s))]
  for (const slug of ordered) {
    await payload.delete({
      collection: slug as never,
      where: { id: { exists: true } },
      overrideAccess: true,
      context: { disableRevalidate: true, skipResave: true },
    })
  }
}

export async function createTenant(payload: Payload, slug: string) {
  return payload.create({
    collection: 'tenants',
    data: {
      name: slug,
      slug,
      siteUrl: `https://${slug}.test`,
      revalidateSecret: `secret-${slug}`,
    },
    overrideAccess: true,
  })
}
```

- [ ] **Step 12: Write the failing boot test `packages/cms/test/boot.int.test.ts`**

```ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

describe('cms boots', () => {
  beforeAll(async () => {
    await resetDb(await testPayload())
  })
  afterAll(async () => {
    await resetDb(await testPayload())
  })

  it('creates a tenant and a user that belongs to it', async () => {
    const payload = await testPayload()
    const tenant = await createTenant(payload, 'boerengroep')

    const user = await payload.create({
      collection: 'users',
      data: {
        email: 'editor@boerengroep.test',
        password: 'correct-horse-battery',
        roles: ['user'],
        tenants: [{ tenant: tenant.id, roles: ['editor'] }],
      },
      overrideAccess: true,
    })

    expect(tenant.slug).toBe('boerengroep')
    expect(user.tenants?.[0]?.roles).toEqual(['editor'])
  })

  it('has both locales configured with English as default', async () => {
    const payload = await testPayload()
    const loc = payload.config.localization
    expect(loc && loc.defaultLocale).toBe('en')
    expect(loc && loc.localeCodes).toEqual(['en', 'nl'])
  })
})
```

- [ ] **Step 13: Run it**

Run: `pnpm install && pnpm --filter @sites/cms test:int`
Expected: 2 tests pass. Docker must be running. If the multi-tenant plugin rejects an option name, read its exported `MultiTenantPluginConfig` type and adapt the call, keeping the behaviour.

- [ ] **Step 14: Generate types and commit**

```bash
PAYLOAD_SECRET=dev PAYLOAD_DATABASE_URL=postgres://payload:payload@127.0.0.1:54329/payload_test \
  pnpm --filter @sites/cms generate:types
git add -A
git commit -m "feat(cms): payload package skeleton with tenants, users and test database"
```

---

### Task 4: Roles and access control

**Files:**
- Create: `packages/cms/src/access/roles.ts`, `packages/cms/src/access/index.ts`
- Modify: `packages/cms/src/collections/users.ts`, `packages/cms/src/collections/tenants.ts`
- Test: `packages/cms/src/access/roles.test.ts`, `packages/cms/test/access.int.test.ts`

**Interfaces:**
- Consumes: `testPayload`, `resetDb`, `createTenant`.
- Produces, from `src/access/roles.ts`:
  - `type TenantRole = 'tenant-admin' | 'editor'`
  - `type AccessUser = { id: number | string; roles?: string[] | null; tenants?: { tenant: Ref; roles?: TenantRole[] | null }[] | null } | null | undefined`
  - `relId(ref: Ref): number | string | undefined`
  - `isSuperAdmin(user: AccessUser): boolean`
  - `tenantIdsWithRole(user: AccessUser, role?: TenantRole): (number | string)[]`
- Produces, from `src/access/index.ts`: `anyone`, `authenticated`, `publishedOrAuthenticated`, `superAdminOnly`, `tenantAdminsOnly`, `superAdminField`.

- [ ] **Step 1: Write the failing unit test `packages/cms/src/access/roles.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { isSuperAdmin, relId, tenantIdsWithRole } from './roles'

const editor = { id: 1, roles: ['user'], tenants: [{ tenant: 10, roles: ['editor' as const] }] }
const admin = {
  id: 2,
  roles: ['user'],
  tenants: [
    { tenant: { id: 10 }, roles: ['tenant-admin' as const] },
    { tenant: 20, roles: ['editor' as const] },
  ],
}

describe('roles', () => {
  it('reads an id from a number, a string or a populated document', () => {
    expect(relId(5)).toBe(5)
    expect(relId('abc')).toBe('abc')
    expect(relId({ id: 7 })).toBe(7)
    expect(relId(null)).toBeUndefined()
  })

  it('detects super admins only by the global role', () => {
    expect(isSuperAdmin({ id: 3, roles: ['super-admin'] })).toBe(true)
    expect(isSuperAdmin(admin)).toBe(false)
    expect(isSuperAdmin(null)).toBe(false)
  })

  it('lists all tenant ids when no role is asked for', () => {
    expect(tenantIdsWithRole(admin)).toEqual([10, 20])
  })

  it('lists only tenants where the user holds the given role', () => {
    expect(tenantIdsWithRole(admin, 'tenant-admin')).toEqual([10])
    expect(tenantIdsWithRole(editor, 'tenant-admin')).toEqual([])
  })

  it('returns no tenants for an anonymous user', () => {
    expect(tenantIdsWithRole(undefined)).toEqual([])
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/cms test`
Expected: FAIL, cannot resolve `./roles`.

- [ ] **Step 3: Write `packages/cms/src/access/roles.ts`**

```ts
export type TenantRole = 'tenant-admin' | 'editor'
export type Ref = number | string | { id: number | string } | null | undefined
export type AccessUser =
  | {
      id: number | string
      roles?: string[] | null
      tenants?: { tenant: Ref; roles?: TenantRole[] | null }[] | null
    }
  | null
  | undefined

export function relId(ref: Ref): number | string | undefined {
  if (ref === null || ref === undefined) return undefined
  return typeof ref === 'object' ? ref.id : ref
}

export function isSuperAdmin(user: AccessUser): boolean {
  return Boolean(user?.roles?.includes('super-admin'))
}

export function tenantIdsWithRole(user: AccessUser, role?: TenantRole): (number | string)[] {
  const ids: (number | string)[] = []
  for (const row of user?.tenants ?? []) {
    const id = relId(row.tenant)
    if (id === undefined) continue
    if (!role || row.roles?.includes(role)) ids.push(id)
  }
  return ids
}
```

- [ ] **Step 4: Run the unit test**

Run: `pnpm --filter @sites/cms test`
Expected: 5 tests pass.

- [ ] **Step 5: Write `packages/cms/src/access/index.ts`**

```ts
import type { Access, FieldAccess } from 'payload'
import { type AccessUser, isSuperAdmin, relId, tenantIdsWithRole } from './roles'

export const anyone: Access = () => true

export const authenticated: Access = ({ req }) => Boolean(req.user)

/** Visitors see published documents. Logged-in users see drafts too. */
export const publishedOrAuthenticated: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

export const superAdminOnly: Access = ({ req }) => isSuperAdmin(req.user as AccessUser)

export const superAdminField: FieldAccess = ({ req }) => isSuperAdmin(req.user as AccessUser)

/**
 * For tenant-scoped collections that only tenant admins may change,
 * such as site settings and redirects.
 */
export const tenantAdminsOnly: Access = ({ req, data }) => {
  const user = req.user as AccessUser
  if (isSuperAdmin(user)) return true
  const ids = tenantIdsWithRole(user, 'tenant-admin')
  if (ids.length === 0) return false
  const target = relId((data as { tenant?: number | string } | undefined)?.tenant)
  if (target !== undefined) return ids.includes(target)
  return { tenant: { in: ids } }
}

/** Who may see or change a user record. */
export const usersReadUpdate: Access = ({ req }) => {
  const user = req.user as AccessUser
  if (!user) return false
  if (isSuperAdmin(user)) return true
  const adminOf = tenantIdsWithRole(user, 'tenant-admin')
  if (adminOf.length === 0) return { id: { equals: user.id } }
  return { or: [{ id: { equals: user.id } }, { 'tenants.tenant': { in: adminOf } }] }
}

export const usersCreateDelete: Access = ({ req }) => {
  const user = req.user as AccessUser
  if (isSuperAdmin(user)) return true
  const adminOf = tenantIdsWithRole(user, 'tenant-admin')
  if (adminOf.length === 0) return false
  return { 'tenants.tenant': { in: adminOf } }
}

/** A user may read the tenants they belong to. */
export const tenantsRead: Access = ({ req }) => {
  const user = req.user as AccessUser
  if (!user) return false
  if (isSuperAdmin(user)) return true
  return { id: { in: tenantIdsWithRole(user) } }
}
```

- [ ] **Step 6: Apply access rules to `users.ts`**

Replace the file with:

```ts
import { APIError, type CollectionBeforeValidateHook, type CollectionConfig } from 'payload'
import { superAdminField, usersCreateDelete, usersReadUpdate } from '../access'
import { type AccessUser, isSuperAdmin, relId, tenantIdsWithRole } from '../access/roles'

/** A tenant admin may only hand out access to tenants they administer. */
const guardTenantAssignment: CollectionBeforeValidateHook = ({ data, req }) => {
  const actor = req.user as AccessUser
  if (!actor || isSuperAdmin(actor)) return data
  const allowed = tenantIdsWithRole(actor, 'tenant-admin')
  const rows = (data?.tenants ?? []) as { tenant: number | string | { id: number | string } }[]
  for (const row of rows) {
    const id = relId(row.tenant)
    if (id === undefined || !allowed.includes(id)) {
      throw new APIError('You can only grant access to sites you administer.', 403)
    }
  }
  return data
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email', group: 'Platform' },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: usersReadUpdate,
    update: usersReadUpdate,
    create: usersCreateDelete,
    delete: usersCreateDelete,
  },
  hooks: { beforeValidate: [guardTenantAssignment] },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['user'],
      saveToJWT: true,
      access: { create: superAdminField, update: superAdminField },
      options: [
        { label: 'Super admin', value: 'super-admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ],
}
```

- [ ] **Step 7: Apply access rules to `tenants.ts`**

Add the import and the `access` block, and restrict the secret field:

```ts
import type { CollectionConfig } from 'payload'
import { superAdminField, superAdminOnly, tenantsRead } from '../access'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: { useAsTitle: 'name', group: 'Platform' },
  access: {
    read: tenantsRead,
    create: superAdminOnly,
    update: superAdminOnly,
    delete: superAdminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'siteUrl',
      type: 'text',
      required: true,
      admin: { description: 'Public origin of this site, for example https://www.example.org' },
    },
    {
      name: 'revalidateSecret',
      type: 'text',
      required: true,
      access: { read: superAdminField, update: superAdminField },
      admin: { description: 'Shared secret the other site sends when it asks this site to refresh its cache.' },
    },
  ],
}
```

- [ ] **Step 8: Write the failing integration test `packages/cms/test/access.int.test.ts`**

```ts
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let bg: { id: number | string }
let it2: { id: number | string }
let superAdmin: any
let bgAdmin: any
let bgEditor: any
let itEditor: any

async function makeUser(email: string, roles: string[], tenants: any[]) {
  return payload.create({
    collection: 'users',
    data: { email, password: 'correct-horse-battery', roles, tenants } as never,
    overrideAccess: true,
  })
}

describe('access control', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    bg = await createTenant(payload, 'boerengroep')
    it2 = await createTenant(payload, 'inspringtheater')
    superAdmin = await makeUser('root@test', ['super-admin'], [])
    bgAdmin = await makeUser('bg-admin@test', ['user'], [{ tenant: bg.id, roles: ['tenant-admin'] }])
    bgEditor = await makeUser('bg-editor@test', ['user'], [{ tenant: bg.id, roles: ['editor'] }])
    itEditor = await makeUser('it-editor@test', ['user'], [{ tenant: it2.id, roles: ['editor'] }])
  })
  afterAll(async () => resetDb(payload))

  it('lets a super admin see every user', async () => {
    const res = await payload.find({ collection: 'users', user: superAdmin, overrideAccess: false })
    expect(res.totalDocs).toBe(4)
  })

  it('lets a tenant admin see only users of their tenant', async () => {
    const res = await payload.find({ collection: 'users', user: bgAdmin, overrideAccess: false })
    const emails = res.docs.map((d) => d.email).sort()
    expect(emails).toEqual(['bg-admin@test', 'bg-editor@test'])
  })

  it('lets an editor see only themselves', async () => {
    const res = await payload.find({ collection: 'users', user: bgEditor, overrideAccess: false })
    expect(res.docs.map((d) => d.email)).toEqual(['bg-editor@test'])
  })

  it('refuses a tenant admin who grants access to another tenant', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: 'sneaky@test',
          password: 'correct-horse-battery',
          tenants: [{ tenant: it2.id, roles: ['tenant-admin'] }],
        } as never,
        user: bgAdmin,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/sites you administer/)
  })

  it('ignores a tenant admin who tries to make someone a super admin', async () => {
    const created = await payload.create({
      collection: 'users',
      data: {
        email: 'promoted@test',
        password: 'correct-horse-battery',
        roles: ['super-admin'],
        tenants: [{ tenant: bg.id, roles: ['editor'] }],
      } as never,
      user: bgAdmin,
      overrideAccess: false,
    })
    expect(created.roles).toEqual(['user'])
  })

  it('shows a user only the tenants they belong to', async () => {
    const res = await payload.find({ collection: 'tenants', user: itEditor, overrideAccess: false })
    expect(res.docs.map((d) => d.slug)).toEqual(['inspringtheater'])
  })

  it('hides the revalidate secret from non super admins', async () => {
    const res = await payload.find({ collection: 'tenants', user: bgAdmin, overrideAccess: false })
    expect(res.docs[0]).not.toHaveProperty('revalidateSecret')
  })

  it('refuses tenant creation by a tenant admin', async () => {
    await expect(
      payload.create({
        collection: 'tenants',
        data: { name: 'x', slug: 'x', siteUrl: 'https://x.test', revalidateSecret: 's' },
        user: bgAdmin,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 9: Run the integration tests**

Run: `pnpm --filter @sites/cms test:int`
Expected: all tests in `boot` and `access` pass.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(cms): roles and access control for users and tenants"
```

---

### Task 5: Shared fields and the ten layout blocks

**Files:**
- Create: `packages/cms/src/fields/shared.ts`
- Create: `packages/cms/src/blocks/hero.ts`, `content.ts`, `callout.ts`, `features.ts`, `stats.ts`, `cta.ts`, `testimonial.ts`, `video.ts`, `image-text.ts`, `events-calendar-preview.ts`, `index.ts`
- Test: `packages/cms/src/blocks/blocks.test.ts`

**Interfaces:**
- Produces, from `src/fields/shared.ts`: `backgroundField`, `iconField`, `actionsField`, `languageField`, `slugField`, `legacyIdField` (all of type `Field`).
- Produces, from `src/blocks/index.ts`: `pageBlocks: Block[]` (all ten) and `articleBlocks: Block[]` (all except `eventsCalendarPreview`). Block slugs are exactly: `hero`, `eventsCalendarPreview`, `callout`, `features`, `stats`, `cta`, `content`, `testimonial`, `video`, `imageText`.
- Field names inside blocks match the Tina names so the migration is one to one. Image fields are `upload` relations to `media`.

- [ ] **Step 1: Write the failing test `packages/cms/src/blocks/blocks.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { articleBlocks, pageBlocks } from './index'

const names = (b: { fields: { name?: string }[] }) => b.fields.map((f) => f.name)

describe('blocks', () => {
  it('exposes the ten page blocks with their Tina slugs', () => {
    expect(pageBlocks.map((b) => b.slug)).toEqual([
      'hero',
      'eventsCalendarPreview',
      'callout',
      'features',
      'stats',
      'cta',
      'content',
      'testimonial',
      'video',
      'imageText',
    ])
  })

  it('leaves the calendar preview out of article blocks', () => {
    expect(articleBlocks.map((b) => b.slug)).not.toContain('eventsCalendarPreview')
    expect(articleBlocks).toHaveLength(9)
  })

  it('keeps Tina field names on the hero block', () => {
    const hero = pageBlocks.find((b) => b.slug === 'hero')!
    expect(names(hero as never)).toEqual(['background', 'headline', 'tagline', 'actions', 'image'])
  })

  it('keeps Tina field names on the image and text block', () => {
    const block = pageBlocks.find((b) => b.slug === 'imageText')!
    expect(names(block as never)).toEqual([
      'background',
      'image',
      'content',
      'layout',
      'imageSize',
      'verticalAlignment',
    ])
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/cms test`
Expected: FAIL, cannot resolve `./index`.

- [ ] **Step 3: Write `packages/cms/src/fields/shared.ts`**

```ts
import type { Field } from 'payload'

/** Free text because content uses arbitrary Tailwind values such as bg-[#F28F07]/20. */
export const backgroundField: Field = {
  name: 'background',
  type: 'text',
  admin: { description: 'Tailwind background class, for example bg-background or bg-[#44AD39]/10.' },
}

export const iconField: Field = {
  name: 'icon',
  type: 'group',
  fields: [
    { name: 'name', type: 'text', admin: { description: 'Lucide icon name, for example ArrowRight.' } },
    { name: 'color', type: 'text' },
    { name: 'style', type: 'text' },
  ],
}

export const actionsField: Field = {
  name: 'actions',
  type: 'array',
  fields: [
    { name: 'label', type: 'text' },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Button', value: 'button' },
        { label: 'Link', value: 'link' },
      ],
    },
    iconField,
    { name: 'link', type: 'text' },
  ],
}

/** Empty means the document is shown in both locales. */
export const languageField: Field = {
  name: 'language',
  type: 'select',
  admin: { position: 'sidebar', description: 'Leave empty to show in both languages.' },
  options: [
    { label: 'English', value: 'en' },
    { label: 'Nederlands', value: 'nl' },
  ],
}

/** URL segment. Case is preserved because existing URLs contain capitals. */
export const slugField: Field = {
  name: 'slug',
  type: 'text',
  required: true,
  index: true,
  admin: { position: 'sidebar' },
  validate: (value: unknown) =>
    typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(value)
      ? true
      : 'Use letters, numbers and hyphens only.',
}

/** Path of the Tina file this document was migrated from. */
export const legacyIdField: Field = {
  name: 'legacyId',
  type: 'text',
  index: true,
  admin: { readOnly: true, position: 'sidebar' },
}
```

- [ ] **Step 4: Write the block files**

`packages/cms/src/blocks/hero.ts`:

```ts
import type { Block } from 'payload'
import { actionsField, backgroundField } from '../fields/shared'

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    backgroundField,
    { name: 'headline', type: 'text' },
    { name: 'tagline', type: 'text' },
    actionsField,
    {
      name: 'image',
      type: 'group',
      fields: [
        { name: 'src', type: 'upload', relationTo: 'media' },
        { name: 'alt', type: 'text' },
        {
          name: 'videoUrl',
          type: 'text',
          admin: { description: 'For YouTube, use the embed version of the URL.' },
        },
      ],
    },
  ],
}
```

`packages/cms/src/blocks/content.ts`:

```ts
import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [backgroundField, { name: 'body', type: 'richText' }],
}
```

`packages/cms/src/blocks/callout.ts`:

```ts
import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Callout: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  fields: [backgroundField, { name: 'text', type: 'text' }, { name: 'url', type: 'text' }],
}
```

`packages/cms/src/blocks/features.ts`:

```ts
import type { Block } from 'payload'
import { backgroundField, iconField } from '../fields/shared'

export const Features: Block = {
  slug: 'features',
  interfaceName: 'FeaturesBlock',
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    { name: 'description', type: 'text' },
    {
      name: 'items',
      type: 'array',
      fields: [iconField, { name: 'title', type: 'text' }, { name: 'text', type: 'richText' }],
    },
  ],
}
```

`packages/cms/src/blocks/stats.ts`:

```ts
import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Stats: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    { name: 'description', type: 'text' },
    {
      name: 'stats',
      type: 'array',
      fields: [
        { name: 'stat', type: 'text' },
        { name: 'type', type: 'text' },
      ],
    },
  ],
}
```

`packages/cms/src/blocks/cta.ts`. The Tina block has no background field, so neither does this one.

```ts
import type { Block } from 'payload'
import { actionsField } from '../fields/shared'

export const Cta: Block = {
  slug: 'cta',
  interfaceName: 'CtaBlock',
  fields: [{ name: 'title', type: 'text' }, { name: 'description', type: 'textarea' }, actionsField],
}
```

`packages/cms/src/blocks/testimonial.ts`:

```ts
import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Testimonial: Block = {
  slug: 'testimonial',
  interfaceName: 'TestimonialBlock',
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'testimonials',
      type: 'array',
      fields: [
        { name: 'quote', type: 'textarea' },
        { name: 'author', type: 'text' },
        { name: 'role', type: 'text' },
        { name: 'avatar', type: 'upload', relationTo: 'media' },
      ],
    },
  ],
}
```

`packages/cms/src/blocks/video.ts`:

```ts
import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Video: Block = {
  slug: 'video',
  interfaceName: 'VideoBlock',
  fields: [
    backgroundField,
    {
      name: 'color',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Tint', value: 'tint' },
        { label: 'Primary', value: 'primary' },
      ],
    },
    { name: 'url', type: 'text' },
    { name: 'autoPlay', type: 'checkbox' },
    { name: 'loop', type: 'checkbox' },
  ],
}
```

`packages/cms/src/blocks/image-text.ts`:

```ts
import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const ImageText: Block = {
  slug: 'imageText',
  interfaceName: 'ImageTextBlock',
  fields: [
    backgroundField,
    {
      name: 'image',
      type: 'group',
      fields: [
        { name: 'src', type: 'upload', relationTo: 'media' },
        { name: 'alt', type: 'text' },
      ],
    },
    { name: 'content', type: 'richText' },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'image-left',
      options: [
        { label: 'Image left', value: 'image-left' },
        { label: 'Image right', value: 'image-right' },
        { label: 'Image center', value: 'image-center' },
        { label: 'Text above image (center)', value: 'text-above-center' },
        { label: 'Text below image (center)', value: 'text-below-center' },
      ],
    },
    {
      name: 'imageSize',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
    {
      name: 'verticalAlignment',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Center', value: 'center' },
        { label: 'Bottom', value: 'bottom' },
      ],
    },
  ],
}
```

`packages/cms/src/blocks/events-calendar-preview.ts`:

```ts
import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const EventsCalendarPreview: Block = {
  slug: 'eventsCalendarPreview',
  interfaceName: 'EventsCalendarPreviewBlock',
  fields: [
    backgroundField,
    { name: 'title', type: 'text', admin: { description: 'Optional. Defaults to the translated title.' } },
    { name: 'description', type: 'textarea' },
  ],
}
```

`packages/cms/src/blocks/index.ts`:

```ts
import type { Block } from 'payload'
import { Callout } from './callout'
import { Content } from './content'
import { Cta } from './cta'
import { EventsCalendarPreview } from './events-calendar-preview'
import { Features } from './features'
import { Hero } from './hero'
import { ImageText } from './image-text'
import { Stats } from './stats'
import { Testimonial } from './testimonial'
import { Video } from './video'

/** Order matches the Tina page template list. */
export const pageBlocks: Block[] = [
  Hero,
  EventsCalendarPreview,
  Callout,
  Features,
  Stats,
  Cta,
  Content,
  Testimonial,
  Video,
  ImageText,
]

/** Blocks allowed in newsletters and past events. */
export const articleBlocks: Block[] = pageBlocks.filter((b) => b.slug !== 'eventsCalendarPreview')
```

- [ ] **Step 5: Run the unit tests**

Run: `pnpm --filter @sites/cms test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(cms): shared fields and the ten layout blocks"
```

---

### Task 6: Media collection with Vercel Blob storage

**Files:**
- Create: `packages/cms/src/collections/media.ts`
- Modify: `packages/cms/src/config.ts`
- Test: `packages/cms/test/media.int.test.ts`

**Interfaces:**
- Consumes: `anyone`, `authenticated`, `legacyIdField`.
- Produces: collection `media` with fields `alt`, `legacyPath`. Registered in `tenantScoped`. Blob storage is active only when `BLOB_READ_WRITE_TOKEN` is set. Without it, files go to a local `media/` folder.

- [ ] **Step 1: Write the failing test `packages/cms/test/media.int.test.ts`**

```ts
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

// A valid 1x1 transparent PNG.
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

let payload: Payload
let tenantId: number | string

describe('media', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    tenantId = (await createTenant(payload, 'boerengroep')).id
  })
  afterAll(async () => resetDb(payload))

  it('stores an upload with its legacy path and tenant', async () => {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: 'dot', legacyPath: '/uploads/dot.png', tenant: tenantId } as never,
      file: { data: png, mimetype: 'image/png', name: 'dot.png', size: png.length },
      overrideAccess: true,
    })
    expect(doc.legacyPath).toBe('/uploads/dot.png')
    expect(doc.url).toBeTruthy()
    expect(doc.mimeType).toBe('image/png')
  })

  it('is readable without logging in', async () => {
    const res = await payload.find({ collection: 'media', overrideAccess: false })
    expect(res.totalDocs).toBe(1)
  })

  it('refuses an anonymous upload', async () => {
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'x', tenant: tenantId } as never,
        file: { data: png, mimetype: 'image/png', name: 'x.png', size: png.length },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/cms test:int`
Expected: FAIL, collection `media` does not exist.

- [ ] **Step 3: Write `packages/cms/src/collections/media.ts`**

```ts
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  upload: {
    mimeTypes: ['image/*', 'application/pdf', 'video/*', 'audio/*'],
  },
  fields: [
    { name: 'alt', type: 'text' },
    {
      name: 'legacyPath',
      type: 'text',
      index: true,
      admin: { readOnly: true, description: 'Original /uploads path. Old links redirect from here.' },
    },
  ],
}
```

- [ ] **Step 4: Register it and add the storage adapter in `config.ts`**

Add the imports:

```ts
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Media } from './collections/media'
```

Change the `tenantScoped` declaration to:

```ts
export const tenantScoped: CollectionConfig[] = [Media]
```

Add this entry to the `plugins` array, after `multiTenantPlugin(...)`:

```ts
vercelBlobStorage({
  enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  token: process.env.BLOB_READ_WRITE_TOKEN,
  clientUploads: true,
  collections: {
    media: { disablePayloadAccessControl: true },
  },
}),
```

- [ ] **Step 5: Run the tests**

Run: `pnpm --filter @sites/cms test:int`
Expected: all pass. A `media/` folder appears under `packages/cms`. It is git-ignored.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(cms): media collection with Vercel Blob storage"
```

---

### Task 7: Pages collection with localized paths

**Files:**
- Create: `packages/cms/src/hooks/page-path.ts`, `packages/cms/src/collections/pages.ts`
- Modify: `packages/cms/src/config.ts`
- Test: `packages/cms/src/hooks/page-path.test.ts`, `packages/cms/test/pages.int.test.ts`

**Interfaces:**
- Consumes: `pageBlocks`, `legacyIdField`, `publishedOrAuthenticated`, `authenticated`, `relId`.
- Produces:
  - `buildPath(parentPath: string | null | undefined, slug: string): string`
  - Collection `pages` with fields `title`, `slug`, `parent`, `path`, `body`, `blocks`, `legacyId`. `title`, `slug`, `path`, `body` and `blocks` are localized. Drafts are enabled.
  - A root page with slug `home` has path `/`.

- [ ] **Step 1: Write the failing unit test `packages/cms/src/hooks/page-path.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { buildPath } from './page-path'

describe('buildPath', () => {
  it('puts a root page under a single slash', () => {
    expect(buildPath(null, 'contact')).toBe('/contact')
  })
  it('maps the root page called home to the site root', () => {
    expect(buildPath(null, 'home')).toBe('/')
  })
  it('joins a child to its parent path', () => {
    expect(buildPath('/over-ons', 'geschiedenis')).toBe('/over-ons/geschiedenis')
  })
  it('does not double the slash under the home page', () => {
    expect(buildPath('/', 'contact')).toBe('/contact')
  })
  it('treats a nested page called home as an ordinary slug', () => {
    expect(buildPath('/library', 'home')).toBe('/library/home')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/cms test`
Expected: FAIL, cannot resolve `./page-path`.

- [ ] **Step 3: Write `packages/cms/src/hooks/page-path.ts`**

```ts
import {
  ValidationError,
  type CollectionAfterChangeHook,
  type CollectionBeforeChangeHook,
} from 'payload'
import { relId } from '../access/roles'

export function buildPath(parentPath: string | null | undefined, slug: string): string {
  if (!parentPath) return slug === 'home' ? '/' : `/${slug}`
  return `${parentPath === '/' ? '' : parentPath}/${slug}`
}

/** Sets `path` for the locale being saved and rejects a duplicate within the tenant. */
export const computePath: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const slug: string | undefined = data.slug ?? originalDoc?.slug
  if (!slug) return data

  const parentId = relId(data.parent !== undefined ? data.parent : originalDoc?.parent)
  let parentPath: string | null = null
  if (parentId !== undefined) {
    const parent = await req.payload.findByID({
      collection: 'pages',
      id: parentId,
      locale: req.locale as never,
      depth: 0,
      draft: true,
      overrideAccess: true,
      req,
    })
    parentPath = (parent as { path?: string | null }).path ?? null
  }

  const path = buildPath(parentPath, slug)
  const tenantId = relId(data.tenant ?? originalDoc?.tenant)

  const clash = await req.payload.find({
    collection: 'pages',
    locale: req.locale as never,
    fallbackLocale: false as never,
    depth: 0,
    limit: 1,
    draft: true,
    overrideAccess: true,
    req,
    where: {
      and: [
        { path: { equals: path } },
        { tenant: { equals: tenantId } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
  })
  if (clash.totalDocs > 0) {
    throw new ValidationError({
      collection: 'pages',
      errors: [{ path: 'slug', message: `Another page already uses the path ${path}.` }],
    })
  }

  data.path = path
  return data
}

/** When a page's path changes, re-save its children so their paths follow. */
export const resaveChildren: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (req.context?.skipResave) return doc
  if (previousDoc?.path === doc.path) return doc

  const children = await req.payload.find({
    collection: 'pages',
    locale: req.locale as never,
    depth: 0,
    limit: 1000,
    draft: true,
    overrideAccess: true,
    req,
    where: { parent: { equals: doc.id } },
  })
  for (const child of children.docs as { id: number | string; slug: string }[]) {
    await req.payload.update({
      collection: 'pages',
      id: child.id,
      locale: req.locale as never,
      data: { slug: child.slug } as never,
      overrideAccess: true,
      req,
    })
  }
  return doc
}
```

- [ ] **Step 4: Write `packages/cms/src/collections/pages.ts`**

```ts
import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { pageBlocks } from '../blocks'
import { legacyIdField } from '../fields/shared'
import { computePath, resaveChildren } from '../hooks/page-path'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'path', '_status'], group: 'Content' },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true },
  hooks: { beforeChange: [computePath], afterChange: [resaveChildren] },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        position: 'sidebar',
        description: 'Last part of the URL in this language. The home page uses "home".',
      },
      validate: (value: unknown) =>
        typeof value === 'string' && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)
          ? true
          : 'Use lowercase letters, numbers and single hyphens.',
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      admin: { position: 'sidebar' },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: 'path',
      type: 'text',
      localized: true,
      index: true,
      admin: { readOnly: true, position: 'sidebar', description: 'Full URL path. Set automatically.' },
    },
    { name: 'body', type: 'richText', localized: true },
    { name: 'blocks', type: 'blocks', localized: true, blocks: pageBlocks },
    legacyIdField,
  ],
}
```

- [ ] **Step 5: Register it in `config.ts`**

```ts
import { Pages } from './collections/pages'
// ...
export const tenantScoped: CollectionConfig[] = [Pages, Media]
```

- [ ] **Step 6: Write the failing integration test `packages/cms/test/pages.int.test.ts`**

```ts
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let bg: number | string
let other: number | string

async function page(tenant: number | string, title: string, slug: string, parent?: number | string) {
  return payload.create({
    collection: 'pages',
    locale: 'en',
    data: { title, slug, parent, tenant, _status: 'published' } as never,
    overrideAccess: true,
  })
}
async function read(id: number | string, locale: 'en' | 'nl') {
  return payload.findByID({ collection: 'pages', id, locale, fallbackLocale: false as never, depth: 0 })
}

describe('pages', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    bg = (await createTenant(payload, 'boerengroep')).id
    other = (await createTenant(payload, 'inspringtheater')).id
  })
  afterAll(async () => resetDb(payload))

  it('gives the home page the root path', async () => {
    const home = await page(bg, 'Home', 'home')
    expect(home.path).toBe('/')
  })

  it('builds a nested path per locale', async () => {
    const about = await page(bg, 'About us', 'about-us')
    await payload.update({
      collection: 'pages',
      id: about.id,
      locale: 'nl',
      data: { title: 'Over ons', slug: 'over-ons' } as never,
    })
    const history = await page(bg, 'History', 'history', about.id)
    await payload.update({
      collection: 'pages',
      id: history.id,
      locale: 'nl',
      data: { title: 'Geschiedenis', slug: 'geschiedenis' } as never,
    })

    expect((await read(history.id, 'en')).path).toBe('/about-us/history')
    expect((await read(history.id, 'nl')).path).toBe('/over-ons/geschiedenis')
  })

  it('updates descendants in one locale when a parent slug changes', async () => {
    const parent = await page(bg, 'Library', 'library')
    const child = await page(bg, 'Archive', 'archive', parent.id)
    const grandchild = await page(bg, 'Old', 'old', child.id)

    await payload.update({
      collection: 'pages',
      id: parent.id,
      locale: 'nl',
      data: { title: 'Bibliotheek', slug: 'bibliotheek' } as never,
    })

    expect((await read(grandchild.id, 'nl')).path).toBe('/bibliotheek/archive/old')
    expect((await read(grandchild.id, 'en')).path).toBe('/library/archive/old')
  })

  it('rejects a second page with the same path in one tenant', async () => {
    await page(bg, 'Contact', 'contact')
    await expect(page(bg, 'Contact again', 'contact')).rejects.toThrow(/already uses the path \/contact/)
  })

  it('allows the same path in a different tenant', async () => {
    const twin = await page(other, 'Contact', 'contact')
    expect(twin.path).toBe('/contact')
  })

  it('rejects a slug with capitals or spaces', async () => {
    await expect(page(bg, 'Bad', 'Bad Slug')).rejects.toThrow()
  })

  it('hides drafts from anonymous readers', async () => {
    await payload.create({
      collection: 'pages',
      locale: 'en',
      data: { title: 'Secret', slug: 'secret', tenant: bg, _status: 'draft' } as never,
      overrideAccess: true,
    })
    const res = await payload.find({
      collection: 'pages',
      where: { path: { equals: '/secret' } },
      overrideAccess: false,
    })
    expect(res.totalDocs).toBe(0)
  })
})
```

- [ ] **Step 7: Run all tests**

Run: `pnpm --filter @sites/cms test && pnpm --filter @sites/cms test:int`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(cms): pages collection with localized, hook-maintained paths"
```

---

### Task 8: Single-language content collections

**Files:**
- Create: `packages/cms/src/collections/speakers.ts`, `authors.ts`, `tags.ts`, `events.ts`, `vacancies.ts`, `newsletters.ts`, `past-events.ts`
- Modify: `packages/cms/src/config.ts`
- Test: `packages/cms/test/content.int.test.ts`

**Interfaces:**
- Consumes: `articleBlocks`, `languageField`, `slugField`, `legacyIdField`, access functions.
- Produces collections with these slugs and field names:
  - `speakers`: `name`, `avatar`, `affiliation`, `bio`, `legacyId`
  - `authors`: `name`, `avatar`, `legacyId`
  - `tags`: `name`, `legacyId`
  - `events`: `title`, `slug`, `language`, `description`, `location{address,mapsLink,callLink}`, `startDate`, `endDate`, `eventType`, `speakers[{speaker,role}]`, `image`, `coverImage`, `featured`, `registrationLink`, `legacyId`
  - `vacancies`: `title`, `slug`, `language`, `opportunityType`, `location{type,cityRegion}`, `startDate`, `duration`, `openApplication`, `applicationDeadline`, `description`, `responsibilities`, `requiredSkills`, `preferredQualities`, `languagesRequired`, `compensation{details}`, `accessibilityNotes`, `howToApply`, `contactInfo{name,email,phone}`, `supportingDocument`, `valuesStatement`, `openToNontraditional`, `legacyId`
  - `newsletters`: `title`, `slug`, `language`, `type`, `organization`, `publishDate`, `tags`, `externalLink`, `linkDescription`, `author`, `featuredImage`, `excerpt`, `body` (blocks), `featured`, `legacyId`. Drafts enabled. Tina's `published` flag becomes `_status`.
  - `past-events`: `title`, `slug`, `language`, `heroImg`, `excerpt`, `author`, `date`, `relatedEvent`, `tags`, `blocks`, `body` (rich text), `legacyId`. Drafts enabled.

- [ ] **Step 1: Write the failing test `packages/cms/test/content.int.test.ts`**

```ts
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let tenant: number | string

describe('content collections', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    tenant = (await createTenant(payload, 'boerengroep')).id
  })
  afterAll(async () => resetDb(payload))

  it('links an event to a speaker with a role', async () => {
    const speaker = await payload.create({
      collection: 'speakers',
      data: { name: 'Dr. Maria van der Meer', affiliation: 'WUR', tenant } as never,
    })
    const event = await payload.create({
      collection: 'events',
      data: {
        title: 'Boerengroep Break: Samhain',
        slug: 'Boerengroep-Break-Samhain',
        language: 'en',
        startDate: '2025-10-30T18:30:00.000Z',
        eventType: 'workshop',
        speakers: [{ speaker: speaker.id, role: 'Host' }],
        tenant,
      } as never,
      depth: 1,
    })
    expect((event.speakers?.[0]?.speaker as { name: string }).name).toBe('Dr. Maria van der Meer')
    expect(event.slug).toBe('Boerengroep-Break-Samhain')
  })

  it('rejects an event type that is not in the list', async () => {
    await expect(
      payload.create({
        collection: 'events',
        data: {
          title: 'x',
          slug: 'x',
          startDate: '2025-10-30T18:30:00.000Z',
          eventType: 'party',
          tenant,
        } as never,
      }),
    ).rejects.toThrow()
  })

  it('keeps an unpublished newsletter away from visitors', async () => {
    await payload.create({
      collection: 'newsletters',
      data: {
        title: 'Draft issue',
        slug: 'Draft-issue',
        type: 'article',
        organization: 'Boerengroep',
        publishDate: '2026-01-01T10:00:00.000Z',
        tenant,
        _status: 'draft',
      } as never,
    })
    const res = await payload.find({ collection: 'newsletters', overrideAccess: false })
    expect(res.totalDocs).toBe(0)
  })

  it('accepts a past event that points at a calendar event and an author', async () => {
    const author = await payload.create({ collection: 'authors', data: { name: 'Cami', tenant } as never })
    const tag = await payload.create({ collection: 'tags', data: { name: 'weekend', tenant } as never })
    const events = await payload.find({ collection: 'events', limit: 1 })
    const recap = await payload.create({
      collection: 'past-events',
      data: {
        title: 'Boerengroep Weekend',
        slug: 'Boerengroep-Weekend',
        date: '2025-09-01T10:00:00.000Z',
        author: author.id,
        relatedEvent: events.docs[0]!.id,
        tags: [tag.id],
        tenant,
        _status: 'published',
      } as never,
    })
    expect(recap.slug).toBe('Boerengroep-Weekend')
  })

  it('stores a vacancy with list fields', async () => {
    const vacancy = await payload.create({
      collection: 'vacancies',
      data: {
        title: 'General Board Member',
        slug: 'General-Board-Member',
        language: 'en',
        opportunityType: 'board',
        requiredSkills: ['organising', 'writing'],
        languagesRequired: ['English'],
        tenant,
      } as never,
    })
    expect(vacancy.requiredSkills).toEqual(['organising', 'writing'])
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/cms test:int`
Expected: FAIL, collection `speakers` does not exist.

- [ ] **Step 3: Write `speakers.ts`, `authors.ts`, `tags.ts`**

`packages/cms/src/collections/speakers.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { legacyIdField } from '../fields/shared'

export const Speakers: CollectionConfig = {
  slug: 'speakers',
  admin: { useAsTitle: 'name', group: 'People' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'affiliation', type: 'text' },
    { name: 'bio', type: 'richText' },
    legacyIdField,
  ],
}
```

`packages/cms/src/collections/authors.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { legacyIdField } from '../fields/shared'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: { useAsTitle: 'name', group: 'People' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    legacyIdField,
  ],
}
```

`packages/cms/src/collections/tags.ts`:

```ts
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { legacyIdField } from '../fields/shared'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: { useAsTitle: 'name', group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [{ name: 'name', type: 'text', required: true }, legacyIdField],
}
```

- [ ] **Step 4: Write `events.ts`**

```ts
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { languageField, legacyIdField, slugField } from '../fields/shared'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'startDate', 'eventType'], group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    languageField,
    { name: 'description', type: 'textarea' },
    {
      name: 'location',
      type: 'group',
      fields: [
        { name: 'address', type: 'text' },
        { name: 'mapsLink', type: 'text', label: 'Google Maps link' },
        { name: 'callLink', type: 'text', label: 'Video call link' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'endDate', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        { label: 'Talk', value: 'talk' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Lecture', value: 'lecture' },
        { label: 'Meeting', value: 'meeting' },
        { label: 'Board Meeting', value: 'board-meeting' },
        { label: 'Soup Kitchen', value: 'soup-kitchen' },
        { label: 'CSA', value: 'csa' },
        { label: 'Excursion', value: 'excursion' },
      ],
    },
    {
      name: 'speakers',
      type: 'array',
      label: 'Speakers and hosts',
      fields: [
        { name: 'speaker', type: 'relationship', relationTo: 'speakers' },
        { name: 'role', type: 'text' },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox' },
    {
      name: 'registrationLink',
      type: 'richText',
      admin: { description: 'Type the link text, select it, and add the registration URL as a link.' },
    },
    legacyIdField,
  ],
}
```

- [ ] **Step 5: Write `vacancies.ts`**

```ts
import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { languageField, legacyIdField, slugField } from '../fields/shared'

export const Vacancies: CollectionConfig = {
  slug: 'vacancies',
  admin: { useAsTitle: 'title', group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Title of position' },
    slugField,
    languageField,
    {
      name: 'opportunityType',
      type: 'select',
      required: true,
      options: [
        { label: 'Volunteer', value: 'volunteer' },
        { label: 'Internship', value: 'internship' },
        { label: 'Coordinator', value: 'coordinator' },
        { label: 'Board', value: 'board' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Remote', value: 'remote' },
            { label: 'In-person', value: 'in-person' },
            { label: 'Hybrid', value: 'hybrid' },
          ],
        },
        { name: 'cityRegion', type: 'text', label: 'Where?' },
      ],
    },
    { name: 'startDate', type: 'date' },
    { name: 'duration', type: 'text' },
    { name: 'openApplication', type: 'checkbox', label: 'Open application (no deadline)' },
    { name: 'applicationDeadline', type: 'date' },
    { name: 'description', type: 'richText' },
    { name: 'responsibilities', type: 'richText' },
    { name: 'requiredSkills', type: 'text', hasMany: true },
    { name: 'preferredQualities', type: 'richText' },
    { name: 'languagesRequired', type: 'text', hasMany: true },
    { name: 'compensation', type: 'group', fields: [{ name: 'details', type: 'textarea' }] },
    { name: 'accessibilityNotes', type: 'textarea' },
    { name: 'howToApply', type: 'richText' },
    {
      name: 'contactInfo',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'phone', type: 'text' },
      ],
    },
    { name: 'supportingDocument', type: 'upload', relationTo: 'media', label: 'Job description' },
    { name: 'valuesStatement', type: 'richText' },
    { name: 'openToNontraditional', type: 'checkbox' },
    legacyIdField,
  ],
}
```

- [ ] **Step 6: Write `newsletters.ts`**

```ts
import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { articleBlocks } from '../blocks'
import { languageField, legacyIdField, slugField } from '../fields/shared'

export const Newsletters: CollectionConfig = {
  slug: 'newsletters',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'organization', 'publishDate'], group: 'Content' },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    languageField,
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Article', value: 'article' },
        { label: 'External Link', value: 'link' },
        { label: 'Event Announcement', value: 'event' },
        { label: 'Update', value: 'update' },
      ],
    },
    {
      name: 'organization',
      type: 'select',
      required: true,
      options: [
        { label: 'Boerengroep', value: 'Boerengroep' },
        { label: 'Inspringtheater', value: 'Inspringtheater' },
        { label: "Friend's News", value: 'friends' },
      ],
    },
    {
      name: 'publishDate',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'tags', type: 'text', hasMany: true },
    { name: 'externalLink', type: 'text' },
    { name: 'linkDescription', type: 'textarea' },
    { name: 'author', type: 'relationship', relationTo: 'speakers' },
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'excerpt', type: 'richText' },
    { name: 'body', type: 'blocks', label: 'Content sections', blocks: articleBlocks },
    { name: 'featured', type: 'checkbox' },
    legacyIdField,
  ],
}
```

- [ ] **Step 7: Write `past-events.ts`**

```ts
import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { articleBlocks } from '../blocks'
import { languageField, legacyIdField, slugField } from '../fields/shared'

export const PastEvents: CollectionConfig = {
  slug: 'past-events',
  labels: { singular: 'Past event', plural: 'Past events' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'date'], group: 'Content' },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    languageField,
    { name: 'heroImg', type: 'upload', relationTo: 'media', label: 'Hero image' },
    { name: 'excerpt', type: 'richText' },
    { name: 'author', type: 'relationship', relationTo: 'authors' },
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Event date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'relatedEvent', type: 'relationship', relationTo: 'events', label: 'Related calendar event' },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'blocks', type: 'blocks', label: 'Content blocks', blocks: articleBlocks },
    { name: 'body', type: 'richText' },
    legacyIdField,
  ],
}
```

- [ ] **Step 8: Register them in `config.ts`**

```ts
import { Authors } from './collections/authors'
import { Events } from './collections/events'
import { Newsletters } from './collections/newsletters'
import { PastEvents } from './collections/past-events'
import { Speakers } from './collections/speakers'
import { Tags } from './collections/tags'
import { Vacancies } from './collections/vacancies'
// ...
export const tenantScoped: CollectionConfig[] = [
  Pages,
  Events,
  PastEvents,
  Newsletters,
  Vacancies,
  Speakers,
  Authors,
  Tags,
  Media,
]
```

- [ ] **Step 9: Run the tests**

Run: `pnpm --filter @sites/cms test:int`
Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat(cms): events, vacancies, newsletters, past events and people collections"
```

---

### Task 9: Site settings and redirects

**Files:**
- Create: `packages/cms/src/collections/site-settings.ts`, `packages/cms/src/collections/redirects.ts`
- Modify: `packages/cms/src/config.ts`
- Test: `packages/cms/test/settings.int.test.ts`

**Interfaces:**
- Consumes: `anyone`, `tenantAdminsOnly`, `relId`.
- Produces:
  - Collection `site-settings`, one document per tenant, with groups `header{logo,logoAlt,name,color,nav[]}`, `homepage{showCalendarWidget}`, `footer{social[],quickLinks[]}`, `theme{color,font,darkMode}`.
  - A nav item has `page` (relation to `pages`), `href`, `label` (translation key), `labelText` (localized display text), `submenu[]` with the same four fields.
  - A footer link has `page`, `href`, `label`.
  - Collection `redirects` with `from`, `to`, `permanent`, `note`. `from` is unique within a tenant.

- [ ] **Step 1: Write the failing test `packages/cms/test/settings.int.test.ts`**

```ts
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let bg: number | string
let other: number | string
let bgEditor: any
let bgAdmin: any

describe('site settings and redirects', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    bg = (await createTenant(payload, 'boerengroep')).id
    other = (await createTenant(payload, 'inspringtheater')).id
    const mk = (email: string, role: string) =>
      payload.create({
        collection: 'users',
        data: { email, password: 'correct-horse-battery', tenants: [{ tenant: bg, roles: [role] }] } as never,
        overrideAccess: true,
      })
    bgEditor = await mk('editor@test', 'editor')
    bgAdmin = await mk('admin@test', 'tenant-admin')
  })
  afterAll(async () => resetDb(payload))

  it('stores localized navigation labels', async () => {
    const settings = await payload.create({
      collection: 'site-settings',
      locale: 'en',
      data: {
        tenant: bg,
        header: {
          logoAlt: 'Boerengroep',
          name: 'Stichting Boerengroep',
          nav: [{ href: '/about-us', label: 'about-us', labelText: 'About us' }],
        },
      } as never,
    })
    const navId = settings.header!.nav![0]!.id
    await payload.update({
      collection: 'site-settings',
      id: settings.id,
      locale: 'nl',
      data: { header: { nav: [{ id: navId, href: '/about-us', label: 'about-us', labelText: 'Over ons' }] } } as never,
    })
    const nl = await payload.findByID({ collection: 'site-settings', id: settings.id, locale: 'nl' })
    expect(nl.header?.nav?.[0]?.labelText).toBe('Over ons')
  })

  it('lets a tenant admin change settings but not an editor', async () => {
    const found = await payload.find({ collection: 'site-settings', where: { tenant: { equals: bg } } })
    const id = found.docs[0]!.id
    await expect(
      payload.update({
        collection: 'site-settings',
        id,
        data: { theme: { font: 'lato' } } as never,
        user: bgEditor,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    const updated = await payload.update({
      collection: 'site-settings',
      id,
      data: { theme: { font: 'lato' } } as never,
      user: bgAdmin,
      overrideAccess: false,
    })
    expect(updated.theme?.font).toBe('lato')
  })

  it('rejects a redirect that does not start with a slash', async () => {
    await expect(
      payload.create({ collection: 'redirects', data: { from: 'old', to: '/new', tenant: bg } as never }),
    ).rejects.toThrow()
  })

  it('rejects a duplicate source within a tenant and allows it across tenants', async () => {
    await payload.create({ collection: 'redirects', data: { from: '/old', to: '/new', tenant: bg } as never })
    await expect(
      payload.create({ collection: 'redirects', data: { from: '/old', to: '/other', tenant: bg } as never }),
    ).rejects.toThrow(/already redirects/)
    const twin = await payload.create({
      collection: 'redirects',
      data: { from: '/old', to: '/new', tenant: other } as never,
    })
    expect(twin.from).toBe('/old')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/cms test:int`
Expected: FAIL, collection `site-settings` does not exist.

- [ ] **Step 3: Write `packages/cms/src/collections/site-settings.ts`**

```ts
import type { CollectionConfig, Field } from 'payload'
import { anyone, tenantAdminsOnly } from '../access'

const linkFields: Field[] = [
  {
    name: 'page',
    type: 'relationship',
    relationTo: 'pages',
    admin: { description: 'Preferred. The link follows the page when its URL changes.' },
  },
  { name: 'href', type: 'text', label: 'Manual URL or external link' },
  { name: 'label', type: 'text', label: 'Translation key (legacy)' },
]

const navFields: Field[] = [
  ...linkFields,
  { name: 'labelText', type: 'text', localized: true, label: 'Label' },
]

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  labels: { singular: 'Site settings', plural: 'Site settings' },
  admin: { group: 'Settings' },
  access: {
    read: anyone,
    create: tenantAdminsOnly,
    update: tenantAdminsOnly,
    delete: tenantAdminsOnly,
  },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'logo', type: 'upload', relationTo: 'media', label: 'Organization logo' },
        { name: 'logoAlt', type: 'text', required: true },
        { name: 'name', type: 'text', required: true, label: 'Organization name' },
        {
          name: 'color',
          type: 'select',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Primary brand color', value: 'primary' },
          ],
        },
        {
          name: 'nav',
          type: 'array',
          label: 'Navigation menu',
          fields: [...navFields, { name: 'submenu', type: 'array', fields: navFields }],
        },
      ],
    },
    {
      name: 'homepage',
      type: 'group',
      fields: [{ name: 'showCalendarWidget', type: 'checkbox' }],
    },
    {
      name: 'footer',
      type: 'group',
      fields: [
        {
          name: 'social',
          type: 'array',
          fields: [
            { name: 'platform', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
        {
          name: 'quickLinks',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', required: true, label: 'Section title key' },
            { name: 'links', type: 'array', fields: linkFields },
          ],
        },
      ],
    },
    {
      name: 'theme',
      type: 'group',
      fields: [
        { name: 'color', type: 'text', label: 'Primary brand color' },
        {
          name: 'font',
          type: 'select',
          options: [
            { label: 'System sans-serif', value: 'sans' },
            { label: 'Nunito (rounded)', value: 'nunito' },
            { label: 'Lato (clean)', value: 'lato' },
          ],
        },
        {
          name: 'darkMode',
          type: 'select',
          options: [
            { label: 'Follow system preference', value: 'system' },
            { label: 'Always light mode', value: 'light' },
            { label: 'Always dark mode', value: 'dark' },
          ],
        },
      ],
    },
  ],
}
```

- [ ] **Step 4: Write `packages/cms/src/collections/redirects.ts`**

```ts
import { ValidationError, type CollectionBeforeChangeHook, type CollectionConfig } from 'payload'
import { anyone, tenantAdminsOnly } from '../access'
import { relId } from '../access/roles'

const uniqueFromPerTenant: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const from = data.from ?? originalDoc?.from
  const tenant = relId(data.tenant ?? originalDoc?.tenant)
  const clash = await req.payload.find({
    collection: 'redirects',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: [
        { from: { equals: from } },
        { tenant: { equals: tenant } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
  })
  if (clash.totalDocs > 0) {
    throw new ValidationError({
      collection: 'redirects',
      errors: [{ path: 'from', message: `${from} already redirects somewhere.` }],
    })
  }
  return data
}

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: { useAsTitle: 'from', defaultColumns: ['from', 'to', 'permanent'], group: 'Settings' },
  access: {
    read: anyone,
    create: tenantAdminsOnly,
    update: tenantAdminsOnly,
    delete: tenantAdminsOnly,
  },
  hooks: { beforeChange: [uniqueFromPerTenant] },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      index: true,
      label: 'From URL',
      validate: (v: unknown) => (typeof v === 'string' && v.startsWith('/') ? true : 'URL must start with /'),
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      label: 'To URL',
      validate: (v: unknown) =>
        typeof v === 'string' && (v.startsWith('/') || v.startsWith('http'))
          ? true
          : 'URL must start with / or http(s)://',
    },
    { name: 'permanent', type: 'checkbox', label: 'Permanent redirect (301)' },
    { name: 'note', type: 'text' },
  ],
}
```

- [ ] **Step 5: Register them in `config.ts`**

```ts
import { Redirects } from './collections/redirects'
import { SiteSettings } from './collections/site-settings'
// ...
export const tenantScoped: CollectionConfig[] = [
  Pages,
  Events,
  PastEvents,
  Newsletters,
  Vacancies,
  Speakers,
  Authors,
  Tags,
  Media,
  Redirects,
  SiteSettings,
]

export const onePerTenant: string[] = ['site-settings']
```

- [ ] **Step 6: Run the tests, regenerate types, commit**

```bash
pnpm --filter @sites/cms test:int
PAYLOAD_SECRET=dev PAYLOAD_DATABASE_URL=postgres://payload:payload@127.0.0.1:54329/payload_test \
  pnpm --filter @sites/cms generate:types
pnpm --filter @sites/cms typecheck
git add -A
git commit -m "feat(cms): site settings per tenant and redirects"
```

Expected: tests pass and typecheck exits 0.

---

### Task 10: Mount Payload in the app, seed, first migration, CI

**Files:**
- Create: `apps/boerengroep/payload.config.ts`, `apps/boerengroep/app/(payload)/**` (from the official template), `apps/boerengroep/scripts/migrate-if-production.mjs`
- Create: `packages/cms/src/seed.ts`, `packages/cms/src/bin/seed.ts`
- Create: `tools/check-migrations/package.json`, `find-destructive.mjs`, `find-destructive.test.mjs`, `run.mjs`
- Create: `.github/workflows/ci.yml`
- Delete: `.github/workflows/build-and-deploy.yml`, `.github/workflows/pr-open.yml`
- Modify: `apps/boerengroep/package.json`, `apps/boerengroep/next.config.ts`, `apps/boerengroep/next.config.base.js`, `apps/boerengroep/tsconfig.json`
- Test: `packages/cms/test/seed.int.test.ts`

**Interfaces:**
- Consumes: `createPayloadConfig`.
- Produces:
  - `ensureTenantAndAdmin(payload, input): Promise<{ tenantId: number | string; userId: number | string }>` where
    `input = { tenant: { name: string; slug: string; siteUrl: string; revalidateSecret: string }; admin: { email: string; password: string } }`
  - `findDestructive(source: string): string[]`
  - Admin panel at `http://localhost:3000/admin`, REST API under `/api`.

- [ ] **Step 1: Write the failing seed test `packages/cms/test/seed.int.test.ts`**

```ts
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ensureTenantAndAdmin } from '../src/seed'
import { resetDb, testPayload } from './helpers'

let payload: Payload
const input = {
  tenant: {
    name: 'Stichting Boerengroep',
    slug: 'boerengroep',
    siteUrl: 'https://boerengroep.test',
    revalidateSecret: 's3cret',
  },
  admin: { email: 'root@test', password: 'correct-horse-battery' },
}

describe('seed', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
  })
  afterAll(async () => resetDb(payload))

  it('creates the tenant and a super admin', async () => {
    const out = await ensureTenantAndAdmin(payload, input)
    const user = await payload.findByID({ collection: 'users', id: out.userId })
    expect(user.roles).toContain('super-admin')
  })

  it('does nothing the second time', async () => {
    const first = await ensureTenantAndAdmin(payload, input)
    const second = await ensureTenantAndAdmin(payload, input)
    expect(second).toEqual(first)
    expect((await payload.find({ collection: 'tenants' })).totalDocs).toBe(1)
    expect((await payload.find({ collection: 'users' })).totalDocs).toBe(1)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

Run: `pnpm --filter @sites/cms test:int`
Expected: FAIL, cannot resolve `../src/seed`.

- [ ] **Step 3: Write `packages/cms/src/seed.ts` and `packages/cms/src/bin/seed.ts`**

`seed.ts`:

```ts
import type { Payload } from 'payload'

export type SeedInput = {
  tenant: { name: string; slug: string; siteUrl: string; revalidateSecret: string }
  admin: { email: string; password: string }
}

export async function ensureTenantAndAdmin(payload: Payload, input: SeedInput) {
  const tenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: input.tenant.slug } },
    limit: 1,
    overrideAccess: true,
  })
  const tenant =
    tenants.docs[0] ?? (await payload.create({ collection: 'tenants', data: input.tenant, overrideAccess: true }))

  const users = await payload.find({
    collection: 'users',
    where: { email: { equals: input.admin.email } },
    limit: 1,
    overrideAccess: true,
  })
  const user =
    users.docs[0] ??
    (await payload.create({
      collection: 'users',
      data: { email: input.admin.email, password: input.admin.password, roles: ['super-admin'] } as never,
      overrideAccess: true,
    }))

  return { tenantId: tenant.id, userId: user.id }
}
```

`bin/seed.ts`:

```ts
import { getPayload } from 'payload'
import config from '../dev.config'
import { requireEnv } from '../env'
import { ensureTenantAndAdmin } from '../seed'

const payload = await getPayload({ config })
const out = await ensureTenantAndAdmin(payload, {
  tenant: {
    name: requireEnv('SEED_TENANT_NAME'),
    slug: requireEnv('TENANT_SLUG'),
    siteUrl: requireEnv('SEED_SITE_URL'),
    revalidateSecret: requireEnv('REVALIDATE_SECRET'),
  },
  admin: { email: requireEnv('SEED_ADMIN_EMAIL'), password: requireEnv('SEED_ADMIN_PASSWORD') },
})
payload.logger.info(`Seeded tenant ${out.tenantId} and admin ${out.userId}`)
process.exit(0)
```

Add to `packages/cms/package.json` scripts:

```json
"seed": "PAYLOAD_CONFIG_PATH=src/dev.config.ts payload run src/bin/seed.ts"
```

Add to `packages/cms/src/index.ts`:

```ts
export { ensureTenantAndAdmin } from './seed'
export type { SeedInput } from './seed'
```

- [ ] **Step 4: Run the seed test**

Run: `pnpm --filter @sites/cms test:int`
Expected: all pass.

- [ ] **Step 5: Add Payload to the app**

```bash
pnpm --filter boerengroep add payload@catalog: @payloadcms/next@catalog: @payloadcms/ui@catalog: \
  @payloadcms/richtext-lexical@catalog: @payloadcms/live-preview-react@catalog: graphql@^16.8.1 \
  "@sites/cms@workspace:*"
cd apps/boerengroep
npx degit "payloadcms/payload/templates/blank/src/app/(payload)#v3.90.2" "app/(payload)"
cd ../..
```

The template supplies the admin page, the not-found page, the root layout for the admin, the REST and GraphQL routes and `custom.scss`. Do not edit those files by hand.

- [ ] **Step 6: Write `apps/boerengroep/payload.config.ts`**

```ts
import { createPayloadConfig } from '@sites/cms'

export default createPayloadConfig({
  tenantSlug: process.env.TENANT_SLUG ?? 'boerengroep',
})
```

- [ ] **Step 7: Wire the config into the app**

In `apps/boerengroep/tsconfig.json` change `paths` to:

```json
"paths": {
  "@/*": ["./*"],
  "@payload-config": ["./payload.config.ts"]
}
```

Replace `apps/boerengroep/next.config.ts` with:

```ts
import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import baseConfig from './next.config.base'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withPayload(withNextIntl(baseConfig))
```

In `apps/boerengroep/next.config.base.js`:

- Change `transpilePackages: ['motion']` to `transpilePackages: ['motion', '@sites/cms']`.
- Delete the `afterFiles` array that rewrites `/admin` to `/admin/index.html`, so `rewrites()` returns only `beforeFiles`.
- Add this entry to `images.remotePatterns`:

```js
{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com', port: '' },
```

Add to `apps/boerengroep/.env.local` (not committed):

```
PAYLOAD_SECRET=<output of: openssl rand -hex 32>
PAYLOAD_DATABASE_URL=postgres://payload:payload@127.0.0.1:54329/payload_test
TENANT_SLUG=boerengroep
REVALIDATE_SECRET=<output of: openssl rand -hex 32>
```

Add these scripts to `apps/boerengroep/package.json`:

```json
"payload": "payload",
"generate:importmap": "payload generate:importmap"
```

- [ ] **Step 8: Generate the import map and check the admin loads**

```bash
pnpm install
pnpm --filter boerengroep generate:importmap
pnpm --filter boerengroep dev &
sleep 30
echo "admin $(curl -s -o /dev/null -w '%{http_code}' -L http://localhost:3000/admin)"
echo "api   $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/tenants)"
echo "site  $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/en)"
echo "news  $(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:3000/api/newsletter/subscribe -H 'content-type: application/json' -d '{}')"
kill %1
```

Expected: `admin 200`, `api 403` (not logged in), `site 200`, and `news` is `400` or `422`, not `404`. A `404` there means the Payload catch-all route shadowed the existing newsletter API. In that case stop and report.

- [ ] **Step 9: Seed a local admin and log in by hand**

```bash
cd packages/cms
PAYLOAD_SECRET=dev PAYLOAD_DATABASE_URL=postgres://payload:payload@127.0.0.1:54329/payload_test \
TENANT_SLUG=boerengroep SEED_TENANT_NAME="Stichting Boerengroep" SEED_SITE_URL=http://localhost:3000 \
REVALIDATE_SECRET=local SEED_ADMIN_EMAIL=you@example.org SEED_ADMIN_PASSWORD=change-me-now \
pnpm seed
cd ../..
```

Open `http://localhost:3000/admin`, log in, and confirm that Pages, Events, Media and Site settings are listed and that a tenant selector shows Boerengroep.

- [ ] **Step 10: Create the first migration**

The migration must be generated against an empty database, not the test database that was pushed.

```bash
docker exec $(docker compose -f packages/cms/docker-compose.yml ps -q postgres) \
  psql -U payload -d postgres -c 'CREATE DATABASE payload_migrate;'
PAYLOAD_SECRET=dev PAYLOAD_DATABASE_URL=postgres://payload:payload@127.0.0.1:54329/payload_migrate \
  pnpm --filter @sites/cms migrate:create initial
ls packages/cms/src/migrations
```

Expected: a timestamped `*_initial.ts`, a matching `.json` and an `index.ts`.

- [ ] **Step 11: Write `apps/boerengroep/scripts/migrate-if-production.mjs`**

```js
import { execSync } from 'node:child_process'

const shouldRun = process.env.VERCEL_ENV === 'production' || process.env.RUN_MIGRATIONS === '1'

if (shouldRun) {
  console.log('Running Payload migrations')
  execSync('pnpm payload migrate', { stdio: 'inherit' })
} else {
  console.log('Skipping Payload migrations (not production and RUN_MIGRATIONS is not 1)')
}
```

In `apps/boerengroep/package.json` change the `build` script to:

```json
"build": "node scripts/migrate-if-production.mjs && tinacms build && tsx scripts/generate-pathnames.ts && next build"
```

- [ ] **Step 12: Write the failing migration-safety test `tools/check-migrations/find-destructive.test.mjs`**

```js
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findDestructive } from './find-destructive.mjs'

const wrap = (up, down = '') => `
export async function up({ db }) { await db.execute(sql\`${up}\`) }
export async function down({ db }) { await db.execute(sql\`${down}\`) }
`

test('accepts an additive migration', () => {
  assert.deepEqual(findDestructive(wrap('ALTER TABLE "pages" ADD COLUMN "x" varchar;')), [])
})

test('flags a dropped column', () => {
  assert.deepEqual(findDestructive(wrap('ALTER TABLE "pages" DROP COLUMN "x";')), ['DROP COLUMN'])
})

test('flags a dropped table and a rename together', () => {
  const found = findDestructive(wrap('DROP TABLE "old"; ALTER TABLE "a" RENAME COLUMN "x" TO "y";'))
  assert.deepEqual(found.sort(), ['DROP TABLE', 'RENAME COLUMN'])
})

test('ignores destructive statements in the down function', () => {
  assert.deepEqual(findDestructive(wrap('SELECT 1;', 'DROP TABLE "pages";')), [])
})

test('accepts a destructive migration that is marked as a contract step', () => {
  const src = `// contract-ok: both apps stopped reading pages.x in release 2026-11-01\n${wrap('ALTER TABLE "pages" DROP COLUMN "x";')}`
  assert.deepEqual(findDestructive(src), [])
})

test('does not accept an empty contract marker', () => {
  const src = `// contract-ok:\n${wrap('ALTER TABLE "pages" DROP COLUMN "x";')}`
  assert.deepEqual(findDestructive(src), ['DROP COLUMN'])
})
```

- [ ] **Step 13: Run it and watch it fail**

Run: `node --test tools/check-migrations/`
Expected: FAIL, cannot find `./find-destructive.mjs`.

- [ ] **Step 14: Write the checker**

`tools/check-migrations/package.json`:

```json
{
  "name": "@sites/check-migrations",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": { "test": "node --test" }
}
```

`tools/check-migrations/find-destructive.mjs`:

```js
const PATTERNS = [
  ['DROP COLUMN', /\bDROP\s+COLUMN\b/i],
  ['DROP TABLE', /\bDROP\s+TABLE\b/i],
  ['RENAME COLUMN', /\bRENAME\s+COLUMN\b/i],
  ['RENAME TO', /\bRENAME\s+TO\b/i],
]

/**
 * Returns the destructive statement kinds found in a migration's `up` function.
 * A file is exempt when it carries a `// contract-ok: <reason>` comment with a reason.
 */
export function findDestructive(source) {
  if (/\/\/\s*contract-ok:\s*\S+/.test(source)) return []
  const up = source.split(/export\s+async\s+function\s+down\b/)[0]
  return PATTERNS.filter(([, re]) => re.test(up)).map(([name]) => name)
}
```

`tools/check-migrations/run.mjs`:

```js
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { findDestructive } from './find-destructive.mjs'

const base = process.env.BASE_REF ?? 'origin/main'
const files = execSync(
  `git diff --name-only --diff-filter=AM ${base}...HEAD -- packages/cms/src/migrations`,
  { encoding: 'utf8' },
)
  .split('\n')
  .filter((f) => f.endsWith('.ts') && !f.endsWith('index.ts'))

let failed = false
for (const file of files) {
  const found = findDestructive(readFileSync(file, 'utf8'))
  if (found.length) {
    failed = true
    console.error(`${file}: ${found.join(', ')}`)
  }
}

if (failed) {
  console.error(
    '\nBoth sites read this database. Remove columns only in a release after both apps stopped reading them,',
  )
  console.error('then add a comment to the migration: // contract-ok: <why this is safe>')
  process.exit(1)
}
console.log(`Checked ${files.length} migration file(s): no unmarked destructive changes.`)
```

- [ ] **Step 15: Run the checker tests**

Run: `node --test tools/check-migrations/`
Expected: 6 tests pass.

- [ ] **Step 16: Replace the GitHub workflows**

```bash
git rm .github/workflows/build-and-deploy.yml .github/workflows/pr-open.yml
```

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main, payload-migration]

jobs:
  check:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_USER: payload
          POSTGRES_PASSWORD: payload
          POSTGRES_DB: payload_test
        ports: ["54329:5432"]
        options: >-
          --health-cmd "pg_isready -U payload -d payload_test"
          --health-interval 2s --health-timeout 3s --health-retries 20
    env:
      PAYLOAD_SECRET: ci-secret
      PAYLOAD_DATABASE_URL: postgres://payload:payload@127.0.0.1:54329/payload_test
      TENANT_SLUG: boerengroep
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm --filter @sites/cms exec vitest run --project int
      - run: node tools/check-migrations/run.mjs
        env:
          BASE_REF: origin/main
```

- [ ] **Step 17: Full verification and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test
pnpm --filter @sites/cms test:int
pnpm --filter boerengroep build-local
git add -A
git commit -m "feat: mount Payload admin in the app, seed, first migration and CI"
```

Expected: every command exits 0. The public site is still served by Tina.

---

## Done when

- `pnpm --filter boerengroep dev` serves the Tina-backed site and the Payload admin at `/admin` side by side.
- A super admin can log in and create a page, an event and site settings for the Boerengroep tenant.
- Unit and integration suites pass locally and in CI.
- One committed migration creates the whole schema on an empty database.

Next: Plan B migrates the content into this schema.
