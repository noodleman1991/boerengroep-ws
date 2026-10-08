import { cms, type Locale } from '@/lib/cms';
import { toSiteEvent } from '@/lib/cms-adapters';
import type { SiteEvent } from '@/lib/events/types';
import { type Episode, loadPodcast } from '@/lib/podcast';

/** What blocks on a page need besides their own fields. Loaded on the server, read by the blocks. */
export type BlockData = {
  events: SiteEvent[];
  /** Episodes of the podcast, newest first. */
  episodes: Episode[];
  /** When the page was built, so server and browser agree on what "upcoming" means at first paint. */
  renderedAt: string;
};

type AnyBlock = { blockType?: string | null };

const has = (blocks: AnyBlock[], type: string) => blocks.some((block) => block.blockType === type);

/** Loads only what the blocks on this page use, in the language of the page. */
export async function loadBlockData(blocks: AnyBlock[] | null | undefined, locale: Locale): Promise<BlockData> {
  const list = blocks ?? [];
  const [events, podcast] = await Promise.all([
    has(list, 'eventsCalendarPreview') ? cms.listEvents(locale) : [],
    // Forty episodes are plenty for "the latest" and for finding chosen ones by title.
    has(list, 'podcast') ? loadPodcast() : null,
  ]);
  return {
    events: events.map(toSiteEvent),
    episodes: podcast?.episodes.slice(0, 40) ?? [],
    renderedAt: new Date().toISOString(),
  };
}
