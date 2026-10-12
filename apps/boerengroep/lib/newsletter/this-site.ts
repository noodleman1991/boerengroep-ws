import config from '@payload-config';
import { getPayload } from 'payload';
import { routing } from '@/i18n/routing';
import { cms } from '@/lib/cms';
import { emailsOff } from '@/lib/cms-email';
import { canManageTenant } from '@/lib/site-admin-auth';
import { siteUrl } from '@/lib/site-url';
import { thisTenantId } from '@/lib/tenant';
import { createBrevo } from './brevo';
import { createNewsletter, wholeNumber } from './newsletter';

/**
 * This site's sign-up for the newsletter. Everything it needs is what an admin saved under
 * Site settings, Newsletter: the Brevo key, the list and the confirmation email. All three
 * are read at the moment they are needed, so a change works without a restart.
 */
export const newsletter = createNewsletter({
  brevo: async () => createBrevo({ apiKey: await cms.getBrevoKey() }),
  settings: async (language) => {
    const locale = routing.locales.find((known) => known === language) ?? routing.defaultLocale;
    const chosen = (await cms.getSiteSettings(locale))?.newsletter;
    return { listId: wholeNumber(chosen?.brevoListId), templateId: wholeNumber(chosen?.brevoConfirmationTemplateId) };
  },
  confirmedUrl: (language) => `${siteUrl()}/${language}/newsletter/verify`,
  languages: routing.locales,
  off: () => emailsOff(process.env),
  report: (problem) => console.error(`[newsletter] ${problem}`),
});

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
