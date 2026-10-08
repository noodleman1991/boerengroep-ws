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
    { name: 'heroImg', type: 'upload', relationTo: 'media', label: 'Main picture', admin: { description: 'Shown large at the top of the story and small in the list.' } },
    { name: 'excerpt', type: 'richText', label: 'Short summary', admin: { description: 'Two or three sentences. Shown in the list and at the top of the story.' } },
    { name: 'author', type: 'relationship', relationTo: 'authors', label: 'Written by' },
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'When it was',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'relatedEvent',
      type: 'relationship',
      relationTo: 'events',
      label: 'The event on the calendar',
      admin: { description: 'Optional. Choose the event this story is about. The event page then links to this story, and this story to the event.' },
    },
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
    {
      name: 'blocks',
      type: 'blocks',
      label: 'Blocks',
      labels: { singular: 'Block', plural: 'Blocks' },
      blocks: articleBlocks,
      admin: { description: 'Optional extras under the text: a video, a quote, files.' },
    },
    { name: 'body', type: 'richText', label: 'The story' },
    legacyIdField,
  ],
}
