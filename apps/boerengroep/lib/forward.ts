import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { cms, type Locale } from '@/lib/cms';

/** An address of the site with its language in front. */
export const withLocale = (locale: Locale, path: string) => `/${locale}${path === '/' ? '' : path}`;

/**
 * For an address where nothing lives any more: sends the visitor on when an editor set a
 * forwarding address for it, and says "not found" otherwise. A forwarding address can be
 * written with or without the language in front, and may lead to another website.
 */
export async function forwardOrNotFound(locale: Locale, path: string): Promise<never> {
  const rule = (await cms.findRedirect(path)) ?? (await cms.findRedirect(withLocale(locale, path)));
  if (rule) {
    const target = /^https?:\/\//.test(rule.to) ? rule.to : withLocale(locale, rule.to);
    if (rule.permanent) permanentRedirect(target);
    redirect(target);
  }
  notFound();
}
