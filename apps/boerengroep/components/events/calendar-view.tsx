'use client';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { groupByMonth, kindsIn, splitEvents } from '@/lib/events/select';
import { monthLabel, type SiteLocale } from '@/lib/events/time';
import type { SiteEvent } from '@/lib/events/types';
import { EventRow } from './event-row';
import { MonthGrid } from './month-grid';

type View = 'upcoming' | 'month' | 'past';
const VIEWS: View[] = ['upcoming', 'month', 'past'];

/**
 * The calendar: what is coming as a list, a month grid, and what has been.
 * Visitors can narrow it down to one kind of event. The kinds are the ones editors made in
 * the admin panel, and only those that have events in the view at hand are offered.
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
    const [kind, setKind] = useState<string | null>(null);
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

    const all = useMemo(() => splitEvents(events, now), [events, now]);
    // What this view holds before any filter: the filter offers the kinds found in here.
    const inView = view === 'past' ? all.past : view === 'upcoming' ? all.upcoming : events;
    const kinds = useMemo(() => kindsIn(inView, locale), [inView, locale]);
    // A kind chosen in one view may not exist in the next. Then everything is shown again.
    const active = kind && kinds.some((option) => option.id === kind) ? kind : null;
    const shown = useMemo(() => (active ? inView.filter((event) => event.kind?.id === active) : inView), [inView, active]);

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
                {kinds.length > 1 && (
                    <div className="chips" role="group" aria-label={t('filter.label')}>
                        <button type="button" className="chip" aria-pressed={active === null} onClick={() => setKind(null)}>
                            {t('filter.all')}
                            <span className="chip__count" aria-hidden="true">
                                {inView.length}
                            </span>
                        </button>
                        {kinds.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                className="chip"
                                data-kind-colour={option.colour}
                                aria-pressed={active === option.id}
                                aria-label={t('filter.kind', { name: option.name, count: option.count })}
                                onClick={() => setKind(active === option.id ? null : option.id)}
                            >
                                {option.name}
                                <span className="chip__count" aria-hidden="true">
                                    {option.count}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {view === 'month' ? (
                <MonthGrid events={shown} now={now} />
            ) : shown.length === 0 ? (
                <div className="calendar__empty">
                    {view === 'past' ? (
                        <p>{t('empty.past')}</p>
                    ) : (
                        <>
                            <h2>{t('empty.upcoming_title')}</h2>
                            <p>{t('empty.upcoming_text')}</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="calendar__list">
                    {groupByMonth(shown).map((group) => (
                        <section key={group.month} className="calendar__month" aria-labelledby={`month-${group.month}`}>
                            <h2 className="calendar__month-title" id={`month-${group.month}`}>
                                {monthLabel(group.month, locale)}
                                <span className="calendar__month-count">{t('month.count', { count: group.events.length })}</span>
                            </h2>
                            <div className="event-list">
                                {group.events.map((event) => (
                                    <EventRow key={event.id} event={event} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
