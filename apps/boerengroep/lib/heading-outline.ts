/**
 * Editors pick a heading by how big it looks: a small "heading 6" for a modest title, say.
 * Screen readers, however, use the levels as the outline of the page, and a page that jumps
 * from its title to a level-6 heading has a broken outline.
 *
 * So the two are separated. The level an editor picked becomes the look (`look`), and the
 * level in the page (`tag`) is worked out here: the first heading of a text sits right under
 * the heading above the text, and each deeper heading goes one level down, never more.
 */
type Node = { type?: string; tag?: string; look?: string; children?: unknown[]; [key: string]: unknown };

const rank = (tag: string | undefined) => {
  const level = Number(tag?.replace(/^h/i, ''));
  return Number.isInteger(level) && level >= 1 && level <= 6 ? level : 2;
};

/**
 * @param base  The level of the first heading in the text: one below the heading above it.
 *              2 for a text directly under the title of the page.
 */
export function outlineHeadings<T>(data: T, base: number): T {
  const root = (data as { root?: Node } | null)?.root;
  if (!root || !Array.isArray(root.children)) return data;
  // What is open above the current heading: the size the editor picked, and the level it got.
  const open: { picked: number; level: number }[] = [];
  const children = (root.children as Node[]).map((node) => {
    if (node?.type !== 'heading') return node;
    const picked = rank(node.tag);
    while (open.length > 0 && open[open.length - 1]!.picked >= picked) open.pop();
    const level = Math.min(6, open.length > 0 ? open[open.length - 1]!.level + 1 : Math.min(6, Math.max(2, base)));
    open.push({ picked, level });
    return { ...node, tag: `h${level}`, look: `h${picked}` };
  });
  return { ...(data as object), root: { ...root, children } } as T;
}
