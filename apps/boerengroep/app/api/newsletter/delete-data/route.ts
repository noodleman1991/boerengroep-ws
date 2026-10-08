import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSubscriberByEmail, getSubscriberByToken, deleteSubscriber, logConsent } from '@/lib/db/queries';
import { sendDeleteConfirmationEmail } from '@/lib/email';
import { getClientIP, getUserAgent, normalizeEmail } from '@/lib/newsletter/utils';
import { newsletterSync } from '@/lib/newsletter/sync';

const language = z.enum(['en', 'nl']).default('en');
const reason = z.string().max(1000).optional();

/** Step 1: someone asks for deletion and gets a link by email. */
const requestSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  language,
  confirmation: z.boolean().refine((val) => val === true, 'Confirmation required'),
  reason,
});

/** Step 2: the link from that email, or from the foot of any newsletter. */
const confirmSchema = z.object({ token: z.string().uuid(), language, reason });

/**
 * Erasing someone's data takes two steps, because an email address alone proves nothing:
 * anyone can type someone else's. The deletion only happens with the personal link.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (typeof body?.token === 'string') {
      const { token, language, reason } = confirmSchema.parse(body);
      const subscriber = await getSubscriberByToken(token, 'unsubscribe');
      if (!subscriber) {
        return NextResponse.json({ error: 'This link is no longer valid.' }, { status: 400 });
      }

      await logConsent({
        email: subscriber.email,
        action: 'delete',
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        language,
        details: JSON.stringify({ reason, deletionRequested: true }),
      });

      if (!(await deleteSubscriber(subscriber.email))) {
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
      }
      // Erased here means erased at the mailing service too.
      await newsletterSync.deleted(subscriber.email);

      return NextResponse.json({
        status: 'deleted',
        message: 'Your data has been permanently deleted from our systems.',
      });
    }

    const { email, language } = requestSchema.parse(body);
    const subscriber = await getSubscriberByEmail(normalizeEmail(email));
    if (subscriber) {
      await sendDeleteConfirmationEmail(subscriber.email, language, subscriber.unsubscribeToken);
    }

    // The same answer whether or not the address is known, so nobody can test who is subscribed.
    return NextResponse.json({
      status: 'email-sent',
      message: 'If this address is on our list, we have sent an email with a link to confirm the deletion.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    console.error('Data deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
