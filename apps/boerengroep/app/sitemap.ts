import type { MetadataRoute } from 'next';
import { cms } from '@/lib/cms';
import { emptyLists, sitemapEntries } from '@/lib/sitemap';
import { siteUrl } from '@/lib/site-url';

// Made again at most once an hour.
export const revalidate = 3600;

/** The list of addresses offered to search engines, at /sitemap.xml. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [pages, events, english, dutch, news, vacancies] = await Promise.all([
        cms.listPagePaths(),
        cms.listEvents(),
        cms.listPastEvents('en'),
        cms.listPastEvents('nl'),
        cms.listNewsletters(),
        cms.listVacancies('en'),
    ]);
    // A story without a language is in both lists.
    const stories = [...new Map([...english, ...dutch].map((story) => [story.id, story])).values()];
    const empty = emptyLists({ news, stories: stories.length, vacancies: vacancies.length, podcast: Boolean(process.env.PODCAST_RSS_URL) });
    return sitemapEntries({ base: siteUrl(), pages, events, stories, news, empty });
}
