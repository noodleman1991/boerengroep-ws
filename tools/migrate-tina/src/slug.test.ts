import { describe, expect, it } from 'vitest'
import { fileSlug, pageSlug } from './slug'

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
