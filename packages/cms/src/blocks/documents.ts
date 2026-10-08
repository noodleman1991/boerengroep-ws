import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Documents: Block = {
  slug: 'documents',
  interfaceName: 'DocumentsBlock',
  labels: { singular: 'Downloads', plural: 'Downloads' },
  admin: {
    group: 'Media',
    custom: {
      description: 'A list of files to download, such as a year report, a flyer or a form. PDF, Word, Excel and OpenDocument work.',
    },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    {
      name: 'files',
      type: 'array',
      labels: { singular: 'File', plural: 'Files' },
      fields: [
        { name: 'file', type: 'upload', relationTo: 'media', required: true },
        { name: 'label', type: 'text', localized: true, label: 'Name shown to visitors', admin: { description: 'Without it the file name is shown.' } },
      ],
    },
  ],
}
