import type { Block } from 'payload'
import { backgroundField, iconField } from '../fields/shared'

export const Features: Block = {
  slug: 'features',
  interfaceName: 'FeaturesBlock',
  labels: { singular: 'Highlights', plural: 'Highlights' },
  admin: {
    group: 'Text and pictures',
    custom: { description: 'A few short items next to each other, for example three things you do.' },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    { name: 'description', type: 'text', label: 'Line under the title' },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Item', plural: 'Items' },
      fields: [iconField, { name: 'title', type: 'text' }, { name: 'text', type: 'richText' }],
    },
  ],
}
