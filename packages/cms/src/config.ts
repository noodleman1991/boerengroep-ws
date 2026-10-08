import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig, type CollectionConfig } from 'payload'
import sharp from 'sharp'
import { anyone, authenticated, canAssignTenants } from './access'
import { type AccessUser, isSuperAdmin } from './access/roles'
import { Authors } from './collections/authors'
import { Events } from './collections/events'
import { Media } from './collections/media'
import { Newsletters } from './collections/newsletters'
import { Pages } from './collections/pages'
import { PastEvents } from './collections/past-events'
import { Redirects } from './collections/redirects'
import { SiteSettings } from './collections/site-settings'
import { Speakers } from './collections/speakers'
import { Tags } from './collections/tags'
import { Tenants } from './collections/tenants'
import { Users } from './collections/users'
import { Vacancies } from './collections/vacancies'
import { requireEnv } from './env'
import { revalidationHooks, withRevalidation } from './hooks/revalidate'

export type CreateConfigOptions = {
  /** The tenant this app serves. */
  tenantSlug: string
  /** Called with cache tags when a document of this app's own tenant changes. */
  revalidateLocal?: (tags: string[]) => void | Promise<void>
  /** Sender for CMS emails such as password resets. Without it emails are only logged. */
  email?: { apiKey: string; fromAddress: string; fromName: string }
}

/** What hooks may read from `config.custom`. Secrets such as the email key are not stored there. */
export type CmsCustom = Pick<CreateConfigOptions, 'tenantSlug' | 'revalidateLocal'>

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** Collections that carry a `tenant` field. Extended in later tasks. */
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

/** Slugs of tenant-scoped collections that hold exactly one document per tenant. */
export const onePerTenant: string[] = ['site-settings']

export function createPayloadConfig(opts: CreateConfigOptions) {
  const scoped = Object.fromEntries([
    ...tenantScoped.map((c) => [c.slug, onePerTenant.includes(c.slug) ? { isGlobal: true } : {}]),
    // Collections that the form builder adds. Each site has its own forms and responses.
    ['forms', {}],
    ['form-submissions', {}],
  ])
  const formHooks = revalidationHooks('forms')

  return buildConfig({
    secret: requireEnv('PAYLOAD_SECRET'),
    custom: { tenantSlug: opts.tenantSlug, revalidateLocal: opts.revalidateLocal } satisfies CmsCustom,
    ...(opts.email
      ? {
          email: resendAdapter({
            apiKey: opts.email.apiKey,
            defaultFromAddress: opts.email.fromAddress,
            defaultFromName: opts.email.fromName,
          }),
        }
      : {}),
    admin: { user: Users.slug },
    collections: [...tenantScoped.map(withRevalidation), Users, Tenants],
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
      // Must come before the multi-tenant plugin, which adds the site field to its collections.
      formBuilderPlugin({
        fields: { payment: false, state: false, country: false },
        formOverrides: {
          labels: { singular: 'Form', plural: 'Forms' },
          admin: {
            group: 'Forms',
            description:
              'Forms you can place on a page with the Form block or the Item block: a contact form, a sign-up, an order. You decide the questions and the message people see afterwards.',
          },
          access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
          hooks: { afterChange: [formHooks.afterChange], afterDelete: [formHooks.afterDelete] },
        },
        formSubmissionOverrides: {
          labels: { singular: 'Form response', plural: 'Form responses' },
          admin: {
            group: 'Forms',
            description: 'What people filled in. Only people who work on this site can read them.',
          },
          // The site saves responses itself after its own checks. Nothing comes in through the open API.
          access: { create: () => false, read: authenticated, update: () => false, delete: authenticated },
        },
      }),
      multiTenantPlugin({
        tenantsSlug: Tenants.slug,
        collections: scoped,
        tenantsArrayField: {
          // The plugin's default lets only super admins write memberships.
          arrayFieldAccess: { create: canAssignTenants, update: canAssignTenants },
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
        userHasAccessToAllTenants: (user) => isSuperAdmin(user as unknown as AccessUser),
      }),
      vercelBlobStorage({
        enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
        token: process.env.BLOB_READ_WRITE_TOKEN,
        clientUploads: true,
        collections: {
          media: { disablePayloadAccessControl: true },
        },
      }),
    ],
    typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
    sharp,
  })
}
