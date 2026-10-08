'use client';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { groupByMonth, splitEvents, typesIn } from '@/lib/events/select';
import { monthLabel, type SiteLocale } from '@/lib/events/time';
import type { SiteEvent } from '@/lib/events/types';
import { EventRow } from './event-row';
import { MonthGrid } from './month-grid';

type View = 'upcoming' | 'month' | 'past';
const VIEWS: View[] = ['upcoming', 'month', 'past'];

/**
 * The calendar: what is coming as a list, a month grid, and what has been.
 * Visitors can narrow it down to one kind of event.
 */
export function CalendarView({ events, renderedAt, defaultView }: {
    events: SiteEvent[];
    /** When the page was built. Used until the browser's own clock takes over. */
    renderedAt: string;
    defaultView: 'list' | 'month';
}) {
    const t = useTranslations('calendar');
    const locale = useLocale() as SiteLocale;
    const [view, setView] = useState<View>(defaultView === 'month' ? 'month' : 'upcoming');
    const [type, setType] = useState<string | null>(null);
    const [now, setNow] = useState(() => new Date(renderedAt));

    useEffect(() => {
        // The page may have been built an hour ago. Move finished events to "past" on arrival.
        setNow(new Date());
        const asked = new URLSearchParams(window.location.search).get('view');
        if (asked && (VIEWS as string[]).includes(asked)) setView(asked as View);
    }, []);

    const choose = (next: View) => {
        setView(next);
        const url = new URL(window.location.href);
        if (next === 'upcoming') url.searchParams.delete('view');
        else url.searchParams.set('view', next);
        window.history.replaceState(null, '', url);
    };

    const types = useMemo(() => typesIn(events), [events]);
    const shown = useMemo(() => (type ? events.filter((event) => event.type === type) : events), [events, type]);
    const { upcoming, past } = useMemo(() => splitEvents(shown, now), [shown, now]);
    const tType = (key: string) => (t.has(`eventTypes.${key}`) ? t(`eventTypes.${key}`) : key);

    const list = view === 'past' ? past : upcoming;

    return (
        <div className="calendar">
            <div className="calendar__controls">
                <div className="segmented" role="group" aria-label={t('views.label')}>
                    {VIEWS.map((option) => (
                        <button key={option} type="button" aria-pressed={view === option} onClick={() => choose(option)}>
                            {t(`views.${option}`)}
                        </button>
                    ))}
                </div>
                {types.length > 1 && (
                    <div className="chips" role="group" aria-label={t('filter.label')}>
                        <button type="button" className="chip" aria-pressed={type === null} onClick={() => setType(null)}>
                            {t('filter.all')}
                        </button>
                        {types.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className="chip"
                                data-event-type={option}
                                aria-pressed={type === option}
                                onClick={() => setType(type === option ? null : option)}
                            >
                                {tType(option)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {view === 'month' ? (
                <MonthGrid events={shown} now={now} />
            ) : list.length === 0 ? (
                <div className="calendar__empty">
                    {type ? (
                        <p>{t('empty.filtered')}</p>
                    ) : view === 'past' ? (
                        <p>{t('empty.past')}</p>
                    ) : (
                        <>
                            <h2>{t('empty.upcoming_title')}</h2>
                            <p>{t('empty.upcoming_text')}</p>
                        </>
                    )}
                </div>
            ) : (
                groupByMonth(list).map((group) => (
                    <section key={group.month} className="calendar__month">
                        <h2 className="calendar__month-title">{monthLabel(group.month, locale)}</h2>
                        <div className="event-list">
                            {group.events.map((event) => (
                                <EventRow key={event.id} event={event} />
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}
