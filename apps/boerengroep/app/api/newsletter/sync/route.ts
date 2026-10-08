import { getSubscribersForSync, newsletterSync, siteAdmin } from '@/lib/newsletter/sync';

export const dynamic = 'force-dynamic';

/** For the admin panel: bring the Brevo list in line with the people who signed up here. */
export async function POST(request: Request) {
  const who = await siteAdmin(request);
  if ('refusal' in who) return who.refusal;
  try {
    const result = await newsletterSync.syncAll(await getSubscribersForSync());
    return Response.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    console.error('[newsletter] sync failed:', error);
    return Response.json({ ok: false, error: 'The list of subscribers on this site could not be read.' }, { status: 500 });
  }
}
