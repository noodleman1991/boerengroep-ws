'use client';
import type { VideoBlock } from '@sites/cms/types';
import { VideoEmbed } from '@/components/media/video-embed';
import { mediaUrl } from '@/lib/cms-adapters';
import { Section } from '../layout/section';

export const Video = ({ data }: { data: VideoBlock }) => {
    if (!data.url) return null;
    return (
        <Section background={data.background}>
            <div className="block-narrow">
                <VideoEmbed url={data.url} poster={mediaUrl(data.poster, 'wide')} caption={data.caption} />
            </div>
        </Section>
    );
};
