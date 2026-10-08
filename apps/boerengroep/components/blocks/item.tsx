'use client';
import type { ItemBlock as ItemData } from '@sites/cms/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { useLayout } from '@/components/layout/layout-context';
import { RichText } from '@/components/rich-text';
import { SiteForm, type SiteFormData } from '@/components/site-form';
import { webAddress } from '@/lib/events/share';
import { toPhotos } from '@/lib/photos';
import { Section } from '../layout/section';

/**
 * Something people get in return for a donation, such as a T-shirt: pictures to look through,
 * what it is, the suggested donation, and one button. It is a donation and not a sale, and the
 * small print under the button says so in words the editor can change.
 */
export const ItemBlock = ({ data }: { data: ItemData }) => {
    const t = useTranslations('media');
    const { globalSettings } = useLayout();
    const photos = toPhotos(data.images);
    const strip = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(0);
    const [asking, setAsking] = useState(false);

    const form = data.actionType === 'form' && data.form && typeof data.form === 'object' ? (data.form as unknown as SiteFormData) : null;
    const link = data.actionType !== 'form' ? webAddress(data.linkUrl) : undefined;
    const label = data.buttonLabel || t('order');
    const note = data.note?.trim() || t('donation_note', { name: globalSettings?.name || '' });

    const show = (index: number) => {
        const slide = strip.current?.children[index] as HTMLElement | undefined;
        strip.current?.scrollTo({ left: slide?.offsetLeft ?? 0, behavior: 'smooth' });
        setShown(index);
    };

    return (
        <Section background={data.background}>
            <div className={`item${photos.length === 0 ? ' item--plain' : ''}`}>
                {photos.length > 0 && (
                    <div className="item__pictures">
                        <div className="item__stage">
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
                        </div>
                        {photos.length > 1 && (
                            <div className="item__thumbs" role="group" aria-label={t('pictures')}>
                                {photos.map((photo, index) => (
                                    <button
                                        key={photo.id}
                                        type="button"
                                        aria-label={t('show_picture', { n: index + 1 })}
                                        aria-current={index === shown ? 'true' : undefined}
                                        onClick={() => show(index)}
                                    >
                                        <Image src={photo.square} alt="" width={120} height={120} sizes="72px" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="item__body">
                    <h2>{data.title}</h2>
                    {data.priceText && (
                        <p className="item__donation">
                            <span className="item__donation-label">{t('suggested_donation')}</span>
                            <span className="item__donation-amount">{data.priceText}</span>
                        </p>
                    )}
                    <RichText data={data.details} className="rich item__details" />
                    {link && (
                        <a className="btn-leaf" href={link} target="_blank" rel="noopener noreferrer">
                            {label}
                        </a>
                    )}
                    {form && !asking && (
                        <button type="button" className="btn-leaf" onClick={() => setAsking(true)}>
                            {label}
                        </button>
                    )}
                    <p className="item__note">{note}</p>
                    {form && asking && (
                        <div className="item__form">
                            <SiteForm form={form} />
                        </div>
                    )}
                </div>
            </div>
        </Section>
    );
};
