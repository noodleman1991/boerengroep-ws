import { Clock, MapPin, Video } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { dateParts, formatTimes, type SiteLocale } from '@/lib/events/time';
import type { EventKind, EventStatus, SiteEvent } from '@/lib/events/types';

/**
 * An event is written in one language. Shown on a page in the other language, its words are
 * marked with their own language, so a screen reader pronounces them correctly.
 */
export function useEventLang(event: Pick<SiteEvent, 'language'>): string | undefined {
    const locale = useLocale();
    return event.language && event.language !== locale ? event.language : undefined;
}

/** The large date beside an event: weekday, day number, month. */
export function DateBlock({ date, className = '' }: { date: string; className?: string }) {
    const locale = useLocale() as SiteLocale;
    const { weekday, day, month } = dateParts(date, locale);
    return (
        <time dateTime={date} className={`date-block ${className}`}>
            <span className="date-block__weekday">{weekday}</span>
            <span className="date-block__day">{day}</span>
            <span className="date-block__month">{month}</span>
        </time>
    );
}

/** The kind of event with its colour, as an editor made it in the admin panel. Nothing for an event without a kind. */
export function KindTag({ kind }: { kind?: EventKind }) {
    if (!kind) return null;
    return (
        <span className="event-kind" data-kind-colour={kind.colour}>
            {kind.name}
        </span>
    );
}

/** Full, cancelled or postponed. Nothing for an event that simply goes ahead. */
export function StatusBadge({ status }: { status: EventStatus }) {
    const t = useTranslations('calendar.status');
    if (status === 'scheduled') return null;
    return <span className={`status-badge status-badge--${status}`}>{t(status)}</span>;
}

/** Time and place in one line each, small. */
export function EventFacts({ event }: { event: SiteEvent }) {
    const locale = useLocale() as SiteLocale;
    const t = useTranslations('calendar');
    return (
        <ul className="event-facts">
            <li>
                <Clock aria-hidden="true" />
                {formatTimes(event.start, event.end, locale) ?? t('whole_day')}
            </li>
            {event.place.address && (
                <li>
                    <MapPin aria-hidden="true" />
                    {event.place.address}
                </li>
            )}
            {!event.place.address && event.place.callLink && (
                <li>
                    <Video aria-hidden="true" />
                    {t('online')}
                </li>
            )}
        </ul>
    );
}
