import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createTenant, resetDb, testPayload } from '@sites/cms/testing'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { migrate } from '../src/migrate'
import type { Report } from '../src/report'

const fixture = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/site')

// A copy of the fixture site with one more page: it links to files on the old site's own file
// server, and shows a picture that is not in the repository's uploads folder.
const site = mkdtempSync(path.join(tmpdir(), 'site-'))
const rescued = mkdtempSync(path.join(tmpdir(), 'rescued-'))
cpSync(fixture, site, { recursive: true })
// A small but real PDF: one empty page.
const PDF =
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n164\n%%EOF\n'
writeFileSync(path.join(site, 'uploads/Year Plan 2026.pdf'), PDF)
cpSync(path.join(fixture, 'uploads/hero.png'), path.join(rescued, 'only-on-the-file-server.png'))
mkdirSync(path.join(site, 'content/pages/en'), { recursive: true })
writeFileSync(
  path.join(site, 'content/pages/en/files.mdx'),
  `---
title: Files
blocks:
  - body: |
      Read the [year plan](https://assets.tina.io/abc-123/Year%20Plan%202026.pdf) or the
      [old report](https://assets.tina.io/abc-123/gone.pdf).

      ![](/uploads/only-on-the-file-server.png)
    _template: content
---
`,
)

const input = (payload: Payload) => ({
  payload,
  tenantSlug: 'boerengroep',
  contentDir: path.join(site, 'content'),
  uploadsDir: path.join(site, 'uploads'),
  extraUploadsDirs: [rescued],
  fixups: { addBlocks: { files: [{ block: { blockType: 'newsPreview', count: 3 } }] } },
})

type Node = { type?: string; fields?: Record<string, any>; value?: unknown; children?: Node[] }
const flat = (node: Node): Node[] => [node, ...(node.children ?? []).flatMap(flat)]

let payload: Payload
let report: Report

async function filesPage() {
  const res = await payload.find({ collection: 'pages', where: { legacyId: { equals: 'pages/files' } }, locale: 'en', depth: 0, draft: true, overrideAccess: true })
  return res.docs[0] as any
}
const mediaId = async (legacyPath: string) =>
  (await payload.find({ collection: 'media', where: { legacyPath: { equals: legacyPath } }, depth: 0, overrideAccess: true })).docs[0]?.id

describe('files of the old site', () => {
  beforeAll(async () => {
    payload = await testPayload()
    await resetDb(payload)
    await createTenant(payload, 'boerengroep')
    report = await migrate(input(payload))
  })

  it('imports without errors', () => {
    expect(report.entries.filter((e) => e.kind === 'error')).toEqual([])
  })
  afterAll(async () => resetDb(payload))

  it('imports a file that is only in the extra folder, and shows it where the text shows it', async () => {
    const id = await mediaId('/uploads/only-on-the-file-server.png')
    expect(id).toBeDefined()
    const nodes = flat((await filesPage()).blocks[0].body.root)
    expect(nodes.filter((node) => node.type === 'upload').map((node) => node.value)).toEqual([id])
  })

  it('turns a link to the old file server into a link to the imported file', async () => {
    const plan = await mediaId('/uploads/Year Plan 2026.pdf')
    expect(plan).toBeDefined()
    const links = flat((await filesPage()).blocks[0].body.root).filter((node) => node.type === 'link')
    expect(links[0]!.fields).toMatchObject({ linkType: 'internal', doc: { relationTo: 'media', value: plan } })
    expect(links[0]!.fields!.url ?? '').not.toContain('tina.io')
  })

  it('keeps a link whose file is nowhere to be found, and says so in the report', async () => {
    const links = flat((await filesPage()).blocks[0].body.root).filter((node) => node.type === 'link')
    expect(links[1]!.fields).toMatchObject({ linkType: 'custom', url: 'https://assets.tina.io/abc-123/gone.pdf' })
    const entry = report.entries.find((e) => e.kind === 'missing-media' && e.message.includes('gone.pdf'))
    expect(entry?.message).toContain('stops working when that account is closed')
  })

  it('adds the blocks the fix-ups name, once, however often the import runs', async () => {
    const kinds = async () => ((await filesPage()).blocks as { blockType: string }[]).map((block) => block.blockType)
    const files = async () => (await payload.find({ collection: 'media', limit: 0, overrideAccess: true })).totalDocs
    expect(await kinds()).toEqual(['content', 'newsPreview'])
    const before = await files()
    await migrate(input(payload))
    expect(await kinds()).toEqual(['content', 'newsPreview'])
    expect(await files()).toBe(before)
  })
})
