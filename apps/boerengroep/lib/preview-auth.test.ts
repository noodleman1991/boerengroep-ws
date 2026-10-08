import { describe, expect, it } from 'vitest'
import { canPreviewTenant } from './preview-auth'

const member = { id: 1, roles: ['user'], tenants: [{ tenant: 10, roles: ['editor' as const] }] }
const populated = { id: 2, roles: ['user'], tenants: [{ tenant: { id: 10 }, roles: ['tenant-admin' as const] }] }
const otherSite = { id: 3, roles: ['user'], tenants: [{ tenant: 20, roles: ['tenant-admin' as const] }] }

describe('canPreviewTenant', () => {
  it('allows a member of this site', () => {
    expect(canPreviewTenant(member, 10)).toBe(true)
    expect(canPreviewTenant(populated, '10')).toBe(true)
  })
  it('allows a super admin without any membership', () => {
    expect(canPreviewTenant({ id: 9, roles: ['super-admin'] }, 10)).toBe(true)
  })
  it('refuses an editor of the other site, even a tenant admin there', () => {
    expect(canPreviewTenant(otherSite, 10)).toBe(false)
  })
  it('refuses a visitor who is not logged in', () => {
    expect(canPreviewTenant(null, 10)).toBe(false)
  })
  it('refuses everyone but super admins when this site has no tenant record', () => {
    expect(canPreviewTenant(member, undefined)).toBe(false)
    expect(canPreviewTenant({ id: 9, roles: ['super-admin'] }, undefined)).toBe(true)
  })
})
