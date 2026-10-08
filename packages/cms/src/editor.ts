import { BlocksFeature, lexicalEditor, UploadFeature } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'
import { GALLERY_SIZES } from './fields/shared'

/** A video in the middle of a text. The page block "Video" is for a video that stands on its own. */
export const VideoInText: Block = {
  slug: 'videoEmbed',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Video link',
      admin: { description: 'For example https://www.youtube.com/watch?v=... or https://vimeo.com/...' },
    },
    { name: 'caption', type: 'text', label: 'Line under the video' },
  ],
}

/** Several photos in the middle of a text. The page block "Photo gallery" is for photos that stand on their own. */
export const GalleryInText: Block = {
  slug: 'photoGallery',
  labels: { singular: 'Photo gallery', plural: 'Photo galleries' },
  fields: [
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      label: 'Photos',
      admin: { description: 'Drop several photos at once. Drag to change the order. A click on a photo opens it large.' },
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'medium',
      label: 'Size of the photos',
      options: GALLERY_SIZES,
    },
    { name: 'caption', type: 'text', label: 'Line under the photos' },
  ],
}

/**
 * The text editor used everywhere. On top of the standard tools (headings, lists, links and
 * files) editors can give a picture a size and a place, and put a video or a photo gallery
 * between paragraphs.
 */
export const siteEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((feature) => feature.key !== 'upload'),
    UploadFeature({
      collections: {
        media: {
          fields: [
            {
              name: 'size',
              type: 'select',
              defaultValue: 'full',
              label: 'Size',
              options: [
                { label: 'Small: a third of the text', value: 'small' },
                { label: 'Medium: half of the text', value: 'medium' },
                { label: 'Large: three quarters of the text', value: 'large' },
                { label: 'As wide as the text', value: 'full' },
              ],
            },
            {
              name: 'place',
              type: 'select',
              defaultValue: 'centre',
              label: 'Place',
              options: [
                { label: 'Left, with the text beside it', value: 'left' },
                { label: 'In the middle', value: 'centre' },
                { label: 'Right, with the text beside it', value: 'right' },
              ],
              admin: { description: 'Text only runs beside a small or medium picture, and only on a wide screen. On a phone the picture always gets its own line.' },
            },
            {
              name: 'caption',
              type: 'text',
              label: 'Line under the picture',
              admin: { description: 'Optional. Empty: the caption of the picture itself, when it has one.' },
            },
          ],
        },
      },
    }),
    BlocksFeature({ blocks: [VideoInText, GalleryInText] }),
  ],
})
