import type { Metadata } from 'next';

type Node = { type?: string; text?: unknown; children?: Node[] };
type Block = { blockType?: string; tagline?: string | null; description?: string | null; body?: unknown; content?: unknown };

const tidy = (text: string) => text.replace(/\s+/g, ' ').trim();

/** A text of at most `max` characters, cut at a word, with a mark when something was cut. */
export function shorten(text: string, max = 160): string {
  const clean = tidy(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const atWord = cut.lastIndexOf(' ');
  return `${(atWord > 0 ? cut.slice(0, atWord) : cut).replace(/[\s.,;:!?-]+$/, '')}…`;
}

/** The first paragraph of a text from the editor, as plain words. Headings are skipped. */
export function firstParagraph(data: unknown): string | undefined {
  const plain = (node: Node): string => (typeof node.text === 'string' ? node.text : (node.children ?? []).map(plain).join(''));
  for (const child of (data as { root?: Node } | null | undefined)?.root?.children ?? []) {
    if (child.type !== 'paragraph') continue;
    const text = tidy(plain(child));
    if (text) return text;
  }
  return undefined;
}

/**
 * One or two sentences that say what a page is about, taken from the page itself: the line
 * under the headline of its opening block, else its own text, else the first block with words.
 */
export function pageDescription(page: { body?: unknown; blocks?: Block[] | null }): string | undefined {
  const blocks = page.blocks ?? [];
  const tagline = blocks.find((block) => block.blockType === 'hero')?.tagline?.trim();
  if (tagline) return tagline;
  const own = firstParagraph(page.body);
  if (own) return own;
  for (const block of blocks) {
    const words = firstParagraph(block.body) ?? firstParagraph(block.content) ?? (block.blockType !== 'hero' ? block.description?.trim() : undefined);
    if (words) return words;
  }
  return undefined;
}

/**
 * What a page tells browsers, search engines and link previews about itself.
 * A part that is left out here falls back to the site-wide value from the layout.
 */
export function pageMeta(input: {
  /** The page's own title. Without one, the site-wide title stays. */
  title?: string | null;
  site: string;
  description?: string | null;
  /** The full address of the page. */
  url: string;
  image?: { url: string; alt?: string | null };
  type?: 'website' | 'article';
  /** False keeps the page out of search engines. */
  index?: boolean;
}): Metadata {
  const own = input.title?.trim() && input.title.trim() !== input.site ? input.title.trim() : undefined;
  const description = input.description?.trim() ? shorten(input.description) : undefined;
  const images = input.image ? [{ url: input.image.url, alt: input.image.alt ?? '' }] : undefined;
  return {
    ...(own ? { title: `${own} - ${input.site}` } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: input.url },
    openGraph: { type: input.type ?? 'website', title: own ?? input.site, description, url: input.url, siteName: input.site, images },
    twitter: { card: images ? 'summary_large_image' : 'summary', title: own ?? input.site, description, images: images?.map((image) => image.url) },
    ...(input.index === false ? { robots: { index: false, follow: false } } : {}),
  };
}
