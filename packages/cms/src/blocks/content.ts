import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: { singular: 'Text', plural: 'Texts' },
  admin: {
    group: 'Text and pictures',
    custom: { description: 'Free text with headings, lists, links, pictures and videos. The workhorse for most pages.' },
  },
  fields: [
    backgroundField,
    {
      name: 'width',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Reading width', value: 'narrow' },
        { label: 'Normal', value: 'normal' },
        { label: 'Wide', value: 'wide' },
      ],
      admin: { description: 'Reading width is the most comfortable for longer texts.' },
    },
    { name: 'body', type: 'richText', label: 'Text' },
  ],
}
