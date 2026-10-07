import type { Block } from 'payload'
import { backgroundField } from '../fields/shared'

export const Callout: Block = {
  slug: 'callout',
  interfaceName: 'CalloutBlock',
  fields: [backgroundField, { name: 'text', type: 'text' }, { name: 'url', type: 'text' }],
}
