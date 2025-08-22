import { NextRequest } from 'next/server';
import crypto from 'crypto';
import type { SupportedLanguage } from '../db/schema';

// Generate cryptographically secure tokens
export function generateSecureToken(): string {
    return crypto.randomUUID();
}

// Hash email for privacy-preserving operations
export function hashEmail(email: string): string {
    const secret = process.env.NEWSLETTER_SECRET || 'fallback-secret-key';
    return crypto
        .createHmac('sha256', secret)
        .update(email.toLowerCase().trim())
        .digest('hex');
}

// Extract client IP address from request
export function getClientIP(request: NextRequest): string | null {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cloudflareIP = request.headers.get('cf-connecting-ip');

    if (cloudflareIP) return cloudflareIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0]?.trim() || null;

    // Fallback to connection remote address
    return request.ip || null;
}

// Get user agent from request
export function getUserAgent(request: NextRequest): string | null {
    return request.headers.get('user-agent') || null;
}

// Validate email format (additional check beyond zod)
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim().toLowerCase());
}

// Normalize email address
export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

// Generate unsubscribe URL
export function generateUnsubscribeUrl(
    token: string,
    baseUrl: string,
    language: SupportedLanguage = 'en'
): string {
    return `${baseUrl}/${language}/newsletter/unsubscribe?token=${token}`;
}

// Generate verification URL
export function generateVerificationUrl(
    token: string,
    baseUrl: string,
    language: SupportedLanguage = 'en'
): string {
    return `${baseUrl}/${language}/newsletter/verify?token=${token}`;
}

// Generate data export URL
export function generateDataExportUrl(
    email: string,
    baseUrl: string,
    language: SupportedLanguage = 'en'
): string {
    const hashedEmail = hashEmail(email);
    return `${baseUrl}/${language}/newsletter/export-data?hash=${hashedEmail}`;
}

// Rate limiting helper
export function createRateLimitKey(ip: string | null, email?: string): string {
    if (email) {
        return `newsletter:${hashEmail(email)}`;
    }
    return `newsletter:${ip || 'unknown'}`;
}

// GDPR compliance helpers
export function isEUIP(ip: string | null): boolean {
    // This is a simplified check - in production, use a proper IP geolocation service
    // For now, we'll assume all IPs might be EU (safe default for GDPR)
    return true;
}

// Clean up sensitive data for logging
export function sanitizeForLogging(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };

    // Remove or mask sensitive fields
    if (sanitized.email) {
        const email = sanitized.email as string;
        const [localPart, domain] = email.split('@');
        if (localPart && domain) {
            sanitized.email = `${localPart.slice(0, 2)}***@${domain}`;
        }
    }

    if (sanitized.ipAddress) {
        const ip = sanitized.ipAddress as string;
        const parts = ip.split('.');
        if (parts.length === 4) {
            sanitized.ipAddress = `${parts[0]}.${parts[1]}.***.***.`;
        }
    }

    return sanitized;
}

// Format date for different locales
export function formatDate(date: Date, language: SupportedLanguage): string {
    const locale = language === 'nl' ? 'nl-NL' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

// Generate consent summary for GDPR
export function generateConsentSummary(
    email: string,
    timestamp: Date,
    ipAddress: string | null,
    userAgent: string | null,
    language: SupportedLanguage
): string {
    const formattedDate = formatDate(timestamp, language);
    const maskedIP = ipAddress ?
        ipAddress.split('.').map((part, index) => index > 1 ? '***' : part).join('.') :
        'Not recorded';

    return `Email: ${email}\nConsent given: ${formattedDate}\nIP: ${maskedIP}\nBrowser: ${userAgent || 'Not recorded'}`;
}

// Validate subscription source
export function validateSubscriptionSource(source?: string): string {
    const allowedSources = [
        'website',
        'footer',
        'blog-post',
        'event-page',
        'contact-form',
        'manual-admin',
        'api'
    ];

    return allowedSources.includes(source || '') ? source! : 'website';
}

// Check if email is from a disposable email provider
export function isDisposableEmail(email: string): boolean {
    const disposableDomains = [
        '10minutemail.com',
        'tempmail.org',
        'guerrillamail.com',
        'mailinator.com',
        'temp-mail.org',
        'throwaway.email',
        // Add more as needed
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? disposableDomains.includes(domain) : false;
}

// Generate newsletter preferences object
export function generateDefaultPreferences(): Record<string, boolean> {
    return {
        newsletter: true,
        events: true,
        updates: true,
        marketing: false, // Opt-in for marketing by default false for GDPR
    };
}

// Create audit trail for GDPR compliance
export function createAuditTrail(
    action: string,
    email: string,
    details: Record<string, any> = {}
): Record<string, any> {
    return {
        timestamp: new Date().toISOString(),
        action,
        email: hashEmail(email), // Store hashed for privacy
        details: sanitizeForLogging(details),
        version: '1.0', // Schema version for future compatibility
    };
}
