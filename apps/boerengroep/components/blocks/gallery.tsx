'use client';
import type { GalleryBlock as GalleryData, PastEvent } from '@sites/cms/types';
import { useTranslations } from 'next-intl';
import { Gallery } from '@/components/media/gallery';
import { Link } from '@/i18n/navigation';
import { toVideoItems } from '@/lib/gallery';
import { toPhotos } from '@/lib/photos';
import { Section } from '../layout/section';

/**
 * Photos and videos on a page: ones the editor chose, or those of a past event with a link
 * to its story.
 */
export const GalleryBlock = ({ data }: { data: GalleryData }) => {
    const t = useTranslations('media');
    const story = data.source === 'pastEvent' && data.pastEvent && typeof data.pastEvent === 'object' ? (data.pastEvent as PastEvent) : null;
    const fromStory = data.source === 'pastEvent';
    const photos = toPhotos(fromStory ? story?.photos : data.images);
    const videos = toVideoItems(fromStory ? story?.videos : data.videos);
    if (photos.length + videos.length === 0) return null;
    const title = data.title || story?.title;

    return (
        <Section background={data.background}>
            {(title || story || data.intro) && (
                <div className="block-head">
                    <div>
                        {title && <h2>{title}</h2>}
                        {data.intro && <p>{data.intro}</p>}
                    </div>
                    {story && (
                        <Link href={`/activities/past-events/${story.slug}`} className="btn-quiet">
                            {t('story')}
                        </Link>
                    )}
                </div>
            )}
            <Gallery photos={photos} videos={videos} />
        </Section>
    );
};
