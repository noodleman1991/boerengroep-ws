import { describe, expect, it } from 'vitest'
import { emailFromEnv, mailKey } from './cms-email'

describe('emailFromEnv', () => {
  it('returns the sender settings when the key and the address are set', () => {
    expect(
      emailFromEnv({ RESEND_BOERENGROEP: 're_123', FROM_EMAIL: 'info@boerengroep.nl', FROM_NAME: 'Boerengroep' }, 'Site name'),
    ).toEqual({ apiKey: 're_123', fromAddress: 'info@boerengroep.nl', fromName: 'Boerengroep' })
  })
  it('falls back to the name of the site as the sender', () => {
    expect(emailFromEnv({ RESEND_BOERENGROEP: 're_123', FROM_EMAIL: 'info@boerengroep.nl' }, 'Stichting Boerengroep')?.fromName).toBe(
      'Stichting Boerengroep',
    )
    expect(emailFromEnv({ RESEND_BOERENGROEP: 're_123', FROM_EMAIL: 'info@example.org' }, 'Inspringtheater')?.fromName).toBe('Inspringtheater')
  })
  it('returns nothing when the key or the address is missing, so local runs need no email setup', () => {
    expect(emailFromEnv({ FROM_EMAIL: 'info@boerengroep.nl' }, 'x')).toBeUndefined()
    expect(emailFromEnv({ RESEND_BOERENGROEP: 're_123' }, 'x')).toBeUndefined()
    expect(emailFromEnv({ RESEND_BOERENGROEP: '  ', FROM_EMAIL: 'info@boerengroep.nl' }, 'x')).toBeUndefined()
  })

  it('sends nothing when emails are switched off, whatever keys are set', () => {
    const env = { RESEND_API_KEY: 're_real', RESEND_BOERENGROEP: 're_old', FROM_EMAIL: 'info@example.org', EMAILS_OFF: '1' }
    expect(mailKey(env)).toBeUndefined()
    expect(emailFromEnv(env, 'Site')).toBeUndefined()
  })

  it('prefers the new name of the key and still reads the old one', () => {
    expect(mailKey({ RESEND_API_KEY: ' re_new ', RESEND_BOERENGROEP: 're_old' })).toBe('re_new')
    expect(mailKey({ RESEND_BOERENGROEP: 're_old' })).toBe('re_old')
    expect(mailKey({})).toBeUndefined()
  })
})
