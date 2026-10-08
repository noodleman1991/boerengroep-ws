/**
 * Dates and times for events. Everything is shown on the Dutch clock, because the events
 * happen in the Netherlands: a visitor abroad must read the same hour as someone in Wageningen.
 */

export const SITE_TIME_ZONE = 'Europe/Amsterdam';

export type SiteLocale = 'en' | 'nl';
type When = string | Date;

const intlLocale = (locale: SiteLocale) => (locale === 'nl' ? 'nl-NL' : 'en-GB');
const asDate = (value: When) => (typeof value === 'string' ? new Date(value) : value);

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = locale + JSON.stringify(options);
  let made = formatters.get(key);
  if (!made) {
    made = new Intl.DateTimeFormat(locale, { timeZone: SITE_TIME_ZONE, ...options });
    formatters.set(key, made);
  }
  return made;
}

function parts(value: When, locale: string, options: Intl.DateTimeFormatOptions): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of formatter(locale, options).formatToParts(asDate(value))) out[part.type] = part.value;
  return out;
}

/** The Dutch calendar day of a moment, as YYYY-MM-DD. */
export function dayKey(value: When): string {
  const p = parts(value, 'en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  return `${p.year}-${p.month}-${p.day}`;
}

/** The Dutch calendar month of a moment, as YYYY-MM. */
export function monthKey(value: When): string {
  return dayKey(value).slice(0, 7);
}

/** The hour on the Dutch clock, 24 hours. */
export function formatTime(value: When, locale: SiteLocale): string {
  const p = parts(value, intlLocale(locale), { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  return `${p.hour}:${p.minute}`;
}

/** The pieces of the large date shown beside an event. */
export function dateParts(value: When, locale: SiteLocale): { day: string; month: string; weekday: string; year: string } {
  const p = parts(value, intlLocale(locale), { day: 'numeric', month: 'short', weekday: 'short', year: 'numeric' });
  const tidy = (text: string | undefined) => (text ?? '').replace(/\.$/, '');
  return { day: p.day ?? '', month: tidy(p.month), weekday: tidy(p.weekday), year: p.year ?? '' };
}

function longDay(value: When, locale: SiteLocale, withYear: boolean, withMonth = true): string {
  const p = parts(value, intlLocale(locale), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return [p.weekday, p.day, withMonth ? p.month : null, withYear ? p.year : null].filter(Boolean).join(' ');
}

const isMidnight = (value: When) => formatTime(value, 'en') === '00:00';

/**
 * Editors who pick a date without a time get midnight. Midnight to midnight (or midnight
 * with no end) therefore means whole days, with the last day included.
 */
export function isAllDay(start: When, end: When | null | undefined): boolean {
  return isMidnight(start) && (!end || isMidnight(end));
}

/** When an event is, as one readable phrase. */
export function formatWhen(start: When, end: When | null | undefined, locale: SiteLocale): string {
  const to = locale === 'nl' ? 'tot' : 'to';
  const lasts = end && asDate(end).getTime() > asDate(start).getTime() ? end : null;

  if (isAllDay(start, end)) {
    if (!lasts || dayKey(lasts) === dayKey(start)) return longDay(start, locale, true);
    const sameMonth = monthKey(start) === monthKey(lasts);
    return `${longDay(start, locale, false, !sameMonth)} ${to} ${longDay(lasts, locale, true)}`;
  }

  if (!lasts) return `${longDay(start, locale, true)}, ${formatTime(start, locale)}`;
  if (dayKey(lasts) === dayKey(start)) {
    return `${longDay(start, locale, true)}, ${formatTime(start, locale)} ${to} ${formatTime(lasts, locale)}`;
  }
  return `${longDay(start, locale, false)}, ${formatTime(start, locale)} ${to} ${longDay(lasts, locale, true)}, ${formatTime(lasts, locale)}`;
}

/** "October 2026" for a YYYY-MM key. */
export function monthLabel(key: string, locale: SiteLocale): string {
  const [year, month] = key.split('-').map(Number);
  // Mid-month at noon UTC is the same month on every clock.
  const date = new Date(Date.UTC(year!, month! - 1, 15, 12));
  const p = parts(date, intlLocale(locale), { month: 'long', year: 'numeric' });
  return `${p.month} ${p.year}`;
}

export function shiftMonth(key: string, by: number): string {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1 + by, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** The weeks of a month, Monday first, as day keys. The first and last week include days of the neighbouring months. */
export function monthGrid(key: string): string[][] {
  const [year, month] = key.split('-').map(Number);
  const first = new Date(Date.UTC(year!, month! - 1, 1));
  const daysInMonth = new Date(Date.UTC(year!, month!, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Monday = 0
  const cells = Math.ceil((lead + daysInMonth) / 7) * 7;
  const weeks: string[][] = [];
  for (let i = 0; i < cells; i++) {
    const day = new Date(Date.UTC(year!, month! - 1, 1 - lead + i));
    if (i % 7 === 0) weeks.push([]);
    weeks.at(-1)!.push(day.toISOString().slice(0, 10));
  }
  return weeks;
}

/**
 * The short time shown beside the large date: "19:30 to 21:00", or until when for more days.
 * Null for one whole day, where the caller says "all day" in its own words.
 */
export function formatTimes(start: When, end: When | null | undefined, locale: SiteLocale): string | null {
  const to = locale === 'nl' ? 'tot' : 'to';
  const until = locale === 'nl' ? 't/m' : 'until';
  const lasts = end && asDate(end).getTime() > asDate(start).getTime() ? end : null;
  const moreDays = lasts && dayKey(lasts) !== dayKey(start);

  if (isAllDay(start, end)) return moreDays ? `${until} ${longDay(lasts, locale, false)}` : null;
  if (!lasts) return formatTime(start, locale);
  if (moreDays) return `${formatTime(start, locale)}, ${until} ${longDay(lasts, locale, false)}`;
  return `${formatTime(start, locale)} ${to} ${formatTime(lasts, locale)}`;
}

/** "Thursday 8 October" for a YYYY-MM-DD key. */
/** A date with its year and without the weekday, for things that may be from another year: "24 June 2026". */
export function formatDate(value: When, locale: SiteLocale): string {
  const p = parts(value, intlLocale(locale), { day: 'numeric', month: 'long', year: 'numeric' });
  return [p.day, p.month, p.year].filter(Boolean).join(' ');
}

export function formatDay(key: string, locale: SiteLocale): string {
  const [year, month, day] = key.split('-').map(Number);
  // Noon UTC is the same calendar day on the Dutch clock all year.
  return longDay(new Date(Date.UTC(year!, month! - 1, day!, 12)), locale, false);
}
