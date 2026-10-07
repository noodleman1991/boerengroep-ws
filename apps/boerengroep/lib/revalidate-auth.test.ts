import { describe, expect, it } from 'vitest'
import { ownTags, secretMatches } from './revalidate-auth'

describe('secretMatches', () => {
  it('accepts the exact secret', () => {
    expect(secretMatches('abc123', 'abc123')).toBe(true)
  })
  it('rejects a wrong secret, including one of a different length', () => {
    expect(secretMatches('abc124', 'abc123')).toBe(false)
    expect(secretMatches('abc', 'abc123')).toBe(false)
  })
  it('rejects a missing header', () => {
    expect(secretMatches(null, 'abc123')).toBe(false)
  })
  it('rejects everything when no secret is configured', () => {
    expect(secretMatches('', undefined)).toBe(false)
    expect(secretMatches('', '')).toBe(false)
  })
})

describe('ownTags', () => {
  it('keeps only tags of this tenant', () => {
    expect(ownTags(['boerengroep:pages', 'inspringtheater:pages', 'boerengroep:events'], 'boerengroep')).toEqual([
      'boerengroep:pages',
      'boerengroep:events',
    ])
  })
  it('returns nothing for input that is not a list of strings', () => {
    expect(ownTags('boerengroep:pages', 'boerengroep')).toEqual([])
    expect(ownTags([1, null, { a: 1 }], 'boerengroep')).toEqual([])
    expect(ownTags(undefined, 'boerengroep')).toEqual([])
  })
  it('does not accept a tag that only starts with the tenant name', () => {
    expect(ownTags(['boerengroep-evil:pages'], 'boerengroep')).toEqual([])
  })
})
