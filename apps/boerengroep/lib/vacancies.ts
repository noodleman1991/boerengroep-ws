import { dayKey } from './events/time';

/** When people can apply for a vacancy, and which vacancies the page shows in what order. */

export type VacancyTiming = { openApplication?: boolean | null; applicationDeadline?: string | null };

/** How long a vacancy stays on the page, marked as closed, after its last day. */
const DAYS_SHOWN_AS_CLOSED = 3;

export type VacancyState =
  /** People can apply, and no last day is set. */
  | { state: 'open' }
  /** People can apply up to and including this day. */
  | { state: 'until'; deadline: string }
  /** The last day has passed. Shown as closed for a few days, so people who meant to apply find out. */
  | { state: 'closed'; deadline: string }
  /** Closed long enough ago to leave the page. */
  | { state: 'gone'; deadline: string };

const addDays = (day: string, days: number) => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d! + days)).toISOString().slice(0, 10);
};

/**
 * "Always open" wins over any date. Without a date a vacancy is open until an editor removes
 * it. With a date, the last day itself still counts, by the Dutch calendar.
 */
export function vacancyState(vacancy: VacancyTiming, now: Date): VacancyState {
  if (vacancy.openApplication || !vacancy.applicationDeadline) return { state: 'open' };
  const deadline = dayKey(vacancy.applicationDeadline);
  const today = dayKey(now);
  if (today <= deadline) return { state: 'until', deadline };
  return { state: today <= addDays(deadline, DAYS_SHOWN_AS_CLOSED) ? 'closed' : 'gone', deadline };
}

/** The kinds of positions, in the order the page shows them. */
export const VACANCY_KINDS = ['volunteer', 'internship', 'coordinator', 'board', 'other'] as const;
export type VacancyKind = (typeof VACANCY_KINDS)[number];

export type VacancyGroup<V> = {
  kind: VacancyKind;
  items: { vacancy: V; state: 'open' | 'until' | 'closed'; deadline?: string }[];
  /** How many of them people can still apply for. */
  open: number;
};

const RANK = { until: 0, open: 1, closed: 2 } as const;

/**
 * The vacancies of the page, grouped by kind. Within a kind: the nearest last day first, then
 * the positions that are always open, then the ones that just closed. A kind the page does not
 * know is listed under "other". Kinds without vacancies are left out unless asked for.
 */
export function groupVacancies<V extends VacancyTiming & { opportunityType?: string | null; title?: string | null }>(
  vacancies: V[],
  now: Date,
  options: { includeEmpty?: boolean } = {},
): VacancyGroup<V>[] {
  const groups = new Map<VacancyKind, VacancyGroup<V>>(VACANCY_KINDS.map((kind) => [kind, { kind, items: [], open: 0 }]));
  for (const vacancy of vacancies) {
    const timing = vacancyState(vacancy, now);
    if (timing.state === 'gone') continue;
    const kind = (VACANCY_KINDS as readonly string[]).includes(vacancy.opportunityType ?? '') ? (vacancy.opportunityType as VacancyKind) : 'other';
    const group = groups.get(kind)!;
    group.items.push({ vacancy, state: timing.state, deadline: 'deadline' in timing ? timing.deadline : undefined });
    if (timing.state !== 'closed') group.open++;
  }
  for (const group of groups.values()) {
    // The sort is stable, so vacancies that tie stay in the order they were given.
    group.items.sort((a, b) => RANK[a.state] - RANK[b.state] || (a.deadline ?? '').localeCompare(b.deadline ?? ''));
  }
  return [...groups.values()].filter((group) => options.includeEmpty || group.items.length > 0);
}
