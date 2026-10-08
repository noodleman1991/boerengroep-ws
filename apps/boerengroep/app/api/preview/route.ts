import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { TENANT_SLUG } from '@/lib/cms'
import { canPreviewTenant } from '@/lib/preview-auth'
import { isSafeInternalPath } from '@/lib/safe-path'

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path')
  if (!isSafeInternalPath(path)) return new Response('Invalid path', { status: 400 })

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Log in to the admin panel to preview drafts.', { status: 401 })

  const tenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: TENANT_SLUG } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (!canPreviewTenant(user as never, tenants.docs[0]?.id)) {
    return new Response('Your account does not belong to this site.', { status: 403 })
  }

  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
