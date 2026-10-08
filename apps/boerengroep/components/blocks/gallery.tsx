'use client';
import type { GalleryBlock as GalleryData, PastEvent } from '@sites/cms/types';
import { useTranslations } from 'next-intl';
import { Gallery } from '@/components/media/gallery';
import { Link } from '@/i18n/navigation';
import { toPhotos } from '@/lib/photos';
import { Section } from '../layout/section';

/** Photos on a page: ones the editor chose, or the photos of a past event with a link to its story. */
export const GalleryBlock = ({ data }: { data: GalleryData }) => {
    const t = useTranslations('media');
    const story = data.source === 'pastEvent' && data.pastEvent && typeof data.pastEvent === 'object' ? (data.pastEvent as PastEvent) : null;
    const photos = toPhotos(data.source === 'pastEvent' ? story?.photos : data.images);
    if (photos.length === 0) return null;
    const title = data.title || story?.title;

    return (
        <Section background={data.background}>
            {(title || story) && (
                <div className="block-head">
                    {title && <h2>{title}</h2>}
                    {story && (
                        <Link href={`/activities/past-events/${story.slug}`} className="btn-quiet">
                            {t('story')}
                        </Link>
                    )}
                </div>
            )}
            <Gallery photos={photos} />
        </Section>
    );
};
