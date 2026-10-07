import { createPayloadConfig } from '@sites/cms'

export default createPayloadConfig({ tenantSlug: process.env.TENANT_SLUG ?? 'boerengroep' })
