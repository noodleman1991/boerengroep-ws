import { describe, expect, it } from 'vitest'
import { createRateLimiter, looksLikeSpam, validateSubmission, type FormField } from './forms'

const fields: FormField[] = [
  { blockType: 'text', name: 'name', label: 'Your name', required: true },
  { blockType: 'email', name: 'email', label: 'Email', required: true },
  { blockType: 'select', name: 'size', label: 'Size', required: true, options: [{ label: 'Small', value: 's' }, { label: 'Large', value: 'l' }] },
  { blockType: 'number', name: 'amount', label: 'How many' },
  { blockType: 'textarea', name: 'note', label: 'Anything else' },
  { blockType: 'checkbox', name: 'agree', label: 'I will pay on pick-up', required: true },
  { blockType: 'message' },
]
const good = { name: ' Anna ', email: 'Anna@Example.org', size: 'l', amount: '2', note: '', agree: true }

describe('what someone filled in on a form', () => {
  it('accepts a complete answer and tidies it', () => {
    expect(validateSubmission(fields, good)).toEqual({
      ok: true,
      data: [
        { field: 'name', value: 'Anna' },
        { field: 'email', value: 'anna@example.org' },
        { field: 'size', value: 'l' },
        { field: 'amount', value: '2' },
        { field: 'note', value: '' },
        { field: 'agree', value: 'yes' },
      ],
    })
  })

  it('points at every question that still needs an answer', () => {
    expect(validateSubmission(fields, {})).toEqual({
      ok: false,
      errors: { name: 'required', email: 'required', size: 'required', agree: 'required' },
    })
  })

  it('checks that an email is an email, a number a number, and a choice one of the choices', () => {
    expect(validateSubmission(fields, { ...good, email: 'anna-at-example', amount: 'two', size: 'xxl' })).toEqual({
      ok: false,
      errors: { email: 'email', amount: 'number', size: 'choice' },
    })
  })

  it('ignores anything that is not a question of this form', () => {
    const result = validateSubmission(fields, { ...good, admin: 'true', tenant: 99 })
    expect(result.ok && result.data.some((row) => row.field === 'admin' || row.field === 'tenant')).toBe(false)
  })

  it('refuses a book in a text field', () => {
    expect(validateSubmission(fields, { ...good, name: 'x'.repeat(501) })).toEqual({ ok: false, errors: { name: 'too-long' } })
    expect(validateSubmission(fields, { ...good, note: 'x'.repeat(5001) })).toEqual({ ok: false, errors: { note: 'too-long' } })
  })

  it('does not accept a list or an object where text belongs', () => {
    expect(validateSubmission(fields, { ...good, name: ['a', 'b'] })).toEqual({ ok: false, errors: { name: 'required' } })
  })

  it('records an unticked optional checkbox as no', () => {
    const optional: FormField[] = [{ blockType: 'checkbox', name: 'news', label: 'Send me news' }]
    expect(validateSubmission(optional, {})).toEqual({ ok: true, data: [{ field: 'news', value: 'no' }] })
  })
})

describe('spam', () => {
  it('is a filled-in trap field, or an answer faster than a person can type', () => {
    expect(looksLikeSpam({ trap: 'http://spam.example', elapsedMs: 60_000 })).toBe(true)
    expect(looksLikeSpam({ trap: '', elapsedMs: 300 })).toBe(true)
    expect(looksLikeSpam({ trap: '', elapsedMs: 4_000 })).toBe(false)
    expect(looksLikeSpam({ trap: undefined, elapsedMs: undefined })).toBe(false)
  })
})

describe('rate limit', () => {
  it('allows a few answers per address and then asks to wait', () => {
    let time = 0
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000, now: () => time })
    expect([1, 2, 3, 4].map(() => limiter.allow('1.2.3.4'))).toEqual([true, true, true, false])
    expect(limiter.allow('5.6.7.8')).toBe(true)
    time = 61_000
    expect(limiter.allow('1.2.3.4')).toBe(true)
  })

  it('does not grow without end', () => {
    let time = 0
    const limiter = createRateLimiter({ limit: 1, windowMs: 1_000, now: () => time })
    for (let i = 0; i < 500; i++) limiter.allow(`ip-${i}`)
    time = 5_000
    limiter.allow('fresh')
    expect(limiter.size()).toBe(1)
  })
})
