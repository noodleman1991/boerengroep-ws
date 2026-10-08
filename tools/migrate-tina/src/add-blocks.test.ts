import { describe, expect, it } from 'vitest'
import { withAddedBlocks } from './add-blocks'

const kinds = (blocks: Record<string, unknown>[]) => blocks.map((block) => block.blockType)
const home = [{ blockType: 'hero' }, { blockType: 'eventsCalendarPreview' }, { blockType: 'callout' }, { blockType: 'cta' }]

describe('blocks the new site adds to an imported page', () => {
  it('puts a block after the first block of the named kind', () => {
    expect(kinds(withAddedBlocks(home, [{ after: 'eventsCalendarPreview', block: { blockType: 'newsPreview' } }]))).toEqual([
      'hero', 'eventsCalendarPreview', 'newsPreview', 'callout', 'cta',
    ])
  })
  it('places several, each after its own kind, whatever order they are written in', () => {
    const added = withAddedBlocks(home, [
      { after: 'callout', block: { blockType: 'vacanciesPreview' } },
      { after: 'eventsCalendarPreview', block: { blockType: 'newsPreview' } },
    ])
    expect(kinds(added)).toEqual(['hero', 'eventsCalendarPreview', 'newsPreview', 'callout', 'vacanciesPreview', 'cta'])
  })
  it('keeps the written order for blocks that go after the same kind', () => {
    const added = withAddedBlocks(home, [
      { after: 'hero', block: { blockType: 'newsPreview' } },
      { after: 'hero', block: { blockType: 'spotlight' } },
    ])
    expect(kinds(added)).toEqual(['hero', 'newsPreview', 'spotlight', 'eventsCalendarPreview', 'callout', 'cta'])
  })
  it('puts a block at the end when no kind is named or the page has none of it', () => {
    expect(kinds(withAddedBlocks(home, [{ block: { blockType: 'newsPreview' } }, { after: 'gallery', block: { blockType: 'spotlight' } }]))).toEqual([
      'hero', 'eventsCalendarPreview', 'callout', 'cta', 'newsPreview', 'spotlight',
    ])
  })
  it('does not add a kind of block the page already has', () => {
    expect(withAddedBlocks(home, [{ after: 'hero', block: { blockType: 'cta' } }])).toEqual(home)
  })
  it('leaves the page it was given untouched', () => {
    const before = [...home]
    withAddedBlocks(home, [{ after: 'hero', block: { blockType: 'newsPreview' } }])
    expect(home).toEqual(before)
  })
})
