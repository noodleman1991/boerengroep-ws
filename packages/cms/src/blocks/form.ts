import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const FormBlock: Block = {
  slug: 'form',
  interfaceName: 'FormBlock',
  labels: { singular: 'Form', plural: 'Forms' },
  admin: {
    group: 'Forms and sign-up',
    custom: {
      description:
        'A form you made under Forms, for example a contact form or a sign-up for an excursion. Answers arrive under Form responses.',
    },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    { name: 'intro', type: 'richText', label: 'Text above the form' },
    { name: 'form', type: 'relationship', relationTo: 'forms', required: true, admin: { description: 'Make or change forms under Forms in the menu on the left.' } },
  ],
}
