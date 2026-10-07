import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSubscriberByEmail, getConsentHistory, logConsent } from '@/lib/db/queries';
import { sendDataExportEmail } from '@/lib/email';
import { getClientIP, getUserAgent, normalizeEmail, hashEmail } from '@/lib/newsletter/utils';
import type { SupportedLanguage } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const schema = z.object({
      email: z.string().email().toLowerCase().trim(),
      language: z.enum(['en', 'nl']).default('en'),
    });

    const { email, language } = schema.parse(body);
    const normalizedEmail = normalizeEmail(email);

    const subscriber = await getSubscriberByEmail(normalizedEmail);

    if (!subscriber) {
      return NextResponse.json(
        { error: 'No data found for this email address' },
        { status: 404 }
      );
    }

    const consentHistory = await getConsentHistory(normalizedEmail);

    const exportData = {
      subscriber: {
        email: subscriber.email,
        preferredLanguage: subscriber.preferredLanguage,
        subscribedDate: subscriber.subscribedDate,
        status: subscriber.status,
        verifiedAt: subscriber.verifiedAt,
        lastEmailSent: subscriber.lastEmailSent,
        emailCount: subscriber.emailCount,
        createdAt: subscriber.createdAt,
        updatedAt: subscriber.updatedAt,
      },
      consentHistory: consentHistory.map(log => ({
        action: log.action,
        timestamp: log.timestamp,
        language: log.language,
        details: log.details,
      })),
      exportTimestamp: new Date(),
      gdprNote: 'This data export was generated in compliance with GDPR Article 15 (Right of Access).',
    };

    const success = await sendDataExportEmail(
      normalizedEmail,
      language,
      exportData
    );

    if (success) {
      await logConsent({
        email: normalizedEmail,
        action: 'export',
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: getUserAgent(request),
        language: language as SupportedLanguage,
        details: JSON.stringify({ exportRequested: true }),
      });

      return NextResponse.json({
        message: 'Data export has been sent to your email address.',
      });
    }

    return NextResponse.json(
      { error: 'Failed to send data export' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Data export error:', error);

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
