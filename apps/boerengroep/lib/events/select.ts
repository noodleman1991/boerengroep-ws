import { dayKey, isAllDay, monthKey } from './time';

/** Choosing and ordering events for lists, the month grid and bands on pages. */

type Timed = { start: string; end?: string | null };

/** Kinds of events in the order the filter shows them. Kinds added later come after these. */
export const EVENT_TYPE_ORDER = ['talk', 'lecture', 'workshop', 'excursion', 'soup-kitchen', 'csa', 'meeting', 'board-meeting'];

const ms = (value: string) => new Date(value).getTime();

/** An end is only believed when it lies after the start. Old content has a few that do not. */
export function realEnd(event: Timed): string | null {
  return event.end && ms(event.end) > ms(event.start) ? event.end : null;
}

/** The last Dutch day an event touches. */
function lastDay(event: Timed): string {
  const end = realEnd(event);
  return end ? dayKey(end) : dayKey(event.start);
}

/**
 * An event stays on the upcoming list until it is over. With an end time that is the end.
 * Without one, or for whole days, it is the end of its last Dutch day.
 */
export function isUpcoming(event: Timed, now: Date): boolean {
  const end = realEnd(event);
  if (end && !isAllDay(event.start, event.end)) return ms(end) >= now.getTime();
  return lastDay(event) >= dayKey(now);
}

export function splitEvents<E extends Timed>(events: E[], now: Date): { upcoming: E[]; past: E[] } {
  const upcoming: E[] = [];
  const past: E[] = [];
  for (const event of events) (isUpcoming(event, now) ? upcoming : past).push(event);
  upcoming.sort((a, b) => ms(a.start) - ms(b.start));
  past.sort((a, b) => ms(b.start) - ms(a.start));
  return { upcoming, past };
}

/** Events under their Dutch month, in the order given. */
export function groupByMonth<E extends Timed>(events: E[]): { month: string; events: E[] }[] {
  const groups: { month: string; events: E[] }[] = [];
  for (const event of events) {
    const month = monthKey(event.start);
    const last = groups.at(-1);
    if (last?.month === month) last.events.push(event);
    else groups.push({ month, events: [event] });
  }
  return groups;
}

/** For the month grid: the events of each day. An event that spans several days is on each of them. */
export function eventsByDay<E extends Timed>(events: E[]): Map<string, E[]> {
  const days = new Map<string, E[]>();
  const sorted = [...events].sort((a, b) => ms(a.start) - ms(b.start));
  for (const event of sorted) {
    const last = lastDay(event);
    let day = dayKey(event.start);
    // A year is the most an event can span, which also stops a wrong date from running away.
    for (let guard = 0; guard < 366 && day <= last; guard++) {
      const list = days.get(day);
      if (list) list.push(event);
      else days.set(day, [event]);
      const [y, m, d] = day.split('-').map(Number);
      day = new Date(Date.UTC(y!, m! - 1, d! + 1)).toISOString().slice(0, 10);
    }
  }
  return days;
}

export function typesIn(events: { type: string }[]): string[] {
  const present = new Set(events.map((event) => event.type));
  const known = EVENT_TYPE_ORDER.filter((type) => present.has(type));
  const other = [...present].filter((type) => !EVENT_TYPE_ORDER.includes(type)).sort();
  return [...known, ...other];
}

export type PickOptions = {
  mode: 'upcoming' | 'type' | 'picked';
  eventType?: string | null;
  picked?: (number | string)[];
  count: number;
  /** Show the most recent events when nothing is coming, so a page is never left with a hole. */
  orRecent?: boolean;
};

/** The events for a band on a page, as the editor set it up. */
export function pickEvents<E extends Timed & { id: number | string; type: string; featured?: boolean }>(
  events: E[],
  options: PickOptions,
  now: Date,
): E[] {
  if (options.mode === 'picked') {
    const byId = new Map(events.map((event) => [String(event.id), event]));
    return (options.picked ?? []).flatMap((id) => byId.get(String(id)) ?? []).slice(0, options.count);
  }
  const pool = options.mode === 'type' && options.eventType ? events.filter((event) => event.type === options.eventType) : events;
  const { upcoming, past } = splitEvents(pool, now);
  if (upcoming.length === 0) return options.orRecent ? past.slice(0, options.count) : [];
  // Spotlighted events lead. The sort is stable, so the rest stay in date order.
  return [...upcoming].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))).slice(0, options.count);
}
