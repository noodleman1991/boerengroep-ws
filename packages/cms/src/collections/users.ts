import { APIError, type CollectionBeforeValidateHook, type CollectionConfig } from 'payload'
import { superAdminField, usersCreateDelete, usersReadUpdate } from '../access'
import { type AccessUser, isSuperAdmin, type Ref, relId, tenantIdsWithRole } from '../access/roles'

type TenantRow = { tenant: Ref; roles?: string[] | null }

/** Memberships in tenants the actor does not administer, in a comparable form. */
function outsideRows(rows: unknown, allowed: string[]): string[] {
  if (!Array.isArray(rows)) return []
  return (rows as TenantRow[])
    .map((row) => ({ id: String(relId(row.tenant)), roles: [...(row.roles ?? [])].sort().join(',') }))
    .filter((row) => !allowed.includes(row.id))
    .map((row) => `${row.id}:${row.roles}`)
    .sort()
}

/**
 * A user may only add, remove or change memberships of tenants they administer.
 * Memberships in every other tenant must arrive exactly as they are stored.
 */
const guardTenantAssignment: CollectionBeforeValidateHook = ({ data, originalDoc, req }) => {
  const actor = req.user as AccessUser
  if (!actor || isSuperAdmin(actor)) return data
  if (!data || data.tenants === undefined) return data
  const allowed = tenantIdsWithRole(actor, 'tenant-admin').map(String)
  const before = outsideRows(originalDoc?.tenants, allowed)
  const after = outsideRows(data.tenants, allowed)
  if (before.length !== after.length || before.some((row, i) => row !== after[i])) {
    throw new APIError('You can only grant access to sites you administer.', 403)
  }
  return data
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email', group: 'Platform' },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: usersReadUpdate,
    update: usersReadUpdate,
    create: usersCreateDelete,
    delete: usersCreateDelete,
  },
  hooks: { beforeValidate: [guardTenantAssignment] },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['user'],
      saveToJWT: true,
      access: { create: superAdminField, update: superAdminField },
      options: [
        { label: 'Super admin', value: 'super-admin' },
        { label: 'User', value: 'user' },
      ],
    },
  ],
}
