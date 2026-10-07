import type { Payload } from 'payload'
import {
  importEvents,
  importNewsletters,
  importPastEvents,
  importPeople,
  importVacancies,
} from './collections'
import type { Ctx } from './context'
import { uploadAll } from './media'
import { importPages } from './pages'
import { Report } from './report'
import { makeToLexical } from './richtext'
import { importRedirects, importSettings } from './settings'

export type MigrateInput = {
  payload: Payload
  tenantSlug: string
  contentDir: string
  uploadsDir: string
}

export async function migrate(input: MigrateInput): Promise<Report> {
  const { payload, tenantSlug, contentDir, uploadsDir } = input
  const tenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: tenantSlug } },
    limit: 1,
    overrideAccess: true,
  })
  const tenant = tenants.docs[0]
  if (!tenant) throw new Error(`Tenant "${tenantSlug}" not found. Run the seed first.`)

  const report = new Report()
  const ctx: Ctx = {
    payload,
    tenantId: tenant.id,
    report,
    media: await uploadAll({ payload, tenantId: tenant.id, report }, uploadsDir),
    ids: new Map(),
    pageByEnPath: new Map(),
    toLexical: await makeToLexical(payload, report),
  }

  // Order matters: referenced collections first, pages before settings.
  await importPeople(ctx, contentDir)
  await importEvents(ctx, contentDir)
  await importVacancies(ctx, contentDir)
  await importNewsletters(ctx, contentDir)
  await importPastEvents(ctx, contentDir)
  await importPages(ctx, contentDir)
  await importSettings(ctx, contentDir)
  await importRedirects(ctx, contentDir)

  return report
}
