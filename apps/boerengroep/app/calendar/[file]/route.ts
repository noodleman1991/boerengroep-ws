import { getTranslations } from 'next-intl/server';
import { cms, TENANT_SLUG } from '@/lib/cms';
import { toSiteEvent } from '@/lib/cms-adapters';
import { calendarFile } from '@/lib/events/ics';
import { toIcsEvent } from '@/lib/events/ics-site';
import { siteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

/** One event as a calendar file: /calendar/<address of the event>.ics */
export async function GET(request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!file.endsWith('.ics')) return new Response('Not found', { status: 404 });
  const slug = decodeURIComponent(file.slice(0, -4));
  const found = await cms.getEvent(slug);
  if (!found) return new Response('Not found', { status: 404 });

  const locale = new URL(request.url).searchParams.get('lang') === 'nl' ? 'nl' : 'en';
  const t = await getTranslations({ locale, namespace: 'calendar' });
  const event = toSiteEvent(found);
  const body = calendarFile(
    [toIcsEvent(event, { base: siteUrl(), locale, tenant: TENANT_SLUG, onlineLabel: t('online') })],
    {
      name: event.title,
      now: new Date(),
      labels: { full: t('status.full'), cancelled: t('status.cancelled'), postponed: t('status.postponed') },
    },
  );

  return new Response(body, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `attachment; filename="${event.slug.replace(/[^A-Za-z0-9-]/g, '')}.ics"`,
      'cache-control': 'public, max-age=0, s-maxage=300',
    },
  });
}
