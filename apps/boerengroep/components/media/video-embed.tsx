'use client';
import { Play } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { parseVideo } from '@/lib/video';
import { BrandSymbol } from '@/components/brand-symbol';

const PROVIDER = { youtube: 'YouTube', vimeo: 'Vimeo' } as const;

/**
 * A video that only contacts YouTube or Vimeo after the visitor presses play.
 * Until then the page shows a cover picture and says where the video comes from.
 */
export function VideoEmbed({ url, poster, caption, title, autoStart = false }: {
    url: string | null | undefined;
    /** The editor's own cover picture. */
    poster?: string;
    caption?: string | null;
    title?: string | null;
    /** Start at once. Only for a place the visitor reached by pressing a play button. */
    autoStart?: boolean;
}) {
    const t = useTranslations('media');
    const [playing, setPlaying] = useState(autoStart);
    const video = parseVideo(url);

    if (!video) {
        const address = url?.trim();
        if (!address || !/^https?:\/\//i.test(address)) return null;
        return (
            <p className="video video--plain">
                {t('video_unavailable')}{' '}
                <a href={address} target="_blank" rel="noopener noreferrer">
                    {t('video_open')}
                </a>
            </p>
        );
    }

    if (video.provider === 'file') {
        return (
            <figure className="video">
                <video className="video__frame" src={video.src} poster={poster} controls preload="metadata" autoPlay={autoStart} />
                {caption && <figcaption className="video__caption">{caption}</figcaption>}
            </figure>
        );
    }

    const provider = PROVIDER[video.provider];
    // YouTube's cover is fetched by this site's own server, so the visitor's browser does not contact YouTube for it.
    const cover = poster ?? video.cover;

    return (
        <figure className="video">
            <div className="video__frame">
                {playing ? (
                    <iframe
                        src={video.embedUrl}
                        title={title || caption || `${provider} video`}
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                ) : (
                    <button type="button" className="video__start" onClick={() => setPlaying(true)}>
                        {cover ? (
                            <Image src={cover} alt="" fill sizes="(max-width: 900px) 100vw, 900px" />
                        ) : (
                            <BrandSymbol className="video__symbol" />
                        )}
                        <span className="video__play">
                            <Play aria-hidden="true" />
                        </span>
                        <span className="sr-only">{title ? `${t('play')}: ${title}` : t('play')}</span>
                    </button>
                )}
            </div>
            <figcaption className="video__caption">
                {caption && <span>{caption}</span>}
                {!playing && <small>{t('video_from', { provider })}</small>}
            </figcaption>
        </figure>
    );
}
