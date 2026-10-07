// Hand-maintained. The site has two locales and no translated route names:
// built-in routes use the same address in both languages, and CMS pages are
// resolved by their localized path in app/[locale]/[...urlSegments].

import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'nl'],
    defaultLocale: 'en',
});
