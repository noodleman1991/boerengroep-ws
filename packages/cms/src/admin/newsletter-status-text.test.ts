import { describe, expect, it } from 'vitest'
import { describeStatus, type NewsletterStatusData } from './newsletter-status-text'

const healthy: NewsletterStatusData = {
  key: { ok: true, account: 'Stichting Boerengroep' },
  list: { ok: true, id: 7, name: 'Newsletter', people: 212 },
  site: { confirmed: 198, waiting: 4, left: 12 },
  missing: 0,
  stale: 0,
}

describe('newsletter status in plain words', () => {
  it('says everything is fine when it is', () => {
    const { lines, canSync } = describeStatus(healthy)
    expect(lines.map((l) => [l.tone, l.text])).toEqual([
      ['good', 'The link with Brevo works. Account: Stichting Boerengroep.'],
      ['good', 'People who confirm their email go to the list "Newsletter" (number 7). It has 212 people.'],
      ['plain', 'On this site: 198 people confirmed, 4 still have to click the link in their email, 12 unsubscribed.'],
      ['good', 'The list is complete. There is nothing to do.'],
    ])
    expect(canSync).toBe(false)
  })

  it('offers to repair the list when people are missing or should be gone', () => {
    const { lines, canSync } = describeStatus({ ...healthy, missing: 1, stale: 3 })
    expect(lines.slice(3).map((l) => [l.tone, l.text])).toEqual([
      ['attention', '1 person confirmed on the site but is not on the Brevo list.'],
      ['attention', '3 people unsubscribed on the site but are still on the Brevo list.'],
    ])
    expect(canSync).toBe(true)
  })

  it('explains what to do when there is no key', () => {
    const { lines, canSync } = describeStatus({
      ...healthy,
      key: { ok: false, error: 'No Brevo API key is set for this site.' },
      list: { ok: false, error: 'The key has to work before the list can be checked.' },
      missing: null,
      stale: null,
    })
    expect(lines[0]).toEqual({
      tone: 'problem',
      text: 'This site has no Brevo key yet, so nobody is added to your list.',
      detail:
        'In Brevo, click your name at the top right, then "SMTP & API", then "API keys", and create a key. Paste it in the box "New Brevo key" below and press Save.',
    })
    expect(lines).toHaveLength(2)
    expect(lines[1]?.tone).toBe('plain')
    expect(canSync).toBe(false)
  })

  it('passes on the reason when Brevo refuses the key', () => {
    const { lines } = describeStatus({
      ...healthy,
      key: { ok: false, error: 'API Key is not enabled' },
      list: { ok: false, error: 'x' },
      missing: null,
      stale: null,
    })
    expect(lines[0]?.text).toBe('Brevo does not accept the key of this site, so nobody is added to your list.')
    expect(lines[0]?.detail).toContain('Brevo says: "API Key is not enabled".')
  })

  it('lists the lists to choose from when none is chosen', () => {
    const { lines, canSync } = describeStatus({
      ...healthy,
      list: {
        ok: false,
        error: 'No list is chosen yet. Fill in the list number above and save.',
        available: [
          { id: 3, name: 'Newsletter', subscribers: 212 },
          { id: 5, name: 'Friends', subscribers: 1 },
        ],
      },
      missing: null,
      stale: null,
    })
    expect(lines[1]).toEqual({
      tone: 'problem',
      text: 'No list is chosen yet. Fill in the list number above and save.',
      detail: 'Lists in this Brevo account: number 3 "Newsletter" (212 people), number 5 "Friends" (1 person).',
    })
    expect(canSync).toBe(false)
  })
})
