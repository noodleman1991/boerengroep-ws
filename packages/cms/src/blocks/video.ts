import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Video: Block = {
  slug: 'video',
  interfaceName: 'VideoBlock',
  fields: [
    backgroundField,
    {
      name: 'color',
      type: 'select',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Tint', value: 'tint' },
        { label: 'Primary', value: 'primary' },
      ],
    },
    { name: 'url', type: 'text' },
    { name: 'autoPlay', type: 'checkbox' },
    { name: 'loop', type: 'checkbox' },
  ],
}
