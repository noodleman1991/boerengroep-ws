import type { Field } from 'payload'

/** Kinds of events. The value is stored, the label is what editors and visitors read. */
export const EVENT_TYPE_OPTIONS = [
  { label: 'Talk', value: 'talk' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Lecture', value: 'lecture' },
  { label: 'Meeting', value: 'meeting' },
  { label: 'Board Meeting', value: 'board-meeting' },
  { label: 'Open Pot', value: 'soup-kitchen' },
  { label: 'CSA', value: 'csa' },
  { label: 'Excursion', value: 'excursion' },
]

/** Background of a section. Presets keep the site consistent and readable. */
export const BACKGROUND_OPTIONS = [
  { label: 'White', value: 'white' },
  { label: 'Soft green', value: 'mist' },
  { label: 'Green', value: 'leaf' },
  { label: 'Orange', value: 'harvest' },
  { label: 'Blue', value: 'sky' },
  { label: 'Dark green', value: 'dark' },
]

export const backgroundField: Field = {
  name: 'background',
  type: 'select',
  defaultValue: 'white',
  options: BACKGROUND_OPTIONS,
  admin: { description: 'The colour behind this section. Alternate white with a colour to give the page rhythm.' },
}

export const iconField: Field = {
  name: 'icon',
  type: 'group',
  admin: { description: 'Optional small symbol.' },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        description:
          'One of: Apple, ArrowRight, Bike, BookOpen, Calendar, Camera, Clock, Download, ExternalLink, Film, Globe, GraduationCap, HandHeart, Heart, Home, Info, Leaf, Mail, MapPin, Megaphone, Mic, Music, Newspaper, Phone, Podcast, Soup, Sprout, Tractor, Users, Wheat. Anything else shows no symbol.',
      },
    },
    { name: 'color', type: 'text' },
    { name: 'style', type: 'text' },
  ],
}

export const actionsField: Field = {
  name: 'actions',
  type: 'array',
  label: 'Buttons',
  labels: { singular: 'Button', plural: 'Buttons' },
  admin: { description: 'One or two buttons are enough. The first one stands out most.' },
  fields: [
    { name: 'label', type: 'text', admin: { description: 'Say what happens, for example "See the calendar".' } },
    {
      name: 'type',
      type: 'select',
      label: 'Look',
      options: [
        { label: 'Button', value: 'button' },
        { label: 'Plain link', value: 'link' },
      ],
    },
    iconField,
    { name: 'link', type: 'text', label: 'Address', admin: { description: 'Starts with / for this site, or https:// for another one.' } },
  ],
}

/** Empty means the item is shown in both languages. */
export const languageField: Field = {
  name: 'language',
  type: 'select',
  admin: {
    position: 'sidebar',
    description: 'The language this is written in. Leave empty to show it to everyone.',
  },
  options: [
    { label: 'English', value: 'en' },
    { label: 'Nederlands', value: 'nl' },
  ],
}

/** Last part of the address. Capitals are allowed because older addresses contain them. */
export const slugField: Field = {
  name: 'slug',
  type: 'text',
  required: true,
  index: true,
  label: 'Address',
  admin: {
    position: 'sidebar',
    description: 'The last part of the web address. Letters, numbers and hyphens. Do not change it after sharing the link.',
  },
  validate: (value: unknown) =>
    typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]*$/.test(value)
      ? true
      : 'Use letters, numbers and hyphens only.',
}

/** Path of the Tina file this document was migrated from. */
export const legacyIdField: Field = {
  name: 'legacyId',
  type: 'text',
  index: true,
  admin: { readOnly: true, position: 'sidebar', hidden: true },
}
