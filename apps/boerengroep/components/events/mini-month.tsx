import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { eventsByDay } from '@/lib/events/select';
import { dayKey, formatDay, monthGrid, monthKey, monthLabel, type SiteLocale } from '@/lib/events/time';
import type { SiteEvent } from '@/lib/events/types';

/** The current month at a glance. A day with something on is a green dot that opens the calendar. */
export function MiniMonth({ events, now }: { events: SiteEvent[]; now: Date }) {
    const locale = useLocale() as SiteLocale;
    const month = monthKey(now);
    const today = dayKey(now);
    const byDay = eventsByDay(events);
    const names = Array.from({ length: 7 }, (_, i) =>
        new Intl.DateTimeFormat(locale === 'nl' ? 'nl-NL' : 'en-GB', { weekday: 'narrow', timeZone: 'UTC' }).format(
            new Date(Date.UTC(2026, 0, 5 + i, 12)),
        ),
    );
    return (
        <div className="mini-month">
            <p className="mini-month__title">{monthLabel(month, locale)}</p>
            <div className="mini-month__grid">
                {names.map((name, index) => (
                    <span key={index} className="mini-month__name" aria-hidden="true">
                        {name}
                    </span>
                ))}
                {monthGrid(month)
                    .flat()
                    .map((day) => {
                        const classes = ['mini-month__day'];
                        if (!day.startsWith(month)) classes.push('mini-month__day--outside');
                        if (day === today) classes.push('mini-month__day--today');
                        const count = byDay.get(day)?.length ?? 0;
                        return count > 0 && day.startsWith(month) ? (
                            <Link
                                key={day}
                                href="/activities/calendar?view=month"
                                className={classes.join(' ')}
                                aria-label={`${formatDay(day, locale)}: ${byDay.get(day)!.map((event) => event.title).join(', ')}`}
                            >
                                {Number(day.slice(8))}
                            </Link>
                        ) : (
                            <span key={day} className={classes.join(' ')}>
                                {Number(day.slice(8))}
                            </span>
                        );
                    })}
            </div>
        </div>
    );
}
