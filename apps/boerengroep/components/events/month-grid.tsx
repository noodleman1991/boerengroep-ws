'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { eventPath } from '@/lib/events/ics-site';
import { eventsByDay } from '@/lib/events/select';
import { dayKey, formatDay, formatTime, isAllDay, monthGrid, monthKey, monthLabel, shiftMonth, type SiteLocale } from '@/lib/events/time';
import type { SiteEvent } from '@/lib/events/types';
import { EventRow } from './event-row';

const CHIPS_PER_DAY = 3;

/** Monday to Sunday, short, in the reader's language. 5 January 2026 is a Monday. */
function weekdayNames(locale: SiteLocale): { short: string; long: string }[] {
    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(Date.UTC(2026, 0, 5 + i, 12));
        const name = (weekday: 'short' | 'long') =>
            new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-GB', { weekday, timeZone: 'UTC' }).format(day);
        return { short: name('short').replace(/\.$/, ''), long: name('long') };
    });
}

/**
 * A month as a grid. On a wide screen each day lists its events. On a phone a day shows
 * dots, and choosing the day lists its events underneath.
 */
export function MonthGrid({ events, now }: { events: SiteEvent[]; now: Date }) {
    const t = useTranslations('calendar');
    const locale = useLocale() as SiteLocale;
    const today = dayKey(now);
    const byDay = useMemo(() => eventsByDay(events), [events]);
    const [month, setMonth] = useState(() => monthKey(now));
    const [chosen, setChosen] = useState<string | null>(() => (byDay.has(today) ? today : null));

    const weeks = monthGrid(month);
    const names = weekdayNames(locale);
    const chosenEvents = chosen ? (byDay.get(chosen) ?? []) : [];

    const go = (to: string) => {
        setMonth(to);
        setChosen(to === monthKey(now) && byDay.has(today) ? today : null);
    };

    return (
        <div className="month">
            <div className="month__bar">
                <h2 className="month__title" aria-live="polite">
                    {monthLabel(month, locale)}
                </h2>
                <div className="month__nav">
                    {month !== monthKey(now) && (
                        <button type="button" className="btn-quiet month__today" onClick={() => go(monthKey(now))}>
                            {t('month.today')}
                        </button>
                    )}
                    <button type="button" className="month__step" aria-label={t('month.previous')} onClick={() => go(shiftMonth(month, -1))}>
                        <ChevronLeft aria-hidden="true" />
                    </button>
                    <button type="button" className="month__step" aria-label={t('month.next')} onClick={() => go(shiftMonth(month, 1))}>
                        <ChevronRight aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="month__grid" role="grid" aria-label={monthLabel(month, locale)}>
                <div className="month__week month__week--names" role="row">
                    {names.map((name) => (
                        <div key={name.long} className="month__name" role="columnheader" aria-label={name.long}>
                            {name.short}
                        </div>
                    ))}
                </div>
                {weeks.map((week) => (
                    <div key={week[0]} className="month__week" role="row">
                        {week.map((day) => {
                            const list = byDay.get(day) ?? [];
                            const outside = !day.startsWith(month);
                            const number = Number(day.slice(8));
                            const classes = ['month__day'];
                            if (outside) classes.push('month__day--outside');
                            if (day === today) classes.push('month__day--today');
                            if (day === chosen) classes.push('month__day--chosen');
                            return (
                                <div key={day} className={classes.join(' ')} role="gridcell">
                                    {list.length > 0 ? (
                                        <button
                                            type="button"
                                            className="month__number"
                                            aria-pressed={day === chosen}
                                            aria-label={`${formatDay(day, locale)}, ${t('month.count', { count: list.length })}`}
                                            onClick={() => setChosen(day === chosen ? null : day)}
                                        >
                                            <span>{number}</span>
                                            <span className="month__dots" aria-hidden="true">
                                                {list.slice(0, 3).map((event) => (
                                                    <i key={event.id} data-event-type={event.type} />
                                                ))}
                                            </span>
                                        </button>
                                    ) : (
                                        <span className="month__number">
                                            <span aria-hidden="true">{number}</span>
                                            <span className="sr-only">{formatDay(day, locale)}</span>
                                        </span>
                                    )}
                                    {list.length > 0 && (
                                        <ul className="month__chips">
                                            {list.slice(0, CHIPS_PER_DAY).map((event) => (
                                                <li key={event.id}>
                                                    <Link
                                                        href={eventPath(event.slug)}
                                                        className={`month__chip${event.status === 'cancelled' || event.status === 'postponed' ? ' month__chip--off' : ''}`}
                                                        data-event-type={event.type}
                                                    >
                                                        {!isAllDay(event.start, event.end) && dayKey(event.start) === day && (
                                                            <span className="month__chip-time">{formatTime(event.start, locale)}</span>
                                                        )}
                                                        <span className="month__chip-title">{event.title}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                            {list.length > CHIPS_PER_DAY && (
                                                <li>
                                                    <button type="button" className="month__more" onClick={() => setChosen(day)}>
                                                        {t('month.more', { count: list.length - CHIPS_PER_DAY })}
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="month__chosen" aria-live="polite">
                {chosen ? (
                    <>
                        <h3 className="month__chosen-title">{t('month.on_day', { date: formatDay(chosen, locale) })}</h3>
                        {chosenEvents.length > 0 ? (
                            <div className="event-list">
                                {chosenEvents.map((event) => (
                                    <EventRow key={event.id} event={event} headingLevel="h4" />
                                ))}
                            </div>
                        ) : (
                            <p>{t('empty.day')}</p>
                        )}
                    </>
                ) : (
                    <p className="month__hint">{t('month.pick_day')}</p>
                )}
            </div>
        </div>
    );
}
