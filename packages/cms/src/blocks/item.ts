import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

type Sibling = { actionType?: string } | undefined

export const Item: Block = {
  slug: 'item',
  interfaceName: 'ItemBlock',
  labels: { singular: 'Item to order', plural: 'Items to order' },
  admin: {
    group: 'Forms and sign-up',
    custom: {
      description:
        'Something people can order or sign up for, such as a T-shirt or a book: a few pictures, the details, and a button to an order form. Nobody pays on the website.',
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
    { name: 'priceText', type: 'text', label: 'Price or contribution', admin: { description: 'Free text, for example "€15" or "pay what you can".' } },
    {
      name: 'actionType',
      type: 'radio',
      defaultValue: 'link',
      label: 'How people order',
      options: [
        { label: 'Through a link, for example a Google Form', value: 'link' },
        { label: 'Through a form on this site', value: 'form' },
      ],
    },
    { name: 'buttonLabel', type: 'text', label: 'Text on the button', admin: { description: 'For example "Order a shirt".' } },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Link to the order form',
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
  ],
}
