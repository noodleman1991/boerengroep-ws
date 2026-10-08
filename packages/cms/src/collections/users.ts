import {
  APIError,
  type CollectionBeforeDeleteHook,
  type CollectionBeforeValidateHook,
  type CollectionConfig,
} from 'payload'
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

type StoredUser = { id: number | string; email?: string; roles?: string[] | null; tenants?: unknown }

const SUPER_ADMIN_ONLY = 'Only a super admin can change or remove a super admin.'
const OTHER_SITE = 'This user also belongs to another site. Only a super admin can change their login or remove them.'

/**
 * Protects accounts that reach beyond the actor's own sites. Without this, a tenant admin
 * could reset the password of a shared user or of a super admin and log in as them.
 */
function assertMayManage(actor: AccessUser, target: StoredUser | undefined, change: 'login' | 'other' | 'delete') {
  if (!actor || isSuperAdmin(actor) || !target) return
  if (String(target.id) === String(actor.id)) return
  if (target.roles?.includes('super-admin')) throw new APIError(SUPER_ADMIN_ONLY, 403)
  if (change === 'other') return
  const allowed = tenantIdsWithRole(actor, 'tenant-admin').map(String)
  if (outsideRows(target.tenants, allowed).length > 0) throw new APIError(OTHER_SITE, 403)
}

const guardProtectedUsers: CollectionBeforeValidateHook = ({ data, originalDoc, req }) => {
  const target = originalDoc as StoredUser | undefined
  const changesLogin =
    data?.password !== undefined || (data?.email !== undefined && data.email !== target?.email)
  assertMayManage(req.user as AccessUser, target, changesLogin ? 'login' : 'other')
  return data
}

const guardProtectedUserDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (!req.user || isSuperAdmin(req.user as AccessUser)) return
  const target = (await req.payload.findByID({
    collection: 'users',
    id,
    depth: 0,
    overrideAccess: true,
    req,
  })) as StoredUser
  assertMayManage(req.user as AccessUser, target, 'delete')
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  labels: { singular: 'Person who can log in', plural: 'People who can log in' },
  admin: {
    useAsTitle: 'email',
    group: 'People and websites',
    defaultColumns: ['email', 'name', 'roles', 'tenants'],
    description:
      'Everyone with a login. To let a colleague in: press Create New, fill in their email address and a first password, and choose under "Websites this person works on" which website they work on and what they may do there. An editor writes and publishes. An admin of a website can also change its menu, footer and settings, and add people.',
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: usersReadUpdate,
    update: usersReadUpdate,
    create: usersCreateDelete,
    delete: usersCreateDelete,
  },
  hooks: {
    beforeValidate: [guardProtectedUsers, guardTenantAssignment],
    beforeDelete: [guardProtectedUserDelete],
  },
  fields: [
    { name: 'name', type: 'text', admin: { description: 'Used in the greeting after logging in.' } },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['user'],
      saveToJWT: true,
      label: 'Kind of account',
      admin: { description: 'A normal account only reaches the websites chosen below. A main admin can do everything on both websites and manages all people: give this to one or two people at most.' },
      access: { create: superAdminField, update: superAdminField },
      options: [
        { label: 'Main admin', value: 'super-admin' },
        { label: 'Normal account', value: 'user' },
      ],
    },
  ],
}
