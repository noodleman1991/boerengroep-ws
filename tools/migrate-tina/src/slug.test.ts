import { describe, expect, it } from 'vitest'
import { fileSlug, pageSlug, uniqueSlug } from './slug'

describe('fileSlug', () => {
  it('uses the file name without folder or extension and keeps capitals', () => {
    expect(fileSlug('events/en/Boerengroep-Break-Samhain.mdx')).toBe('Boerengroep-Break-Samhain')
  })
  it('replaces characters that are not allowed in a URL segment', () => {
    expect(fileSlug('events/en/What is this?.mdx')).toBe('What-is-this')
  })
  it('keeps repeated hyphens that exist in current URLs', () => {
    expect(fileSlug('events/en/Critical-Perspectives-at-WUR---Meet-Greet--Chill.mdx')).toBe(
      'Critical-Perspectives-at-WUR---Meet-Greet--Chill',
    )
  })
})

describe('pageSlug', () => {
  it('leaves a valid segment alone', () => {
    expect(pageSlug('over-ons')).toBe('over-ons')
  })
  it('lowercases and collapses separators', () => {
    expect(pageSlug('About_Us  Page')).toBe('about-us-page')
  })
  it('keeps digits', () => {
    expect(pageSlug('50-years-bg')).toBe('50-years-bg')
  })
})

describe('uniqueSlug', () => {
  it('uses the address as it is when it is free', () => {
    const used = new Set<string>()
    expect(uniqueSlug('boerengroep-break-2025-10-30', 'en', used)).toBe('boerengroep-break-2025-10-30')
    expect(used.has('boerengroep-break-2025-10-30')).toBe(true)
  })
  it('adds the language when the same event exists in both', () => {
    const used = new Set(['boerengroep-break-2025-10-30'])
    expect(uniqueSlug('boerengroep-break-2025-10-30', 'nl', used)).toBe('boerengroep-break-2025-10-30-nl')
  })
  it('counts up when the language does not help', () => {
    const used = new Set(['x', 'x-en'])
    expect(uniqueSlug('x', 'en', used)).toBe('x-2')
    expect(uniqueSlug('x', undefined, used)).toBe('x-3')
  })
})
