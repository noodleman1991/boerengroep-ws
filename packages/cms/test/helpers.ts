import { getPayload, type Payload } from 'payload'
import config from '../src/dev.config'

let cached: Payload | undefined

export async function testPayload(): Promise<Payload> {
  if (!cached) cached = await getPayload({ config })
  return cached
}

/** Deletes every document. Content collections go first, tenants and users last. */
export async function resetDb(payload: Payload): Promise<void> {
  const slugs = payload.config.collections.map((c) => c.slug)
  const last = ['users', 'tenants']
  const ordered = [...slugs.filter((s) => !last.includes(s)), ...last.filter((s) => slugs.includes(s))]
  for (const slug of ordered) {
    await payload.delete({
      collection: slug as never,
      where: { id: { exists: true } },
      overrideAccess: true,
      context: { disableRevalidate: true, skipResave: true },
    })
  }
}

export async function createTenant(payload: Payload, slug: string) {
  return payload.create({
    collection: 'tenants',
    data: {
      name: slug,
      slug,
      siteUrl: `https://${slug}.test`,
      revalidateSecret: `secret-${slug}`,
    },
    overrideAccess: true,
  })
}
