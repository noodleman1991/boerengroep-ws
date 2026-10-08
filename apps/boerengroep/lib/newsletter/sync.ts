import config from '@payload-config';
import { getPayload } from 'payload';
import { cms } from '@/lib/cms';
import { getSubscribersForSync } from '@/lib/db/queries';
import { createBrevo } from '@/lib/email/brevo';
import { canManageTenant } from '@/lib/site-admin-auth';
import { thisTenantId } from '@/lib/tenant';
import { createNewsletterSync } from './brevo-sync';
import { listIdFrom } from './list-id';

/**
 * The key for Brevo: the one an admin saved under Site settings, Newsletter, and otherwise the
 * one of the hosting. Read at the moment it is needed, so a new key works without a restart.
 */
async function brevoKey(): Promise<string | undefined> {
  try {
    return (await cms.getBrevoKey()) ?? process.env.BREVO_API_KEY;
  } catch (error) {
    console.error('[newsletter] reading the saved Brevo key failed:', error instanceof Error ? error.message : error);
    return process.env.BREVO_API_KEY;
  }
}

/** This site's link with Brevo. */
export const newsletterSync = createNewsletterSync({
  brevo: async () => createBrevo({ apiKey: await brevoKey() }),
  listId: async () => listIdFrom((await cms.getSiteSettings('en'))?.newsletter?.brevoListId, process.env.BREVO_LIST_ID),
  report: (problem) => console.error(`[newsletter] ${problem}`),
});

export { getSubscribersForSync };

/**
 * Who is asking? Gives a refusal unless the request comes from an admin of this site.
 * Otherwise gives this site's id, so a caller can tell when the question is about the other site.
 */
export async function siteAdmin(request: Request): Promise<{ refusal: Response } | { tenantId: number | string }> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) return { refusal: Response.json({ error: 'Log in to the admin panel first.' }, { status: 401 }) };
  const tenantId = await thisTenantId();
  if (!canManageTenant(user as never, tenantId)) {
    return { refusal: Response.json({ error: 'Only admins of this site can do this.' }, { status: 403 }) };
  }
  return { tenantId };
}
