import { describe, expect, it } from 'vitest'
import { canManageTenant } from './site-admin-auth'

describe('who may manage a site', () => {
  const admin = { id: 1, tenants: [{ tenant: 7, roles: ['tenant-admin' as const] }] }
  const editor = { id: 2, tenants: [{ tenant: 7, roles: ['editor' as const] }] }

  it('lets a super admin manage every site', () => {
    expect(canManageTenant({ id: 3, roles: ['super-admin'] }, 7)).toBe(true)
  })
  it('lets the admin of this site in, also when the site comes back as an object', () => {
    expect(canManageTenant(admin, 7)).toBe(true)
    expect(canManageTenant({ id: 1, tenants: [{ tenant: { id: 7 }, roles: ['tenant-admin'] }] }, '7')).toBe(true)
  })
  it('keeps out editors, admins of the other site, and visitors', () => {
    expect(canManageTenant(editor, 7)).toBe(false)
    expect(canManageTenant(admin, 8)).toBe(false)
    expect(canManageTenant(null, 7)).toBe(false)
    expect(canManageTenant(admin, undefined)).toBe(false)
  })
})
