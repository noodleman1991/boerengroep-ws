import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter } from '@/lib/forms';
import { newsletter } from '@/lib/newsletter/this-site';
import { getClientIP, isDisposableEmail } from '@/lib/newsletter/utils';

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  language: z.enum(['en', 'nl']).default('en'),
});

// Every sign-up makes Brevo send an email to the address that was typed. The limit keeps
// one visitor from using the box to send many of them.
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

/**
 * Someone typed their address in the newsletter box. The address goes to Brevo, which
 * sends its confirmation email. The site itself stores nothing about the person.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success || isDisposableEmail(parsed.data.email)) {
    return NextResponse.json({ error: 'Please use a valid email address' }, { status: 400 });
  }
  if (!limiter.allow(getClientIP(request) ?? 'unknown')) {
    return NextResponse.json({ error: 'Too many sign-ups from here. Try again later.' }, { status: 429 });
  }

  const result = await newsletter.signUp(parsed.data.email, parsed.data.language);
  // The same answer whether or not Brevo already knew the address, so nobody can use the box
  // to find out who is on the list.
  if (result.status === 'sent' || result.status === 'off') {
    return NextResponse.json({ status: 'pending', message: 'Please check your email to confirm your subscription.' });
  }
  // Why it failed is for the admin panel and the log, not for a visitor.
  return NextResponse.json(
    { error: 'Signing up is not possible right now. Please try again later.' },
    { status: result.status === 'not-ready' ? 503 : 502 },
  );
}
