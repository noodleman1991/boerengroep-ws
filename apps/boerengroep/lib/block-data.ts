import { cms, type Locale } from '@/lib/cms';
import { toSiteEvent } from '@/lib/cms-adapters';
import type { SiteEvent } from '@/lib/events/types';
import { type NewsCard, toNewsCard } from '@/lib/news';
import { type Episode, loadPodcast } from '@/lib/podcast';
import { vacancyAnchor } from '@/lib/vacancies';

/** A vacancy as the short list of open positions shows it. */
export type PositionCard = {
  id: string;
  title: string;
  /** The name of the vacancy on the positions page. */
  anchor: string;
  kind: string;
  openApplication: boolean;
  applicationDeadline?: string;
  featured: boolean;
};

/** What blocks on a page need besides their own fields. Loaded on the server, read by the blocks. */
export type BlockData = {
  events: SiteEvent[];
  /** Episodes of the podcast, newest first. */
  episodes: Episode[];
  /** Every news item, newest first. */
  news: NewsCard[];
  /** Every vacancy. Which ones are open is worked out when the page is shown. */
  positions: PositionCard[];
  /** When the page was built, so server and browser agree on what "upcoming" means at first paint. */
  renderedAt: string;
};

type AnyBlock = { blockType?: string | null };

const has = (blocks: AnyBlock[], type: string) => blocks.some((block) => block.blockType === type);

/** Loads only what the blocks on this page use, in the language of the page. */
export async function loadBlockData(blocks: AnyBlock[] | null | undefined, locale: Locale): Promise<BlockData> {
  const list = blocks ?? [];
  const [events, podcast, news, vacancies] = await Promise.all([
    has(list, 'eventsCalendarPreview') ? cms.listEvents(locale) : [],
    // Forty episodes are plenty for "the latest" and for finding chosen ones by title.
    has(list, 'podcast') ? loadPodcast() : null,
    has(list, 'newsPreview') ? cms.listNewsletters() : [],
    has(list, 'vacanciesPreview') ? cms.listVacancies(locale) : [],
  ]);
  return {
    events: events.map(toSiteEvent),
    episodes: podcast?.episodes.slice(0, 40) ?? [],
    news: news.flatMap((item) => toNewsCard(item) ?? []),
    positions: vacancies.map((vacancy) => ({
      id: String(vacancy.id),
      title: vacancy.title,
      anchor: vacancyAnchor(vacancy),
      kind: vacancy.opportunityType,
      openApplication: Boolean(vacancy.openApplication),
      applicationDeadline: vacancy.applicationDeadline ?? undefined,
      featured: Boolean(vacancy.featured),
    })),
    renderedAt: new Date().toISOString(),
  };
}
