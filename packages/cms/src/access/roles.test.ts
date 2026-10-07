import { describe, expect, it } from 'vitest'
import { isSuperAdmin, relId, tenantIdsWithRole } from './roles'

const editor = { id: 1, roles: ['user'], tenants: [{ tenant: 10, roles: ['editor' as const] }] }
const admin = {
  id: 2,
  roles: ['user'],
  tenants: [
    { tenant: { id: 10 }, roles: ['tenant-admin' as const] },
    { tenant: 20, roles: ['editor' as const] },
  ],
}

describe('roles', () => {
  it('reads an id from a number, a string or a populated document', () => {
    expect(relId(5)).toBe(5)
    expect(relId('abc')).toBe('abc')
    expect(relId({ id: 7 })).toBe(7)
    expect(relId(null)).toBeUndefined()
  })

  it('detects super admins only by the global role', () => {
    expect(isSuperAdmin({ id: 3, roles: ['super-admin'] })).toBe(true)
    expect(isSuperAdmin(admin)).toBe(false)
    expect(isSuperAdmin(null)).toBe(false)
  })

  it('lists all tenant ids when no role is asked for', () => {
    expect(tenantIdsWithRole(admin)).toEqual([10, 20])
  })

  it('lists only tenants where the user holds the given role', () => {
    expect(tenantIdsWithRole(admin, 'tenant-admin')).toEqual([10])
    expect(tenantIdsWithRole(editor, 'tenant-admin')).toEqual([])
  })

  it('returns no tenants for an anonymous user', () => {
    expect(tenantIdsWithRole(undefined)).toEqual([])
  })
})
