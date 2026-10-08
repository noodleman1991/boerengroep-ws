import { isOwnNews, newsItemPath } from './news';
import { RESERVED_PATHS } from './reserved-paths';
import { TEST_PAGE } from './test-page';

const LANGUAGES = ['en', 'nl'] as const;
type Language = (typeof LANGUAGES)[number];
type Written = { slug?: string | null; language?: Language | null; updatedAt?: string | null };

/** Pages about one visitor's own newsletter subscription. They are not for search engines. */
const PERSONAL = '/newsletter/';

/**
 * The built-in lists that have nothing to show right now. An empty list is of no use to a
 * search engine, so the sitemap leaves these out until something is added.
 */
export function emptyLists(has: { news: { organization: string }[]; stories: number; vacancies: number; podcast: boolean }): string[] {
  const own = has.news.some((item) => isOwnNews(item.organization));
  const friends = has.news.some((item) => !isOwnNews(item.organization));
  return [
    ...(own || friends ? [] : ['/news']),
    ...(own ? [] : ['/news/newsletter']),
    ...(friends ? [] : ['/news/friends-news']),
    ...(has.stories > 0 ? [] : ['/activities/past-events']),
    ...(has.vacancies > 0 ? [] : ['/vacancies']),
    ...(has.podcast ? [] : ['/library/podcast']),
  ];
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
  /** Built-in lists to leave out because they are empty. See `emptyLists`. */
  empty?: string[];
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
    if (path.startsWith(PERSONAL) || input.empty?.includes(path)) continue;
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

export { newsItemPath };
