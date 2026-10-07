import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  upload: {
    // Used only when no Blob token is set. MEDIA_DIR lets the app and the tools share one folder locally.
    staticDir: process.env.MEDIA_DIR || 'media',
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
