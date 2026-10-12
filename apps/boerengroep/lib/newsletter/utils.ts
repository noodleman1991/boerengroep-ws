import type { NextRequest } from 'next/server';

/** The address a request comes from, for the limit on how often one visitor may send a form. */
export function getClientIP(request: NextRequest): string | null {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cloudflareIP = request.headers.get('cf-connecting-ip');

    if (cloudflareIP) return cloudflareIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0]?.trim() || null;
    return null;
}

/** Addresses of services that hand out a mailbox for ten minutes. Nobody reads a newsletter there. */
export function isDisposableEmail(email: string): boolean {
    const disposableDomains = [
        '10minutemail.com',
        'tempmail.org',
        'guerrillamail.com',
        'mailinator.com',
        'temp-mail.org',
        'throwaway.email',
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? disposableDomains.includes(domain) : false;
}
