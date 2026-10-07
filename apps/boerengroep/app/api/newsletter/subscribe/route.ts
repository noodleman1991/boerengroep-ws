import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createBrevoContact, isBrevoConfigured } from '@/lib/email/brevo';
import {
  generateSecureToken,
  getClientIP,
  getUserAgent,
  normalizeEmail,
  isDisposableEmail,
} from '@/lib/newsletter/utils';
import {
  createSubscriber,
  getSubscriberByEmail,
  logConsent,
  updateSubscriberStatus,
} from '@/lib/db/queries';
import { sendWelcomeEmail } from '@/lib/email';

const subscribeSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  language: z.enum(['en', 'nl']).default('en'),
  source: z.string().optional().default('website'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = subscribeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.issues.map((issue) => issue.message),
        },
        { status: 400 }
      );
    }

    const { email, language, source } = validationResult.data;
    const normalizedEmail = normalizeEmail(email);

    // Check for disposable email
    if (isDisposableEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please use a valid email address' },
        { status: 400 }
      );
    }

    // Get client info for consent logging
    const clientIP = getClientIP(request);
    const userAgent = getUserAgent(request);

    // Check if subscriber already exists
    const existingSubscriber = await getSubscriberByEmail(normalizedEmail);

    if (existingSubscriber) {
      // Handle existing subscriber
      if (existingSubscriber.status === 'active') {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 400 }
        );
      }

      if (existingSubscriber.status === 'pending') {
        // Resend verification email
        try {
          await sendWelcomeEmail(
            normalizedEmail,
            language,
            existingSubscriber.verificationToken!
          );
        } catch (emailError) {
          console.error('Failed to resend verification email:', emailError);
        }

        return NextResponse.json({
          message: 'Verification email resent. Please check your inbox.',
          status: 'pending',
        });
      }

      // Re-subscribe unsubscribed user
      const verificationToken = generateSecureToken();
      const unsubscribeToken = generateSecureToken();

      await updateSubscriberStatus(normalizedEmail, 'pending', {
        verificationToken,
        unsubscribeToken,
        preferredLanguage: language,
        subscribedDate: new Date(),
      });

      // Log consent
      await logConsent({
        email: normalizedEmail,
        action: 'subscribe',
        ipAddress: clientIP,
        userAgent: userAgent,
        language,
        details: JSON.stringify({ source, resubscribe: true }),
      });

      // Send verification email
      try {
        await sendWelcomeEmail(normalizedEmail, language, verificationToken);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      // Sync with Brevo (if configured)
      if (isBrevoConfigured()) {
        await createBrevoContact({
          email: normalizedEmail,
          attributes: { LANGUAGE: language.toUpperCase() },
          updateEnabled: true,
        });
      }

      return NextResponse.json({
        message: 'Please check your email to verify your subscription.',
        status: 'pending',
      });
    }

    // Create new subscriber
    const verificationToken = generateSecureToken();
    const unsubscribeToken = generateSecureToken();

    const newSubscriber = await createSubscriber({
      email: normalizedEmail,
      preferredLanguage: language,
      status: 'pending',
      verificationToken,
      unsubscribeToken,
      consentTimestamp: new Date(),
      consentIp: clientIP,
      consentUserAgent: userAgent,
      subscribedDate: new Date(),
    });

    if (!newSubscriber) {
      return NextResponse.json(
        { error: 'Failed to create subscription. Please try again.' },
        { status: 500 }
      );
    }

    // Log consent
    await logConsent({
      email: normalizedEmail,
      action: 'subscribe',
      ipAddress: clientIP,
      userAgent: userAgent,
      language,
      details: JSON.stringify({ source }),
    });

    // Send verification email
    try {
      await sendWelcomeEmail(normalizedEmail, language, verificationToken);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue - subscription is created, email can be resent
    }

    // Sync with Brevo (if configured)
    if (isBrevoConfigured()) {
      const brevoResult = await createBrevoContact({
        email: normalizedEmail,
        attributes: { LANGUAGE: language.toUpperCase() },
        updateEnabled: true,
      });

      if (!brevoResult.success && !brevoResult.skipped) {
        console.error('Brevo sync failed:', brevoResult.error);
        // Continue - local subscription is created, Brevo sync can retry later
      }
    }

    return NextResponse.json({
      message: 'Please check your email to verify your subscription.',
      status: 'pending',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const brevoConfigured = isBrevoConfigured();

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    brevo: brevoConfigured ? 'configured' : 'not configured',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'missing',
      RESEND_BOERENGROEP: process.env.RESEND_BOERENGROEP ? 'set' : 'missing',
      FROM_EMAIL: process.env.FROM_EMAIL ? 'set' : 'missing',
      BREVO_API_KEY: brevoConfigured ? 'set' : 'not set (optional)',
      BREVO_LIST_ID: process.env.BREVO_LIST_ID ? 'set' : 'not set (optional)',
    },
  };

  return NextResponse.json(health);
}
