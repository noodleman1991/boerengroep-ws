/** A block the new site adds to an imported page, because the old site had no such block. */
export type AddedBlock = {
  /** The kind of block to put it after, for example `eventsCalendarPreview`. Without it, or when the page has none, it goes at the end. */
  after?: string
  block: Record<string, unknown> & { blockType: string }
}

/**
 * A page's blocks with the added ones in place. Blocks added after the same kind keep the
 * order they were written in. A page that already has a block of an added kind is left as it is
 * for that kind, so running the import twice never doubles a block.
 */
export function withAddedBlocks(blocks: Record<string, unknown>[], additions: AddedBlock[]): Record<string, unknown>[] {
  const out = [...blocks]
  // How many blocks were already placed after each anchor, so the next one follows them.
  const placed = new Map<number, number>()
  for (const { after, block } of additions) {
    if (blocks.some((existing) => existing.blockType === block.blockType)) continue
    const anchor = after === undefined ? -1 : blocks.findIndex((existing) => existing.blockType === after)
    if (anchor === -1) {
      out.push(block)
      continue
    }
    const before = [...placed].filter(([index]) => index < anchor).reduce((sum, [, count]) => sum + count, 0)
    const here = placed.get(anchor) ?? 0
    out.splice(anchor + 1 + before + here, 0, block)
    placed.set(anchor, here + 1)
  }
  return out
}
