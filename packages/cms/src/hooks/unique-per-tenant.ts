import { ValidationError, type CollectionBeforeChangeHook } from 'payload'
import { relId } from '../access/roles'

/**
 * Refuses a second document on the same site with the same value in one field.
 * Used for addresses, which must lead to exactly one thing.
 */
export function uniquePerTenant(collection: string, field: string, message: (value: unknown) => string): CollectionBeforeChangeHook {
  return async ({ data, originalDoc, req }) => {
    const value = data[field] ?? originalDoc?.[field]
    if (value === undefined || value === null || value === '') return data
    const tenant = relId(data.tenant ?? originalDoc?.tenant)
    const clash = await req.payload.find({
      collection: collection as never,
      depth: 0,
      limit: 1,
      draft: true,
      overrideAccess: true,
      req,
      where: {
        and: [
          { [field]: { equals: value } },
          { tenant: { equals: tenant } },
          ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
        ],
      },
    })
    if (clash.totalDocs > 0) {
      throw new ValidationError({ collection, errors: [{ path: field, message: message(value) }] })
    }
    return data
  }
}
