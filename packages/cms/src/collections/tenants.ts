import type { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: { useAsTitle: 'name', group: 'Platform' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'siteUrl',
      type: 'text',
      required: true,
      admin: { description: 'Public origin of this site, for example https://www.example.org' },
    },
    {
      name: 'revalidateSecret',
      type: 'text',
      required: true,
      admin: { description: 'Shared secret the other site sends when it asks this site to refresh its cache.' },
    },
  ],
}
