import { createPayloadConfig } from '@sites/cms'
import { revalidateTag } from 'next/cache'

export default createPayloadConfig({
  tenantSlug: process.env.TENANT_SLUG ?? 'boerengroep',
  revalidateLocal: (tags) => {
    for (const tag of tags) revalidateTag(tag)
  },
})
