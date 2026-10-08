import type { CollectionConfig } from 'payload'
import { superAdminField, superAdminOnly, tenantsRead } from '../access'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: { singular: 'Website', plural: 'Websites' },
  // The order of this list is the order of the tabs at the top. Drag a row to change it.
  orderable: true,
  admin: {
    useAsTitle: 'name',
    group: 'People and websites',
    defaultColumns: ['name', 'siteUrl'],
    description:
      'The websites that are kept up to date from here: their name and their web address. You rarely need this screen. The order of the list is the order of the tabs at the top, and only a main admin can change anything here. To change what is on a website, use the menu on the left instead.',
  },
  access: {
    read: tenantsRead,
    create: superAdminOnly,
    update: superAdminOnly,
    delete: superAdminOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Name', admin: { description: 'Shown on the tab at the top, for people who work on more than one website.' } },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Short name',
      admin: { description: 'Used behind the scenes to tell the websites apart. Do not change it once the website is live.' },
    },
    {
      name: 'siteUrl',
      type: 'text',
      required: true,
      label: 'Web address',
      admin: { description: 'Where visitors find this website, for example https://www.example.org' },
    },
    {
      name: 'revalidateSecret',
      type: 'text',
      required: true,
      access: { read: superAdminField, update: superAdminField },
      label: 'Refresh key',
      admin: { description: 'A password between this panel and the website, used to tell the website that something changed. Only change it together with the hosting settings.' },
    },
  ],
}
