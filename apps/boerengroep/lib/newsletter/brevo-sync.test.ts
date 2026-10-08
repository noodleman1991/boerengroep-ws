import { describe, expect, it, vi } from 'vitest'
import type { Brevo } from '../email/brevo'
import { createNewsletterSync } from './brevo-sync'

const ok = { ok: true } as const

function setup(over: Partial<Brevo> = {}, listId: number | null = 7) {
  const brevo = {
    configured: true,
    addToList: vi.fn(async () => ok),
    removeFromList: vi.fn(async () => ok),
    deleteContact: vi.fn(async () => ok),
    importToList: vi.fn(async () => ok),
    removeManyFromList: vi.fn(async () => ok),
    listContacts: vi.fn(async () => ({ ok: true as const, emails: [] as string[] })),
    listLists: vi.fn(async () => ({ ok: true as const, lists: [{ id: 7, name: 'Newsletter', subscribers: 2 }] })),
    check: vi.fn(async () => ({ ok: true as const, account: 'Stichting Boerengroep' })),
    ...over,
  } as unknown as Brevo
  const problems: string[] = []
  const sync = createNewsletterSync({ brevo, listId: async () => listId, report: (m) => problems.push(m) })
  return { brevo, sync, problems }
}

const site = {
  confirmed: [
    { email: 'anna@example.org', language: 'nl' },
    { email: 'ben@example.org', language: 'en' },
  ],
  left: ['carl@example.org'],
  waiting: 3,
}

describe('newsletter and Brevo', () => {
  it('adds someone to the list when they confirm their email', async () => {
    const { sync, brevo } = setup()
    expect(await sync.confirmed('anna@example.org', 'nl')).toEqual({ status: 'done' })
    expect(brevo.addToList).toHaveBeenCalledWith('anna@example.org', 7, 'nl')
  })

  it('skips quietly when no list is chosen yet', async () => {
    const { sync, brevo, problems } = setup({}, null)
    expect(await sync.confirmed('anna@example.org', 'nl')).toEqual({ status: 'skipped', reason: 'no-list' })
    expect(brevo.addToList).not.toHaveBeenCalled()
    expect(problems).toEqual([])
  })

  it('skips quietly when no key is set', async () => {
    const { sync, brevo } = setup({ configured: false } as Partial<Brevo>)
    expect(await sync.confirmed('anna@example.org', 'nl')).toEqual({ status: 'skipped', reason: 'no-key' })
    expect(await sync.unsubscribed('anna@example.org')).toEqual({ status: 'skipped', reason: 'no-key' })
    expect(await sync.deleted('anna@example.org')).toEqual({ status: 'skipped', reason: 'no-key' })
    expect(brevo.addToList).not.toHaveBeenCalled()
  })

  it('reports a refusal and never throws, so the visitor is not held up', async () => {
    const { sync, problems } = setup({ addToList: vi.fn(async () => ({ ok: false as const, error: 'API Key is not enabled' })) })
    expect(await sync.confirmed('anna@example.org', 'nl')).toEqual({ status: 'failed', error: 'API Key is not enabled' })
    expect(problems).toEqual(['Brevo did not add anna@example.org to list 7: API Key is not enabled'])
  })

  it('survives a list lookup that fails', async () => {
    const brevo = { configured: true, addToList: vi.fn() } as unknown as Brevo
    const sync = createNewsletterSync({
      brevo,
      listId: async () => {
        throw new Error('database away')
      },
      report: () => {},
    })
    expect(await sync.confirmed('anna@example.org', 'nl')).toEqual({ status: 'failed', error: 'database away' })
  })

  it('takes someone off the list when they unsubscribe', async () => {
    const { sync, brevo } = setup()
    expect(await sync.unsubscribed('anna@example.org')).toEqual({ status: 'done' })
    expect(brevo.removeFromList).toHaveBeenCalledWith('anna@example.org', 7)
  })

  it('deletes the contact when someone asks for their data to be erased, list or no list', async () => {
    const { sync, brevo } = setup({}, null)
    expect(await sync.deleted('anna@example.org')).toEqual({ status: 'done' })
    expect(brevo.deleteContact).toHaveBeenCalledWith('anna@example.org')
  })

  it('shows who is missing from the list and who should have left it', async () => {
    const { sync } = setup({
      listContacts: vi.fn(async () => ({ ok: true as const, emails: ['ben@example.org', 'carl@example.org', 'someone@else.org'] })),
    })
    expect(await sync.status(site)).toEqual({
      key: { ok: true, account: 'Stichting Boerengroep' },
      list: { ok: true, id: 7, name: 'Newsletter', people: 3 },
      site: { confirmed: 2, waiting: 3, left: 1 },
      missing: 1,
      stale: 1,
    })
  })

  it('explains a missing key', async () => {
    const { sync } = setup({
      configured: false,
      check: vi.fn(async () => ({ ok: false as const, error: 'No Brevo API key is set for this site.' })),
    } as Partial<Brevo>)
    const status = await sync.status(site)
    expect(status.key).toEqual({ ok: false, error: 'No Brevo API key is set for this site.' })
    expect(status.list).toEqual({ ok: false, error: 'The key has to work before the list can be checked.' })
    expect(status.missing).toBeNull()
  })

  it('offers the lists of the account when none is chosen or the number is wrong', async () => {
    const none = await setup({}, null).sync.status(site)
    expect(none.list).toEqual({
      ok: false,
      error: 'No list is chosen yet. Fill in the list number above and save.',
      available: [{ id: 7, name: 'Newsletter', subscribers: 2 }],
    })
    const wrong = await setup({}, 99).sync.status(site)
    expect(wrong.list).toEqual({
      ok: false,
      error: 'There is no list with number 99 in this Brevo account.',
      available: [{ id: 7, name: 'Newsletter', subscribers: 2 }],
    })
  })

  it('brings the list in line: adds who is missing, removes who left', async () => {
    const { sync, brevo } = setup({
      listContacts: vi.fn(async () => ({ ok: true as const, emails: ['ben@example.org', 'carl@example.org'] })),
    })
    expect(await sync.syncAll(site)).toEqual({ ok: true, added: 1, removed: 1 })
    expect(brevo.importToList).toHaveBeenCalledWith([{ email: 'anna@example.org', language: 'nl' }], 7)
    expect(brevo.removeManyFromList).toHaveBeenCalledWith(['carl@example.org'], 7)
  })

  it('says why when bringing the list in line is not possible', async () => {
    expect(await setup({}, null).sync.syncAll(site)).toEqual({ ok: false, error: 'No list is chosen yet. Fill in the list number above and save.' })
    const refused = setup({ importToList: vi.fn(async () => ({ ok: false as const, error: 'API Key is not enabled' })) })
    expect(await refused.sync.syncAll(site)).toEqual({ ok: false, error: 'API Key is not enabled' })
  })
})
