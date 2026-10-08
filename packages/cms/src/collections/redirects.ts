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
  labels: { singular: 'Forwarding address', plural: 'Forwarding addresses' },
  admin: {
    useAsTitle: 'from',
    defaultColumns: ['from', 'to', 'permanent'],
    group: 'Site settings',
    description:
      'When a page moves or disappears, send visitors from the old address to a new one. Old links, bookmarks and search results then keep working.',
  },
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
      label: 'Old address',
      admin: { description: 'The part after the site name, starting with /. For example /old-page.' },
      validate: (v: unknown) => (typeof v === 'string' && v.startsWith('/') ? true : 'Start the address with /'),
    },
    {
      name: 'to',
      type: 'text',
      required: true,
      label: 'New address',
      admin: { description: 'Starts with / for a page on this site, or with https:// for another website.' },
      validate: (v: unknown) =>
        typeof v === 'string' && (v.startsWith('/') || v.startsWith('http'))
          ? true
          : 'Start the address with / or with https://',
    },
    {
      name: 'permanent',
      type: 'checkbox',
      label: 'This move is for good',
      admin: { description: 'Tick this for pages that moved for good. Leave it off for a temporary detour.' },
    },
    { name: 'note', type: 'text', label: 'Note for yourself', admin: { description: 'Why this forwarding exists. Visitors never see it.' } },
  ],
}
