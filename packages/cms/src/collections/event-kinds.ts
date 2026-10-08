import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { legacyIdField } from '../fields/shared'

/**
 * The colours a kind of event can have. Each is dark enough to read on white and on the
 * tinted backgrounds, so an editor cannot pick one that visitors cannot see.
 */
export const KIND_COLOURS = [
  { label: 'Green', value: 'green' },
  { label: 'Orange', value: 'orange' },
  { label: 'Blue', value: 'blue' },
  { label: 'Red', value: 'red' },
  { label: 'Purple', value: 'purple' },
  { label: 'Teal', value: 'teal' },
  { label: 'Brown', value: 'brown' },
  { label: 'Grey', value: 'grey' },
]

/**
 * Kinds of events, such as "Workshop" or "Open Pot". Editors make them. The calendar shows
 * one filter button for each kind that has events, so the filter always follows this list.
 */
export const EventKinds: CollectionConfig = {
  slug: 'event-kinds',
  labels: { singular: 'Kind of event', plural: 'Kinds of events' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'colour'],
    group: 'Calendar',
    description:
      'The kinds visitors can filter the calendar by, each with its own colour. Add, rename or remove kinds here and the calendar follows. A kind without events is not shown to visitors.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'For example "Workshop". Fill it in once per language with the language switch at the top right.' },
    },
    {
      name: 'colour',
      type: 'select',
      required: true,
      defaultValue: 'green',
      label: 'Colour',
      options: KIND_COLOURS,
      admin: { description: 'Shown as a dot next to events of this kind and on the month view.' },
    },
    legacyIdField,
  ],
}
