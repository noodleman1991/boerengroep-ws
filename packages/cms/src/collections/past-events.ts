import type { CollectionConfig } from 'payload'
import { authenticated, publishedOrAuthenticated } from '../access'
import { articleBlocks } from '../blocks'
import { languageField, legacyIdField, slugField } from '../fields/shared'

export const PastEvents: CollectionConfig = {
  slug: 'past-events',
  labels: { singular: 'Past event', plural: 'Past events' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date'],
    group: 'Calendar',
    description: 'Stories and photos of events that have happened. Link one to its calendar event and the two point to each other.',
  },
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
    {
      name: 'photos',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description:
          'Drop all the photos of the day here at once. They show as a mosaic on the story, and can be reused in a Photo gallery block on any page.',
      },
    },
    { name: 'blocks', type: 'blocks', label: 'Content blocks', blocks: articleBlocks },
    { name: 'body', type: 'richText' },
    legacyIdField,
  ],
}
