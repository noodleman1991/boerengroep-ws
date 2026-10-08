import { describe, expect, it, vi } from 'vitest'
import { createBrevo } from './brevo'

type Call = { url: string; method: string; body: unknown; key: string | null }

function fake(responses: Array<{ status: number; json?: unknown } | Error>) {
  const calls: Call[] = []
  const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({
      url: String(url),
      method: init?.method ?? 'GET',
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
      key: new Headers(init?.headers).get('api-key'),
    })
    const next = responses.shift()
    if (!next) throw new Error('unexpected call')
    if (next instanceof Error) throw next
    return new Response(next.json === undefined ? null : JSON.stringify(next.json), { status: next.status })
  })
  return { calls, brevo: createBrevo({ apiKey: 'key-123', fetchImpl: fetchImpl as never }) }
}

describe('brevo client', () => {
  it('adds a confirmed subscriber to the list with their language', async () => {
    const { brevo, calls } = fake([{ status: 201, json: { id: 5 } }])
    expect(await brevo.addToList('Anna@Example.org ', 7, 'nl')).toEqual({ ok: true })
    expect(calls[0]).toEqual({
      url: 'https://api.brevo.com/v3/contacts',
      method: 'POST',
      key: 'key-123',
      body: { email: 'anna@example.org', listIds: [7], updateEnabled: true, attributes: { LANGUAGE: 'NL' } },
    })
  })

  it('treats an update of an existing contact as success', async () => {
    const { brevo } = fake([{ status: 204 }])
    expect(await brevo.addToList('a@b.org', 7, 'en')).toEqual({ ok: true })
  })

  it('reports the reason when Brevo refuses, for example a disabled key', async () => {
    const { brevo } = fake([{ status: 401, json: { code: 'unauthorized', message: 'API Key is not enabled' } }])
    expect(await brevo.addToList('a@b.org', 7, 'en')).toEqual({ ok: false, error: 'API Key is not enabled' })
  })

  it('reports a network failure instead of throwing', async () => {
    const { brevo } = fake([new Error('getaddrinfo ENOTFOUND')])
    expect(await brevo.addToList('a@b.org', 7, 'en')).toEqual({ ok: false, error: 'getaddrinfo ENOTFOUND' })
  })

  it('removes someone from the list when they unsubscribe', async () => {
    const { brevo, calls } = fake([{ status: 201, json: { contacts: { success: ['a@b.org'] } } }])
    expect(await brevo.removeFromList('a@b.org', 7)).toEqual({ ok: true })
    expect(calls[0]).toMatchObject({
      url: 'https://api.brevo.com/v3/contacts/lists/7/contacts/remove',
      method: 'POST',
      body: { emails: ['a@b.org'] },
    })
  })

  it('counts someone who was never on the list as removed', async () => {
    const { brevo } = fake([{ status: 400, json: { code: 'invalid_parameter', message: 'Contact already removed from list and/or does not exist' } }])
    expect(await brevo.removeFromList('a@b.org', 7)).toEqual({ ok: true })
  })

  it('deletes a contact, and is fine with one that is already gone', async () => {
    const first = fake([{ status: 204 }])
    expect(await first.brevo.deleteContact('a+b@b.org')).toEqual({ ok: true })
    expect(first.calls[0]).toMatchObject({ url: 'https://api.brevo.com/v3/contacts/a%2Bb%40b.org', method: 'DELETE' })
    const second = fake([{ status: 404, json: { code: 'document_not_found', message: 'Contact does not exist' } }])
    expect(await second.brevo.deleteContact('a@b.org')).toEqual({ ok: true })
  })

  it('lists the lists of the account', async () => {
    const { brevo } = fake([{ status: 200, json: { lists: [{ id: 7, name: 'Newsletter', uniqueSubscribers: 212, folderId: 1 }] } }])
    expect(await brevo.listLists()).toEqual({ ok: true, lists: [{ id: 7, name: 'Newsletter', subscribers: 212 }] })
  })

  it('checks the key and names the account', async () => {
    const good = fake([{ status: 200, json: { companyName: 'Stichting Boerengroep', email: 'x@y.org' } }])
    expect(await good.brevo.check()).toEqual({ ok: true, account: 'Stichting Boerengroep' })
    const bad = fake([{ status: 401, json: { message: 'API Key is not enabled' } }])
    expect(await bad.brevo.check()).toEqual({ ok: false, error: 'API Key is not enabled' })
  })

  it('tries again without the language when the account has no such attribute', async () => {
    const { brevo, calls } = fake([
      { status: 400, json: { code: 'invalid_parameter', message: 'Invalid attribute LANGUAGE' } },
      { status: 201, json: { id: 9 } },
    ])
    expect(await brevo.addToList('a@b.org', 7, 'nl')).toEqual({ ok: true })
    expect(calls[1]?.body).toEqual({ email: 'a@b.org', listIds: [7], updateEnabled: true })
  })

  it('reads everyone on a list, page by page', async () => {
    const page = (from: number, size: number) => ({
      status: 200,
      json: { count: 620, contacts: Array.from({ length: size }, (_, i) => ({ id: from + i, email: `P${from + i}@Example.org` })) },
    })
    const { brevo, calls } = fake([page(0, 500), page(500, 120)])
    const result = await brevo.listContacts(7)
    expect(result.ok && result.emails.length).toBe(620)
    expect(result.ok && result.emails[0]).toBe('p0@example.org')
    expect(calls.map((c) => c.url)).toEqual([
      'https://api.brevo.com/v3/contacts/lists/7/contacts?limit=500&offset=0',
      'https://api.brevo.com/v3/contacts/lists/7/contacts?limit=500&offset=500',
    ])
  })

  it('sends many people to a list in one go', async () => {
    const { brevo, calls } = fake([{ status: 202, json: { processId: 78 } }])
    const people = [
      { email: 'A@b.org', language: 'nl' },
      { email: 'c@d.org', language: 'en' },
    ]
    expect(await brevo.importToList(people, 7)).toEqual({ ok: true })
    expect(calls[0]).toMatchObject({
      url: 'https://api.brevo.com/v3/contacts/import',
      method: 'POST',
      body: {
        listIds: [7],
        updateExistingContacts: true,
        emptyContactsAttributes: false,
        disableNotification: true,
        jsonBody: [
          { email: 'a@b.org', attributes: { LANGUAGE: 'NL' } },
          { email: 'c@d.org', attributes: { LANGUAGE: 'EN' } },
        ],
      },
    })
  })

  it('has nothing to send when the group is empty', async () => {
    const { brevo, calls } = fake([])
    expect(await brevo.importToList([], 7)).toEqual({ ok: true })
    expect(await brevo.removeManyFromList([], 7)).toEqual({ ok: true })
    expect(calls).toHaveLength(0)
  })

  it('removes many people in groups of 150', async () => {
    const { brevo, calls } = fake([{ status: 201, json: {} }, { status: 201, json: {} }])
    const emails = Array.from({ length: 151 }, (_, i) => `p${i}@b.org`)
    expect(await brevo.removeManyFromList(emails, 7)).toEqual({ ok: true })
    expect((calls[0]?.body as { emails: string[] }).emails).toHaveLength(150)
    expect((calls[1]?.body as { emails: string[] }).emails).toEqual(['p150@b.org'])
  })

  it('does nothing and says so when no key is set', async () => {
    const fetchImpl = vi.fn()
    const brevo = createBrevo({ apiKey: undefined, fetchImpl: fetchImpl as never })
    expect(brevo.configured).toBe(false)
    expect(await brevo.addToList('a@b.org', 7, 'en')).toEqual({ ok: false, error: 'No Brevo API key is set for this site.' })
    expect(await brevo.check()).toEqual({ ok: false, error: 'No Brevo API key is set for this site.' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
