import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Video: Block = {
  slug: 'video',
  interfaceName: 'VideoBlock',
  labels: { singular: 'Video', plural: 'Videos' },
  admin: {
    group: 'Media',
    custom: {
      description:
        'A YouTube or Vimeo video. Paste the link from the address bar. The video only loads when a visitor presses play, so no tracking happens before that.',
    },
  },
  fields: [
    backgroundField,
    {
      name: 'color',
      type: 'select',
      admin: { hidden: true },
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Tint', value: 'tint' },
        { label: 'Primary', value: 'primary' },
      ],
    },
    { name: 'url', type: 'text', label: 'Video link', admin: { description: 'For example https://www.youtube.com/watch?v=... or https://vimeo.com/...' } },
    { name: 'caption', type: 'text', label: 'Line under the video' },
    { name: 'poster', type: 'upload', relationTo: 'media', label: 'Cover picture', admin: { description: 'Optional. Shown before the video plays. Without it the video\'s own cover is used.' } },
    { name: 'autoPlay', type: 'checkbox', admin: { hidden: true } },
    { name: 'loop', type: 'checkbox', admin: { hidden: true } },
  ],
}
