import { describe, expect, it } from 'vitest'
import { checkPreview, signPreview } from './preview'

const now = Date.parse('2026-10-08T12:00:00.000Z')
const secret = 'shared-between-the-admin-and-the-site'

describe('a preview link for the other site', () => {
  it('is accepted by the site that shares the secret', () => {
    const { exp, sig } = signPreview('/en/about-us', secret, now)
    expect(checkPreview({ path: '/en/about-us', exp: String(exp), sig, secret, now })).toBe(true)
  })

  it('is refused for another page, with another secret, or when the signature was changed', () => {
    const { exp, sig } = signPreview('/en/about-us', secret, now)
    expect(checkPreview({ path: '/en/contact', exp: String(exp), sig, secret, now })).toBe(false)
    expect(checkPreview({ path: '/en/about-us', exp: String(exp), sig, secret: 'another', now })).toBe(false)
    expect(checkPreview({ path: '/en/about-us', exp: String(exp), sig: `${sig.slice(0, -1)}0`, secret, now })).toBe(false)
    expect(checkPreview({ path: '/en/about-us', exp: String(exp + 60_000), sig, secret, now })).toBe(false)
  })

  it('stops working after half a day', () => {
    const { exp, sig } = signPreview('/en', secret, now)
    expect(checkPreview({ path: '/en', exp: String(exp), sig, secret, now: now + 11 * 3600_000 })).toBe(true)
    expect(checkPreview({ path: '/en', exp: String(exp), sig, secret, now: now + 13 * 3600_000 })).toBe(false)
  })

  it('is refused when anything is missing, also the site’s own secret', () => {
    const { exp, sig } = signPreview('/en', secret, now)
    expect(checkPreview({ path: '/en', exp: null, sig, secret, now })).toBe(false)
    expect(checkPreview({ path: '/en', exp: String(exp), sig: null, secret, now })).toBe(false)
    expect(checkPreview({ path: '/en', exp: String(exp), sig, secret: undefined, now })).toBe(false)
    expect(checkPreview({ path: '/en', exp: 'soon', sig, secret, now })).toBe(false)
  })
})
