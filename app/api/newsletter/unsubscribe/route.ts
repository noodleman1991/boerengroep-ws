import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSubscriberByToken, updateSubscriberStatus, logConsent } from '@/lib/db/queries';
import { sendUnsubscribeConfirmation } from '@/lib/email';
import { getClientIP, getUserAgent } from '@/lib/newsletter/utils';
import type { SupportedLanguage } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const schema = z.object({
      token: z.string().uuid(),
      language: z.enum(['en', 'nl']).default('en'),
      reason: z.string().optional(),
      feedback: z.string().max(1000).optional(),
    });

    const { token, language, reason, feedback } = schema.parse(body);

    const subscriber = await getSubscriberByToken(token, 'unsubscribe');

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 400 }
      );
    }

    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json({
        message: 'Already unsubscribed',
      });
    }

    const success = await updateSubscriberStatus(
      subscriber.email,
      'unsubscribed',
      {
        updatedAt: new Date(),
      }
    );

    if (success) {
      await logConsent({
        email: subscriber.email,
        action: 'unsubscribe',
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        language: language as SupportedLanguage,
        details: JSON.stringify({ reason, feedback }),
      });

      await sendUnsubscribeConfirmation(
        subscriber.email,
        subscriber.preferredLanguage
      );

      return NextResponse.json({
        message: 'Successfully unsubscribed from newsletter',
      });
    }

    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Unsubscribe error:', error);

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
