import { type AccessUser, isSuperAdmin, tenantIdsWithRole } from '@sites/cms/access'

/**
 * Site-wide actions, such as checking the newsletter link, are for the admins of this site.
 * Both sites share one user collection, so a login alone is not enough.
 */
export function canManageTenant(user: AccessUser, tenantId: number | string | undefined): boolean {
  if (!user) return false
  if (isSuperAdmin(user)) return true
  if (tenantId === undefined) return false
  return tenantIdsWithRole(user, 'tenant-admin').map(String).includes(String(tenantId))
}
