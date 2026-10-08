/**
 * The Brevo list for this site. Editors set the number in Site settings, Newsletter.
 * The server setting BREVO_LIST_ID is the fallback for a site that has not chosen one yet.
 */
export function listIdFrom(fromSettings: number | null | undefined, fromEnv: string | undefined): number | null {
  const valid = (value: number) => Number.isInteger(value) && value > 0;
  if (typeof fromSettings === 'number' && valid(fromSettings)) return fromSettings;
  const parsed = Number((fromEnv ?? '').trim() || Number.NaN);
  return valid(parsed) ? parsed : null;
}
