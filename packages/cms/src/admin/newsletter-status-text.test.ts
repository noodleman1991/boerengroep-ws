import { describe, expect, it } from 'vitest'
import { describeStatus, type NewsletterStatusData } from './newsletter-status-text'

const healthy: NewsletterStatusData = {
  off: false,
  key: { ok: true, account: 'Stichting Boerengroep' },
  list: { ok: true, id: 7, name: 'Newsletter', people: 212 },
  confirmation: [{ ok: true, languages: ['en', 'nl'], id: 3, name: 'Confirm your address' }],
}

const told = (status: NewsletterStatusData) => describeStatus(status).lines.map((l) => [l.tone, l.text])

describe('newsletter status in plain words', () => {
  it('says everything is fine when it is', () => {
    expect(told(healthy)).toEqual([
      ['good', 'The link with Brevo works. Account: Stichting Boerengroep.'],
      ['good', 'People who confirm their email go on the list "Newsletter" (number 7). It has 212 people.'],
      ['good', 'Someone who signs up gets the email "Confirm your address" (number 3) from Brevo.'],
      ['good', 'The sign-up box works. Someone who clicks the button in that email is on the list.'],
    ])
  })

  it('explains what to do when there is no key', () => {
    const { lines } = describeStatus({
      ...healthy,
      key: { ok: false, error: 'No Brevo API key is set for this site.' },
      list: { ok: false, error: 'The key has to work before the list can be checked.' },
      confirmation: [],
    })
    expect(lines).toHaveLength(1)
    expect(lines[0]).toMatchObject({ tone: 'problem', text: 'This site has no Brevo key yet, so nobody can sign up.' })
    expect(lines[0].detail).toContain('"SMTP & API"')
  })

  it('quotes Brevo when it refuses the key', () => {
    const { lines } = describeStatus({
      ...healthy,
      key: { ok: false, error: 'API Key is not enabled' },
      list: { ok: false, error: 'The key has to work before the list can be checked.' },
      confirmation: [],
    })
    expect(lines[0].text).toBe('Brevo does not accept the key of this site, so nobody can sign up.')
    expect(lines[0].detail).toContain('Brevo says: "API Key is not enabled".')
  })

  it('names the lists to choose from when the list is wrong', () => {
    const { lines } = describeStatus({
      ...healthy,
      list: {
        ok: false,
        error: 'There is no list with number 8 in this Brevo account.',
        available: [
          { id: 7, name: 'Newsletter', subscribers: 212 },
          { id: 9, name: 'Friends', subscribers: 1 },
        ],
      },
    })
    expect(lines[1]).toEqual({
      tone: 'problem',
      text: 'There is no list with number 8 in this Brevo account.',
      detail: 'Lists in this Brevo account: number 7 "Newsletter" (212 people), number 9 "Friends" (1 person).',
    })
    // Not everything is right, so the last line does not say the box works.
    expect(lines.at(-1)?.text).not.toContain('The sign-up box works')
  })

  it('says that nobody can sign up without a confirmation email, and names the emails to choose from', () => {
    const { lines } = describeStatus({
      ...healthy,
      confirmation: [{ ok: false, languages: ['en', 'nl'], problem: 'none' }],
      templates: [
        { id: 3, name: 'Confirm your address', active: true },
        { id: 4, name: 'Old welcome', active: false },
      ],
    })
    expect(lines[2]).toEqual({
      tone: 'problem',
      text: 'No confirmation email is chosen yet, so nobody can sign up.',
      detail:
        'Fill in its number under "Brevo confirmation email" below and save. Emails in this Brevo account: number 3 "Confirm your address", number 4 "Old welcome" (switched off).',
    })
    expect(lines).toHaveLength(3)
  })

  it.each([
    ['missing', undefined, 'There is no email with number 5 in this Brevo account, so nobody can sign up.'],
    ['off', 'Welcome', 'The email "Welcome" (number 5) is switched off in Brevo, so nobody receives it.'],
    ['no-button', 'Welcome', 'The email "Welcome" (number 5) has no button to confirm with, so nobody can get on the list.'],
  ] as const)('says what is wrong with the chosen email: %s', (problem, name, text) => {
    const { lines } = describeStatus({ ...healthy, confirmation: [{ ok: false, languages: ['en', 'nl'], problem, id: 5, name }] })
    expect(lines[2]).toMatchObject({ tone: 'problem', text })
  })

  it('says which language a line is about when the languages use different emails', () => {
    expect(
      told({
        ...healthy,
        confirmation: [
          { ok: true, languages: ['en'], id: 3, name: 'Confirm your address' },
          { ok: false, languages: ['nl'], problem: 'none' },
        ],
      }).slice(2),
    ).toEqual([
      ['good', 'English: Someone who signs up gets the email "Confirm your address" (number 3) from Brevo.'],
      ['problem', 'Dutch: No confirmation email is chosen yet, so nobody can sign up.'],
    ])
  })

  it('says first that a trial copy passes nobody on, and still tells whether all is ready', () => {
    const lines = told({ ...healthy, off: true })
    expect(lines[0]).toEqual(['attention', 'Emails are switched off on this copy of the website, so the sign-up box passes nobody to Brevo.'])
    expect(lines.at(-1)).toEqual(['plain', 'Everything is ready. On the real website, someone who clicks the button in that email is on the list.'])
  })
})
