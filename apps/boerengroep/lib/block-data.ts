import { cms } from '@/lib/cms';
import { toSiteEvent } from '@/lib/cms-adapters';
import type { SiteEvent } from '@/lib/events/types';

/** What blocks on a page need besides their own fields. Loaded on the server, read by the blocks. */
export type BlockData = {
  events: SiteEvent[];
  /** When the page was built, so server and browser agree on what "upcoming" means at first paint. */
  renderedAt: string;
};

type AnyBlock = { blockType?: string | null };

const needsEvents = (blocks: AnyBlock[]) => blocks.some((block) => block.blockType === 'eventsCalendarPreview');

/** Loads only what the blocks on this page use. */
export async function loadBlockData(blocks: AnyBlock[] | null | undefined): Promise<BlockData> {
  const list = blocks ?? [];
  return {
    events: needsEvents(list) ? (await cms.listEvents()).map(toSiteEvent) : [],
    renderedAt: new Date().toISOString(),
  };
}
