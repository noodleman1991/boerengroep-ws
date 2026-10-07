import type { Payload } from 'payload'
import type { Report } from './report'

export type Id = number | string
export type Lexical = Record<string, unknown>

export type Ctx = {
  payload: Payload
  tenantId: Id
  report: Report
  /** `/uploads/...` path to media id. */
  media: Map<string, Id>
  /** Tina file path (relative to content/) to Payload id. */
  ids: Map<string, Id>
  /** English page path such as `/about-us/history` to page id. Only pages a menu may link to. */
  pageByEnPath: Map<string, Id>
  /** Addresses served by a built-in route of the app. Menu items keep their plain href for these. */
  reservedPaths: Set<string>
  toLexical: (markdown: unknown, legacyId: string) => Promise<Lexical | undefined>
}

const WRITE = { overrideAccess: true, context: { disableRevalidate: true } } as const

/** Creates the document, or updates the one previously imported from the same Tina file. */
export async function upsert(
  ctx: Ctx,
  collection: string,
  legacyId: string,
  data: Record<string, unknown>,
  locale?: 'en' | 'nl',
): Promise<Id> {
  const existing = await ctx.payload.find({
    collection: collection as never,
    where: { and: [{ legacyId: { equals: legacyId } }, { tenant: { equals: ctx.tenantId } }] },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })
  const found = existing.docs[0] as { id: Id } | undefined
  const doc = found
    ? await ctx.payload.update({
        collection: collection as never,
        id: found.id,
        data: data as never,
        locale: locale as never,
        ...WRITE,
      })
    : await ctx.payload.create({
        collection: collection as never,
        data: { ...data, legacyId, tenant: ctx.tenantId } as never,
        locale: locale as never,
        ...WRITE,
      })
  const id = (doc as { id: Id }).id
  ctx.ids.set(legacyId, id)
  return id
}

/** Resolves a Tina reference such as `content/speakers/x.md` to a Payload id. */
export function refId(ctx: Ctx, value: unknown, legacyId: string): Id | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') {
    ctx.report.add('unresolved-reference', legacyId, `reference is not a path: ${JSON.stringify(value)}`)
    return undefined
  }
  const key = value.replace(/^content\//, '')
  const id = ctx.ids.get(key)
  if (id === undefined) ctx.report.add('unresolved-reference', legacyId, `${value} was not imported`)
  return id
}
