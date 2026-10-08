import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'
import { rowLabel } from '../fields/row-label'

export const Stats: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: { singular: 'Numbers', plural: 'Numbers' },
  admin: {
    group: 'Text and pictures',
    custom: { description: 'A few big numbers with a short label each, such as years active or members.' },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    { name: 'description', type: 'text', label: 'Line under the title' },
    {
      name: 'stats',
      type: 'array',
      label: 'Numbers',
      labels: { singular: 'Number', plural: 'Numbers' },
      admin: rowLabel('type', 'Number'),
      fields: [
        { name: 'stat', type: 'text', label: 'Number', admin: { description: 'For example 55 or 1.200.' } },
        { name: 'type', type: 'text', label: 'What it counts' },
      ],
    },
  ],
}
