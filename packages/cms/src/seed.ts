import type { Payload } from 'payload'

export type SeedInput = {
  tenant: { name: string; slug: string; siteUrl: string; revalidateSecret: string }
  admin: { email: string; password: string }
}

export async function ensureTenantAndAdmin(payload: Payload, input: SeedInput) {
  const tenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: input.tenant.slug } },
    limit: 1,
    overrideAccess: true,
  })
  const tenant =
    tenants.docs[0] ?? (await payload.create({ collection: 'tenants', data: input.tenant, overrideAccess: true }))

  const users = await payload.find({
    collection: 'users',
    where: { email: { equals: input.admin.email } },
    limit: 1,
    overrideAccess: true,
  })
  const user =
    users.docs[0] ??
    (await payload.create({
      collection: 'users',
      data: { email: input.admin.email, password: input.admin.password, roles: ['super-admin'] } as never,
      overrideAccess: true,
    }))

  return { tenantId: tenant.id, userId: user.id }
}
