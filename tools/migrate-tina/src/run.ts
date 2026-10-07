import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import { migrate } from './migrate'
import config from './payload.config'

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable ${name}`)
  return value
}

const payload = await getPayload({ config })
const report = await migrate({
  payload,
  tenantSlug: env('TENANT_SLUG'),
  contentDir: path.resolve(env('CONTENT_DIR')),
  uploadsDir: path.resolve(env('UPLOADS_DIR')),
})

const reportPath = path.resolve(process.env.REPORT_PATH ?? 'migration-report.md')
writeFileSync(reportPath, report.toMarkdown())
payload.logger.info(`Migration finished with ${report.count()} report entries. Report: ${reportPath}`)
process.exit(report.failed ? 1 : 0)
