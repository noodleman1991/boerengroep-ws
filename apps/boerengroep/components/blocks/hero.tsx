'use client';
import type { HeroBlock } from '@sites/cms/types';
import Image from 'next/image';
import { VideoEmbed } from '@/components/media/video-embed';
import { mediaUrl } from '@/lib/cms-adapters';
import { Section } from '../layout/section';
import { Actions } from './actions';

/**
 * The opening of a page. "Split" puts the words left and the picture right, with the logo's
 * circles behind the picture. "Centred" puts the picture under the words. An opening without
 * a picture keeps its words on the left and lets the circles be the picture.
 */
export const Hero = ({ data }: { data: HeroBlock }) => {
    const picture = mediaUrl(data.image?.src, 'wide') ?? mediaUrl(data.image?.src);
    const video = data.image?.videoUrl?.trim();
    const hasVisual = Boolean(picture || video);
    const layout = !hasVisual ? 'plain' : data.layout === 'centered' ? 'centered' : 'split';

    return (
        <Section background={data.background} className={`hero hero--${layout}`}>
            <div className="hero__words">
                {data.headline && <h1>{data.headline}</h1>}
                {data.tagline && <p className="hero__tagline">{data.tagline}</p>}
                <Actions actions={data.actions} />
            </div>
            <div className="hero__visual">
                <span className="overprint" aria-hidden="true" />
                {video ? (
                    <VideoEmbed url={video} poster={picture} title={data.headline} />
                ) : (
                    picture && (
                        <Image
                            src={picture}
                            alt={data.image?.alt ?? ''}
                            width={1600}
                            height={900}
                            sizes={layout === 'split' ? '(max-width: 900px) 100vw, 50vw' : '(max-width: 1300px) 100vw, 1250px'}
                            priority
                        />
                    )
                )}
            </div>
        </Section>
    );
};
