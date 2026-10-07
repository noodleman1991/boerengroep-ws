import type { CollectionConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { legacyIdField } from '../fields/shared'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: { useAsTitle: 'name', group: 'Content' },
  access: { read: anyone, create: authenticated, update: authenticated, delete: authenticated },
  fields: [{ name: 'name', type: 'text', required: true }, legacyIdField],
}
