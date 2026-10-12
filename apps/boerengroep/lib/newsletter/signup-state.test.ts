import { describe, expect, it } from 'vitest'
import { outcomeOf } from './signup-state'

describe('what the visitor sees after pressing subscribe', () => {
  it('thanks them when the confirmation email is on its way', () => {
    expect(outcomeOf(200)).toBe('thanks')
  })
  it('asks them to check the address when the server refuses it', () => {
    expect(outcomeOf(400)).toBe('invalid')
  })
  it('reports a problem for anything else', () => {
    for (const status of [429, 500, 502, 503]) expect(outcomeOf(status)).toBe('error')
  })
})
