import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { legacyIdField } from '../fields/shared'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: {
    useAsTitle: 'name',
    group: 'Library',
    description: 'Short labels for stories of past events, so readers can find stories that belong together.',
  },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [{ name: 'name', type: 'text', required: true }, legacyIdField],
}
