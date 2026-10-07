import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const ImageText: Block = {
  slug: 'imageText',
  interfaceName: 'ImageTextBlock',
  fields: [
    backgroundField,
    {
      name: 'image',
      type: 'group',
      fields: [
        { name: 'src', type: 'upload', relationTo: 'media' },
        { name: 'alt', type: 'text' },
      ],
    },
    { name: 'content', type: 'richText' },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'image-left',
      options: [
        { label: 'Image left', value: 'image-left' },
        { label: 'Image right', value: 'image-right' },
        { label: 'Image center', value: 'image-center' },
        { label: 'Text above image (center)', value: 'text-above-center' },
        { label: 'Text below image (center)', value: 'text-below-center' },
      ],
    },
    {
      name: 'imageSize',
      type: 'select',
      defaultValue: 'medium',
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
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Center', value: 'center' },
        { label: 'Bottom', value: 'bottom' },
      ],
    },
  ],
}
