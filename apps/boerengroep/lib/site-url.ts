type Env = Partial<Record<'NEXT_PUBLIC_SITE_URL' | 'BASE_URL' | 'VERCEL_URL', string | undefined>>;

/** The public address of the site, without a slash at the end. Needed wherever a link leaves the site. */
export function siteUrlFrom(env: Env): string {
  const set = env.NEXT_PUBLIC_SITE_URL?.trim() || env.BASE_URL?.trim();
  if (set) return set.replace(/\/+$/, '');
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export const siteUrl = () => siteUrlFrom(process.env as Env);
