import type { Block } from 'payload'
import { rowLabel } from '../fields/row-label'
import { backgroundField } from '../fields/shared'

/** What an editor can put in the spotlight. */
export const SPOTLIGHT_KINDS = ['pages', 'events', 'newsletters', 'past-events', 'vacancies'] as const

export const Spotlight: Block = {
  slug: 'spotlight',
  interfaceName: 'SpotlightBlock',
  labels: { singular: 'In the spotlight', plural: 'In the spotlight' },
  admin: {
    group: 'Events and news',
    custom: {
      description:
        'Puts something you choose in front of visitors: a page, an event, a news item, a story of a past event or a vacancy. Title, text and picture come from the thing itself. Write your own here when you want different words. One thing shows large, two or three show side by side.',
    },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text', label: 'Heading above', admin: { description: 'Optional, for example "Don\'t miss".' } },
    {
      name: 'items',
      type: 'array',
      label: 'What is in the spotlight',
      labels: { singular: 'Thing in the spotlight', plural: 'Things in the spotlight' },
      minRows: 1,
      maxRows: 3,
      admin: { components: rowLabel('title', 'In the spotlight').components },
      fields: [
        {
          name: 'what',
          type: 'relationship',
          relationTo: [...SPOTLIGHT_KINDS],
          required: true,
          label: 'What to show',
          admin: { description: 'First choose the kind (page, event, news, story, vacancy), then the one you mean.' },
        },
        { name: 'title', type: 'text', label: 'Your own title', admin: { description: 'Optional. Empty: the title of the thing itself.' } },
        { name: 'text', type: 'textarea', label: 'Your own text', admin: { description: 'Optional. Empty: the first lines of the thing itself.' } },
        {
          name: 'picture',
          type: 'upload',
          relationTo: 'media',
          label: 'Your own picture',
          admin: { description: 'Optional. Empty: the picture of the thing itself, when it has one.' },
        },
        { name: 'buttonLabel', type: 'text', label: 'Words on the button', admin: { description: 'Optional. Empty: "Read more".' } },
      ],
    },
  ],
}
