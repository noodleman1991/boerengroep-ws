import { describe, expect, it } from 'vitest'
import { hintOf, isSealed, seal, unseal } from './secrets'

describe('keys kept in the settings', () => {
  it('come back as they went in, with the same secret', () => {
    const sealed = seal('xkeysib-abc123', 'the-secret')
    expect(isSealed(sealed)).toBe(true)
    expect(sealed).not.toContain('xkeysib')
    expect(unseal(sealed, 'the-secret')).toBe('xkeysib-abc123')
  })
  it('look different every time, also for the same key', () => {
    expect(seal('same', 's')).not.toBe(seal('same', 's'))
  })
  it('cannot be read with another secret', () => {
    expect(unseal(seal('xkeysib-abc123', 'the-secret'), 'another-secret')).toBeUndefined()
  })
  it('cannot be read after someone changed them', () => {
    const sealed = seal('xkeysib-abc123', 'the-secret')
    const changed = `${sealed.slice(0, -3)}${sealed.endsWith('AAA') ? 'BBB' : 'AAA'}`
    expect(unseal(changed, 'the-secret')).toBeUndefined()
  })
  it('give nothing for a text that was never locked', () => {
    expect(unseal('xkeysib-abc123', 's')).toBeUndefined()
    expect(unseal(null, 's')).toBeUndefined()
    expect(unseal('sealed:v1:broken', 's')).toBeUndefined()
  })
  it('are recognised by their last four characters', () => {
    expect(hintOf('xkeysib-abc123')).toBe('…c123')
  })
})
