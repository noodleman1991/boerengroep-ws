'use client';

import React from 'react';
import Image from 'next/image';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import type { TinaTemplate } from '@tinacms/cli';
import { tinaField } from 'tinacms/dist/react';
import { PageBlocksImageText } from '../../tina/__generated__/types';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';
import { scriptCopyBlockSchema, ScriptCopyBtn } from '../magicui/script-copy-btn';
import { Mermaid } from './mermaid';

export const ImageText = ({ data }: { data: PageBlocksImageText }) => {
    const getLayoutClasses = () => {
        switch (data.layout) {
            case 'image-left':
                return 'md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center';
            case 'image-right':
                return 'md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center';
            case 'image-center':
                return 'grid-cols-1 gap-6 md:gap-8 text-center';
            case 'text-above-center':
                return 'grid-cols-1 gap-6 md:gap-8';
            case 'text-below-center':
                return 'grid-cols-1 gap-6 md:gap-8';
            default:
                return 'md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center';
        }
    };

    const getImageSizeClasses = () => {
        // For side-by-side layouts (image-left, image-right), don't constrain width
        // as the grid handles the sizing. Only constrain for centered layouts.
        const isSideBySide = data.layout === 'image-left' || data.layout === 'image-right';

        if (isSideBySide) {
            // Let the grid column determine width, just ensure proper sizing
            return 'w-full';
        }

        // For centered layouts, use size constraints
        switch (data.imageSize) {
            case 'small':
                return 'max-w-md mx-auto';
            case 'medium':
                return 'max-w-lg mx-auto';
            case 'large':
                return 'max-w-3xl mx-auto';
            default:
                return 'max-w-lg mx-auto';
        }
    };

    const getVerticalAlignmentClasses = () => {
        switch (data.verticalAlignment) {
            case 'top':
                return 'items-start';
            case 'center':
                return 'items-center';
            case 'bottom':
                return 'items-end';
            default:
                return 'items-center';
        }
    };

    const isImageRight = data.layout === 'image-right';
    const isImageCenter = data.layout === 'image-center';
    const isTextAboveCenter = data.layout === 'text-above-center';
    const isTextBelowCenter = data.layout === 'text-below-center';
    const isCenterLayout = isImageCenter || isTextAboveCenter || isTextBelowCenter;

    // Early return if no image is provided
    if (!data.image?.src) {
        return (
            <Section background={data.background!}>
                <div className="prose prose-lg max-w-none" data-tina-field={tinaField(data, 'content')}>
                    <TinaMarkdown
                        content={data.content}
                        components={{
                            mermaid: (props: any) => <Mermaid {...props} />,
                            scriptCopyBlock: (props: any) => <ScriptCopyBtn {...props} />,
                        }}
                    />
                </div>
            </Section>
        );
    }

    return (
        <Section background={data.background!}>
            <div className={`grid ${getLayoutClasses()} ${!isCenterLayout ? getVerticalAlignmentClasses() : ''}`}>
                {/* Content - Above for text-above-center layout */}
                {isTextAboveCenter && (
                    <div
                        className="prose prose-lg max-w-none mb-4 text-center"
                        data-tina-field={tinaField(data, 'content')}
                    >
                        <TinaMarkdown
                            content={data.content}
                            components={{
                                mermaid: (props: any) => <Mermaid {...props} />,
                                scriptCopyBlock: (props: any) => <ScriptCopyBtn {...props} />,
                            }}
                        />
                    </div>
                )}

                {/* Image */}
                <div
                    className={`${isImageRight ? 'md:order-2' : ''} ${isCenterLayout ? 'mx-auto' : ''} ${getImageSizeClasses()}`}
                    data-tina-field={tinaField(data, 'image')}
                >
                    <Image
                        src={data.image.src}
                        alt={data.image?.alt || ''}
                        width={800}
                        height={600}
                        sizes={isCenterLayout ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 50vw'}
                        className="rounded-lg shadow-lg w-full h-auto object-contain"
                    />
                </div>

                {/* Content - For standard layouts and text-below-center */}
                {(!isTextAboveCenter) && (
                    <div
                        className={`prose prose-lg max-w-none ${
                            isImageCenter ? 'mt-6 md:mt-8 text-center' :
                            isTextBelowCenter ? 'mt-4 text-center' :
                            isImageRight ? 'md:order-1' : ''
                        }`}
                        data-tina-field={tinaField(data, 'content')}
                    >
                        <TinaMarkdown
                            content={data.content}
                            components={{
                                mermaid: (props: any) => <Mermaid {...props} />,
                                scriptCopyBlock: (props: any) => <ScriptCopyBtn {...props} />,
                            }}
                        />
                    </div>
                )}
            </div>
        </Section>
    );
};

export const imageTextBlockSchema: TinaTemplate = {
    name: 'imageText',
    label: 'Image & Text',
    ui: {
        previewSrc: '/blocks/image-text.png',
        // defaultItem: {
        //     layout: 'image-left',
        //     imageSize: 'medium',
        //     verticalAlignment: 'center',
        //     content: 'Add your content here. This rich text editor supports **bold**, *italic*, and [links](https://example.com).',
        //     image: {
        //         src: '',
        //         alt: 'Descriptive alt text',
        //     },
        // },
        defaultItem: {
            layout: 'image-left',
            imageSize: 'medium',
            verticalAlignment: 'center',
            content: {
                type: 'root',
                children: [
                    {
                        type: 'p',
                        children: [
                            { type: 'text', text: 'Add your content here. This rich text editor supports ' },
                            { type: 'text', text: 'bold', bold: true },
                            { type: 'text', text: ', ' },
                            { type: 'text', text: 'italic', italic: true },
                            { type: 'text', text: ', and ' },
                            {
                                type: 'a',
                                url: 'https://example.com',
                                children: [{ type: 'text', text: 'links' }],
                            },
                            { type: 'text', text: '.' },
                        ],
                    },
                ],
            },
            image: {
                src: '',
                alt: 'Descriptive alt text',
            },
        },
    },
    fields: [
        sectionBlockSchemaField as any,
        {
            type: 'object',
            label: 'Image',
            name: 'image',
            fields: [
                {
                    type: 'image',
                    label: 'Image Source',
                    name: 'src',
                    description: 'Recommended: at least 800x600px for best quality',
                },
                {
                    type: 'string',
                    label: 'Alt Text',
                    name: 'alt',
                    description: 'Describe the image for accessibility',
                },
            ],
        },
        {
            type: 'rich-text',
            label: 'Content',
            name: 'content',
            templates: [scriptCopyBlockSchema],
        },
        {
            type: 'string',
            label: 'Layout',
            name: 'layout',
            options: [
                { label: 'Image Left', value: 'image-left' },
                { label: 'Image Right', value: 'image-right' },
                { label: 'Image Center', value: 'image-center' },
                { label: 'Text Above Image (Center)', value: 'text-above-center' },
                { label: 'Text Below Image (Center)', value: 'text-below-center' },
            ],
        },
        {
            type: 'string',
            label: 'Image Size',
            name: 'imageSize',
            options: [
                { label: 'Small', value: 'small' },
                { label: 'Medium', value: 'medium' },
                { label: 'Large', value: 'large' },
            ],
        },
        {
            type: 'string',
            label: 'Vertical Alignment',
            name: 'verticalAlignment',
            description: 'How content aligns vertically with the image (not applicable for center layout)',
            options: [
                { label: 'Top', value: 'top' },
                { label: 'Center', value: 'center' },
                { label: 'Bottom', value: 'bottom' },
            ],
        },
    ],
};
