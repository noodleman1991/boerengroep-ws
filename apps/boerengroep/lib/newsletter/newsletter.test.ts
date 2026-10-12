import { describe, expect, it, vi } from 'vitest'
import type { Brevo } from './brevo'
import { createNewsletter, wholeNumber } from './newsletter'

const ok = { ok: true } as const

type Chosen = { listId: number | null; templateId: number | null }

function setup({
  brevo: over = {},
  chosen = { en: { listId: 7, templateId: 3 }, nl: { listId: 7, templateId: 3 } },
  off = false,
}: { brevo?: Partial<Brevo>; chosen?: Record<string, Chosen>; off?: boolean } = {}) {
  const brevo = {
    configured: true,
    requestConfirmation: vi.fn(async () => ok),
    listLists: vi.fn(async () => ({ ok: true as const, lists: [{ id: 7, name: 'Newsletter', subscribers: 212 }] })),
    template: vi.fn(async (id: number) => ({ ok: true as const, name: `Email ${id}`, active: true, confirmation: true })),
    listTemplates: vi.fn(async () => ({ ok: true as const, templates: [{ id: 3, name: 'Email 3', active: true }] })),
    check: vi.fn(async () => ({ ok: true as const, account: 'Stichting Boerengroep' })),
    ...over,
  } as unknown as Brevo
  const problems: string[] = []
  const newsletter = createNewsletter({
    brevo,
    settings: async (language) => chosen[language],
    confirmedUrl: (language) => `https://site.example/${language}/newsletter/verify`,
    languages: ['en', 'nl'],
    off: () => off,
    report: (m) => problems.push(m),
  })
  return { brevo, newsletter, problems }
}

describe('signing up for the newsletter', () => {
  it('asks Brevo to send its confirmation email, with the page to come back to', async () => {
    const { newsletter, brevo, problems } = setup()
    expect(await newsletter.signUp('anna@example.org', 'nl')).toEqual({ status: 'sent' })
    expect(brevo.requestConfirmation).toHaveBeenCalledWith({
      email: 'anna@example.org',
      listId: 7,
      templateId: 3,
      redirectUrl: 'https://site.example/nl/newsletter/verify',
      language: 'nl',
    })
    expect(problems).toEqual([])
  })

  it('uses the confirmation email chosen for the language of the visitor', async () => {
    const { newsletter, brevo } = setup({ chosen: { en: { listId: 7, templateId: 3 }, nl: { listId: 7, templateId: 5 } } })
    await newsletter.signUp('anna@example.org', 'nl')
    expect(brevo.requestConfirmation).toHaveBeenCalledWith(expect.objectContaining({ templateId: 5 }))
  })

  it('passes nobody to Brevo on a copy of the site that must not send email', async () => {
    const { newsletter, brevo } = setup({ off: true })
    expect(await newsletter.signUp('anna@example.org', 'nl')).toEqual({ status: 'off' })
    expect(brevo.requestConfirmation).not.toHaveBeenCalled()
  })

  it.each([
    ['no-key', { brevo: { configured: false } as Partial<Brevo> }],
    ['no-list', { chosen: { nl: { listId: null, templateId: 3 } } }],
    ['no-confirmation', { chosen: { nl: { listId: 7, templateId: null } } }],
  ] as const)('is not ready and says why: %s', async (reason, options) => {
    const { newsletter, brevo, problems } = setup(options)
    expect(await newsletter.signUp('anna@example.org', 'nl')).toEqual({ status: 'not-ready', reason })
    expect(brevo.requestConfirmation).not.toHaveBeenCalled()
    expect(problems).toHaveLength(1)
  })

  it('reports a refusal by Brevo, without the address of the visitor', async () => {
    const { newsletter, problems } = setup({
      brevo: { requestConfirmation: vi.fn(async () => ({ ok: false as const, error: 'API Key is not enabled' })) },
    })
    expect(await newsletter.signUp('anna@example.org', 'nl')).toEqual({ status: 'failed', error: 'API Key is not enabled' })
    expect(problems).toEqual(['Brevo did not send the confirmation email: API Key is not enabled'])
  })

  it('never throws, also when the settings cannot be read', async () => {
    const { newsletter, problems } = setup({ chosen: {} })
    expect(await newsletter.signUp('anna@example.org', 'nl')).toMatchObject({ status: 'failed' })
    expect(problems).toHaveLength(1)
  })
})

