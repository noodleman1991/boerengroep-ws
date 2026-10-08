'use client';
import { CalendarPlus, CalendarSync, Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { subscribeLinks } from '@/lib/events/share';
import { useCopy } from './event-actions';
import { Menu } from './menu';

/** Lets visitors put all events in their own calendar, where they stay up to date. */
export function SubscribeCalendar({ feedUrl }: { feedUrl: string }) {
    const t = useTranslations('calendar.subscribe');
    const links = subscribeLinks(feedUrl);
    const { copied, copy } = useCopy();
    return (
        <Menu label={t('button')} icon={<CalendarSync aria-hidden="true" />}>
            <div className="site-menu__intro">
                <strong>{t('title')}</strong>
                <p>{t('text')}</p>
            </div>
            <a className="site-menu__item" href={links.app}>
                <CalendarPlus aria-hidden="true" />
                <span>
                    {t('app')}
                    <small>{t('app_hint')}</small>
                </span>
            </a>
            <a className="site-menu__item" href={links.google} target="_blank" rel="noopener noreferrer">
                <CalendarPlus aria-hidden="true" />
                {t('google')}
            </a>
            <a className="site-menu__item" href={links.outlook} target="_blank" rel="noopener noreferrer">
                <CalendarPlus aria-hidden="true" />
                {t('outlook')}
            </a>
            <button type="button" className="site-menu__item" onClick={() => copy(links.address)}>
                {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                <span>
                    <span aria-live="polite">{copied ? t('copied') : t('copy')}</span>
                    <small>{t('address_hint')}</small>
                </span>
            </button>
        </Menu>
    );
}
