import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Stats: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    { name: 'description', type: 'text' },
    {
      name: 'stats',
      type: 'array',
      fields: [
        { name: 'stat', type: 'text' },
        { name: 'type', type: 'text' },
      ],
    },
  ],
}
