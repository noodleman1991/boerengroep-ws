import type { CollectionConfig, PayloadRequest } from 'payload'
import { type Ref, relId } from '../access/roles'
import type { CmsCustom } from '../config'
import { signPreview } from '../preview'
import { authenticated, publishedOrAuthenticated } from '../access'
import { pageBlocks } from '../blocks'
import { legacyIdField } from '../fields/shared'
import { computePath, resaveChildren } from '../hooks/page-path'

/**
 * Address of the draft preview for a page. For a page of the site that serves this admin panel
 * it is a plain address on the same site. For a page of the other site it is a signed link to
 * that site, which cannot see the editor's login.
 */
export function pagePreviewUrl(path: unknown, localeCode: string | undefined, other?: { siteUrl: string; secret: string }): string {
  const pagePath = typeof path === 'string' && path.startsWith('/') ? path : '/'
  const target = `/${localeCode ?? 'en'}${pagePath === '/' ? '' : pagePath}`
  if (!other) return `/api/preview?path=${encodeURIComponent(target)}`
  const { exp, sig } = signPreview(target, other.secret)
  return `${other.siteUrl.replace(/\/$/, '')}/api/preview?path=${encodeURIComponent(target)}&exp=${exp}&sig=${sig}`
}

type PreviewArgs = { data?: { path?: unknown; tenant?: unknown } | null; locale?: { code?: string } | null; req?: PayloadRequest }

/** The preview address of a page, on whichever site the page belongs to. */
async function previewOf({ data, locale, req }: PreviewArgs): Promise<string> {
  const tenantId = relId(data?.tenant as Ref)
  const own = (req?.payload.config.custom as Partial<CmsCustom> | undefined)?.tenantSlug
  if (!req || tenantId === undefined || !own) return pagePreviewUrl(data?.path, locale?.code)
  try {
    // Read loosely: tools that load this file with their own config do not know the generated types.
    const tenant = (await req.payload.findByID({ collection: 'tenants', id: tenantId, depth: 0, overrideAccess: true })) as unknown as {
      slug: string
      siteUrl: string
      revalidateSecret: string
    }
    return pagePreviewUrl(data?.path, locale?.code, tenant.slug === own ? undefined : { siteUrl: tenant.siteUrl, secret: tenant.revalidateSecret })
  } catch {
    return pagePreviewUrl(data?.path, locale?.code)
  }
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', '_status'],
    group: 'Pages',
    description:
      'The pages of the site. A page is built from blocks: text, pictures, events, a form. Every page exists in English and in Dutch. Switch language at the top right.',
    // The page beside the form while editing, and a button that opens it in a tab of its own.
    // The second matters for the other site: some browsers do not let a framed site remember
    // that a preview was started.
    livePreview: { url: (args) => previewOf(args as PreviewArgs) },
    preview: (data, { locale, req }) => previewOf({ data, locale: { code: locale }, req }),
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  versions: { drafts: true },
  hooks: { beforeChange: [computePath], afterChange: [resaveChildren] },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'The name of the page. Shown in the browser tab and in search results.' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      localized: true,
      label: 'Address',
      admin: {
        position: 'sidebar',
        description: 'The last part of the web address in this language, for example "history". The home page uses "home".',
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
      label: 'Sits under',
      admin: {
        position: 'sidebar',
        description: 'Choose a page to make this one a sub-page, for example History under About us. The address follows by itself.',
      },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: 'path',
      type: 'text',
      localized: true,
      index: true,
      label: 'Full address',
      admin: { readOnly: true, position: 'sidebar', description: 'Made for you from the address and the page it sits under.' },
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      label: 'Text',
      admin: { description: 'Optional. Plain text for a simple page. For anything more, use the blocks below.' },
    },
    {
      name: 'blocks',
      type: 'blocks',
      localized: true,
      labels: { singular: 'Block', plural: 'Blocks' },
      blocks: pageBlocks,
      admin: { description: 'The building blocks of the page, from top to bottom. Drag a block to move it.' },
    },
    legacyIdField,
  ],
}
