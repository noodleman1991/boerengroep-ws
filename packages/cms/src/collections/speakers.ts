import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { legacyIdField } from '../fields/shared'

export const Speakers: CollectionConfig = {
  slug: 'speakers',
  labels: { singular: 'Speaker or host', plural: 'Speakers and hosts' },
  admin: {
    useAsTitle: 'name',
    group: 'Library',
    description: 'People who speak at or host events. Add someone once and choose them on any event.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media', label: 'Picture' },
    {
      name: 'affiliation',
      type: 'text',
      label: 'Organisation',
      admin: { description: 'For example "Wageningen University" or "farmer in Renkum". Shown next to the name.' },
    },
    { name: 'bio', type: 'richText', label: 'About this person' },
    legacyIdField,
  ],
}
