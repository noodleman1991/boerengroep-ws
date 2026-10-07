import type { CollectionConfig, Field } from 'payload'
import { anyone, tenantAdminsOnly } from '../access'

const linkFields: Field[] = [
  {
    name: 'page',
    type: 'relationship',
    relationTo: 'pages',
    admin: { description: 'Preferred. The link follows the page when its URL changes.' },
  },
  { name: 'href', type: 'text', label: 'Manual URL or external link' },
  { name: 'label', type: 'text', label: 'Translation key (legacy)' },
]

const navFields: Field[] = [
  ...linkFields,
  { name: 'labelText', type: 'text', localized: true, label: 'Label' },
]

export const SiteSettings: CollectionConfig = {
  slug: 'site-settings',
  labels: { singular: 'Site settings', plural: 'Site settings' },
  admin: { group: 'Settings' },
  access: {
    read: anyone,
    create: tenantAdminsOnly,
    update: tenantAdminsOnly,
    delete: tenantAdminsOnly,
  },
  fields: [
    {
      name: 'header',
      type: 'group',
      fields: [
        { name: 'logo', type: 'upload', relationTo: 'media', label: 'Organization logo' },
        { name: 'logoAlt', type: 'text', required: true },
        { name: 'name', type: 'text', required: true, label: 'Organization name' },
        {
          name: 'color',
          type: 'select',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Primary brand color', value: 'primary' },
          ],
        },
        {
          name: 'nav',
          type: 'array',
          label: 'Navigation menu',
          fields: [...navFields, { name: 'submenu', type: 'array', fields: navFields }],
        },
      ],
    },
    {
      name: 'homepage',
      type: 'group',
      fields: [{ name: 'showCalendarWidget', type: 'checkbox' }],
    },
    {
      name: 'footer',
      type: 'group',
      fields: [
        {
          name: 'social',
          type: 'array',
          fields: [
            { name: 'platform', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
        {
          name: 'quickLinks',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', required: true, label: 'Section title key' },
            { name: 'links', type: 'array', fields: linkFields },
          ],
        },
      ],
    },
    {
      name: 'theme',
      type: 'group',
      fields: [
        { name: 'color', type: 'text', label: 'Primary brand color' },
        {
          name: 'font',
          type: 'select',
          options: [
            { label: 'System sans-serif', value: 'sans' },
            { label: 'Nunito (rounded)', value: 'nunito' },
            { label: 'Lato (clean)', value: 'lato' },
          ],
        },
        {
          name: 'darkMode',
          type: 'select',
          options: [
            { label: 'Follow system preference', value: 'system' },
            { label: 'Always light mode', value: 'light' },
            { label: 'Always dark mode', value: 'dark' },
          ],
        },
      ],
    },
  ],
}
