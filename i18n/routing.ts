import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'nl'],
    defaultLocale: 'en',
    pathnames: {
        '/': '/',
        '/pathnames': {
            nl: '/padnamen'
        }
    }
});
