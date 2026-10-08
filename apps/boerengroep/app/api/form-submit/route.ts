import config from '@payload-config';
import type { NextRequest } from 'next/server';
import { getPayload } from 'payload';
import { cms } from '@/lib/cms';
import { createRateLimiter, type FormField, looksLikeSpam, validateSubmission } from '@/lib/forms';
import { answerEmail, notifyAddress } from '@/lib/forms-notify';
import { getClientIP } from '@/lib/newsletter/utils';
import { thisTenantId } from '@/lib/tenant';
import { SITE } from '@/site.config';

export const dynamic = 'force-dynamic';

// Ten answers per sender in ten minutes is plenty for a person and little for a script.
const limiter = createRateLimiter({ limit: 10, windowMs: 10 * 60_000 });

/**
 * Receives an answer to a form that editors built. The open API refuses answers, so this is
 * the only way in: it checks the sender, the form's site and every field before saving.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    form?: unknown;
    values?: unknown;
    website?: unknown;
    elapsedMs?: unknown;
  } | null;
  const formId = typeof body?.form === 'number' || typeof body?.form === 'string' ? body.form : null;
  if (!body || formId === null || !body.values || typeof body.values !== 'object' || Array.isArray(body.values)) {
    return Response.json({ error: 'invalid' }, { status: 400 });
  }

  if (!limiter.allow(getClientIP(request) ?? 'unknown')) {
    return Response.json({ error: 'too-many' }, { status: 429 });
  }

  // A robot gets the same friendly answer as a person, and nothing is saved.
  if (looksLikeSpam({ trap: body.website, elapsedMs: typeof body.elapsedMs === 'number' ? body.elapsedMs : undefined })) {
    return Response.json({ ok: true });
  }

  try {
    const payload = await getPayload({ config });
    const tenant = await thisTenantId();
    const found = await payload.find({
      collection: 'forms',
      // A form of the other site cannot be answered through this site.
      where: { and: [{ id: { equals: formId } }, { tenant: { equals: tenant } }] },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    const form = found.docs[0];
    if (!form) return Response.json({ error: 'no-form' }, { status: 404 });

    const checked = validateSubmission((form.fields ?? []) as FormField[], body.values as Record<string, unknown>);
    if (!checked.ok) return Response.json({ error: 'fields', fields: checked.errors }, { status: 400 });

    await payload.create({
      collection: 'form-submissions',
      data: { form: form.id, submissionData: checked.data, tenant } as never,
      overrideAccess: true,
    });

    // The organisation gets a copy by email. The answer is saved either way, so a mail
    // problem is logged and never shown to the person who filled in the form.
    try {
      const [settings, contact] = await Promise.all([cms.getSiteSettings('en'), cms.getContactForServer()]);
      const to = notifyAddress({ general: { contact } });
      if (to) {
        const mail = answerEmail({ site: settings?.general?.name || SITE.name, form: { title: form.title, fields: (form.fields ?? []) as FormField[] }, data: checked.data });
        await payload.sendEmail({ to, subject: mail.subject, text: mail.text, html: mail.html, ...(mail.replyTo ? { replyTo: mail.replyTo } : {}) });
      }
    } catch (error) {
      console.error('[forms] the email about an answer was not sent:', error instanceof Error ? error.message : error);
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error('[forms] saving an answer failed:', error);
    return Response.json({ error: 'server' }, { status: 500 });
  }
}
