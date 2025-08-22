import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSubscriberByEmail, deleteSubscriber, logConsent } from '@/lib/db/queries';
import { getClientIP, getUserAgent, normalizeEmail } from '@/lib/newsletter/utils';
import type { SupportedLanguage } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const schema = z.object({
      email: z.string().email().toLowerCase().trim(),
      language: z.enum(['en', 'nl']).default('en'),
      confirmation: z.boolean().refine(val => val === true, 'Confirmation required'),
      reason: z.string().max(1000).optional(),
    });

    const { email, language, confirmation, reason } = schema.parse(body);
    const normalizedEmail = normalizeEmail(email);

    const subscriber = await getSubscriberByEmail(normalizedEmail);

    if (!subscriber) {
      return NextResponse.json(
        { error: 'No data found for this email address' },
        { status: 404 }
      );
    }

    // Log deletion request before deleting
    await logConsent({
      email: normalizedEmail,
      action: 'delete',
      timestamp: new Date(),
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      language: language as SupportedLanguage,
      details: JSON.stringify({ reason, deletionRequested: true }),
    });

    const success = await deleteSubscriber(normalizedEmail);

    if (success) {
      return NextResponse.json({
        message: 'Your data has been permanently deleted from our systems.',
      });
    }

    return NextResponse.json(
      { error: 'Failed to delete data' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Data deletion error:', error);

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
