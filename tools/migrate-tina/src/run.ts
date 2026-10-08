import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import { listAppRoutes } from './app-routes'
import { parseFixups } from './fixups'
import { migrate } from './migrate'
import config from './payload.config'
import { refreshSite } from './refresh'

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}`)
  return value
}

/**
 * Menu labels and the names of event kinds lived in the old site's translation files.
 * MESSAGES_DIR points at that folder. Without it the files of the new app are read.
 */
function readMessages(appDir: string | undefined) {
  const dir = process.env.MESSAGES_DIR ? path.resolve(process.env.MESSAGES_DIR) : appDir ? path.resolve(appDir, 'messages') : undefined
  const read = (locale: string) => {
    if (!dir) return undefined
    const file = path.resolve(dir, `${locale}.json`)
    return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as unknown) : undefined
  }
  return { en: read('en'), nl: read('nl') }
}

const payload = await getPayload({ config })
const report = await migrate({
  payload,
  tenantSlug: env('TENANT_SLUG'),
  contentDir: path.resolve(env('CONTENT_DIR')),
  uploadsDir: path.resolve(env('UPLOADS_DIR')),
  // EXTRA_UPLOADS_DIR is optional: files the old repository lacks, laid out like the uploads folder.
  extraUploadsDirs: process.env.EXTRA_UPLOADS_DIR ? [path.resolve(process.env.EXTRA_UPLOADS_DIR)] : [],
  // APP_DIR is optional. With it, menu items that point at built-in routes keep their plain href.
  reservedPaths: process.env.APP_DIR ? listAppRoutes(path.resolve(process.env.APP_DIR)) : [],
  // FIXUPS_FILE is optional: a JSON file with editorial corrections for this site.
  messages: readMessages(process.env.APP_DIR),
  fixups: process.env.FIXUPS_FILE ? parseFixups(readFileSync(path.resolve(process.env.FIXUPS_FILE), 'utf8')) : undefined,
})

const reportPath = path.resolve(process.env.REPORT_PATH ?? 'migration-report.md')
writeFileSync(reportPath, report.toMarkdown())
payload.logger.info(`Migration finished with ${report.count()} report entries. Report: ${reportPath}`)

// The site still remembers what it showed before the import. Tell it once to forget.
const site = (await payload.find({ collection: 'tenants', where: { slug: { equals: env('TENANT_SLUG') } }, limit: 1, depth: 0, overrideAccess: true }))
  .docs[0] as unknown as { siteUrl?: string; revalidateSecret?: string } | undefined
const refreshed = await refreshSite({
  siteUrl: site?.siteUrl,
  secret: site?.revalidateSecret,
  tenantSlug: env('TENANT_SLUG'),
  collections: payload.config.collections.map((collection) => collection.slug),
})
if (refreshed.ok) payload.logger.info(`Site refreshed: ${refreshed.detail}.`)
else payload.logger.warn(`Site not refreshed: ${refreshed.detail}. It may show what it showed before the import. With the site running, run the import again or redeploy it. For a local build, delete the app's .next folder first.`)
process.exit(report.failed ? 1 : 0)
