import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

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

/**
 * The text editor used everywhere. On top of the standard tools (headings, lists, links,
 * pictures and files) editors can place a video between paragraphs.
 */
export const siteEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [...defaultFeatures, BlocksFeature({ blocks: [VideoInText] })],
})
