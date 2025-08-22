import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSubscriberByToken, updateSubscriberStatus, logConsent } from '@/lib/db/queries';
import { getClientIP, getUserAgent } from '@/lib/newsletter/utils';
import type { SupportedLanguage } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const schema = z.object({
      token: z.string().uuid(),
      language: z.enum(['en', 'nl']).default('en'),
    });

    const { token, language } = schema.parse(body);

    const subscriber = await getSubscriberByToken(token, 'verification');

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    if (subscriber.status === 'active') {
      return NextResponse.json({
        message: 'Email already verified',
      });
    }

    const success = await updateSubscriberStatus(
      subscriber.email,
      'active',
      {
        verifiedAt: new Date(),
        verificationToken: null,
      }
    );

    if (success) {
      await logConsent({
        email: subscriber.email,
        action: 'update',
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        language: language as SupportedLanguage,
        details: JSON.stringify({ action: 'email_verified' }),
      });

      return NextResponse.json({
        message: 'Email verified successfully! You are now subscribed to our newsletter.',
      });
    }

    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Email verification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
