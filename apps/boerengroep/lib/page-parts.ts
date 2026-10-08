import type { Page } from '@sites/cms/types';
import { hasRichText } from './rich-text-utils';

type Block = NonNullable<Page['blocks']>[number];
type Node = { type?: string; tag?: string; children?: Node[] };

/** True when text from the editor contains a main heading. */
function hasMainHeading(data: unknown): boolean {
  const walk = (node: Node | undefined): boolean =>
    Boolean(node) && ((node!.type === 'heading' && node!.tag === 'h1') || (node!.children ?? []).some(walk));
  return walk((data as { root?: Node } | null | undefined)?.root);
}

/** True when a text holds pictures and nothing else: a poster, a map, a scanned flyer. */
function isOnlyPictures(data: unknown): boolean {
  const nodes = (data as { root?: Node } | null | undefined)?.root?.children ?? [];
  const meaningful = nodes.filter((node) => node.type === 'upload' || hasRichText({ root: { children: [node] } }));
  return meaningful.length > 0 && meaningful.every((node) => node.type === 'upload');
}

/**
 * How a page is put together: the opening block first, then the page's own text, then the
 * other blocks. A page without any main heading gets its title as one, so every page has
 * exactly one place where it says what it is.
 */
export function pageParts(page: Pick<Page, 'title' | 'body' | 'blocks'>) {
  const blocks = (page.blocks ?? []) as Block[];
  const opensWithHero = blocks[0]?.blockType === 'hero';
  const showBody = hasRichText(page.body);
  const headed =
    blocks.some((block) => block.blockType === 'hero') ||
    hasMainHeading(page.body) ||
    blocks.some((block) => block.blockType === 'content' && hasMainHeading(block.body));
  return {
    lead: opensWithHero ? blocks.slice(0, 1) : [],
    rest: opensWithHero ? blocks.slice(1) : blocks,
    showBody,
    showTitle: !headed && Boolean(page.title),
    /** Nothing to show. Such a page lists its sub-pages. */
    empty: blocks.length === 0 && !showBody,
    /** The whole page is a picture. It is shown in the middle, under a centred title. */
    visualOnly: blocks.length === 0 && showBody && isOnlyPictures(page.body),
  };
}
