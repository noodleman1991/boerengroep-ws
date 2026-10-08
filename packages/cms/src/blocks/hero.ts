import type { Block } from 'payload'
import { actionsField, backgroundField } from '../fields/shared'

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Opening', plural: 'Openings' },
  admin: {
    group: 'Text and pictures',
    custom: { description: 'The big opening of a page: a headline, a line of text, buttons and a picture or video.' },
  },
  fields: [
    backgroundField,
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'split',
      options: [
        { label: 'Text left, picture right', value: 'split' },
        { label: 'Centred, picture below', value: 'centered' },
      ],
    },
    { name: 'headline', type: 'text' },
    { name: 'tagline', type: 'text', label: 'Line under the headline' },
    actionsField,
    {
      name: 'image',
      type: 'group',
      label: 'Picture or video',
      fields: [
        { name: 'src', type: 'upload', relationTo: 'media', label: 'Picture' },
        { name: 'alt', type: 'text', label: 'Describe the picture', admin: { description: 'For people who cannot see it.' } },
        {
          name: 'videoUrl',
          type: 'text',
          label: 'Video address',
          admin: { description: 'Optional. A YouTube or Vimeo link. The picture is then used as the cover.' },
        },
      ],
    },
  ],
}
