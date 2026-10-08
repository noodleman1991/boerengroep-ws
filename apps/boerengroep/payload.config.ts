import { createPayloadConfig } from '@sites/cms'
import { revalidateTag } from 'next/cache'
import { emailFromEnv } from './lib/cms-email'

export default createPayloadConfig({
  tenantSlug: process.env.TENANT_SLUG ?? 'boerengroep',
  email: emailFromEnv(process.env),
  revalidateLocal: (tags) => {
    for (const tag of tags) revalidateTag(tag)
  },
})
