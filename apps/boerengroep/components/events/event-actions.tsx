'use client';
import { CalendarPlus, Check, Copy, Download, Mail, MessageCircle, Share2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { eventPath } from '@/lib/events/ics-site';
import { addToCalendarLinks, shareLinks } from '@/lib/events/share';
import { formatWhen, type SiteLocale } from '@/lib/events/time';
import type { SiteEvent } from '@/lib/events/types';
import { Menu } from './menu';

/** Copies text and shows "copied" for a moment. */
export function useCopy() {
    const [copied, setCopied] = useState(false);
    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            // No clipboard access, for example in an old browser. The address stays visible to copy by hand.
        }
    };
    return { copied, copy };
}

/** "Add to my calendar" and "Share" on an event's page. */
export function EventActions({ event, siteUrl }: { event: SiteEvent; siteUrl: string }) {
    const t = useTranslations('calendar.event');
    const locale = useLocale() as SiteLocale;
    const url = `${siteUrl}/${locale}${eventPath(event.slug)}`;
    const when = formatWhen(event.start, event.end, locale);
    const calendars = addToCalendarLinks(
        { title: event.title, start: event.start, end: event.end, description: event.description, location: event.place.address ?? event.place.callLink },
        url,
    );
    const share = shareLinks({ title: event.title, when, url });
    const { copied, copy } = useCopy();
    const [shareOpen, setShareOpen] = useState(false);

    const onShare = (next: boolean) => {
        // A phone has its own share sheet with every app on it. Use that when it exists.
        if (next && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            navigator.share({ title: event.title, text: `${event.title}\n${when}`, url }).catch(() => {});
            return;
        }
        setShareOpen(next);
    };

    return (
        <div className="event-actions">
            <Menu label={t('add')} icon={<CalendarPlus aria-hidden="true" />}>
                <a className="site-menu__item" href={`/calendar/${encodeURIComponent(event.slug)}.ics${locale === 'nl' ? '?lang=nl' : ''}`}>
                    <Download aria-hidden="true" />
                    {t('add_file')}
                </a>
                <a className="site-menu__item" href={calendars.google} target="_blank" rel="noopener noreferrer">
                    <CalendarPlus aria-hidden="true" />
                    {t('add_google')}
                </a>
                <a className="site-menu__item" href={calendars.outlook} target="_blank" rel="noopener noreferrer">
                    <CalendarPlus aria-hidden="true" />
                    {t('add_outlook')}
                </a>
            </Menu>

            <Menu label={t('share')} icon={<Share2 aria-hidden="true" />} open={shareOpen} onOpenChange={onShare}>
                <button type="button" className="site-menu__item" onClick={() => copy(url)}>
                    {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                    <span aria-live="polite">{copied ? t('copied') : t('copy')}</span>
                </button>
                <a className="site-menu__item" href={share.whatsapp} target="_blank" rel="noopener noreferrer">
                    <MessageCircle aria-hidden="true" />
                    {t('whatsapp')}
                </a>
                <a className="site-menu__item" href={share.email}>
                    <Mail aria-hidden="true" />
                    {t('email')}
                </a>
            </Menu>
        </div>
    );
}
