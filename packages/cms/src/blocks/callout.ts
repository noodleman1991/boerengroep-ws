import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Callout: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  labels: { singular: 'Announcement', plural: 'Announcements' },
  admin: {
    group: 'Text and pictures',
    custom: { description: 'One short line with a link, for something timely such as a call for volunteers.' },
  },
  fields: [
    backgroundField,
    { name: 'text', type: 'text' },
    { name: 'url', type: 'text', label: 'Address it links to' },
  ],
}
