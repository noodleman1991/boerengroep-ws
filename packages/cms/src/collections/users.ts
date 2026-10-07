import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email', group: 'Platform' },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['user'],
      saveToJWT: true,
      options: [
        { label: 'Super admin', value: 'super-admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ],
}
