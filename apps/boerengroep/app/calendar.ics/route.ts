import { getTranslations } from 'next-intl/server';
import { cms, TENANT_SLUG } from '@/lib/cms';
import { toSiteEvent } from '@/lib/cms-adapters';
import { calendarFile } from '@/lib/events/ics';
import { feedEvents, toIcsEvent } from '@/lib/events/ics-site';
import { siteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

/**
 * The calendar people subscribe to. Their calendar app fetches this address every few
 * hours, so new events, changes and cancellations arrive by themselves.
 */
export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get('lang') === 'nl' ? 'nl' : 'en';
  const settings = await cms.getSiteSettings(locale);
  if (settings?.calendar?.showSubscribe === false) return new Response('Not found', { status: 404 });

  const t = await getTranslations({ locale, namespace: 'calendar' });
  const site = { base: siteUrl(), locale, tenant: TENANT_SLUG, onlineLabel: t('online') } as const;
  const now = new Date();
  const events = feedEvents((await cms.listEvents()).map(toSiteEvent), now);

  const body = calendarFile(
    events.map((event) => toIcsEvent(event, site)),
    {
      name: settings?.general?.name ?? 'Events',
      now,
      feed: true,
      labels: { full: t('status.full'), cancelled: t('status.cancelled'), postponed: t('status.postponed') },
    },
  );

  return new Response(body, {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': 'inline; filename="calendar.ics"',
      // Shared caches may keep it a quarter of an hour. Calendar apps ask far less often than that.
      'cache-control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600',
    },
  });
}
