import { describe, expect, it } from 'vitest'
import { emailFromEnv } from './cms-email'

describe('emailFromEnv', () => {
  it('returns the sender settings when the key and the address are set', () => {
    expect(
      emailFromEnv({ RESEND_BOERENGROEP: 're_123', FROM_EMAIL: 'info@boerengroep.nl', FROM_NAME: 'Boerengroep' }),
    ).toEqual({ apiKey: 're_123', fromAddress: 'info@boerengroep.nl', fromName: 'Boerengroep' })
  })
  it('falls back to a default sender name', () => {
    expect(emailFromEnv({ RESEND_BOERENGROEP: 're_123', FROM_EMAIL: 'info@boerengroep.nl' })?.fromName).toBe(
      'Stichting Boerengroep',
    )
  })
  it('returns nothing when the key or the address is missing, so local runs need no email setup', () => {
    expect(emailFromEnv({ FROM_EMAIL: 'info@boerengroep.nl' })).toBeUndefined()
    expect(emailFromEnv({ RESEND_BOERENGROEP: 're_123' })).toBeUndefined()
    expect(emailFromEnv({ RESEND_BOERENGROEP: '  ', FROM_EMAIL: 'info@boerengroep.nl' })).toBeUndefined()
  })
})
