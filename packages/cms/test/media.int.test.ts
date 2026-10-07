import { existsSync } from 'node:fs'
import path from 'node:path'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createTenant, resetDb, testPayload } from './helpers'

// A valid 1x1 transparent PNG.
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

let payload: Payload
let tenantId: number | string

describe('media', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    tenantId = (await createTenant(payload, 'boerengroep')).id
  })
  afterAll(async () => resetDb(payload))

  it('stores an upload with its legacy path and tenant', async () => {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: 'dot', legacyPath: '/uploads/dot.png', tenant: tenantId } as never,
      file: { data: png, mimetype: 'image/png', name: 'dot.png', size: png.length },
      overrideAccess: true,
    })
    expect(doc.legacyPath).toBe('/uploads/dot.png')
    expect(doc.url).toBeTruthy()
    expect(doc.mimeType).toBe('image/png')
  })

  it('writes local files to MEDIA_DIR when no Blob token is set', async () => {
    const res = await payload.find({ collection: 'media', limit: 1 })
    expect(existsSync(path.join(process.env.MEDIA_DIR!, res.docs[0]!.filename!))).toBe(true)
  })

  it('is readable without logging in', async () => {
    const res = await payload.find({ collection: 'media', overrideAccess: false })
    expect(res.totalDocs).toBe(1)
  })

  it('refuses an anonymous upload', async () => {
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'x', tenant: tenantId } as never,
        file: { data: png, mimetype: 'image/png', name: 'x.png', size: png.length },
        overrideAccess: false,
      }),
    ).rejects.toThrow(/not allowed/)
  })
})
