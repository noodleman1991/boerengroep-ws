import type { Access, FieldAccess, Where } from 'payload'
import { type AccessUser, isSuperAdmin, relId, tenantIdsWithRole } from './roles'

export const anyone: Access = () => true

export const authenticated: Access = ({ req }) => Boolean(req.user)

/** Visitors see published documents. Logged-in users see drafts too. */
export const publishedOrAuthenticated: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

export const superAdminOnly: Access = ({ req }) => isSuperAdmin(req.user as AccessUser)

export const superAdminField: FieldAccess = ({ req }) => isSuperAdmin(req.user as AccessUser)

/**
 * For tenant-scoped collections that only tenant admins may change,
 * such as site settings and redirects.
 */
export const tenantAdminsOnly: Access = ({ req, data }) => {
  const user = req.user as AccessUser
  if (isSuperAdmin(user)) return true
  const ids = tenantIdsWithRole(user, 'tenant-admin')
  if (ids.length === 0) return false
  const target = relId((data as { tenant?: number | string } | undefined)?.tenant)
  if (target !== undefined) return ids.includes(target)
  return { tenant: { in: ids } }
}

/** Who may see or change a user record. */
export const usersReadUpdate: Access = ({ req }) => {
  const user = req.user as AccessUser
  if (!user) return false
  if (isSuperAdmin(user)) return true
  const self: Where = { id: { equals: user.id } }
  const adminOf = tenantIdsWithRole(user, 'tenant-admin')
  if (adminOf.length === 0) return self
  const where: Where = { or: [self, { 'tenants.tenant': { in: adminOf } }] }
  return where
}

export const usersCreateDelete: Access = ({ req }) => {
  const user = req.user as AccessUser
  if (isSuperAdmin(user)) return true
  const adminOf = tenantIdsWithRole(user, 'tenant-admin')
  if (adminOf.length === 0) return false
  const where: Where = { 'tenants.tenant': { in: adminOf } }
  return where
}

/** A user may read the tenants they belong to. */
export const tenantsRead: Access = ({ req }) => {
  const user = req.user as AccessUser
  if (!user) return false
  if (isSuperAdmin(user)) return true
  return { id: { in: tenantIdsWithRole(user) } }
}

/** Who may write the memberships of a user. The users collection hook checks which ones. */
export const canAssignTenants: FieldAccess = ({ req }) => {
  const user = req.user as AccessUser
  return isSuperAdmin(user) || tenantIdsWithRole(user, 'tenant-admin').length > 0
}
