import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

let payload: Payload
let bg: { id: number | string }
let it2: { id: number | string }
let superAdmin: any
let bgAdmin: any
let bgEditor: any
let itEditor: any

async function makeUser(email: string, roles: string[], tenants: any[]) {
  return payload.create({
    collection: 'users',
    data: { email, password: 'correct-horse-battery', roles, tenants } as never,
    overrideAccess: true,
  })
}

describe('access control', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    bg = await createTenant(payload, 'boerengroep')
    it2 = await createTenant(payload, 'inspringtheater')
    superAdmin = await makeUser('root@site.test', ['super-admin'], [])
    bgAdmin = await makeUser('bg-admin@site.test', ['user'], [{ tenant: bg.id, roles: ['tenant-admin'] }])
    bgEditor = await makeUser('bg-editor@site.test', ['user'], [{ tenant: bg.id, roles: ['editor'] }])
    itEditor = await makeUser('it-editor@site.test', ['user'], [{ tenant: it2.id, roles: ['editor'] }])
  })
  afterAll(async () => resetDb(payload))

  it('lets a super admin see every user', async () => {
    const res = await payload.find({ collection: 'users', user: superAdmin, overrideAccess: false })
    expect(res.totalDocs).toBe(4)
  })

  it('lets a tenant admin see only users of their tenant', async () => {
    const res = await payload.find({ collection: 'users', user: bgAdmin, overrideAccess: false })
    const emails = res.docs.map((d) => d.email).sort()
    expect(emails).toEqual(['bg-admin@site.test', 'bg-editor@site.test'])
  })

  it('lets an editor see only themselves', async () => {
    const res = await payload.find({ collection: 'users', user: bgEditor, overrideAccess: false })
    expect(res.docs.map((d) => d.email)).toEqual(['bg-editor@site.test'])
  })

  it('refuses a tenant admin who grants access to another tenant', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: 'sneaky@site.test',
          password: 'correct-horse-battery',
          tenants: [{ tenant: it2.id, roles: ['tenant-admin'] }],
        } as never,
        user: bgAdmin,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/sites you administer/)
  })

  it('lets a tenant admin add an editor to their own tenant', async () => {
    const created = await payload.create({
      collection: 'users',
      data: {
        email: 'new-editor@site.test',
        password: 'correct-horse-battery',
        tenants: [{ tenant: bg.id, roles: ['editor'] }],
      } as never,
      user: bgAdmin,
      overrideAccess: false,
    })
    const stored = await payload.findByID({ collection: 'users', id: created.id, depth: 0, overrideAccess: true })
    expect(stored.tenants?.map((t) => [t.tenant, t.roles])).toEqual([[bg.id, ['editor']]])
  })

  it('refuses a tenant admin who removes another tenant from a shared user', async () => {
    const shared = await makeUser('shared@site.test', ['user'], [
      { tenant: bg.id, roles: ['editor'] },
      { tenant: it2.id, roles: ['editor'] },
    ])
    await expect(
      payload.update({
        collection: 'users',
        id: shared.id,
        data: { tenants: [{ tenant: bg.id, roles: ['editor'] }] } as never,
        user: bgAdmin,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/sites you administer/)
  })

  it('lets a tenant admin change the role in their own tenant on a shared user', async () => {
    const shared = await makeUser('shared2@site.test', ['user'], [
      { tenant: bg.id, roles: ['editor'] },
      { tenant: it2.id, roles: ['editor'] },
    ])
    await payload.update({
      collection: 'users',
      id: shared.id,
      data: {
        tenants: [
          { tenant: bg.id, roles: ['tenant-admin'] },
          { tenant: it2.id, roles: ['editor'] },
        ],
      } as never,
      user: bgAdmin,
      overrideAccess: false,
    })
    const stored = await payload.findByID({ collection: 'users', id: shared.id, depth: 0, overrideAccess: true })
    expect(stored.tenants?.map((t) => [t.tenant, t.roles])).toEqual([
      [bg.id, ['tenant-admin']],
      [it2.id, ['editor']],
    ])
  })

  it('refuses a tenant admin who raises a role in another tenant on a shared user', async () => {
    const shared = await makeUser('shared3@site.test', ['user'], [
      { tenant: bg.id, roles: ['editor'] },
      { tenant: it2.id, roles: ['editor'] },
    ])
    await expect(
      payload.update({
        collection: 'users',
        id: shared.id,
        data: {
          tenants: [
            { tenant: bg.id, roles: ['editor'] },
            { tenant: it2.id, roles: ['tenant-admin'] },
          ],
        } as never,
        user: bgAdmin,
        overrideAccess: false,
      }),
    ).rejects.toThrow(/sites you administer/)
  })

  it('ignores an editor who gives themselves another tenant or a higher role', async () => {
    // Editors may not write memberships at all, so Payload keeps the stored value.
    await payload.update({
      collection: 'users',
      id: bgEditor.id,
      data: {
        tenants: [
          { tenant: bg.id, roles: ['tenant-admin'] },
          { tenant: it2.id, roles: ['tenant-admin'] },
        ],
      } as never,
      user: bgEditor,
      overrideAccess: false,
    })
    const stored = await payload.findByID({ collection: 'users', id: bgEditor.id, depth: 0, overrideAccess: true })
    expect(stored.tenants?.map((t) => [t.tenant, t.roles])).toEqual([[bg.id, ['editor']]])
  })

  it('lets an editor save their own name when the form sends their memberships unchanged', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: bgEditor.id,
      data: { name: 'Editor Name', tenants: [{ tenant: bg.id, roles: ['editor'] }] } as never,
      user: bgEditor,
      overrideAccess: false,
    })
    expect(updated.name).toBe('Editor Name')
  })

  it('ignores a tenant admin who tries to make someone a super admin', async () => {
    const created = await payload.create({
      collection: 'users',
      data: {
        email: 'promoted@site.test',
        password: 'correct-horse-battery',
        roles: ['super-admin'],
        tenants: [{ tenant: bg.id, roles: ['editor'] }],
      } as never,
      user: bgAdmin,
      overrideAccess: false,
    })
    expect(created.roles).toEqual(['user'])
  })

  it('shows a user only the tenants they belong to', async () => {
    const res = await payload.find({ collection: 'tenants', user: itEditor, overrideAccess: false })
    expect(res.docs.map((d) => d.slug)).toEqual(['inspringtheater'])
  })

  it('hides the revalidate secret from non super admins', async () => {
    const res = await payload.find({ collection: 'tenants', user: bgAdmin, overrideAccess: false })
    expect(res.docs[0]).not.toHaveProperty('revalidateSecret')
  })

  it('refuses tenant creation by a tenant admin', async () => {
    await expect(
      payload.create({
        collection: 'tenants',
        data: { name: 'x', slug: 'x', siteUrl: 'https://x.test', revalidateSecret: 's' },
        user: bgAdmin,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
