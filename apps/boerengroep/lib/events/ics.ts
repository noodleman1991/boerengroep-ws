import { dayKey, isAllDay } from './time';

/**
 * Calendar files (iCalendar, RFC 5545) for one event and for the feed people subscribe to.
 * Times are written in UTC, so Google, Apple and Outlook each show the right local hour.
 */

export type IcsStatus = 'scheduled' | 'full' | 'cancelled' | 'postponed';

export type IcsEvent = {
  /** Never changes for an event. Calendars use it to update instead of duplicating. */
  uid: string;
  title: string;
  description?: string | null;
  start: string;
  end?: string | null;
  location?: string | null;
  url?: string | null;
  status: IcsStatus;
  statusNote?: string | null;
  updatedAt?: string | null;
};

export type IcsOptions = {
  name: string;
  now: Date;
  /** Words for the states, in the language of the reader. */
  labels: { full: string; cancelled: string; postponed: string };
  /** A feed is refreshed by the calendar app. A single file is imported once. */
  feed?: boolean;
};

const DEFAULT_LENGTH_MS = 2 * 60 * 60 * 1000;
const SEQUENCE_EPOCH = Date.UTC(2025, 0, 1) / 1000;
const encoder = new TextEncoder();

/** Commas, semicolons, backslashes and line breaks have a meaning in the format. */
export function escapeText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/** Lines may be 75 bytes long. Longer ones continue on the next line after a space. */
export function foldLine(line: string): string {
  const out: string[] = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    const limit = out.length === 0 ? 75 : 74; // continuation lines spend one byte on the space
    if (size + bytes > limit) {
      out.push(current);
      current = '';
      size = 0;
    }
    current += char;
    size += bytes;
  }
  out.push(current);
  return out.map((part, index) => (index === 0 ? part : ` ${part}`)).join('\r\n');
}

const utcStamp = (value: string | Date) =>
  new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

const dateStamp = (key: string) => key.replace(/-/g, '');

function nextDay(key: string): string {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day! + 1)).toISOString().slice(0, 10);
}

function eventLines(event: IcsEvent, { now, labels }: IcsOptions): string[] {
  const startMs = new Date(event.start).getTime();
  const end = event.end && new Date(event.end).getTime() > startMs ? event.end : null;
  const off = event.status === 'cancelled' || event.status === 'postponed';

  const title =
    event.status === 'cancelled'
      ? `${labels.cancelled}: ${event.title}`
      : event.status === 'postponed'
        ? `${labels.postponed}: ${event.title}`
        : event.status === 'full'
          ? `${event.title} (${labels.full})`
          : event.title;

  const stateLine = off
    ? `${event.status === 'cancelled' ? labels.cancelled : labels.postponed}.${event.statusNote ? ` ${event.statusNote}` : ''}`
    : event.status === 'full'
      ? `${labels.full}.${event.statusNote ? ` ${event.statusNote}` : ''}`
      : (event.statusNote ?? null);
  const description = [stateLine, event.description?.trim() || null, event.url ?? null].filter(Boolean).join('\n\n');

  const lines = ['BEGIN:VEVENT', `UID:${event.uid}`, `DTSTAMP:${utcStamp(now)}`];
  if (isAllDay(event.start, event.end)) {
    const first = dayKey(event.start);
    const last = end ? dayKey(end) : first;
    // The end of a whole-day event is the day after the last day.
    lines.push(`DTSTART;VALUE=DATE:${dateStamp(first)}`, `DTEND;VALUE=DATE:${dateStamp(nextDay(last))}`);
  } else {
    lines.push(`DTSTART:${utcStamp(event.start)}`, `DTEND:${utcStamp(end ?? new Date(startMs + DEFAULT_LENGTH_MS))}`);
  }
  lines.push(`SUMMARY:${escapeText(title.trim())}`);
  if (description) lines.push(`DESCRIPTION:${escapeText(description)}`);
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
  if (event.url) lines.push(`URL:${event.url}`);
  lines.push(`STATUS:${off ? 'CANCELLED' : 'CONFIRMED'}`);
  if (event.updatedAt) {
    const edited = new Date(event.updatedAt);
    lines.push(
      `LAST-MODIFIED:${utcStamp(edited)}`,
      // Grows with every edit, which tells a calendar that its copy is out of date.
      `SEQUENCE:${Math.max(0, Math.floor(edited.getTime() / 1000) - SEQUENCE_EPOCH)}`,
    );
  }
  lines.push('END:VEVENT');
  return lines;
}

/** The text of a calendar file: one event to import, or a feed to subscribe to. */
export function calendarFile(events: IcsEvent[], options: IcsOptions): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Boerengroep//Events//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  if (options.feed) {
    lines.push(
      `X-WR-CALNAME:${escapeText(options.name)}`,
      'X-WR-TIMEZONE:Europe/Amsterdam',
      'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
      'X-PUBLISHED-TTL:PT6H',
    );
  }
  for (const event of events) lines.push(...eventLines(event, options));
  lines.push('END:VCALENDAR');
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}
