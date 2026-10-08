import type { Event, Media, Newsletter, Page, PastEvent, SpotlightBlock, Vacancy } from '@sites/cms/types';
import { mediaUrl } from './cms-adapters';
import { toNewsCard } from './news';
import { firstParagraph, pageDescription, shorten } from './page-meta';
import { vacancyAnchor } from './vacancies';

type Row = NonNullable<SpotlightBlock['items']>[number];
export type SpotlightKind = Row['what']['relationTo'];

/** Something an editor put in the spotlight, as the page shows it. */
export type SpotlightCard = {
  key: string;
  kind: SpotlightKind;
  href: string;
  /** True when it leads to another website. */
  external: boolean;
  title: string;
  text?: string;
  picture?: string;
  /** The day of an event, a story or a news item. */
  date?: string;
  /** The language it is written in, when that is known and the editor did not write their own words. */
  language?: 'en' | 'nl';
  buttonLabel?: string;
};

type Found = Pick<SpotlightCard, 'href' | 'title'> & Partial<Pick<SpotlightCard, 'external' | 'text' | 'date' | 'language'>> & { picture?: number | Media | null };

/** The first picture on a page: the one of its opening block, else of a picture with text. */
function pagePicture(page: Page): number | Media | null | undefined {
  for (const block of page.blocks ?? []) {
    if ((block.blockType === 'hero' || block.blockType === 'imageText') && block.image?.src) return block.image.src;
  }
  return undefined;
}

function find(what: Row['what']): Found | null {
  const value = what.value;
  // A number means the thing was removed or could not be loaded.
  if (!value || typeof value !== 'object') return null;
  // A page or news item that is not published yet must not show up through the back door.
  if ('_status' in value && value._status === 'draft') return null;
  switch (what.relationTo) {
    case 'pages': {
      const page = value as Page;
      return page.path ? { href: page.path, title: page.title, text: pageDescription(page as never), picture: pagePicture(page) } : null;
    }
    case 'events': {
      const event = value as Event;
      if (!event.slug) return null;
      return { href: `/activities/calendar/${event.slug}`, title: event.title, text: event.description ?? undefined, picture: event.image, date: event.startDate, language: event.language ?? undefined };
    }
    case 'newsletters': {
      const item = value as Newsletter;
      const card = toNewsCard(item);
      return card && { href: card.href, external: card.external, title: card.title, text: card.summary, picture: item.featuredImage, date: card.date, language: card.language };
    }
    case 'past-events': {
      const story = value as PastEvent;
      return { href: `/activities/past-events/${story.slug}`, title: story.title, text: firstParagraph(story.excerpt), picture: story.heroImg, date: story.date, language: story.language ?? undefined };
    }
    case 'vacancies': {
      const vacancy = value as Vacancy;
      return { href: `/vacancies#${vacancyAnchor(vacancy)}`, title: vacancy.title, text: firstParagraph(vacancy.description) };
    }
    default:
      return null;
  }
}

/**
 * The cards of a spotlight block. Title, text and picture come from the thing itself, unless
 * the editor wrote their own. Something that was removed or is not published is left out.
 */
export function spotlightCards(items: SpotlightBlock['items']): SpotlightCard[] {
  const cards: SpotlightCard[] = [];
  (items ?? []).forEach((row, index) => {
    const found = row?.what ? find(row.what) : null;
    if (!found) return;
    const ownWords = Boolean(row.title?.trim() || row.text?.trim());
    const text = row.text?.trim() || found.text?.trim();
    cards.push({
      key: row.id ?? String(index),
      kind: row.what.relationTo,
      href: found.href,
      external: found.external ?? false,
      title: row.title?.trim() || found.title,
      text: text ? shorten(text, 220) : undefined,
      picture: mediaUrl(row.picture, 'card') ?? mediaUrl(found.picture, 'card'),
      date: found.date,
      // The editor's own words are in the language of the page.
      language: ownWords ? undefined : found.language,
      buttonLabel: row.buttonLabel?.trim() || undefined,
    });
  });
  return cards;
}
