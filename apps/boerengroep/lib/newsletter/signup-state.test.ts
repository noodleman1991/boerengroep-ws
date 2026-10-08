import { describe, expect, it } from 'vitest'
import { outcomeOf } from './signup-state'

describe('what the visitor sees after pressing subscribe', () => {
  it('thanks them when the confirmation email is on its way', () => {
    expect(outcomeOf(200, { status: 'pending' })).toBe('thanks')
    expect(outcomeOf(200, {})).toBe('thanks')
  })
  it('tells them when they were on the list already', () => {
    expect(outcomeOf(200, { status: 'already' })).toBe('already')
  })
  it('asks them to check the address when the server refuses it', () => {
    expect(outcomeOf(400, { error: 'Please use a valid email address' })).toBe('invalid')
  })
  it('reports a problem for anything else, also an unreadable answer', () => {
    expect(outcomeOf(500, { error: 'boom' })).toBe('error')
    expect(outcomeOf(502, null)).toBe('error')
    expect(outcomeOf(429, undefined)).toBe('error')
  })
})
