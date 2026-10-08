import { NextRequest, NextResponse } from 'next/server';
import { loadPodcast } from '@/lib/podcast';
import { podcastPage } from '@/lib/podcast-page';

/** More episodes for the podcast page: /api/podcast?limit=6&offset=6 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
  const offset = Number.parseInt(searchParams.get('offset') || '0', 10);
  return NextResponse.json(podcastPage(await loadPodcast(), limit, offset));
}
