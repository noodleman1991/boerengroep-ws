import type { Page } from '@sites/cms/types';
import type { Metadata } from 'next';
import { cms, type Locale } from './cms';
import { mediaUrl } from './cms-adapters';
import { pageDescription, pageMeta } from './page-meta';
import { siteUrl } from './site-url';
import { SITE } from '@/site.config';
import { TEST_PAGE } from './test-page';

const absolute = (address: string) => (address.startsWith('/') ? `${siteUrl()}${address}` : address);

/**
 * Title, description, address and preview picture of one page of this site. The name of the
 * site and the fallback description come from Site settings, so editors control them.
 */
export async function siteMeta(
  locale: Locale,
  input: {
    title?: string | null;
    description?: string | null;
    /** The address without the language, for example `/about-us/history`. */
    path: string;
    picture?: string;
    pictureAlt?: string | null;
    type?: 'website' | 'article';
    index?: boolean;
  },
): Promise<Metadata> {
  const settings = await cms.getSiteSettings(locale);
  return pageMeta({
    title: input.title,
    site: settings?.general?.name ?? SITE.name,
    description: input.description ?? settings?.general?.tagline ?? SITE.description,
    url: `${siteUrl()}/${locale}${input.path === '/' ? '' : input.path}`,
    image: input.picture ? { url: absolute(input.picture), alt: input.pictureAlt } : undefined,
    type: input.type,
    index: input.index,
  });
}

/** The same for a page from the admin panel. The home page keeps the site-wide title. */
export function contentPageMeta(locale: Locale, page: Page, home = false): Promise<Metadata> {
  const opening = (page.blocks ?? []).find((block) => block.blockType === 'hero');
  const picture = opening?.blockType === 'hero' ? opening.image : undefined;
  return siteMeta(locale, {
    title: home ? undefined : page.title,
    description: pageDescription(page as never),
    path: home ? '/' : (page.path ?? '/'),
    picture: mediaUrl(picture?.src, 'og'),
    pictureAlt: picture?.alt,
    index: page.legacyId !== TEST_PAGE.legacyId,
  });
}
