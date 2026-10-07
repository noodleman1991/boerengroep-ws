import { revalidateTag } from 'next/cache'
import { TENANT_SLUG } from '@/lib/cms'
import { ownTags, secretMatches } from '@/lib/revalidate-auth'

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get('x-revalidate-secret'), process.env.REVALIDATE_SECRET)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null
  const tags = ownTags(body?.tags, TENANT_SLUG)
  for (const tag of tags) revalidateTag(tag)
  return Response.json({ revalidated: tags })
}
