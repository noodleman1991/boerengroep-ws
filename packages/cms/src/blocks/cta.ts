import type { Block } from 'payload'
import { actionsField, backgroundField } from '../fields/shared'

export const Cta: Block = {
  slug: 'cta',
  interfaceName: 'CtaBlock',
  labels: { singular: 'Invitation', plural: 'Invitations' },
  admin: {
    group: 'Text and pictures',
    custom: { description: 'A short invitation with one or two buttons, usually near the end of a page.' },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea', label: 'Text' },
    actionsField,
  ],
}
