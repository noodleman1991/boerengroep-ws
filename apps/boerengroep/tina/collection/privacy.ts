import type { Collection } from '@tinacms/cli';
import { heroBlockSchema } from '@/components/blocks/hero';
import { contentBlockSchema } from '@/components/blocks/content';
import { calloutBlockSchema } from '@/components/blocks/callout';

const Privacy: Collection = {
    label: 'Privacy Policies',
    name: 'privacy',
    path: 'content/privacy',
    format: 'mdx',
    ui: {
        router: ({ document } : any) => {
            const breadcrumbs = document._sys.breadcrumbs;
            const locales = ['nl', 'en'];

            // Check if first segment is a locale
            if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
                const locale = breadcrumbs[0];
                const path = breadcrumbs.slice(1);
                return `/${locale}/privacy-policy`;
            } else {
                // Non-localized content - default to first locale
                return `/nl/privacy-policy`;
            }
        },
    },
    fields: [
        {
            type: 'string',
            label: 'Title',
            name: 'title',
            isTitle: true,
            required: true,
        },
        {
            type: 'datetime',
            label: 'Last Updated',
            name: 'lastUpdated',
            required: true,
            ui: {
                dateFormat: 'YYYY-MM-DD',
            },
        },
        {
            type: 'string',
            label: 'Version',
            name: 'version',
            required: true,
            description: 'e.g., 1.0, 1.1, 2.0',
        },
        {
            type: 'object',
            list: true,
            name: 'blocks',
            label: 'Content Sections',
            ui: {
                visualSelector: true,
            },
            templates: [
                heroBlockSchema,
                contentBlockSchema,
                calloutBlockSchema,
            ],
        },
    ],
};

export default Privacy;
