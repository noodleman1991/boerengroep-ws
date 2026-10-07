import type { Block } from 'payload'
import { backgroundField, iconField } from '../fields/shared'

export const Features: Block = {
  slug: 'features',
  interfaceName: 'FeaturesBlock',
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    { name: 'description', type: 'text' },
    {
      name: 'items',
      type: 'array',
      fields: [iconField, { name: 'title', type: 'text' }, { name: 'text', type: 'richText' }],
    },
  ],
}
