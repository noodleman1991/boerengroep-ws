'use client';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Blocks } from '@/components/blocks';
import ErrorBoundary from '@/components/error-boundary';
import { Gallery } from '@/components/media/gallery';
import { RichText } from '@/components/rich-text';
import { Link } from '@/i18n/navigation';
import type { BlockData } from '@/lib/block-data';
import type { toPastEventNode } from '@/lib/cms-adapters';
import { eventPath } from '@/lib/events/ics-site';
import { toVideoItems } from '@/lib/gallery';
import { formatDay, dayKey, type SiteLocale } from '@/lib/events/time';

interface ClientPastEventProps {
  pastEvent: ReturnType<typeof toPastEventNode>;
  data?: BlockData;
}

/** The story of an event that has been: text, blocks, and the photos of the day as a mosaic. */
export default function PastEventClientPage({ pastEvent, data }: ClientPastEventProps) {
  const t = useTranslations('pastEvents');
  const locale = useLocale() as SiteLocale;
  const videos = toVideoItems(pastEvent.videos);
  const date = new Date(pastEvent.date);
  const when = Number.isNaN(date.getTime()) ? null : `${formatDay(dayKey(date), locale)} ${date.getFullYear()}`;

  return (
    <ErrorBoundary>
      <article className="story">
        <div className="page-width">
          <Link href="/activities/past-events" className="event-page__back">
            <ArrowLeft aria-hidden="true" />
            {t('back')}
          </Link>
          <header className="story__head">
            <p className="story__meta">
              {when && <time dateTime={pastEvent.date}>{when}</time>}
              {pastEvent.author && <span>{t('by', { name: pastEvent.author.name })}</span>}
            </p>
            <h1>{pastEvent.title}</h1>
            <RichText data={pastEvent.excerpt} className="story__lead" />
          </header>
          {(pastEvent.heroWide ?? pastEvent.heroImg) && (
            <figure className="story__hero">
              <Image src={(pastEvent.heroWide ?? pastEvent.heroImg)!} alt="" width={1600} height={900} sizes="(max-width: 1300px) 100vw, 1250px" priority />
            </figure>
          )}
          <RichText data={pastEvent.body} className="story__text" />
        </div>

        {pastEvent.blocks.length > 0 && <Blocks blocks={pastEvent.blocks} data={data} />}

        {(pastEvent.photos.length > 0 || videos.length > 0 || pastEvent.relatedEvent) && (
          <div className="page-width story__after">
            {(pastEvent.photos.length > 0 || videos.length > 0) && (
              <section>
                <h2>{t('photos')}</h2>
                <Gallery photos={pastEvent.photos} videos={videos} />
              </section>
            )}
            {pastEvent.relatedEvent && (
              <p>
                <Link href={eventPath(pastEvent.relatedEvent.slug)} className="btn-quiet">
                  {t('event')}
                </Link>
              </p>
            )}
          </div>
        )}
      </article>
    </ErrorBoundary>
  );
}
