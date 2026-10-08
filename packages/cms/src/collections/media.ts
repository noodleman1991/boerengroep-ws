import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  upload: {
    // Used only when no Blob token is set. MEDIA_DIR lets the app and the tools share one folder locally.
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: [
      'image/*',
      'video/*',
      'audio/*',
      'application/pdf',
      // Word, Excel, PowerPoint and OpenDocument, for vacancy texts, year reports and forms.
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'text/plain',
      'text/csv',
    ],
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
