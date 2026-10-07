import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { languageField, legacyIdField, slugField } from '../fields/shared'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'startDate', 'eventType'], group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    languageField,
    { name: 'description', type: 'textarea' },
    {
      name: 'location',
      type: 'group',
      fields: [
        { name: 'address', type: 'text' },
        { name: 'mapsLink', type: 'text', label: 'Google Maps link' },
        { name: 'callLink', type: 'text', label: 'Video call link' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    { name: 'endDate', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: [
        { label: 'Talk', value: 'talk' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Lecture', value: 'lecture' },
        { label: 'Meeting', value: 'meeting' },
        { label: 'Board Meeting', value: 'board-meeting' },
        { label: 'Soup Kitchen', value: 'soup-kitchen' },
        { label: 'CSA', value: 'csa' },
        { label: 'Excursion', value: 'excursion' },
      ],
    },
    {
      name: 'speakers',
      type: 'array',
      label: 'Speakers and hosts',
      fields: [
        { name: 'speaker', type: 'relationship', relationTo: 'speakers' },
        { name: 'role', type: 'text' },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'featured', type: 'checkbox' },
    {
      name: 'registrationLink',
      type: 'richText',
      admin: { description: 'Type the link text, select it, and add the registration URL as a link.' },
    },
    legacyIdField,
  ],
}
