import React from 'react';
import type { Collection } from '@tinacms/cli';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Import all content block schemas
import { videoBlockSchema } from '@/components/blocks/video';
import { heroBlockSchema } from '@/components/blocks/hero';
import { contentBlockSchema } from '@/components/blocks/content';
import { featureBlockSchema } from '@/components/blocks/features';
import { testimonialBlockSchema } from '@/components/blocks/testimonial';
import { calloutBlockSchema } from '@/components/blocks/callout';
import { statsBlockSchema } from '@/components/blocks/stats';
import { ctaBlockSchema } from '@/components/blocks/call-to-action';
import { imageTextBlockSchema } from '@/components/blocks/image-text';

const PastEvent: Collection = {
    label: 'Past Events',
    name: 'pastEvent',
    path: 'content/past-events',
    format: 'mdx',
    ui: {
        router: ({ document }: any) => {
            const breadcrumbs = document._sys.breadcrumbs;
            const locales = ['nl', 'en'];

            // Check if first segment is a locale
            if (breadcrumbs.length >= 1 && locales.includes(breadcrumbs[0])) {
                const locale = breadcrumbs[0];
                const path = breadcrumbs.slice(1);
                return `/${locale}/activities/past-events/${path.join('/')}`;
            } else {
                // Non-localized content - default to first locale
                return `/nl/activities/past-events/${breadcrumbs.join('/')}`;
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
            type: 'image',
            name: 'heroImg',
            label: 'Hero Image',
            // @ts-ignore
            uploadDir: () => 'past-events',
        },
        {
            type: 'rich-text',
            label: 'Excerpt',
            name: 'excerpt',
            description: 'Brief summary of what happened at this event',
            overrides: {
                toolbar: ['bold', 'italic', 'link'],
            },
        },
        {
            type: 'reference',
            label: 'Author',
            name: 'author',
            collections: ['author'],
            ui: {
                //@ts-ignore
                optionComponent: (
                    props: {
                        name?: string;
                        avatar: string;
                    },
                    _internalSys: { path: string }
                ) => {
                    const { name, avatar } = props;
                    if (!name) return _internalSys.path;

                    return (
                        <p className='flex min-h-8 items-center gap-4'>
                            <Avatar>
                                {avatar && <AvatarImage src={avatar} alt={`${name} Profile`} />}
                                <AvatarFallback>
                                    {name
                                        .split(' ')
                                        .map((part) => part[0]?.toUpperCase() || '')
                                        .join('')}
                                </AvatarFallback>
                            </Avatar>
                            {name}
                        </p>
                    );
                },
            },
        },
        {
            type: 'datetime',
            label: 'Event Date',
            name: 'date',
            required: true,
            description: 'The date when the event took place',
            ui: {
                dateFormat: 'MMMM DD YYYY',
                timeFormat: 'hh:mm A',
            },
        },
        {
            type: 'reference',
            label: 'Related Calendar Event',
            name: 'relatedEvent',
            collections: ['event'],
            description: 'Link to the original calendar event (optional)',
        },
        {
            type: 'object',
            label: 'Tags',
            name: 'tags',
            list: true,
            fields: [
                {
                    type: 'reference',
                    label: 'Tag',
                    name: 'tag',
                    collections: ['tag'],
                    ui: {
                        optionComponent: (
                            props: {
                                name?: string;
                            },
                            _internalSys: { path: string }
                        ) => props.name || _internalSys.path,
                    },
                },
            ],
            ui: {
                itemProps: (item: any) => {
                    return { label: item?.tag };
                },
            },
        },
        {
            type: 'object',
            label: 'Content Blocks',
            name: 'blocks',
            list: true,
            templates: [
                heroBlockSchema,
                contentBlockSchema,
                featureBlockSchema,
                testimonialBlockSchema,
                videoBlockSchema,
                calloutBlockSchema,
                statsBlockSchema,
                ctaBlockSchema,
                imageTextBlockSchema,
            ],
            ui: {
                visualSelector: true,
            },
        },
        {
            type: 'rich-text',
            label: 'Body',
            name: '_body',
            templates: [
                {
                    name: 'BlockQuote',
                    label: 'Block Quote',
                    fields: [
                        {
                            name: 'children',
                            label: 'Quote',
                            type: 'rich-text',
                            overrides: {
                                toolbar: ['bold', 'italic', 'link'],
                            },
                        },
                        {
                            name: 'authorName',
                            label: 'Author',
                            type: 'string',
                        },
                    ],
                },
                {
                    name: 'DateTime',
                    label: 'Date & Time',
                    inline: true,
                    fields: [
                        {
                            name: 'format',
                            label: 'Format',
                            type: 'string',
                            options: ['utc', 'iso', 'local'],
                        },
                    ],
                },
                {
                    name: 'NewsletterSignup',
                    label: 'Newsletter Sign Up',
                    fields: [
                        {
                            name: 'children',
                            label: 'CTA',
                            type: 'rich-text',
                        },
                        {
                            name: 'placeholder',
                            label: 'Placeholder',
                            type: 'string',
                        },
                        {
                            name: 'buttonText',
                            label: 'Button Text',
                            type: 'string',
                        },
                        {
                            name: 'disclaimer',
                            label: 'Disclaimer',
                            type: 'rich-text',
                            overrides: {
                                toolbar: ['bold', 'italic', 'link'],
                            },
                        },
                    ],
                    ui: {
                        defaultItem: {
                            placeholder: 'Enter your email',
                            buttonText: 'Notify Me',
                        },
                    },
                },
                videoBlockSchema,
            ],
            isBody: true,
        },
    ],
};

export default PastEvent;