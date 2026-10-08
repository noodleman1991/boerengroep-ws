import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { legacyIdField } from '../fields/shared'

export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: { singular: 'Author', plural: 'Authors' },
  admin: {
    useAsTitle: 'name',
    group: 'Library',
    description: 'People who write the stories of past events. Add someone once and choose them on any story.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media', label: 'Picture' },
    legacyIdField,
  ],
}
