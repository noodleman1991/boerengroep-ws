import type { Collection } from "@tinacms/cli";
import { heroBlockSchema } from '@/components/blocks/hero';
import { contentBlockSchema } from '@/components/blocks/content';
import { testimonialBlockSchema } from '@/components/blocks/testimonial';
import { featureBlockSchema } from '@/components/blocks/features';
import { videoBlockSchema } from '@/components/blocks/video';
import { calloutBlockSchema } from '@/components/blocks/callout';
import { statsBlockSchema } from '@/components/blocks/stats';
import { ctaBlockSchema } from '@/components/blocks/call-to-action';
import { imageTextBlockSchema } from '@/components/blocks/image-text';

const Newsletter: Collection = {
    label: "Newsletters",
    name: "newsletter",
    path: "content/newsletters",
    format: "mdx",
    ui: {
        router: ({ document }: any) => {
            const breadcrumbs = document._sys.breadcrumbs;
            const locales = ['nl', 'en'];

            // Check if first segment is a locale
            if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
                const locale = breadcrumbs[0];
                const path = breadcrumbs.slice(1);
                return `/${locale}/newsletters/${path.join('/')}`;
            } else {
                // Non-localized content - default to first locale
                return `/nl/newsletters/${breadcrumbs.join('/')}`;
            }
        },
    },
    fields: [
        {
            type: "string",
            label: "Title",
            name: "title",
            isTitle: true,
            required: true,
        },
        {
            type: "string",
            label: "Type",
            name: "type",
            required: true,
            options: [
                { label: "Article", value: "article" },
                { label: "External Link", value: "link" },
                { label: "Event Announcement", value: "event" },
                { label: "Update", value: "update" },
            ],
        },
        {
            type: "string",
            label: "Organization",
            name: "organization",
            required: true,
            options: [
                { label: "Boerengroep", value: "Boerengroep" },
                { label: "Inspiratietheater", value: "Inspiratietheater" },
                { label: "Friend Organization", value: "partner" },
                { label: "Other", value: "other" },
            ],
        },
        {
            type: "datetime",
            label: "Publish Date",
            name: "publishDate",
            required: true,
            ui: {
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'HH:mm',
            },
        },
        {
            type: "string",
            label: "Tags",
            name: "tags",
            list: true,
            ui: {
                component: "tags",
            },
        },
        {
            type: "string",
            label: "External Link",
            name: "externalLink",
            description: "If this is a link to external content",
        },
        {
            type: "string",
            label: "Link Description",
            name: "linkDescription",
            description: "Description of the external link",
            ui: {
                component: "textarea",
            },
        },
        {
            type: "reference",
            label: "Author",
            name: "author",
            collections: ["speaker"],
        },
        {
            type: "image",
            label: "Featured Image",
            name: "featuredImage",
            // @ts-ignore
            uploadDir: () => "newsletters",
        },
        {
            type: "rich-text",
            label: "Excerpt",
            name: "excerpt",
            description: "Brief summary for listings",
            overrides: {
                toolbar: ['bold', 'italic', 'link'],
            },
        },
        {
            type: 'object',
            list: true,
            name: 'body',
            label: 'Content Sections',
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
                imageTextBlockSchema,
            ],
        },
        {
            type: "boolean",
            label: "Featured",
            name: "featured",
            description: "Highlight this newsletter",
        },
        {
            type: "boolean",
            label: "Published",
            name: "published",
            description: "Make this newsletter visible",
            required: true,
        },
    ],
};

export default Newsletter;
