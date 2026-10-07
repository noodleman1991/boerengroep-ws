import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  upload: {
    mimeTypes: ['image/*', 'application/pdf', 'video/*', 'audio/*'],
  },
  fields: [
    { name: 'alt', type: 'text' },
    {
      name: 'legacyPath',
      type: 'text',
      index: true,
      admin: { readOnly: true, description: 'Original /uploads path. Old links redirect from here.' },
    },
  ],
}
