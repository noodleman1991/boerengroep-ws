import type { Payload } from 'payload'
import {
  importEvents,
  importNewsletters,
  importPastEvents,
  importPeople,
  importVacancies,
} from './collections'
import type { Ctx } from './context'
import { emptyFixups, type Fixups } from './fixups'
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
  /** More folders with files that belong in the uploads folder, in the same layout. */
  extraUploadsDirs?: string[]
  /** Addresses served by built-in routes of the app, for example `/vacancies`. */
  reservedPaths?: string[]
  /** Hand-written corrections for this site. */
  fixups?: Partial<Fixups>
  /** The old site's translation files, keyed by language. */
  messages?: { en?: unknown; nl?: unknown }
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
  const media = await uploadAll({ payload, tenantId: tenant.id, report }, uploadsDir, input.extraUploadsDirs)
  const ctx: Ctx = {
    payload,
    tenantId: tenant.id,
    report,
    media,
    ids: new Map(),
    pageByEnPath: new Map(),
    reservedPaths: new Set(input.reservedPaths ?? []),
    // A fix-ups object may leave parts out.
    fixups: { ...emptyFixups, ...input.fixups },
    messages: input.messages ?? {},
    toLexical: await makeToLexical(payload, report, media),
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
