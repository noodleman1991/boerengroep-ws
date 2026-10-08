import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig, type CollectionConfig, type Config } from 'payload'
import sharp from 'sharp'
import { anyone, authenticated, canAssignTenants } from './access'
import { type AccessUser, isSuperAdmin } from './access/roles'
import { Authors } from './collections/authors'
import { EventKinds } from './collections/event-kinds'
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
import { siteEditor } from './editor'
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
  EventKinds,
  PastEvents,
  Newsletters,
  Vacancies,
  Media,
  Speakers,
  Authors,
  Tags,
  SiteSettings,
  Redirects,
]

/**
 * The order of the menu in the admin panel, by what editors come to do: pages, calendar,
 * news, library, forms, settings, and last the people and the websites.
 */
const MENU_ORDER = [
  'pages',
  'events',
  'past-events',
  'event-kinds',
  'newsletters',
  'vacancies',
  'media',
  'speakers',
  'authors',
  'tags',
  'forms',
  'form-submissions',
  'site-settings',
  'redirects',
  'users',
  'tenants',
]

/** Sorts the collections for the menu. Plugins add theirs at the end, which would put Forms last. */
const inMenuOrder = (config: Config): Config => {
  const rank = (slug: string) => {
    const index = MENU_ORDER.indexOf(slug)
    return index === -1 ? MENU_ORDER.length : index
  }
  return { ...config, collections: [...(config.collections ?? [])].sort((a, b) => rank(a.slug) - rank(b.slug)) }
}

type Named = { name?: string; label?: unknown; labels?: unknown; admin?: Record<string, unknown>; fields?: Named[] }

/**
 * The plugin adds the list of a person's websites without any wording of its own. This gives
 * that list, and the box for the website inside it, names an editor understands.
 */
const inPlainWords = (config: Config): Config => ({
  ...config,
  collections: (config.collections ?? []).map((collection) => {
    if (collection.slug !== Users.slug) return collection
    const fields = (collection.fields as Named[]).map((field) => {
      if (field.name !== 'tenants') return field
      return {
        ...field,
        label: 'Websites this person works on',
        labels: { singular: 'Website', plural: 'Websites' },
        admin: {
          ...field.admin,
          description:
            'Add a row for each website this person works on, and choose what they may do there. Someone who works on both websites gets two rows.',
        },
        fields: (field.fields ?? []).map((inner) => (inner.name === 'tenant' ? { ...inner, label: 'Website' } : inner)),
      }
    })
    return { ...collection, fields: fields as typeof collection.fields }
  }),
})

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
    admin: {
      user: Users.slug,
      // The components live in the app that serves the admin panel (the Boerengroep site),
      // because they must share one copy of the admin library with it.
      components: {
        // Which site am I changing? Shown as tabs to people who work on both.
        beforeNavLinks: ['@/components/admin/site-tabs#SiteTabs'],
        // A welcome with the things people come here to do.
        beforeDashboard: ['@/components/admin/dashboard-intro#DashboardIntro'],
        // The symbol of the logo instead of the mark of the software: on the login page and in the corner.
        graphics: { Logo: '@/components/admin/brand#AdminLogo', Icon: '@/components/admin/brand#AdminIcon' },
        beforeLogin: ['@/components/admin/brand#LoginWelcome'],
      },
      // What the first screen shows under the welcome: every kind of content of the chosen
      // website, in plain words, with how much of it there is.
      dashboard: {
        widgets: [{ slug: 'site-overview', label: 'Everything on this website', Component: '@/components/admin/site-overview#SiteOverview', minWidth: 'full', maxWidth: 'full' }],
        defaultLayout: [{ widgetSlug: 'site-overview', width: 'full' }],
      },
      meta: { titleSuffix: ' · Website admin', icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/brand/boerengroep-symbol.svg' }] },
    },
    // The plugin's own words speak of "tenants". Editors know them as websites.
    i18n: {
      translations: {
        en: {
          'plugin-multi-tenant': {
            'assign-tenant-button-label': 'Move to the other website',
            'assign-tenant-modal-title': 'Which website does "{{title}}" belong to?',
            'field-assignedTenant-label': 'Website',
            'nav-tenantSelector-label': 'Website',
          },
        },
      },
    },
    collections: [...tenantScoped.map(withRevalidation), Users, Tenants],
    editor: siteEditor,
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
              label: 'What they may do there',
              admin: {
                description:
                  'An editor writes, changes and publishes. An admin of this website can also change its menu, footer and settings, and add people.',
              },
              options: [
                { label: 'Admin of this website', value: 'tenant-admin' },
                { label: 'Editor', value: 'editor' },
              ],
            },
          ],
        },
        userHasAccessToAllTenants: (user) => isSuperAdmin(user as unknown as AccessUser),
        // The lists of people and of websites show everyone and everything the reader may see,
        // whichever website is chosen at the top. Who may see whom is decided in ../access.
        useUsersTenantFilter: false,
        useTenantsListFilter: false,
      }),
      vercelBlobStorage({
        enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
        token: process.env.BLOB_READ_WRITE_TOKEN,
        clientUploads: true,
        collections: {
          media: { disablePayloadAccessControl: true },
        },
      }),
      inPlainWords,
      // Last, so it also places the collections that the plugins above add.
      inMenuOrder,
    ],
    typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
    sharp,
  })
}
