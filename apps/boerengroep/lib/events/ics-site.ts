import type { IcsEvent } from './ics';
import type { SiteLocale } from './time';
import type { SiteEvent } from './types';

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/** Where an event's own page lives, without the language. */
export const eventPath = (slug: string) => `/activities/calendar/${slug}`;

type Site = {
  /** Public address of the site, no slash at the end. */
  base: string;
  locale: SiteLocale;
  /** Makes identities unique per site. It must never change, or subscribers get every event twice. */
  tenant: string;
  onlineLabel: string;
};

/** An event as a calendar file describes it. */
export function toIcsEvent(event: SiteEvent, site: Site): IcsEvent {
  const { address, callLink } = event.place;
  return {
    uid: `event-${event.id}@${site.tenant}`,
    title: event.title,
    description: [event.description || null, address && callLink ? `${site.onlineLabel}: ${callLink}` : null].filter(Boolean).join('\n\n'),
    start: event.start,
    end: event.end,
    location: address ?? callLink ?? null,
    url: `${site.base}/${site.locale}${eventPath(event.slug)}`,
    status: event.status,
    statusNote: event.statusNote,
    updatedAt: event.updatedAt,
  };
}

/** The feed carries what is coming and the past year. Older events would only weigh calendars down. */
export function feedEvents<E extends { start: string }>(events: E[], now: Date): E[] {
  const from = now.getTime() - YEAR_MS;
  return events.filter((event) => new Date(event.start).getTime() >= from);
}
