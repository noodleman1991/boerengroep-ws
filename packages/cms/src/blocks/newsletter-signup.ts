import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const NewsletterSignup: Block = {
  slug: 'newsletterSignup',
  interfaceName: 'NewsletterSignupBlock',
  labels: { singular: 'Newsletter sign-up', plural: 'Newsletter sign-ups' },
  admin: {
    group: 'Forms and sign-up',
    custom: {
      description:
        'The newsletter sign-up box, anywhere on a page. The texts come from Site settings, Newsletter, unless you write other ones here.',
    },
  },
  fields: [
    backgroundField,
    { name: 'heading', type: 'text', admin: { description: 'Optional. Replaces the standard heading for this page only.' } },
    { name: 'intro', type: 'textarea', label: 'Short introduction', admin: { description: 'Optional.' } },
  ],
}
