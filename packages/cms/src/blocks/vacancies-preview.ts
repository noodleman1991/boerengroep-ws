import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const VacanciesPreview: Block = {
  slug: 'vacanciesPreview',
  interfaceName: 'VacanciesPreviewBlock',
  labels: { singular: 'Open positions', plural: 'Open positions' },
  admin: {
    group: 'Events and news',
    custom: {
      description:
        'Shows the vacancies people can apply for right now, by itself. A vacancy leaves this block the day after its last day. A vacancy marked "in the spotlight" comes first.',
    },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text', admin: { description: 'Optional. Without it the heading is "Join us".' } },
    { name: 'description', type: 'textarea', label: 'Text under the title' },
    { name: 'count', type: 'number', defaultValue: 3, min: 1, max: 9, label: 'How many' },
    {
      name: 'whenNone',
      type: 'radio',
      defaultValue: 'hide',
      label: 'When nothing is open',
      options: [
        { label: 'Leave this block out', value: 'hide' },
        { label: 'Say that nothing is open right now', value: 'say' },
      ],
      admin: { layout: 'horizontal' },
    },
  ],
}
