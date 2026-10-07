import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { isSafeInternalPath } from '@/lib/safe-path'

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path')
  if (!isSafeInternalPath(path)) return new Response('Invalid path', { status: 400 })

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Log in to the admin panel to preview drafts.', { status: 401 })

  const draft = await draftMode()
  draft.enable()
  redirect(path)
}
