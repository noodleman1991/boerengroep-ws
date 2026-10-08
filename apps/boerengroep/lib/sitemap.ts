import { RESERVED_PATHS } from './reserved-paths';
import { TEST_PAGE } from './test-page';

const LANGUAGES = ['en', 'nl'] as const;
type Language = (typeof LANGUAGES)[number];
type Written = { slug?: string | null; language?: Language | null; updatedAt?: string | null };

/** Pages about one visitor's own newsletter subscription. They are not for search engines. */
const PERSONAL = '/newsletter/';

/** The address of a news item written on the site. The organisation's own news and news from friends have separate lists. */
export function newsItemPath(item: { slug: string; organization: string }): string {
  // Kept from the previous site, including the 'Inspiratietheater' spelling.
  const own = item.organization === 'Boerengroep' || item.organization === 'Inspiratietheater';
  return `${own ? '/news/newsletter' : '/news/friends-news'}/${item.slug}`;
}

/**
 * Every address a search engine may list: published pages, the built-in lists, events,
 * stories of past events and news written on the site. Each address appears once.
 */
export function sitemapEntries(input: {
  base: string;
  pages: { locale: Language; path: string }[];
  events: Written[];
  stories: Written[];
  news: (Written & { organization: string; type: string })[];
}): { url: string; lastModified?: Date }[] {
  const seen = new Map<string, Date | undefined>();
  const add = (locale: Language, path: string, changed?: string | null) => {
    const url = `${input.base}/${locale}${path === '/' ? '' : path}`;
    if (!seen.has(url)) seen.set(url, changed ? new Date(changed) : undefined);
  };
  // Something written in one language is listed under that language, otherwise under both.
  const each = (item: Written, path: string) => {
    for (const locale of item.language ? [item.language] : LANGUAGES) add(locale, path, item.updatedAt);
  };

  for (const page of input.pages) {
    if (page.path === TEST_PAGE.path || page.path.startsWith(PERSONAL)) continue;
    add(page.locale, page.path);
  }
  for (const path of RESERVED_PATHS) {
    if (path.startsWith(PERSONAL)) continue;
    for (const locale of LANGUAGES) add(locale, path);
  }
  for (const event of input.events) if (event.slug) each(event, `/activities/calendar/${event.slug}`);
  for (const story of input.stories) if (story.slug) each(story, `/activities/past-events/${story.slug}`);
  for (const item of input.news) {
    // An item that only links to another website has nothing of its own to list.
    if (item.slug && item.type !== 'link') each(item, newsItemPath({ slug: item.slug, organization: item.organization }));
  }
  return [...seen].map(([url, lastModified]) => (lastModified ? { url, lastModified } : { url }));
}
