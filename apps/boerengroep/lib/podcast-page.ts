import type { Podcast } from './podcast';

/** One page of episodes, in the shape the podcast page and its "load more" button read. */
export function podcastPage(podcast: Podcast, limit: number, offset: number) {
  const size = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 50) : 10;
  const from = Number.isFinite(offset) && offset > 0 ? Math.floor(offset) : 0;
  return {
    ...podcast,
    totalEpisodes: podcast.episodes.length,
    hasMore: from + size < podcast.episodes.length,
    episodes: podcast.episodes.slice(from, from + size),
  };
}
