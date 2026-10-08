import { XMLParser } from 'fast-xml-parser';

/** The podcast as the site shows it. Dates are text, so the data can travel from server to browser. */
export type Episode = {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  audioType: string;
  audioLength: number;
  duration: string;
  pubDate: string;
  image: string;
  episodeNumber: string;
  seasonNumber: string;
  episodeType: string;
  explicit: boolean;
  spotifyUrl: string;
  applePodcastsUrl: string;
};

export type Podcast = {
  title: string;
  description: string;
  image: string;
  author: string;
  link: string;
  language: string;
  episodes: Episode[];
};

const text = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const raw = typeof value === 'object' ? ((value as { '#text'?: unknown })['#text'] ?? '') : value;
  return String(raw)
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

const isoDate = (value: unknown): string => {
  const date = new Date(String(value ?? ''));
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
};

/** Reads a podcast feed. Episodes come back newest first. */
export function parsePodcastFeed(xml: string): Podcast {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', parseAttributeValue: false, trimValues: true });
  const channel = parser.parse(xml)?.rss?.channel;
  if (!channel) throw new Error('This address is not a podcast feed');

  const cover = channel['itunes:image']?.['@_href'] || channel.image?.url || '';
  const items: any[] = channel.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : [];

  const episodes = items.map((item, index): Episode => {
    const title = text(item.title) || 'Untitled episode';
    return {
      id: text(item.guid) || `episode-${index}`,
      title,
      description: text(item.description),
      audioUrl: item.enclosure?.['@_url'] || '',
      audioType: item.enclosure?.['@_type'] || 'audio/mpeg',
      audioLength: Number.parseInt(item.enclosure?.['@_length'] ?? '', 10) || 0,
      duration: text(item['itunes:duration']),
      pubDate: isoDate(item.pubDate),
      image: item['itunes:image']?.['@_href'] || cover,
      episodeNumber: text(item['itunes:episode']),
      seasonNumber: text(item['itunes:season']),
      episodeType: text(item['itunes:episodeType']) || 'full',
      explicit: text(item['itunes:explicit']) === 'true',
      spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(title)}`,
      applePodcastsUrl: `https://podcasts.apple.com/search?term=${encodeURIComponent(title)}`,
    };
  });
  episodes.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return {
    title: text(channel.title) || 'Podcast',
    description: text(channel.description),
    image: cover,
    author: text(channel['itunes:author']),
    link: text(channel.link),
    language: text(channel.language) || 'en',
    episodes,
  };
}

/** The episodes a block shows: the latest ones, or the ones whose title contains the editor's words. */
export function pickEpisodes(
  episodes: Episode[],
  options: { mode: 'latest'; count: number } | { mode: 'picked'; matches: string[] },
): Episode[] {
  if (options.mode === 'latest') return episodes.slice(0, options.count);
  const picked: Episode[] = [];
  for (const words of options.matches) {
    const wanted = words.trim().toLowerCase();
    if (!wanted) continue;
    const found = episodes.find((episode) => episode.title.toLowerCase().includes(wanted));
    if (found && !picked.includes(found)) picked.push(found);
  }
  return picked;
}

const EMPTY: Podcast = { title: 'Podcast', description: '', image: '', author: '', link: '', language: 'en', episodes: [] };

/**
 * The podcast from the feed set in PODCAST_RSS_URL, kept for an hour.
 * A feed that cannot be reached gives an empty podcast, so a page never breaks over it.
 */
export async function loadPodcast(): Promise<Podcast> {
  const address = process.env.PODCAST_RSS_URL;
  if (!address) return EMPTY;
  try {
    const response = await fetch(address, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`The podcast feed answered ${response.status}`);
    return parsePodcastFeed(await response.text());
  } catch (error) {
    console.error('[podcast]', error instanceof Error ? error.message : error);
    return EMPTY;
  }
}
