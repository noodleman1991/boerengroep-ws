'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { eventsByDay } from '@/lib/events/select';
import { dayKey, formatDay, monthGrid, monthKey, monthLabel, shiftMonth, type SiteLocale } from '@/lib/events/time';
import type { SiteEvent } from '@/lib/events/types';
import { EventRow } from './event-row';

const TITLES_PER_DAY = 2;

/** Monday to Sunday, short, in the reader's language. 5 January 2026 is a Monday. */
function weekdayNames(locale: SiteLocale): { short: string; long: string }[] {
    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(Date.UTC(2026, 0, 5 + i, 12));
        const name = (weekday: 'short' | 'long') =>
            new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-GB', { weekday, timeZone: 'UTC' }).format(day);
        return { short: name('short').replace(/\.$/, ''), long: name('long') };
    });
}

/** The day to open a month on: today when something is on, else the next day with something, else the first. */
function dayToOpen(month: string, days: string[], today: string): string | null {
    const inMonth = days.filter((day) => day.startsWith(month));
    if (inMonth.length === 0) return null;
    return inMonth.find((day) => day >= today) ?? inMonth[0]!;
}

/**
 * A month as a field of days. A day with events is a tile in the colour of what is on, and
 * choosing it shows that day's events beside the month (under it on a small screen). The month
 * opens on the next day that has something, so the panel is never empty without reason.
 */
export function MonthGrid({ events, now }: { events: SiteEvent[]; now: Date }) {
    const t = useTranslations('calendar');
    const locale = useLocale() as SiteLocale;
    const today = dayKey(now);
    const byDay = useMemo(() => eventsByDay(events), [events]);
    const days = useMemo(() => [...byDay.keys()].sort(), [byDay]);
    const [month, setMonth] = useState(() => monthKey(now));
    // What the visitor chose. Until then, and after a change of month or filter, the month opens itself.
    const [picked, setPicked] = useState<string | null>(null);
    const chosen = picked && byDay.has(picked) && monthGrid(month).flat().includes(picked) ? picked : dayToOpen(month, days, today);

    const weeks = monthGrid(month);
    const names = weekdayNames(locale);
    const chosenEvents = chosen ? (byDay.get(chosen) ?? []) : [];
    const inMonth = days.filter((day) => day.startsWith(month)).reduce((sum, day) => sum + (byDay.get(day)?.filter((event) => dayKey(event.start) === day).length ?? 0), 0);
    // Where to send someone who lands in an empty month.
    const nextBusy = days.find((day) => day.slice(0, 7) > month)?.slice(0, 7);
    const lastBusy = [...days].reverse().find((day) => day.slice(0, 7) < month)?.slice(0, 7);

    const go = (to: string) => {
        setMonth(to);
        setPicked(null);
    };

    return (
        <div className="month">
            <div className="month__bar">
                <div>
                    <h2 className="month__title" aria-live="polite">
                        {monthLabel(month, locale)}
                    </h2>
                    <p className="month__summary">{t('month.count', { count: inMonth })}</p>
                </div>
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

            <div className="month__layout">
                <table className="month__table">
                    <caption className="sr-only">{monthLabel(month, locale)}</caption>
                    <thead>
                        <tr>
                            {names.map((name) => (
                                <th key={name.long} scope="col" abbr={name.long}>
                                    <span aria-hidden="true">{name.short}</span>
                                    <span className="sr-only">{name.long}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map((week) => (
                            <tr key={week[0]}>
                                {week.map((day) => {
                                    const list = byDay.get(day) ?? [];
                                    const number = Number(day.slice(8));
                                    const classes = ['month__tile'];
                                    if (!day.startsWith(month)) classes.push('month__tile--outside');
                                    if (day < today) classes.push('month__tile--past');
                                    if (day === today) classes.push('month__tile--today');
                                    return (
                                        <td key={day}>
                                            {list.length > 0 ? (
                                                <button
                                                    type="button"
                                                    className={classes.join(' ')}
                                                    data-kind-colour={list[0]!.kind?.colour ?? 'grey'}
                                                    aria-pressed={day === chosen}
                                                    aria-label={`${formatDay(day, locale)}, ${t('month.count', { count: list.length })}`}
                                                    onClick={() => setPicked(day)}
                                                >
                                                    <span className="month__number">{number}</span>
                                                    <span className="month__titles" aria-hidden="true">
                                                        {list.slice(0, TITLES_PER_DAY).map((event) => (
                                                            <span
                                                                key={event.id}
                                                                className={event.status === 'cancelled' || event.status === 'postponed' ? 'month__off' : undefined}
                                                                data-kind-colour={event.kind?.colour ?? 'grey'}
                                                            >
                                                                {event.title}
                                                            </span>
                                                        ))}
                                                        {list.length > TITLES_PER_DAY && <span className="month__more">{t('month.more', { count: list.length - TITLES_PER_DAY })}</span>}
                                                    </span>
                                                    <span className="month__dots" aria-hidden="true">
                                                        {list.slice(0, 3).map((event) => (
                                                            <i key={event.id} data-kind-colour={event.kind?.colour ?? 'grey'} />
                                                        ))}
                                                    </span>
                                                </button>
                                            ) : (
                                                <span className={`${classes.join(' ')} month__tile--free`}>
                                                    <span className="month__number" aria-hidden="true">
                                                        {number}
                                                    </span>
                                                    <span className="sr-only">{formatDay(day, locale)}</span>
                                                </span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="month__day" aria-live="polite">
                    {chosen ? (
                        <>
                            <h3 className="month__day-title">{formatDay(chosen, locale)}</h3>
                            <div className="event-list">
                                {chosenEvents.map((event) => (
                                    <EventRow key={event.id} event={event} headingLevel="h4" compact />
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="month__day-title">{t('month.nothing', { month: monthLabel(month, locale) })}</h3>
                            {(nextBusy || lastBusy) && (
                                <div className="month__jump">
                                    {nextBusy && (
                                        <button type="button" className="btn-leaf" onClick={() => go(nextBusy)}>
                                            {t('month.go_next', { month: monthLabel(nextBusy, locale) })}
                                        </button>
                                    )}
                                    {lastBusy && (
                                        <button type="button" className="btn-quiet" onClick={() => go(lastBusy)}>
                                            {t('month.go_last', { month: monthLabel(lastBusy, locale) })}
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
