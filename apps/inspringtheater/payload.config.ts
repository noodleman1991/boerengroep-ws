import { createPayloadConfig } from '@sites/cms'
import { revalidateTag } from 'next/cache'
import { emailFromEnv } from '@/lib/cms-email'
import { SITE } from './site.config'

// This app reads its content through the same content model as the Boerengroep app.
// The admin panel itself is served by the Boerengroep app only.
export default createPayloadConfig({
  tenantSlug: process.env.TENANT_SLUG ?? SITE.tenant,
  email: emailFromEnv(process.env, SITE.name),
  revalidateLocal: (tags) => {
    for (const tag of tags) revalidateTag(tag)
  },
})
