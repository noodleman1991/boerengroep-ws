'use client';
import type { ItemBlock as ItemData } from '@sites/cms/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { RichText } from '@/components/rich-text';
import { SiteForm, type SiteFormData } from '@/components/site-form';
import { webAddress } from '@/lib/events/share';
import { toPhotos } from '@/lib/photos';
import { Section } from '../layout/section';

/**
 * Something people can order or sign up for, such as a T-shirt: pictures to flip through,
 * what it is, what it costs, and one button. No payment happens on the site.
 */
export const ItemBlock = ({ data }: { data: ItemData }) => {
    const t = useTranslations('media');
    const photos = toPhotos(data.images);
    const strip = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(0);
    const [ordering, setOrdering] = useState(false);

    const form = data.actionType === 'form' && data.form && typeof data.form === 'object' ? (data.form as unknown as SiteFormData) : null;
    const link = data.actionType !== 'form' ? webAddress(data.linkUrl) : undefined;
    const label = data.buttonLabel || t('order');

    const go = (index: number) => {
        const next = (index + photos.length) % photos.length;
        const slide = strip.current?.children[next] as HTMLElement | undefined;
        strip.current?.scrollTo({ left: slide?.offsetLeft ?? 0, behavior: 'smooth' });
        setShown(next);
    };

    return (
        <Section background={data.background}>
            <div className={`item${photos.length === 0 ? ' item--plain' : ''}`}>
                {photos.length > 0 && (
                    <div className="item__pictures">
                        {/* Reachable with the keyboard: arrow keys scroll through the pictures. */}
                        <div
                            className="item__strip"
                            ref={strip}
                            role="region"
                            aria-label={t('pictures')}
                            tabIndex={0}
                            onScroll={(event) => {
                                const el = event.currentTarget;
                                setShown(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
                            }}
                        >
                            {photos.map((photo, index) => (
                                <div key={photo.id} className="item__slide" role="group" aria-label={t('picture', { n: index + 1, total: photos.length })}>
                                    <Image src={photo.square} alt={photo.alt} width={800} height={800} sizes="(max-width: 900px) 100vw, 45vw" priority={index === 0} />
                                </div>
                            ))}
                        </div>
                        {photos.length > 1 && (
                            <div className="item__nav">
                                <button type="button" onClick={() => go(shown - 1)} aria-label={t('previous_picture')}>
                                    <ChevronLeft aria-hidden="true" />
                                </button>
                                <span aria-live="polite">{t('counter', { n: shown + 1, total: photos.length })}</span>
                                <button type="button" onClick={() => go(shown + 1)} aria-label={t('next_picture')}>
                                    <ChevronRight aria-hidden="true" />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="item__body">
                    <h2>{data.title}</h2>
                    {data.priceText && <p className="item__price">{data.priceText}</p>}
                    <RichText data={data.details} className="item__details" />
                    {link && (
                        <a className="btn-leaf" href={link} target="_blank" rel="noopener noreferrer">
                            {label}
                        </a>
                    )}
                    {form && !ordering && (
                        <button type="button" className="btn-leaf" onClick={() => setOrdering(true)}>
                            {label}
                        </button>
                    )}
                    {form && ordering && (
                        <div className="item__form">
                            <SiteForm form={form} />
                        </div>
                    )}
                </div>
            </div>
        </Section>
    );
};
