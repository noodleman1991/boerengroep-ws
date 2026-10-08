import { type AccessUser, isSuperAdmin, tenantIdsWithRole } from '@sites/cms/access'

/**
 * Draft preview shows this site's unpublished content. Both sites share one user
 * collection, so a login alone is not enough: the user must belong to this site.
 */
export function canPreviewTenant(user: AccessUser, tenantId: number | string | undefined): boolean {
  if (!user) return false
  if (isSuperAdmin(user)) return true
  if (tenantId === undefined) return false
  return tenantIdsWithRole(user).map(String).includes(String(tenantId))
}
