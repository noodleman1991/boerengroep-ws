import { cms } from '@/lib/cms'

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const legacyPath = `/uploads/${path.map((segment) => decodeURIComponent(segment)).join('/')}`
  const media = await cms.getMediaByLegacyPath(legacyPath)
  if (!media?.url) return new Response('Not found', { status: 404 })

  return new Response(null, {
    status: 308,
    headers: {
      Location: media.url,
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000',
    },
  })
}
