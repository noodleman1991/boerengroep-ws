/**
 * Forms that editors build in the admin panel. The site checks an answer here before it is
 * saved, because the open API does not accept answers at all.
 */

export type FormField = {
  blockType: string;
  name?: string | null;
  label?: string | null;
  required?: boolean | null;
  defaultValue?: unknown;
  width?: number | null;
  options?: { label: string; value: string }[] | null;
  message?: unknown;
};

export type FieldProblem = 'required' | 'email' | 'number' | 'choice' | 'too-long';

export type Validation =
  | { ok: true; data: { field: string; value: string }[] }
  | { ok: false; errors: Record<string, FieldProblem> };

const MAX_LENGTH: Record<string, number> = { textarea: 5000 };
const DEFAULT_MAX = 500;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Checks an answer against the questions of its form and tidies it. Unknown keys are dropped. */
export function validateSubmission(fields: FormField[], values: Record<string, unknown>): Validation {
  const data: { field: string; value: string }[] = [];
  const errors: Record<string, FieldProblem> = {};

  for (const field of fields) {
    if (!field.name || field.blockType === 'message') continue;
    const given = values[field.name];

    if (field.blockType === 'checkbox') {
      const ticked = given === true || given === 'true' || given === 'on' || given === 'yes';
      if (field.required && !ticked) errors[field.name] = 'required';
      else data.push({ field: field.name, value: ticked ? 'yes' : 'no' });
      continue;
    }

    const value = typeof given === 'string' || typeof given === 'number' ? String(given).trim() : '';
    if (!value) {
      if (field.required) errors[field.name] = 'required';
      else data.push({ field: field.name, value: '' });
      continue;
    }
    if (value.length > (MAX_LENGTH[field.blockType] ?? DEFAULT_MAX)) errors[field.name] = 'too-long';
    else if (field.blockType === 'email' && !EMAIL.test(value)) errors[field.name] = 'email';
    else if (field.blockType === 'number' && !Number.isFinite(Number(value.replace(',', '.')))) errors[field.name] = 'number';
    else if (field.blockType === 'select' && !(field.options ?? []).some((option) => option.value === value)) errors[field.name] = 'choice';
    else data.push({ field: field.name, value: field.blockType === 'email' ? value.toLowerCase() : value });
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, data };
}

/**
 * Two cheap signs of a robot: it fills in a field people cannot see, or it answers within a
 * second. Neither stops a determined sender. Together with the rate limit they stop the bulk.
 */
export function looksLikeSpam({ trap, elapsedMs }: { trap: unknown; elapsedMs: number | undefined }): boolean {
  if (typeof trap === 'string' && trap.trim() !== '') return true;
  return typeof elapsedMs === 'number' && elapsedMs < 1500;
}

/** Counts answers per sender within a window of time. Kept in memory, per running server. */
export function createRateLimiter({ limit, windowMs, now = Date.now }: { limit: number; windowMs: number; now?: () => number }) {
  const seen = new Map<string, number[]>();
  return {
    allow(key: string): boolean {
      const from = now() - windowMs;
      // Forget senders whose window has passed, so the list cannot grow without end.
      for (const [other, times] of seen) {
        if (times.every((time) => time <= from)) seen.delete(other);
      }
      const recent = (seen.get(key) ?? []).filter((time) => time > from);
      if (recent.length >= limit) {
        seen.set(key, recent);
        return false;
      }
      recent.push(now());
      seen.set(key, recent);
      return true;
    },
    size: () => seen.size,
  };
}
