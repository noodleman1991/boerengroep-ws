import { createPayloadConfig } from './config'

export default createPayloadConfig({ tenantSlug: process.env.TENANT_SLUG ?? 'boerengroep' })
