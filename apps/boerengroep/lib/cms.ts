import config from '@payload-config'
import { createQueries } from '@sites/cms/queries'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { SITE } from '@/site.config'

export const TENANT_SLUG = process.env.TENANT_SLUG ?? SITE.tenant

export const cms = createQueries({
  getPayload: () => getPayload({ config }),
  tenantSlug: TENANT_SLUG,
  isDraft: async () => {
    try {
      return (await draftMode()).isEnabled
    } catch {
      // Outside a request, for example in generateStaticParams.
      return false
    }
  },
  cache: (fn, key, tags) => unstable_cache(fn, key, { tags, revalidate: 3600 }),
})

export type { Locale } from '@sites/cms/queries'
