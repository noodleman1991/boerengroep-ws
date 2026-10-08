import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const NewsPreview: Block = {
  slug: 'newsPreview',
  interfaceName: 'NewsPreviewBlock',
  labels: { singular: 'Latest news', plural: 'Latest news' },
  admin: {
    group: 'Events and news',
    custom: {
      description:
        'Shows the newest news items by itself. Add a news item and it appears here, no need to touch this page. An item marked "in the spotlight" comes first and larger. With no news at all the block stays hidden.',
    },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text', admin: { description: 'Optional. Without it the heading is "News".' } },
    { name: 'description', type: 'textarea', label: 'Text under the title' },
    {
      name: 'which',
      type: 'radio',
      defaultValue: 'all',
      label: 'Whose news',
      options: [
        { label: 'All news', value: 'all' },
        { label: 'Our own news', value: 'own' },
        { label: 'News from friends', value: 'friends' },
      ],
      admin: { layout: 'horizontal' },
    },
    { name: 'count', type: 'number', defaultValue: 3, min: 1, max: 9, label: 'How many' },
    {
      name: 'spotlightFirst',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show the item that is "in the spotlight" first and larger',
      admin: { description: 'You put a news item in the spotlight with the tick box at the bottom of the item itself.' },
    },
  ],
}
