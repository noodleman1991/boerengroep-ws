import {
  ValidationError,
  type CollectionAfterChangeHook,
  type CollectionBeforeChangeHook,
} from 'payload'
import { relId } from '../access/roles'

export function buildPath(parentPath: string | null | undefined, slug: string): string {
  if (!parentPath) return slug === 'home' ? '/' : `/${slug}`
  return `${parentPath === '/' ? '' : parentPath}/${slug}`
}

/** Sets `path` for the locale being saved and rejects a duplicate within the tenant. */
export const computePath: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  const slug: string | undefined = data.slug ?? originalDoc?.slug
  if (!slug) return data

  const parentId = relId(data.parent !== undefined ? data.parent : originalDoc?.parent)
  let parentPath: string | null = null
  if (parentId !== undefined) {
    const parent = await req.payload.findByID({
      collection: 'pages',
      id: parentId,
      locale: req.locale as never,
      depth: 0,
      draft: true,
      overrideAccess: true,
      req,
    })
    parentPath = (parent as { path?: string | null }).path ?? null
  }

  const path = buildPath(parentPath, slug)
  const tenantId = relId(data.tenant ?? originalDoc?.tenant)

  const clash = await req.payload.find({
    collection: 'pages',
    locale: req.locale as never,
    fallbackLocale: false as never,
    depth: 0,
    limit: 1,
    draft: true,
    overrideAccess: true,
    req,
    where: {
      and: [
        { path: { equals: path } },
        { tenant: { equals: tenantId } },
        ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
      ],
    },
  })
  if (clash.totalDocs > 0) {
    throw new ValidationError({
      collection: 'pages',
      errors: [{ path: 'slug', message: `Another page already uses the path ${path}.` }],
    })
  }

  data.path = path
  return data
}

/**
 * When a page's path changes, re-save its children so their paths follow.
 * A child without a version in this locale is skipped: it keeps no path here and
 * stays reachable under its fallback-locale address.
 */
export const resaveChildren: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (req.context?.skipResave) return doc
  if (previousDoc?.path === doc.path) return doc

  const children = await req.payload.find({
    collection: 'pages',
    locale: req.locale as never,
    fallbackLocale: false as never,
    depth: 0,
    limit: 1000,
    draft: true,
    overrideAccess: true,
    req,
    where: { parent: { equals: doc.id } },
  })
  for (const child of children.docs as { id: number | string; slug?: string | null }[]) {
    if (!child.slug) continue
    await req.payload.update({
      collection: 'pages',
      id: child.id,
      locale: req.locale as never,
      data: { slug: child.slug } as never,
      overrideAccess: true,
      req,
    })
  }
  return doc
}
