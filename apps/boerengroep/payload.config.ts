import { createPayloadConfig } from '@sites/cms'
import { revalidateTag } from 'next/cache'
import { emailFromEnv } from './lib/cms-email'
import { SITE } from './site.config'

export default createPayloadConfig({
  tenantSlug: process.env.TENANT_SLUG ?? SITE.tenant,
  email: emailFromEnv(process.env, SITE.name),
  revalidateLocal: (tags) => {
    for (const tag of tags) revalidateTag(tag)
  },
})
