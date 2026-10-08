import { getSubscribersForSync, newsletterSync, siteAdmin } from '@/lib/newsletter/sync';

export const dynamic = 'force-dynamic';

/** For the admin panel: does the link with Brevo work, and is the list complete? */
export async function GET(request: Request) {
  const who = await siteAdmin(request);
  if ('refusal' in who) return who.refusal;

  // One admin panel serves both sites. This site can only answer for its own newsletter.
  const asked = new URL(request.url).searchParams.get('tenant');
  if (asked && asked !== String(who.tenantId)) return Response.json({ otherSite: true });

  try {
    return Response.json(await newsletterSync.status(await getSubscribersForSync()));
  } catch (error) {
    console.error('[newsletter] status failed:', error);
    return Response.json({ error: 'The list of subscribers on this site could not be read.' }, { status: 500 });
  }
}
