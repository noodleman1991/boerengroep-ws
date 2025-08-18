import type { Collection } from '@tinacms/cli';
import { heroBlockSchema } from '@/components/blocks/hero';
import { contentBlockSchema } from '@/components/blocks/content';
import { testimonialBlockSchema } from '@/components/blocks/testimonial';
import { featureBlockSchema } from '@/components/blocks/features';
import { videoBlockSchema } from '@/components/blocks/video';
import { calloutBlockSchema } from '@/components/blocks/callout';
import { statsBlockSchema } from '@/components/blocks/stats';
import { ctaBlockSchema } from '@/components/blocks/call-to-action';

const Page: Collection = {
    label: 'Pages',
    name: 'page',
    path: 'content/pages',
    format: 'mdx',
    ui: {
        router: ({ document } : any) => {
            const breadcrumbs = document._sys.breadcrumbs;
            const locales = ['nl', 'en'];

            // Check if first segment is a locale
            if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
                const locale = breadcrumbs[0];
                const path = breadcrumbs.slice(1);

                if (path.length === 0 || (path.length === 1 && path[0] === 'home')) {
                    // Home page for this locale
                    return `/${locale}`;
                } else {
                    // Regular page for this locale
                    return `/${locale}/${path.join('/')}`;
                }
            } else {
                // Non-localized content - default to first locale or root
                const filepath = breadcrumbs.join('/');
                if (filepath === 'home') {
                    return '/nl'; // Default locale home
                }
                return `/nl/${filepath}`; // Default locale for other pages
            }
        },
    },
    fields: [
        {
            type: 'object',
            list: true,
            name: 'blocks',
            label: 'Sections',
            ui: {
                visualSelector: true,
            },
            templates: [
                heroBlockSchema,
                calloutBlockSchema,
                featureBlockSchema,
                statsBlockSchema,
                ctaBlockSchema,
                contentBlockSchema,
                testimonialBlockSchema,
                videoBlockSchema,
            ],
        },
    ],
};

export default Page;
