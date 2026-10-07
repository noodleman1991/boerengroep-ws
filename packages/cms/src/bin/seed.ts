import { getPayload } from 'payload'
import config from '../dev.config'
import { requireEnv } from '../env'
import { ensureTenantAndAdmin } from '../seed'

const payload = await getPayload({ config })
const out = await ensureTenantAndAdmin(payload, {
  tenant: {
    name: requireEnv('SEED_TENANT_NAME'),
    slug: requireEnv('TENANT_SLUG'),
    siteUrl: requireEnv('SEED_SITE_URL'),
    revalidateSecret: requireEnv('REVALIDATE_SECRET'),
  },
  admin: { email: requireEnv('SEED_ADMIN_EMAIL'), password: requireEnv('SEED_ADMIN_PASSWORD') },
})
payload.logger.info(`Seeded tenant ${out.tenantId} and admin ${out.userId}`)
process.exit(0)
