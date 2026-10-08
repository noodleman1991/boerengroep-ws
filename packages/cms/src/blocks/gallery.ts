import type { Block } from 'payload'
import { rowLabel } from '../fields/row-label'
import { backgroundField, videoFields } from '../fields/shared'

type Sibling = { source?: string } | undefined

export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: { singular: 'Photo gallery', plural: 'Photo galleries' },
  admin: {
    group: 'Media',
    custom: {
      description:
        'A mosaic of photos. Clicking one opens them large, one after another. Captions come from each photo. Use your own selection or the photos of a past event.',
    },
  },
  fields: [
    backgroundField,
    { name: 'title', type: 'text' },
    { name: 'intro', type: 'textarea', label: 'A few words above the photos', admin: { description: 'Optional.' } },
    {
      name: 'source',
      type: 'radio',
      defaultValue: 'pictures',
      label: 'Which photos',
      options: [
        { label: 'Photos I choose', value: 'pictures' },
        { label: 'The photos of a past event', value: 'pastEvent' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: 'Photos',
      admin: {
        condition: (_d, s: Sibling) => (s?.source ?? 'pictures') === 'pictures',
        description: 'Drop several photos at once. Drag to change the order. Add a caption by opening a photo.',
      },
    },
    {
      name: 'videos',
      type: 'array',
      label: 'Videos among the photos',
      labels: { singular: 'Video', plural: 'Videos' },
      admin: {
        condition: (_d, s: Sibling) => (s?.source ?? 'pictures') === 'pictures',
        description: 'Optional. Videos get the large places in the mosaic. They only load after a visitor presses play.',
        components: rowLabel('caption', 'Video').components,
      },
      fields: videoFields,
    },
    {
      name: 'pastEvent',
      type: 'relationship',
      relationTo: 'past-events',
      label: 'Past event',
      admin: {
        condition: (_d, s: Sibling) => s?.source === 'pastEvent',
        description: 'The gallery links back to the story of this event.',
      },
    },
  ],
}
