import { ValidationError, type CollectionBeforeChangeHook, type CollectionConfig } from 'payload'
import { anyone, tenantAdminsOnly } from '../access'
import { relId } from '../access/roles'

const uniqueFromPerTenant: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const from = data.from ?? originalDoc?.from
  const tenant = relId(data.tenant ?? originalDoc?.tenant)
  const clash = await req.payload.find({
    collection: 'redirects',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: [
        { from: { equals: from } },
        { tenant: { equals: tenant } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
  })
  if (clash.totalDocs > 0) {
    throw new ValidationError({
      collection: 'redirects',
      errors: [{ path: 'from', message: `${from} already redirects somewhere.` }],
    })
  }
  return data
}

export const Redirects: CollectionConfig = {
  slug: 'redirects',
  admin: { useAsTitle: 'from', defaultColumns: ['from', 'to', 'permanent'], group: 'Settings' },
  access: {
    read: anyone,
    create: tenantAdminsOnly,
    update: tenantAdminsOnly,
    delete: tenantAdminsOnly,
  },
  hooks: { beforeChange: [uniqueFromPerTenant] },
  fields: [
    {
      name: 'from',
      type: 'text',
      required: true,
      index: true,
      label: 'From URL',
      validate: (v: unknown) => (typeof v === 'string' && v.startsWith('/') ? true : 'URL must start with /'),
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      label: 'To URL',
      validate: (v: unknown) =>
        typeof v === 'string' && (v.startsWith('/') || v.startsWith('http'))
          ? true
          : 'URL must start with / or http(s)://',
    },
    { name: 'permanent', type: 'checkbox', label: 'Permanent redirect (301)' },
    { name: 'note', type: 'text' },
  ],
}
