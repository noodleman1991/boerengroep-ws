import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const EventsCalendarPreview: Block = {
  slug: 'eventsCalendarPreview',
  interfaceName: 'EventsCalendarPreviewBlock',
  fields: [
    backgroundField,
    { name: 'title', type: 'text', admin: { description: 'Optional. Defaults to the translated title.' } },
    { name: 'description', type: 'textarea' },
  ],
}
