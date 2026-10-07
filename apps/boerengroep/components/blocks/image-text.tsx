'use client';

import React from 'react';
import Image from 'next/image';
import { Section } from '../layout/section';
import type { ImageTextBlock } from '@sites/cms/types';
import { RichText } from '@/components/rich-text';
import { mediaUrl } from '@/lib/cms-adapters';

export const ImageText = ({ data }: { data: ImageTextBlock }) => {
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
    const imageSrc = mediaUrl(data.image?.src);
    if (!imageSrc) {
        return (
            <Section background={data.background!}>
                <div className="prose prose-lg max-w-none">
                    <RichText data={data.content} />
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
                    >
                        <RichText data={data.content} />
                    </div>
                )}

                {/* Image */}
                <div
                    className={`${isImageRight ? 'md:order-2' : ''} ${isCenterLayout ? 'mx-auto' : ''} ${getImageSizeClasses()}`}
                >
                    <Image
                        src={imageSrc}
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
                    >
                        <RichText data={data.content} />
                    </div>
                )}
            </div>
        </Section>
    );
};
