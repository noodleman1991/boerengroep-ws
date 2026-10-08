import type { Newsletter } from '@sites/cms/types';
import { mediaUrl } from './cms-adapters';
import { firstParagraph, shorten } from './page-meta';

/** Whether a news item is the organisation's own, as opposed to news from friends. */
export function isOwnNews(organization: string | null | undefined): boolean {
  // 'Inspiratietheater' is how the previous site spelled it. Items imported from it keep that value.
  return organization === 'Boerengroep' || organization === 'Inspringtheater' || organization === 'Inspiratietheater';
}

/** The address of a news item written on the site. The organisation's own news and news from friends have separate lists. */
export function newsItemPath(item: { slug: string; organization: string }): string {
  return `${isOwnNews(item.organization) ? '/news/newsletter' : '/news/friends-news'}/${item.slug}`;
}

/** A news item as a short card on a page. */
export type NewsCard = {
  id: string;
  title: string;
  /** On this site, or the other website for an item that only links elsewhere. */
  href: string;
  external: boolean;
  /** When it was published, as the editor set it. */
  date: string;
  own: boolean;
  /** Marked "in the spotlight" by an editor. */
  featured: boolean;
  summary?: string;
  picture?: string;
  /** The language it is written in, when that is known. */
  language?: 'en' | 'nl';
};

type NewsSource = Pick<Newsletter, 'id' | 'title' | 'slug' | 'type' | 'organization' | 'publishDate'> &
  Partial<Pick<Newsletter, 'externalLink' | 'linkDescription' | 'excerpt' | 'featuredImage' | 'featured' | 'language'>>;

/** What a card needs out of a news item. An item that links elsewhere and has no link yet is left out. */
export function toNewsCard(item: NewsSource): NewsCard | null {
  const elsewhere = item.type === 'link';
  const link = item.externalLink?.trim();
  if (elsewhere && !link) return null;
  const summary = firstParagraph(item.excerpt) ?? item.linkDescription?.trim();
  return {
    id: String(item.id),
    title: item.title,
    href: elsewhere ? link! : newsItemPath({ slug: item.slug, organization: item.organization }),
    external: elsewhere,
    date: item.publishDate,
    own: isOwnNews(item.organization),
    featured: Boolean(item.featured),
    summary: summary ? shorten(summary, 180) : undefined,
    picture: mediaUrl(item.featuredImage, 'card'),
    language: item.language ?? undefined,
  };
}

/**
 * The news a page shows: the newest first. With `spotlightFirst`, the newest item an editor
 * put in the spotlight leads and the others follow by date. `count` is the lead included.
 */
export function latestNews(
  cards: NewsCard[],
  options: { which?: 'all' | 'own' | 'friends' | null; count?: number | null; spotlightFirst?: boolean | null },
): { lead?: NewsCard; rest: NewsCard[] } {
  const which = options.which ?? 'all';
  const count = Math.max(1, options.count ?? 3);
  const wanted = cards
    .filter((card) => which === 'all' || (which === 'own') === card.own)
    .sort((a, b) => b.date.localeCompare(a.date));
  const lead = options.spotlightFirst === false ? undefined : wanted.find((card) => card.featured);
  const rest = wanted.filter((card) => card !== lead).slice(0, lead ? count - 1 : count);
  return { lead, rest };
}
