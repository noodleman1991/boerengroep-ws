import { describe, expect, it } from 'vitest'
import { outlineHeadings } from './heading-outline'

const h = (tag: string, text = 'x') => ({ type: 'heading', tag, children: [{ type: 'text', text }] })
const p = () => ({ type: 'paragraph', children: [{ type: 'text', text: 'x' }] })
const doc = (...children: unknown[]) => ({ root: { type: 'root', children } })
const levels = (data: unknown) =>
  ((data as { root: { children: { type: string; tag?: string; look?: string }[] } }).root.children)
    .filter((node) => node.type === 'heading')
    .map((node) => `${node.tag}${node.look && node.look !== node.tag ? `(${node.look})` : ''}`)

describe('headings an editor chose for their size', () => {
  it('start right under the heading above the text, whatever size was picked', () => {
    expect(levels(outlineHeadings(doc(h('h6'), p(), h('h6'), p()), 2))).toEqual(['h2(h6)', 'h2(h6)'])
    expect(levels(outlineHeadings(doc(h('h3'), p()), 2))).toEqual(['h2(h3)'])
  })

  it('go one level down at a time, never skipping one', () => {
    expect(levels(outlineHeadings(doc(h('h2'), h('h5'), h('h6'), h('h5'), h('h2')), 2))).toEqual(['h2', 'h3(h5)', 'h4(h6)', 'h3(h5)', 'h2'])
  })

  it('keep a text that was already in order as it is', () => {
    expect(levels(outlineHeadings(doc(h('h2'), h('h3'), h('h3'), h('h2')), 2))).toEqual(['h2', 'h3', 'h3', 'h2'])
  })

  it('can start deeper, for a text under a smaller heading, and stop at the deepest level there is', () => {
    expect(levels(outlineHeadings(doc(h('h2'), h('h3'), h('h4')), 5))).toEqual(['h5(h2)', 'h6(h3)', 'h6(h4)'])
  })

  it('never makes a second main heading out of one in a text', () => {
    expect(levels(outlineHeadings(doc(h('h1'), h('h2')), 2))).toEqual(['h2(h1)', 'h3(h2)'])
  })

  it('leaves everything else untouched and does not change what it was given', () => {
    const before = doc(h('h6'), p())
    const copy = JSON.parse(JSON.stringify(before))
    const after = outlineHeadings(before, 2) as typeof before
    expect(before).toEqual(copy)
    expect(after.root.children[1]).toEqual(before.root.children[1])
    expect(outlineHeadings(null, 2)).toBeNull()
    expect(outlineHeadings({ notADocument: true }, 2)).toEqual({ notADocument: true })
  })
})
