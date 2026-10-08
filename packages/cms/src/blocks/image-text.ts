import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const ImageText: Block = {
  slug: 'imageText',
  interfaceName: 'ImageTextBlock',
  labels: { singular: 'Picture with text', plural: 'Pictures with text' },
  admin: {
    group: 'Text and pictures',
    custom: { description: 'A picture next to a piece of text. Alternate left and right down the page.' },
  },
  fields: [
    backgroundField,
    {
      name: 'image',
      type: 'group',
      label: 'Picture',
      fields: [
        { name: 'src', type: 'upload', relationTo: 'media', label: 'Picture' },
        { name: 'alt', type: 'text', label: 'Describe the picture', admin: { description: 'For people who cannot see it.' } },
      ],
    },
    { name: 'content', type: 'richText', label: 'Text' },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'image-left',
      label: 'Where the picture goes',
      options: [
        { label: 'Picture left', value: 'image-left' },
        { label: 'Picture right', value: 'image-right' },
        { label: 'Picture in the middle', value: 'image-center' },
        { label: 'Text above the picture', value: 'text-above-center' },
        { label: 'Text below the picture', value: 'text-below-center' },
      ],
    },
    {
      name: 'imageSize',
      type: 'select',
      defaultValue: 'medium',
      label: 'Picture size',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
    {
      name: 'verticalAlignment',
      type: 'select',
      defaultValue: 'center',
      label: 'Line the text up with',
      options: [
        { label: 'Top of the picture', value: 'top' },
        { label: 'Middle of the picture', value: 'center' },
        { label: 'Bottom of the picture', value: 'bottom' },
      ],
    },
  ],
}
