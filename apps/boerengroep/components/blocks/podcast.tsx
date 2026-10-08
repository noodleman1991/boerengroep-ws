'use client';
import type { PodcastBlock as PodcastData } from '@sites/cms/types';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { dateParts, type SiteLocale } from '@/lib/events/time';
import { excerpt } from '@/lib/page-meta';
import { pickEpisodes } from '@/lib/podcast';
import { Section } from '../layout/section';
import { useBlockData } from './block-data-context';

/** Podcast episodes on a page, each with a player. */
export const PodcastBlock = ({ data }: { data: PodcastData }) => {
    const t = useTranslations('media');
    const locale = useLocale() as SiteLocale;
    const { episodes } = useBlockData();
    const shown = pickEpisodes(
        episodes,
        data.mode === 'picked'
            ? { mode: 'picked', matches: (data.episodes ?? []).map((row) => row.match) }
            : { mode: 'latest', count: data.count ?? 3 },
    );
    if (shown.length === 0) return null;

    return (
        <Section background={data.background}>
            <div className="block-head">
                <h2>{data.title || t('podcast_title')}</h2>
                <Link href="/library/podcast" className="btn-quiet">
                    {t('podcast_all')}
                </Link>
            </div>
            <ul className="episodes">
                {shown.map((episode) => {
                    const date = dateParts(episode.pubDate, locale);
                    return (
                        <li key={episode.id} className="episode">
                            {episode.image && <Image className="episode__cover" src={episode.image} alt="" width={160} height={160} unoptimized />}
                            <div className="episode__body">
                                <p className="episode__meta">
                                    {`${date.day} ${date.month} ${date.year}`}
                                    {episode.duration && <span>{episode.duration}</span>}
                                </p>
                                <h3 className="episode__title">{episode.title}</h3>
                                {episode.description && <p className="episode__text">{excerpt(episode.description, 220)}</p>}
                                {episode.audioUrl && (
                                    <audio controls preload="none" src={episode.audioUrl} aria-label={t('podcast_listen', { title: episode.title })} />
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </Section>
    );
};
