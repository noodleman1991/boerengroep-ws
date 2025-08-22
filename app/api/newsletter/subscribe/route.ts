import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('❌ Request body parsing failed:', error);
      return NextResponse.json(
        { error: 'Invalid request format', step: 'body_parsing' },
        { status: 400 }
      );
    }

    // Step 3: Test validation
    try {
      const validationSchema = z.object({
        email: z.string().email().toLowerCase().trim(),
        consent: z.boolean().refine(val => val === true, 'Consent is required'),
        language: z.enum(['en', 'nl']).default('en'),
        source: z.string().optional().default('website'),
      });

      const validatedData = validationSchema.parse(body);
    } catch (error) {
      console.error('❌ Validation failed:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid request data',
            details: error.issues.map((issue: z.ZodIssue) => issue.message),
            step: 'validation'
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Validation error', step: 'validation' },
        { status: 400 }
      );
    }

    let utilityFunctions: any = {};
    try {
      const utilsModule = await import('@/lib/newsletter/utils');
      utilityFunctions = {
        generateSecureToken: utilsModule.generateSecureToken,
        getClientIP: utilsModule.getClientIP,
        getUserAgent: utilsModule.getUserAgent,
        normalizeEmail: utilsModule.normalizeEmail,
        isValidEmail: utilsModule.isValidEmail,
        validateSubscriptionSource: utilsModule.validateSubscriptionSource,
      };
    } catch (error) {
      console.error('❌ Utility import failed:', error);
      return NextResponse.json(
        {
          error: 'Server configuration error - utilities',
          step: 'utility_import',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    let dbFunctions: any = {};
    try {
      const dbModule = await import('@/lib/db/queries');
      dbFunctions = {
        createSubscriber: dbModule.createSubscriber,
        getSubscriberByEmail: dbModule.getSubscriberByEmail,
        logConsent: dbModule.logConsent,
      };
    } catch (error) {
      console.error('❌ Database import failed:', error);
      return NextResponse.json(
        {
          error: 'Database service unavailable',
          step: 'database_import',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    let emailFunctions: any = {};
    try {
      const emailModule = await import('@/lib/email');
      emailFunctions = {
        sendWelcomeEmail: emailModule.sendWelcomeEmail,
      };
    } catch (error) {
      console.error('❌ Email import failed:', error);
      return NextResponse.json(
        {
          error: 'Email service unavailable',
          step: 'email_import',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    const requiredEnvVars = ['DATABASE_URL', 'RESEND_BOERENGROEP', 'FROM_EMAIL'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
      console.error('❌ Missing environment variables:', missingEnvVars);
      return NextResponse.json(
        {
          error: 'Server configuration error - environment variables',
          step: 'environment_check',
          missing: missingEnvVars
        },
        { status: 500 }
      );
    }

    try {
      const testEmail = 'test@example.com';
      const existingSubscriber = await dbFunctions.getSubscriberByEmail(testEmail);
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return NextResponse.json(
        {
          error: 'Database connection failed',
          step: 'database_connection',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Debug successful - all systems operational',
      steps_passed: 8,
      timestamp: new Date().toISOString(),
      next_action: 'Replace this debug route with full implementation'
    });

  } catch (error) {
    console.error('❌ CRITICAL ERROR in newsletter API:', error);

    return NextResponse.json(
      {
        error: 'Critical server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        step: 'critical_error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      RESEND_BOERENGROEP: process.env.RESEND_BOERENGROEP ? '✅ Set' : '❌ Missing',
      FROM_EMAIL: process.env.FROM_EMAIL ? '✅ Set' : '❌ Missing',
    }
  };

  console.log('🏥 Health check:', health);
  return NextResponse.json(health);
}
