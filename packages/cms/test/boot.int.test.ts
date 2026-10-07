import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

describe('cms boots', () => {
  beforeAll(async () => {
    await resetDb(await testPayload())
  })
  afterAll(async () => {
    await resetDb(await testPayload())
  })

  it('creates a tenant and a user that belongs to it', async () => {
    const payload = await testPayload()
    const tenant = await createTenant(payload, 'boerengroep')

    const user = await payload.create({
      collection: 'users',
      data: {
        email: 'editor@boerengroep.test',
        password: 'correct-horse-battery',
        roles: ['user'],
        tenants: [{ tenant: tenant.id, roles: ['editor'] }],
      },
      overrideAccess: true,
    })

    expect(tenant.slug).toBe('boerengroep')
    expect(user.tenants?.[0]?.roles).toEqual(['editor'])
  })

  it('has both locales configured with English as default', async () => {
    const payload = await testPayload()
    const loc = payload.config.localization
    expect(loc && loc.defaultLocale).toBe('en')
    expect(loc && loc.localeCodes).toEqual(['en', 'nl'])
  })
})
