import config from '@payload-config';
import { getPayload } from 'payload';
import { cms, TENANT_SLUG } from '@/lib/cms';
import { getSubscribersForSync } from '@/lib/db/queries';
import { brevo } from '@/lib/email/brevo';
import { canManageTenant } from '@/lib/site-admin-auth';
import { createNewsletterSync } from './brevo-sync';
import { listIdFrom } from './list-id';

/** This site's link with Brevo. */
export const newsletterSync = createNewsletterSync({
  brevo,
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
  const tenants = await payload.find({
    collection: 'tenants',
    where: { slug: { equals: TENANT_SLUG } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const tenantId = tenants.docs[0]?.id;
  if (tenantId === undefined || !canManageTenant(user as never, tenantId)) {
    return { refusal: Response.json({ error: 'Only admins of this site can do this.' }, { status: 403 }) };
  }
  return { tenantId };
}