describe('what an admin sees about the sign-up', () => {
  it('reports the account, the list and the confirmation email when all is well', async () => {
    const { newsletter, brevo } = setup()
    expect(await newsletter.status()).toEqual({
      off: false,
      key: { ok: true, account: 'Stichting Boerengroep' },
      list: { ok: true, id: 7, name: 'Newsletter', people: 212 },
      confirmation: [{ ok: true, languages: ['en', 'nl'], id: 3, name: 'Email 3' }],
    })
    expect(brevo.template).toHaveBeenCalledTimes(1)
    expect(brevo.listTemplates).not.toHaveBeenCalled()
  })

  it('checks nothing more when Brevo refuses the key', async () => {
    const { newsletter, brevo } = setup({ brevo: { check: vi.fn(async () => ({ ok: false as const, error: 'API Key is not enabled' })) } })
    expect(await newsletter.status()).toEqual({
      off: false,
      key: { ok: false, error: 'API Key is not enabled' },
      list: { ok: false, error: 'The key has to work before the list can be checked.' },
      confirmation: [],
    })
    expect(brevo.listLists).not.toHaveBeenCalled()
  })

  it('names the lists of the account when none is chosen, or the chosen one does not exist', async () => {
    const none = await setup({ chosen: { en: { listId: null, templateId: 3 }, nl: { listId: null, templateId: 3 } } }).newsletter.status()
    expect(none.list).toEqual({
      ok: false,
      error: 'No list is chosen yet. Fill in the list number below and save.',
      available: [{ id: 7, name: 'Newsletter', subscribers: 212 }],
    })
    const wrong = await setup({ chosen: { en: { listId: 8, templateId: 3 }, nl: { listId: 8, templateId: 3 } } }).newsletter.status()
    expect(wrong.list).toMatchObject({ ok: false, error: 'There is no list with number 8 in this Brevo account.' })
  })

  it('reports each language apart when they use different confirmation emails', async () => {
    const { newsletter } = setup({ chosen: { en: { listId: 7, templateId: 3 }, nl: { listId: 7, templateId: 5 } } })
    expect((await newsletter.status()).confirmation).toEqual([
      { ok: true, languages: ['en'], id: 3, name: 'Email 3' },
      { ok: true, languages: ['nl'], id: 5, name: 'Email 5' },
    ])
  })

  it('says what is wrong with a confirmation email, and names the emails of the account', async () => {
    const cases = [
      [{ ok: false as const, error: 'Template ID does not exist', missing: true as const }, { problem: 'missing', id: 3 }],
      [{ ok: true as const, name: 'Welcome', active: false, confirmation: true }, { problem: 'off', id: 3, name: 'Welcome' }],
      [{ ok: true as const, name: 'Welcome', active: true, confirmation: false }, { problem: 'no-button', id: 3, name: 'Welcome' }],
      [{ ok: false as const, error: 'timeout' }, { problem: 'unreadable', id: 3, error: 'timeout' }],
    ] as const
    for (const [answer, expected] of cases) {
      const { newsletter } = setup({ brevo: { template: vi.fn(async () => answer) as never } })
      const status = await newsletter.status()
      expect(status.confirmation).toEqual([{ ok: false, languages: ['en', 'nl'], ...expected }])
      expect(status.templates).toEqual([{ id: 3, name: 'Email 3', active: true }])
    }
  })

  it('says so when no confirmation email is chosen', async () => {
    const { newsletter, brevo } = setup({ chosen: { en: { listId: 7, templateId: null }, nl: { listId: 7, templateId: null } } })
    const status = await newsletter.status()
    expect(status.confirmation).toEqual([{ ok: false, languages: ['en', 'nl'], problem: 'none' }])
    expect(brevo.template).not.toHaveBeenCalled()
  })

  it('tells that this copy of the site passes nobody on', async () => {
    expect((await setup({ off: true }).newsletter.status()).off).toBe(true)
  })
})

describe('a number typed in the settings', () => {
  it('counts only when it is a whole number above zero', () => {
    expect(wholeNumber(7)).toBe(7)
    for (const not of [0, -1, 2.5, Number.NaN, null, undefined, '7']) expect(wholeNumber(not)).toBeNull()
  })
})
