import type { Field } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

process.env.PAYLOAD_SECRET ??= 'test-secret-not-for-production'
process.env.PAYLOAD_DATABASE_URL ??= 'postgres://payload:payload@127.0.0.1:54329/payload_test'

/** Every stored field of a collection, by its path. */
function paths(fields: Field[], prefix = ''): string[] {
  return fields.flatMap((field) => {
    if (field.type === 'tabs') return field.tabs.flatMap((tab) => paths(tab.fields, 'name' in tab && tab.name ? `${prefix}${tab.name}.` : prefix))
    if (field.type === 'row' || field.type === 'collapsible') return paths(field.fields, prefix)
    if (!('name' in field) || field.type === 'ui') return []
    const own = `${prefix}${field.name}`
    return 'fields' in field && Array.isArray(field.fields) ? [own, ...paths(field.fields, `${own}.`)] : [own]
  })
}

async function mediaFields(token: string | undefined): Promise<string[]> {
  if (token) process.env.BLOB_READ_WRITE_TOKEN = token
  else delete process.env.BLOB_READ_WRITE_TOKEN
  // Plugins add their fields to the collections themselves, so every build starts from fresh ones.
  vi.resetModules()
  const { createPayloadConfig } = await import('./config')
  const config = await createPayloadConfig({ tenantSlug: 'boerengroep' })
  const media = config.collections.find((collection) => collection.slug === 'media')
  return paths(media?.fields ?? []).sort()
}

describe('the tables of pictures and files', () => {
  const before = process.env.BLOB_READ_WRITE_TOKEN
  afterEach(() => {
    if (before) process.env.BLOB_READ_WRITE_TOKEN = before
    else delete process.env.BLOB_READ_WRITE_TOKEN
  })

  // The tables are made on a laptop, without a file store. The real site has one. If the store
  // added a column of its own, the real site would ask the database for a column it lacks, and
  // no picture could be read or uploaded.
  it('are the same with and without a file store', async () => {
    const without = await mediaFields(undefined)
    const withStore = await mediaFields('vercel_blob_rw_abc123_def456')
    expect(withStore).toEqual(without)
    expect(without).toEqual(expect.arrayContaining(['_objectKey', 'prefix', 'url', 'legacyPath']))
  })
})
