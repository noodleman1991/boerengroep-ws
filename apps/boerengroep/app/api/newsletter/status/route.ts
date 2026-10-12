import { newsletter, siteAdmin } from '@/lib/newsletter/this-site';

export const dynamic = 'force-dynamic';

/** For the admin panel: does the sign-up box work, from the box to the Brevo list? */
export async function GET(request: Request) {
  const who = await siteAdmin(request);
  if ('refusal' in who) return who.refusal;

  // One admin panel serves both sites. This site can only answer for its own newsletter.
  const asked = new URL(request.url).searchParams.get('tenant');
  if (asked && asked !== String(who.tenantId)) return Response.json({ otherSite: true });

  try {
    return Response.json(await newsletter.status());
  } catch (error) {
    console.error('[newsletter] status failed:', error);
    return Response.json({ error: 'The check did not work. Try again in a moment.' }, { status: 500 });
  }
}
