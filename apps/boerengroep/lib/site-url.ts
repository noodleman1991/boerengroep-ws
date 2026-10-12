type Env = Partial<Record<'NEXT_PUBLIC_SITE_URL' | 'BASE_URL' | 'VERCEL_URL', string | undefined>>;

/** The public address of the site, without a slash at the end. Needed wherever a link leaves the site. */
export function siteUrlFrom(env: Env): string {
  const set = env.NEXT_PUBLIC_SITE_URL?.trim() || env.BASE_URL?.trim();
  if (set) return set.replace(/\/+$/, '');
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export const siteUrl = () => siteUrlFrom(process.env as Env);

/**
 * A site on a vercel.app address is a copy for trying things out, not the real one. Search
 * engines must stay out of it, or they list every page twice: once here and once on the
 * organisation's own address.
 */
export function isTrialCopyFrom(env: Env): boolean {
  try {
    return new URL(siteUrlFrom(env)).hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

export const isTrialCopy = () => isTrialCopyFrom(process.env as Env);
