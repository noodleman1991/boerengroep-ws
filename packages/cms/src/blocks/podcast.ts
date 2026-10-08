import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

type Sibling = { mode?: string } | undefined

export const Podcast: Block = {
  slug: 'podcast',
  interfaceName: 'PodcastBlock',
  labels: { singular: 'Podcast episodes', plural: 'Podcast episodes' },
  admin: {
    group: 'Media',
    custom: {
      description:
        'Episodes from your podcast with a player. New episodes appear by themselves when you publish them where your podcast is hosted.',
    },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    {
      name: 'mode',
      type: 'radio',
      defaultValue: 'latest',
      label: 'Which episodes',
      options: [
        { label: 'The latest ones', value: 'latest' },
        { label: 'Episodes I choose', value: 'picked' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      name: 'count',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 12,
      label: 'How many',
      admin: { condition: (_d, s: Sibling) => (s?.mode ?? 'latest') === 'latest' },
    },
    {
      name: 'episodes',
      type: 'array',
      label: 'Chosen episodes',
      labels: { singular: 'Episode', plural: 'Episodes' },
      admin: {
        condition: (_d, s: Sibling) => s?.mode === 'picked',
        description: 'Type a few words from the title of each episode. The first episode that matches is shown.',
      },
      fields: [{ name: 'match', type: 'text', required: true, label: 'Words from the title' }],
    },
  ],
}
