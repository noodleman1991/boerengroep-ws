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
                return 'lg:grid-cols-2 lg:gap-16 items-center';
            case 'image-right':
                return 'lg:grid-cols-2 lg:gap-16 items-center';
            case 'image-center':
                return 'grid-cols-1 gap-8 text-center';
            default:
                return 'lg:grid-cols-2 lg:gap-16 items-center';
        }
    };

    const getImageSizeClasses = () => {
        switch (data.imageSize) {
            case 'small':
                return 'max-w-sm mx-auto';
            case 'medium':
                return 'max-w-md mx-auto';
            case 'large':
                return 'max-w-2xl mx-auto';
            default:
                return 'max-w-md mx-auto';
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
            <div className={`grid ${getLayoutClasses()} ${!isImageCenter ? getVerticalAlignmentClasses() : ''}`}>
                {/* Image */}
                <div
                    className={`${isImageRight ? 'lg:order-2' : ''} ${getImageSizeClasses()}`}
                    data-tina-field={tinaField(data, 'image')}
                >
                    <Image
                        src={data.image.src}
                        alt={data.image?.alt || ''}
                        width={800}
                        height={600}
                        className="rounded-lg shadow-lg w-full h-auto"
                    />
                </div>

                {/* Content */}
                <div
                    className={`prose prose-lg max-w-none ${isImageCenter ? 'mt-8' : ''} ${isImageRight ? 'lg:order-1' : ''}`}
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
            </div>
        </Section>
    );
};

export const imageTextBlockSchema: TinaTemplate = {
    name: 'imageText',
    label: 'Image & Text',
    ui: {
        previewSrc: '/blocks/image-text.png',
        defaultItem: {
            layout: 'image-left',
            imageSize: 'medium',
            verticalAlignment: 'center',
            content: 'Add your content here. This rich text editor supports **bold**, *italic*, and [links](https://example.com).',
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
