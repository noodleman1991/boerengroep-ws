import type { CollectionConfig } from 'payload'
import { superAdminField, superAdminOnly, tenantsRead } from '../access'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: { singular: 'Site', plural: 'Sites' },
  admin: {
    useAsTitle: 'name',
    group: 'People and sites',
    description: 'The websites that share this admin panel. Only super admins can change these.',
  },
  access: {
    read: tenantsRead,
    create: superAdminOnly,
    update: superAdminOnly,
    delete: superAdminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Name of the site' },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Short name',
      admin: { description: 'Used by the system to tell the sites apart. Do not change it once the site is live.' },
    },
    {
      name: 'siteUrl',
      type: 'text',
      required: true,
      label: 'Web address',
      admin: { description: 'Where visitors find this site, for example https://www.example.org' },
    },
    {
      name: 'revalidateSecret',
      type: 'text',
      required: true,
      access: { read: superAdminField, update: superAdminField },
      label: 'Refresh key',
      admin: { description: 'A password between the admin panel and this site, used to tell the site that something changed. Only change it together with the hosting settings.' },
    },
  ],
}
