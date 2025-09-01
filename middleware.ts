import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const nextIntlMiddleware = createMiddleware(routing);

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
