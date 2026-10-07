import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import mime from 'mime-types'
import type { Payload } from 'payload'
import type { Ctx, Id } from './context'
import type { Report } from './report'

export function listUploads(uploadsDir: string): string[] {
  if (!existsSync(uploadsDir)) return []
  const out: string[] = []
  const walk = (abs: string) => {
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const child = path.join(abs, entry.name)
      if (entry.isDirectory()) walk(child)
      else out.push(`/uploads/${path.relative(uploadsDir, child).split(path.sep).join('/')}`)
    }
  }
  walk(uploadsDir)
  return out.sort()
}

/** Uploads every file once. A file already uploaded for this tenant is reused. */
export async function uploadAll(
  input: { payload: Payload; tenantId: Id; report: Report },
  uploadsDir: string,
): Promise<Map<string, Id>> {
  const { payload, tenantId, report } = input
  const map = new Map<string, Id>()

  for (const legacyPath of listUploads(uploadsDir)) {
    try {
      const existing = await payload.find({
        collection: 'media',
        where: { and: [{ legacyPath: { equals: legacyPath } }, { tenant: { equals: tenantId } }] },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (existing.docs[0]) {
        map.set(legacyPath, existing.docs[0].id)
        continue
      }
      const abs = path.join(uploadsDir, legacyPath.replace(/^\/uploads\//, ''))
      const data = readFileSync(abs)
      const created = await payload.create({
        collection: 'media',
        data: { alt: '', legacyPath, tenant: tenantId } as never,
        file: {
          data,
          name: path.basename(abs),
          mimetype: mime.lookup(abs) || 'application/octet-stream',
          size: data.length,
        },
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
      map.set(legacyPath, created.id)
    } catch (err) {
      report.add('error', legacyPath, `upload failed: ${(err as Error).message}`)
    }
  }
  return map
}

export function resolveMedia(ctx: Ctx, value: unknown, legacyId: string): Id | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') {
    ctx.report.add('missing-media', legacyId, `image value is not a path: ${JSON.stringify(value)}`)
    return undefined
  }
  if (/^https?:\/\//.test(value)) {
    ctx.report.add('missing-media', legacyId, `external image ${value} was not imported`)
    return undefined
  }
  let key = value
  try {
    key = decodeURI(value)
  } catch {
    // keep the raw value when it is not valid percent-encoding
  }
  const id = ctx.media.get(key)
  if (id === undefined) ctx.report.add('missing-media', legacyId, `${value} is not in the uploads folder`)
  return id
}
