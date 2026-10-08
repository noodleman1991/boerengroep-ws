import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { pageBlocks } from '../blocks'
import { legacyIdField } from '../fields/shared'
import { computePath, resaveChildren } from '../hooks/page-path'

/** Address of the draft preview for a page. Relative, because each site serves its own admin. */
export function pagePreviewUrl(path: unknown, localeCode: string | undefined): string {
  const pagePath = typeof path === 'string' && path.startsWith('/') ? path : '/'
  const target = `/${localeCode ?? 'en'}${pagePath === '/' ? '' : pagePath}`
  return `/api/preview?path=${encodeURIComponent(target)}`
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
    livePreview: {
      url: ({ data, locale }) => pagePreviewUrl(data?.path, locale?.code),
    },
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
