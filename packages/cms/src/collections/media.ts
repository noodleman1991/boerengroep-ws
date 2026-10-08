import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Picture or file', plural: 'Pictures and files' },
  admin: {
    group: 'Library',
    description:
      'Every picture and document on the site. Upload here or straight from the page you are editing. Open a picture to cut it or to choose which part must stay visible.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  upload: {
    // Used only when no Blob token is set. MEDIA_DIR lets the app and the tools share one folder locally.
    staticDir: process.env.MEDIA_DIR || 'media',
    crop: true,
    focalPoint: true,
    adminThumbnail: 'thumbnail',
    // Each size is cut around the focal point, so faces and posters stay in view.
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300 },
      { name: 'card', width: 800, height: 600 },
      { name: 'square', width: 800, height: 800 },
      { name: 'wide', width: 1600, height: 900 },
      { name: 'og', width: 1200, height: 630 },
    ],
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
    {
      name: 'alt',
      type: 'text',
      label: 'Describe the picture',
      admin: { description: 'One sentence for people who cannot see it, and for search engines.' },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      admin: { description: 'Optional. Shown under the picture in galleries. Who, what, where, or who took it.' },
    },
    {
      name: 'legacyPath',
      type: 'text',
      index: true,
      admin: { readOnly: true, hidden: true },
    },
  ],
}
