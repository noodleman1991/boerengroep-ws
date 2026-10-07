export type TenantRole = 'tenant-admin' | 'editor'
export type Ref = number | string | { id: number | string } | null | undefined
export type AccessUser =
  | {
      id: number | string
      roles?: string[] | null
      tenants?: { tenant: Ref; roles?: TenantRole[] | null }[] | null
    }
  | null
  | undefined

export function relId(ref: Ref): number | string | undefined {
  if (ref === null || ref === undefined) return undefined
  return typeof ref === 'object' ? ref.id : ref
}

export function isSuperAdmin(user: AccessUser): boolean {
  return Boolean(user?.roles?.includes('super-admin'))
}

export function tenantIdsWithRole(user: AccessUser, role?: TenantRole): (number | string)[] {
  const ids: (number | string)[] = []
  for (const row of user?.tenants ?? []) {
    const id = relId(row.tenant)
    if (id === undefined) continue
    if (!role || row.roles?.includes(role)) ids.push(id)
  }
  return ids
}
