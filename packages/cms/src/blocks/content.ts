import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  fields: [backgroundField, { name: 'body', type: 'richText' }],
}
