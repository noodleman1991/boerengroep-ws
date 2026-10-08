// The same rules as the Boerengroep site: the root goes to /en or /nl, and next-intl does the rest.
export { middleware } from '../boerengroep/middleware';

// Next.js reads this from the file itself, so it is repeated here.
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|admin|uploads|blocks).*)'],
};
