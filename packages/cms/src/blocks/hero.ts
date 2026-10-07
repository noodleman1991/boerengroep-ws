import type { Block } from 'payload'
import { actionsField, backgroundField } from '../fields/shared'

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    backgroundField,
    { name: 'headline', type: 'text' },
    { name: 'tagline', type: 'text' },
    actionsField,
    {
      name: 'image',
      type: 'group',
      fields: [
        { name: 'src', type: 'upload', relationTo: 'media' },
        { name: 'alt', type: 'text' },
        {
          name: 'videoUrl',
          type: 'text',
          admin: { description: 'For YouTube, use the embed version of the URL.' },
        },
      ],
    },
  ],
}
