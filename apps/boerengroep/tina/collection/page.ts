import type { Collection } from '@tinacms/cli';
import { heroBlockSchema } from '@/components/blocks/hero';
import { contentBlockSchema } from '@/components/blocks/content';
import { testimonialBlockSchema } from '@/components/blocks/testimonial';
import { featureBlockSchema } from '@/components/blocks/features';
import { videoBlockSchema } from '@/components/blocks/video';
import { calloutBlockSchema } from '@/components/blocks/callout';
import { statsBlockSchema } from '@/components/blocks/stats';
import { ctaBlockSchema } from '@/components/blocks/call-to-action';
import { imageTextBlockSchema } from '@/components/blocks/image-text';
import { eventsCalendarPreviewBlockSchema } from '@/components/blocks/events-calendar-preview';

const Page: Collection = {
    label: 'Pages',
    name: 'page',
    path: 'content/pages',
    format: 'mdx',
    ui: {
        // Auto-generate filename from URL slug (prevents manual filename edits)
        filename: {
            slugify: (values: any) => {
                // Use urlSlug if provided, otherwise fall back to title
                const slug = values?.urlSlug || values?.title || 'untitled';
                return slug
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');
            },
            readonly: true, // Prevent manual filename edits for URL consistency
        },
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
            type: 'string',
            name: 'title',
            label: 'Page Title',
            description: 'The display title for this page',
            required: true,
            isTitle: true,
        },
        {
            type: 'string',
            name: 'urlSlug',
            label: 'URL Slug (English)',
            description: 'URL-friendly name for this page (e.g., "about-us"). This determines the page URL. Use lowercase letters, numbers, and hyphens only.',
            required: false,
            ui: {
                validate: (value: string) => {
                    if (!value) return undefined;
                    if (!/^[a-z0-9-]+$/.test(value)) {
                        return 'URL slug can only contain lowercase letters, numbers, and hyphens';
                    }
                    if (value.startsWith('-') || value.endsWith('-')) {
                        return 'URL slug cannot start or end with a hyphen';
                    }
                    return undefined;
                },
            },
        },
        {
            type: 'string',
            name: 'urlSlugNl',
            label: 'URL Slug (Dutch)',
            description: 'Dutch URL path (e.g., "over-ons" for "about-us"). Leave empty to use the English slug.',
            ui: {
                validate: (value: string) => {
                    if (value && !/^[a-z0-9-]+$/.test(value)) {
                        return 'URL slug can only contain lowercase letters, numbers, and hyphens';
                    }
                    return undefined;
                },
            },
        },
        {
            type: 'string',
            name: 'previousUrls',
            label: 'Previous URLs (for redirects)',
            description: 'Old URLs that should redirect to this page. Add entries here when changing the URL slug to prevent broken links.',
            list: true,
        },
        {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
        },
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
                eventsCalendarPreviewBlockSchema,
                calloutBlockSchema,
                featureBlockSchema,
                statsBlockSchema,
                ctaBlockSchema,
                contentBlockSchema,
                testimonialBlockSchema,
                videoBlockSchema,
                imageTextBlockSchema,
            ],
        },
    ],
};

export default Page;
