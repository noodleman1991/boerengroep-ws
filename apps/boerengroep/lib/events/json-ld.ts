import { dayKey, isAllDay } from './time';
import type { SiteEvent } from './types';

const SCHEMA = 'https://schema.org';
const STATUS = { scheduled: 'EventScheduled', full: 'EventScheduled', cancelled: 'EventCancelled', postponed: 'EventPostponed' } as const;

/** Describes an event the way search engines read it, so it can show up as an event in results. */
export type EventJsonLd = {
  '@context': string;
  '@type': 'Event';
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  eventStatus: string;
  eventAttendanceMode: string;
  location?: { '@type': 'Place'; name: string; address: string } | { '@type': 'VirtualLocation'; url: string };
  image?: string[];
  organizer: { '@type': 'Organization'; name: string; url: string };
  url: string;
};

export function eventJsonLd(event: SiteEvent, ctx: { url: string; organizer: { name: string; url: string } }): EventJsonLd {
  const { address, callLink } = event.place;
  const wholeDays = isAllDay(event.start, event.end);
  const picture = event.image?.share ?? event.image?.original;
  return {
    '@context': SCHEMA,
    '@type': 'Event',
    name: event.title,
    ...(event.description ? { description: event.description } : {}),
    startDate: wholeDays ? dayKey(event.start) : event.start,
    ...(event.end ? { endDate: wholeDays ? dayKey(event.end) : event.end } : {}),
    eventStatus: `${SCHEMA}/${STATUS[event.status]}`,
    eventAttendanceMode: `${SCHEMA}/${address && callLink ? 'Mixed' : callLink ? 'Online' : 'Offline'}EventAttendanceMode`,
    ...(address
      ? { location: { '@type': 'Place', name: address, address } }
      : callLink
        ? { location: { '@type': 'VirtualLocation', url: callLink } }
        : {}),
    ...(picture ? { image: [picture] } : {}),
    organizer: { '@type': 'Organization', ...ctx.organizer },
    url: ctx.url,
  };
}

/** JSON that is safe inside a script tag, whatever an editor typed into a title. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
