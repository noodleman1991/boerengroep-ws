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
