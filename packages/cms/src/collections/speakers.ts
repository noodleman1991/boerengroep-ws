import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { legacyIdField } from '../fields/shared'

export const Speakers: CollectionConfig = {
  slug: 'speakers',
  admin: { useAsTitle: 'name', group: 'People' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'affiliation', type: 'text' },
    { name: 'bio', type: 'richText' },
    legacyIdField,
  ],
}
