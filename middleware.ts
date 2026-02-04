import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const nextIntlMiddleware = createMiddleware(routing);

/**
 * Detects if the browser prefers Dutch based on Accept-Language header.
 * Returns true only if Dutch (nl) is explicitly the primary language.
 */
function prefersDutch(request: NextRequest): boolean {
    const acceptLanguage = request.headers.get('accept-language') || '';
    // Check if the first language in the header starts with 'nl'
    // Accept-Language format: "nl,en;q=0.9,de;q=0.8" or "nl-NL,nl;q=0.9"
    const primaryLanguage = acceptLanguage.split(',')[0]?.trim().toLowerCase() || '';
    return primaryLanguage.startsWith('nl');
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static assets and API routes
    if (
        pathname.startsWith('/api/') ||
        pathname.startsWith('/admin/') ||
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/uploads/') ||
        pathname.startsWith('/blocks/') ||
        pathname.includes('.') // Skip any file extensions (.png, .jpg, .css, .js, etc.)
    ) {
        return NextResponse.next();
    }

    // For TinaCMS admin routes
    if (pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    // Explicit root path redirect based on browser language (no cookies)
    // Redirects / to /nl if browser is Dutch, otherwise to /en
    if (pathname === '/') {
        const targetLocale = prefersDutch(request) ? 'nl' : 'en';
        return NextResponse.redirect(new URL(`/${targetLocale}`, request.url));
    }

    // Apply next-intl middleware for all other routes
    return nextIntlMiddleware(request);
}

export const config = {
    // Match all pathnames except those starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico, robots.txt, etc. (static files in public)
    // - admin (TinaCMS admin)
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|admin|uploads|blocks).*)',
    ]
};
