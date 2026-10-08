import type { Field } from 'payload'
import { rowLabel } from './row-label'

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

/** How the photos of a gallery are laid out. The same choice exists for a gallery inside a text. */
export const GALLERY_SIZES = [
  { label: 'Mosaic: large and small mixed', value: 'mosaic' },
  { label: 'Small pictures, many in a row', value: 'small' },
  { label: 'Medium pictures', value: 'medium' },
  { label: 'Large pictures, two in a row', value: 'large' },
]

export const gallerySizeField: Field = {
  name: 'size',
  type: 'select',
  defaultValue: 'mosaic',
  label: 'Size of the photos',
  options: GALLERY_SIZES,
  admin: { description: 'In every size a click opens the photo large.' },
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
  admin: { description: 'One or two buttons are enough. The first one stands out most.', components: rowLabel('label', 'Button').components },
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

/** One video by its link, with a line of text. Used where videos sit among photos. */
export const videoFields: Field[] = [
  {
    name: 'url',
    type: 'text',
    required: true,
    label: 'Video link',
    admin: { description: 'For example https://www.youtube.com/watch?v=... or https://vimeo.com/...' },
  },
  { name: 'caption', type: 'text', label: 'Caption', admin: { description: 'Optional. Shown on the video in the mosaic and under it when it plays.' } },
]

