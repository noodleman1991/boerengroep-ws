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
