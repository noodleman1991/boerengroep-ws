import { dayKey, isAllDay } from './time';

/** Links for passing an event on, and for putting it in your own calendar. */

type Timed = { title: string; start: string; end?: string | null; description?: string | null; location?: string | null };

const DEFAULT_LENGTH_MS = 2 * 60 * 60 * 1000;

/** Like encodeURIComponent for a whole query, with spaces as %20: mail programs show a plus sign literally. */
const query = (values: Record<string, string>) =>
  Object.entries(values)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

export function shareLinks({ title, when, url }: { title: string; when: string; url: string }) {
  return {
    whatsapp: `https://wa.me/?${query({ text: `${title}\n${when}\n${url}` })}`,
    email: `mailto:?${query({ subject: title, body: `${title}\n${when}\n\n${url}` })}`,
  };
}

function nextDay(key: string): string {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day! + 1)).toISOString().slice(0, 10);
}

/** Start and end as calendar services want them. Whole days end on the day after the last day. */
function span(event: Timed) {
  const startMs = new Date(event.start).getTime();
  const end = event.end && new Date(event.end).getTime() > startMs ? event.end : null;
  if (isAllDay(event.start, event.end)) {
    const first = dayKey(event.start);
    return { allDay: true as const, from: first, until: nextDay(end ? dayKey(end) : first) };
  }
  const iso = (ms: number) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
  return { allDay: false as const, from: iso(startMs), until: iso(end ? new Date(end).getTime() : startMs + DEFAULT_LENGTH_MS) };
}

export function addToCalendarLinks(event: Timed, url: string) {
  const { allDay, from, until } = span(event);
  const details = [event.description?.trim() || null, url].filter(Boolean).join('\n\n');
  const compact = (value: string) => value.replace(/[-:]/g, '');

  const google = `https://calendar.google.com/calendar/render?${query({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${compact(from)}/${compact(until)}`,
    details,
    ...(event.location ? { location: event.location } : {}),
  })}`;

  const outlook = `https://outlook.live.com/calendar/0/action/compose?${query({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: from,
    enddt: until,
    ...(allDay ? { allday: 'true' } : {}),
    body: details,
    ...(event.location ? { location: event.location } : {}),
  })}`;

  return { google, outlook };
}

/** The feed address in the forms that calendar apps and services expect. */
export function subscribeLinks(feedUrl: string) {
  const app = feedUrl.replace(/^https?:\/\//, 'webcal://');
  return {
    address: feedUrl,
    /** Opens the calendar app on a phone or computer, which then asks to subscribe. */
    app,
    google: `https://calendar.google.com/calendar/r?${query({ cid: app })}`,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?${query({ url: feedUrl })}`,
  };
}

/** A map link: the editor's own when it is a web address, otherwise a search for the place. */
export function mapsUrl(place: { address?: string | null; mapsLink?: string | null }): string | undefined {
  if (place.mapsLink && /^https?:\/\//i.test(place.mapsLink.trim())) return place.mapsLink.trim();
  if (!place.address?.trim()) return undefined;
  return `https://www.google.com/maps/search/?${query({ api: '1', query: place.address.trim() })}`;
}

/** A link an editor typed, but only when it really is a web address. Anything else is not turned into a link. */
export function webAddress(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && /^https?:\/\//i.test(trimmed) ? trimmed : undefined;
}
