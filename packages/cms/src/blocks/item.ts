import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

type Sibling = { actionType?: string } | undefined

export const Item: Block = {
  slug: 'item',
  interfaceName: 'ItemBlock',
  labels: { singular: 'Item for a donation', plural: 'Items for a donation' },
  admin: {
    group: 'Forms and sign-up',
    custom: {
      description:
        'Something people get in return for a donation, such as a T-shirt or a book: a few pictures, the details, the suggested donation and a button to a form. It is a donation, not a sale, and nobody pays on the website.',
    },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text', required: true, label: 'Name' },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Pictures',
      admin: { description: 'Visitors can flip through them. Three or four is plenty.' },
    },
    { name: 'details', type: 'richText', admin: { description: 'What it is, sizes, how people get it.' } },
    {
      name: 'priceText',
      type: 'text',
      label: 'Suggested donation',
      admin: { description: 'Free text, for example "€15" or "what you can spare". Shown large next to the pictures.' },
    },
    {
      name: 'actionType',
      type: 'radio',
      defaultValue: 'link',
      label: 'How people ask for it',
      options: [
        { label: 'Through a link, for example a Google Form', value: 'link' },
        { label: 'Through a form on this site', value: 'form' },
      ],
    },
    { name: 'buttonLabel', type: 'text', label: 'Text on the button', admin: { description: 'For example "Get a shirt for a donation".' } },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Link to the form',
      admin: { condition: (_d, s: Sibling) => (s?.actionType ?? 'link') === 'link' },
    },
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      admin: {
        condition: (_d, s: Sibling) => s?.actionType === 'form',
        description: 'Answers arrive under Form responses.',
      },
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Small print under the button',
      admin: {
        description:
          'Say here what people agree to. Leave empty for the standard line: "This is a donation to (your organisation), not a purchase."',
      },
    },
  ],
}
