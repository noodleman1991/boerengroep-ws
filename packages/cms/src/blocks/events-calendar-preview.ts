import type { Block } from 'payload'
import { backgroundField, EVENT_TYPE_OPTIONS } from '../fields/shared'

type Sibling = { mode?: string } | undefined

export const EventsCalendarPreview: Block = {
  slug: 'eventsCalendarPreview',
  interfaceName: 'EventsCalendarPreviewBlock',
  labels: { singular: 'Events', plural: 'Events' },
  admin: {
    group: 'Events and news',
    custom: {
      description:
        'Shows events from the calendar. By default the next ones coming up. You can also show one kind of event or pick them yourself.',
    },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text', admin: { description: 'Optional. Without it the heading is "What\'s on".' } },
    { name: 'description', type: 'textarea', label: 'Text under the title' },
    {
      name: 'mode',
      type: 'radio',
      defaultValue: 'upcoming',
      label: 'Which events',
      options: [
        { label: 'The next ones coming up', value: 'upcoming' },
        { label: 'One kind of event', value: 'type' },
        { label: 'Events I choose', value: 'picked' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      name: 'eventType',
      type: 'select',
      label: 'Kind of event',
      options: EVENT_TYPE_OPTIONS,
      admin: { condition: (_d, s: Sibling) => s?.mode === 'type' },
    },
    {
      name: 'events',
      type: 'relationship',
      relationTo: 'events',
      hasMany: true,
      label: 'Chosen events',
      admin: { condition: (_d, s: Sibling) => s?.mode === 'picked' },
    },
    {
      name: 'count',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 12,
      label: 'How many',
      admin: { condition: (_d, s: Sibling) => s?.mode !== 'picked' },
    },
    {
      name: 'showMiniCalendar',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show a small month calendar next to the list',
    },
  ],
}
