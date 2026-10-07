import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ensureTenantAndAdmin } from '../src/seed'
import { resetDb, testPayload } from './helpers'

let payload: Payload
const input = {
  tenant: {
    name: 'Stichting Boerengroep',
    slug: 'boerengroep',
    siteUrl: 'https://boerengroep.test',
    revalidateSecret: 's3cret',
  },
  admin: { email: 'root@site.test', password: 'correct-horse-battery' },
}

describe('seed', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
  })
  afterAll(async () => resetDb(payload))

  it('creates the tenant and a super admin', async () => {
    const out = await ensureTenantAndAdmin(payload, input)
    const user = await payload.findByID({ collection: 'users', id: out.userId })
    expect(user.roles).toContain('super-admin')
  })

  it('does nothing the second time', async () => {
    const first = await ensureTenantAndAdmin(payload, input)
    const second = await ensureTenantAndAdmin(payload, input)
    expect(second).toEqual(first)
    expect((await payload.find({ collection: 'tenants' })).totalDocs).toBe(1)
    expect((await payload.find({ collection: 'users' })).totalDocs).toBe(1)
  })
})
