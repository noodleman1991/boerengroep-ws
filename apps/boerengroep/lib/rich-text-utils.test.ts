import { describe, expect, it } from 'vitest'
import { hasRichText } from './rich-text-utils'

const state = (children: unknown[]) => ({ root: { type: 'root', children } })
const paragraph = (...children: unknown[]) => ({ type: 'paragraph', children })
const text = (value: string) => ({ type: 'text', text: value })

describe('hasRichText', () => {
  it('is false for a missing value', () => {
    expect(hasRichText(null)).toBe(false)
    expect(hasRichText(undefined)).toBe(false)
  })
  it('is false for an editor state with no nodes', () => {
    expect(hasRichText(state([]))).toBe(false)
  })
  it('is false for paragraphs that hold only whitespace', () => {
    expect(hasRichText(state([paragraph(text('   ')), paragraph()]))).toBe(false)
  })
  it('is true when any paragraph has text', () => {
    expect(hasRichText(state([paragraph(), paragraph(text('Join the board'))]))).toBe(true)
  })
  it('finds text nested in a link inside a list', () => {
    const link = { type: 'link', children: [text('Register here')] }
    const list = { type: 'list', children: [{ type: 'listitem', children: [link] }] }
    expect(hasRichText(state([list]))).toBe(true)
  })
  it('counts an embedded upload or block as content', () => {
    expect(hasRichText(state([{ type: 'upload', value: 3 }]))).toBe(true)
    expect(hasRichText(state([{ type: 'block', fields: {} }]))).toBe(true)
  })
  it('is false for something that is not an editor state', () => {
    expect(hasRichText('plain string')).toBe(false)
    expect(hasRichText({ children: [paragraph(text('old Tina shape'))] })).toBe(false)
  })
})
