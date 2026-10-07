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
