import type { CollectionConfig } from 'payload'
import { superAdminField, superAdminOnly, tenantsRead } from '../access'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: { useAsTitle: 'name', group: 'Platform' },
  access: {
    read: tenantsRead,
    create: superAdminOnly,
    update: superAdminOnly,
    delete: superAdminOnly,
  },
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
      access: { read: superAdminField, update: superAdminField },
      admin: { description: 'Shared secret the other site sends when it asks this site to refresh its cache.' },
    },
  ],
}
