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
