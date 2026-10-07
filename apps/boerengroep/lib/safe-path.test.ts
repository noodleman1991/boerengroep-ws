import { describe, expect, it } from 'vitest'
import { isSafeInternalPath } from './safe-path'

describe('isSafeInternalPath', () => {
  it('accepts a normal site path', () => {
    expect(isSafeInternalPath('/nl/over-ons/geschiedenis')).toBe(true)
    expect(isSafeInternalPath('/en')).toBe(true)
  })
  it('rejects a missing value', () => {
    expect(isSafeInternalPath(null)).toBe(false)
    expect(isSafeInternalPath('')).toBe(false)
  })
  it('rejects an absolute URL', () => {
    expect(isSafeInternalPath('https://evil.example/x')).toBe(false)
  })
  it('rejects a protocol-relative URL', () => {
    expect(isSafeInternalPath('//evil.example/x')).toBe(false)
  })
  it('rejects a backslash trick that browsers treat as a host', () => {
    expect(isSafeInternalPath('/\\evil.example')).toBe(false)
  })
  it('rejects a path that does not start with a slash', () => {
    expect(isSafeInternalPath('nl/over-ons')).toBe(false)
  })
})
