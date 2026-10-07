import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'
import { type Ref, relId } from '../access/roles'
import type { CmsCustom } from '../config'

type TenantDoc = { slug: string; siteUrl: string; revalidateSecret: string }

/** The part of Payload this module needs. Lets the unit test pass a small fake. */
export type PayloadLike = {
  config: { custom?: unknown }
  logger: { error: (msg: string) => void }
  findByID: (args: {
    collection: 'tenants'
    id: number | string
    depth: 0
    overrideAccess: true
  }) => Promise<unknown>
}

export async function revalidateTenant(args: {
  payload: PayloadLike
  tenant: Ref
  collection: string
  fetchImpl?: typeof fetch
}): Promise<'local' | 'remote' | 'skipped' | 'failed'> {
  const { payload, collection } = args
  const id = relId(args.tenant)
  if (id === undefined) return 'skipped'
  const custom = (payload.config.custom ?? {}) as Partial<CmsCustom>

  try {
    const tenant = (await payload.findByID({
      collection: 'tenants',
      id,
      depth: 0,
      overrideAccess: true,
    })) as TenantDoc
    const tags = [`${tenant.slug}:${collection}`]

    if (tenant.slug === custom.tenantSlug) {
      await custom.revalidateLocal?.(tags)
      return 'local'
    }

    const doFetch = args.fetchImpl ?? fetch
    const url = `${tenant.siteUrl.replace(/\/$/, '')}/api/revalidate`
    let lastError = ''
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await doFetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-revalidate-secret': tenant.revalidateSecret },
          body: JSON.stringify({ tags }),
        })
        if (res.ok) return 'remote'
        lastError = `status ${res.status}`
      } catch (err) {
        lastError = (err as Error).message
      }
    }
    payload.logger.error(`Revalidation of ${tenant.slug} failed for ${collection}: ${lastError}`)
    return 'failed'
  } catch (err) {
    payload.logger.error(`Revalidation failed for ${collection}: ${(err as Error).message}`)
    return 'failed'
  }
}

/** Adds cache-refresh hooks to a tenant-scoped collection. */
export function withRevalidation(collection: CollectionConfig): CollectionConfig {
  const afterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
    if (!req.context?.disableRevalidate) {
      await revalidateTenant({ payload: req.payload as never, tenant: doc.tenant, collection: collection.slug })
    }
    return doc
  }
  const afterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
    if (!req.context?.disableRevalidate) {
      await revalidateTenant({ payload: req.payload as never, tenant: doc.tenant, collection: collection.slug })
    }
    return doc
  }
  return {
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [...(collection.hooks?.afterChange ?? []), afterChange],
      afterDelete: [...(collection.hooks?.afterDelete ?? []), afterDelete],
    },
  }
}
