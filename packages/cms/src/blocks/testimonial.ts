import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Testimonial: Block = {
  slug: 'testimonial',
  interfaceName: 'TestimonialBlock',
  labels: { singular: 'Quotes', plural: 'Quotes' },
  admin: {
    group: 'Text and pictures',
    custom: { description: 'What people say, in their own words, with their name and a small picture.' },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea', label: 'Text under the title' },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Quotes',
      labels: { singular: 'Quote', plural: 'Quotes' },
      fields: [
        { name: 'quote', type: 'textarea' },
        { name: 'author', type: 'text', label: 'Who said it' },
        { name: 'role', type: 'text', label: 'Who they are', admin: { description: 'For example "farmer in Renkum".' } },
        { name: 'avatar', type: 'upload', relationTo: 'media', label: 'Picture' },
      ],
    },
  ],
}
