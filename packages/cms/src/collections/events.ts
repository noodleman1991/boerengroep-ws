import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { relId } from '../access/roles'
import { eventSlug } from '../fields/event-slug'
import { EVENT_TYPE_OPTIONS, languageField, legacyIdField } from '../fields/shared'
import { uniquePerTenant } from '../hooks/unique-per-tenant'

export const EVENT_STATUS_OPTIONS = [
  { label: 'Going ahead', value: 'scheduled' },
  { label: 'Full', value: 'full' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Postponed', value: 'postponed' },
]

/**
 * Gives a new event its address from the title and date. Editors never have to think of one.
 * An address that exists already gets a number, since events often repeat under one name.
 */
const fillSlug: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  if (!data || data.slug || originalDoc?.slug) return data
  const base = eventSlug(data.title ?? originalDoc?.title, data.startDate ?? originalDoc?.startDate)
  const tenant = relId(data.tenant ?? originalDoc?.tenant)
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`
    const taken = await req.payload.find({
      collection: 'events',
      where: { and: [{ slug: { equals: candidate } }, { tenant: { equals: tenant } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      req,
    })
    if (taken.totalDocs === 0) {
      data.slug = candidate
      return data
    }
  }
  return data
}

export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Event', plural: 'Events' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'eventType', 'status'],
    group: 'Calendar',
    description:
      'Everything on the calendar. Each event gets its own page that people can share and add to their own calendar.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  hooks: {
    beforeValidate: [fillSlug],
    beforeChange: [uniquePerTenant('events', 'slug', (v) => `The address "${v}" is already used by another event.`)],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      index: true,
      label: 'Address',
      admin: {
        position: 'sidebar',
        description:
          'The last part of the event\'s web address. It is made for you from the title and the date. Do not change it after sharing the link.',
      },
      validate: (value: unknown) =>
        value === undefined || value === null || value === '' || (typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(value))
          ? true
          : 'Use letters, numbers and hyphens only.',
    },
    languageField,
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      options: EVENT_STATUS_OPTIONS,
      admin: {
        position: 'sidebar',
        description:
          'Set to Full when there are no places left. The sign-up button is then replaced by a "Fully booked" note. Cancelled events stay visible, crossed out, so people who saved them find out.',
      },
    },
    {
      name: 'statusNote',
      type: 'text',
      label: 'Note with the status',
      admin: {
        position: 'sidebar',
        description: 'Optional. For example "Waiting list: mail us" or the new date.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'What happens, who it is for, what to bring. A new line starts a new paragraph.' },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      label: 'Starts',
      admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'Dutch time.' },
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'Ends',
      admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'Optional. Without it the event is shown as two hours long in people\'s calendars.' },
    },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      label: 'Kind of event',
      options: EVENT_TYPE_OPTIONS,
      admin: { description: 'Sets the colour on the calendar and lets visitors filter.' },
    },
    {
      name: 'location',
      type: 'group',
      label: 'Where',
      fields: [
        { name: 'address', type: 'text', label: 'Place', admin: { description: 'Name and address, as you would say it to a friend.' } },
        { name: 'mapsLink', type: 'text', label: 'Map link', admin: { description: 'Optional. Without it a map link is made from the place.' } },
        { name: 'callLink', type: 'text', label: 'Online meeting link', admin: { description: 'For online or hybrid events.' } },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Picture',
      admin: {
        description:
          'A poster or photo. After uploading you can choose which part stays visible when the picture is cut to fit.',
      },
    },
    {
      name: 'speakers',
      type: 'array',
      label: 'Speakers and hosts',
      labels: { singular: 'Person', plural: 'People' },
      fields: [
        { name: 'speaker', type: 'relationship', relationTo: 'speakers', label: 'Person' },
        { name: 'role', type: 'text', admin: { description: 'For example "host" or "speaker".' } },
      ],
    },
    {
      name: 'registrationLink',
      type: 'richText',
      label: 'How to sign up',
      admin: {
        description:
          'Optional. Type what people should click, select it, and add the link to your sign-up form. Leave empty if people can just come.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Put this event in the spotlight',
      admin: { position: 'sidebar', description: 'Spotlighted events are shown first and larger.' },
    },
    legacyIdField,
  ],
}
