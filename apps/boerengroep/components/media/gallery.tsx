'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { arrangeGallery, type GalleryItem, type VideoItem } from '@/lib/gallery';
import type { Photo } from '@/lib/photos';
import type { GallerySize } from '@/lib/picture-look';
import { VideoEmbed } from './video-embed';

/** What is shown small for an item: its photo, a video's cover, or nothing. */
const smallPicture = (item: GalleryItem) => (item.kind === 'photo' ? item.tile : item.cover);

/**
 * Photos and videos as a mosaic. A click opens one large, with arrows, swipe, keyboard and a
 * strip of small pictures to move through the rest. Videos take the large tiles and only
 * load from the video site after a visitor presses play.
 */
export function Gallery({ photos, videos = [], size = 'mosaic' }: {
    photos: Photo[];
    videos?: VideoItem[];
    /** `mosaic` mixes large and small tiles. The other sizes are even rows of equal tiles. */
    size?: GallerySize;
}) {
    const t = useTranslations('media');
    const items = arrangeGallery(photos, videos);
    const total = items.length;
    const [open, setOpen] = useState<number | null>(null);
    // The video the visitor asked for by pressing its play button in the mosaic.
    const [asked, setAsked] = useState<string | null>(null);
    const touchStart = useRef<number | null>(null);
    const strip = useRef<HTMLDivElement>(null);
    // The tile the large view was opened from. It gets the focus back when the view closes.
    const opener = useRef<HTMLElement | null>(null);

    const step = useCallback(
        (by: number) => {
            setAsked(null);
            setOpen((current) => (current === null ? current : (current + by + total) % total));
        },
        [total],
    );

    useEffect(() => {
        // Keep the current small picture in view.
        if (open !== null) strip.current?.children[open]?.scrollIntoView({ block: 'nearest', inline: 'center' });
    }, [open]);

    if (total === 0) return null;
    const current = open === null ? null : items[open];
    const label = (item: GalleryItem, index: number) =>
        `${item.kind === 'video' ? t('open_video', { n: index + 1, total }) : t('open_photo', { n: index + 1, total })}${item.caption ? `: ${item.caption}` : ''}`;

    return (
        <>
            <div className="mosaic-wrap">
                <ul className={size === 'mosaic' ? `mosaic mosaic--${Math.min(total, 5)}` : `mosaic mosaic--even mosaic--${size}`}>
                    {items.map((item, index) => (
                        <li key={item.id} className={`mosaic__tile mosaic__tile--${item.kind}`}>
                            <button
                                type="button"
                                aria-label={label(item, index)}
                                onClick={(event) => {
                                    opener.current = event.currentTarget;
                                    setAsked(item.kind === 'video' ? item.id : null);
                                    setOpen(index);
                                }}
                            >
                                {smallPicture(item) ? (
                                    <Image
                                        src={smallPicture(item)!}
                                        // The button already says what this is. The picture's own description is on the large view.
                                        alt=""
                                        width={800}
                                        height={600}
                                        sizes="(max-width: 700px) 50vw, (max-width: 1200px) 33vw, 400px"
                                    />
                                ) : null}
                                {item.kind === 'video' && (
                                    <span className="mosaic__play" aria-hidden="true">
                                        <Play />
                                    </span>
                                )}
                                {item.caption && <span className="mosaic__caption">{item.caption}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <Dialog.Root open={open !== null} onOpenChange={(next) => !next && setOpen(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="lightbox__veil" />
                    <Dialog.Content
                        className="lightbox"
                        aria-describedby={undefined}
                        onCloseAutoFocus={(event) => {
                            event.preventDefault();
                            opener.current?.focus();
                        }}
                        onKeyDown={(event) => {
                            // Arrow keys belong to a video's own controls while one is in use.
                            if ((event.target as HTMLElement).closest('.video')) return;
                            if (event.key === 'ArrowRight') step(1);
                            if (event.key === 'ArrowLeft') step(-1);
                        }}
                        onTouchStart={(event) => {
                            touchStart.current = event.touches[0]?.clientX ?? null;
                        }}
                        onTouchEnd={(event) => {
                            const from = touchStart.current;
                            const to = event.changedTouches[0]?.clientX;
                            touchStart.current = null;
                            if (from === null || to === undefined || Math.abs(to - from) < 48) return;
                            step(to < from ? 1 : -1);
                        }}
                    >
                        <Dialog.Title className="sr-only">{t('photos')}</Dialog.Title>
                        {current && open !== null && (
                            <figure className="lightbox__figure">
                                <div className="lightbox__frame">
                                    {current.kind === 'photo' ? (
                                        <Image key={current.id} src={current.full} alt={current.alt} fill sizes="100vw" className="lightbox__image" priority />
                                    ) : (
                                        <div className="lightbox__video" key={current.id}>
                                            <VideoEmbed url={current.url} title={current.caption} autoStart={asked === current.id} />
                                        </div>
                                    )}
                                </div>
                                <figcaption className="lightbox__caption" aria-live="polite">
                                    <span>{current.caption}</span>
                                    <span className="lightbox__count">{t('counter', { n: open + 1, total })}</span>
                                </figcaption>
                            </figure>
                        )}
                        {total > 1 && (
                            <>
                                <div className="lightbox__strip" ref={strip} role="group" aria-label={t('all_items')}>
                                    {items.map((item, index) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className="lightbox__thumb"
                                            data-kind={item.kind}
                                            aria-label={label(item, index)}
                                            aria-current={index === open ? 'true' : undefined}
                                            onClick={() => {
                                                setAsked(null);
                                                setOpen(index);
                                            }}
                                        >
                                            {smallPicture(item) && <Image src={smallPicture(item)!} alt="" width={120} height={90} sizes="80px" />}
                                            {item.kind === 'video' && <Play aria-hidden="true" />}
                                        </button>
                                    ))}
                                </div>
                                <button type="button" className="lightbox__step lightbox__step--back" onClick={() => step(-1)} aria-label={t('previous')}>
                                    <ChevronLeft aria-hidden="true" />
                                </button>
                                <button type="button" className="lightbox__step lightbox__step--on" onClick={() => step(1)} aria-label={t('next')}>
                                    <ChevronRight aria-hidden="true" />
                                </button>
                            </>
                        )}
                        <Dialog.Close className="lightbox__close" aria-label={t('close')}>
                            <X aria-hidden="true" />
                        </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}
