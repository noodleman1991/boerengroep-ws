import { describe, expect, it, vi } from 'vitest'
import { createBrevo } from './brevo'

type Call = { url: string; method: string; body: unknown; key: string | null }

function fake(responses: Array<{ status: number; json?: unknown } | Error>, apiKey = 'key-123') {
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
  return { calls, brevo: createBrevo({ apiKey, fetchImpl: fetchImpl as never }) }
}

const anna = { email: 'Anna@Example.org ', listId: 7, templateId: 3, redirectUrl: 'https://site.example/nl/newsletter/verify', language: 'nl' }

describe('brevo client', () => {
  it('asks Brevo to send its confirmation email, for one list, in the language of the visitor', async () => {
    const { brevo, calls } = fake([{ status: 201 }])
    expect(await brevo.requestConfirmation(anna)).toEqual({ ok: true })
    expect(calls).toEqual([
      {
        url: 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation',
        method: 'POST',
        key: 'key-123',
        body: {
          email: 'anna@example.org',
          includeListIds: [7],
          templateId: 3,
          redirectionUrl: 'https://site.example/nl/newsletter/verify',
          attributes: { LANGUAGE: 'NL' },
        },
      },
    ])
  })

  it('treats someone Brevo already knows as success', async () => {
    const { brevo } = fake([{ status: 204 }])
    expect(await brevo.requestConfirmation(anna)).toEqual({ ok: true })
  })

  it('asks again without the language when the Brevo account has no such attribute', async () => {
    const { brevo, calls } = fake([
      { status: 400, json: { code: 'invalid_parameter', message: 'Attribute LANGUAGE does not exist' } },
      { status: 201 },
    ])
    expect(await brevo.requestConfirmation(anna)).toEqual({ ok: true })
    expect(calls[1].body).toEqual({
      email: 'anna@example.org',
      includeListIds: [7],
      templateId: 3,
      redirectionUrl: 'https://site.example/nl/newsletter/verify',
    })
  })

  it('reports the reason when Brevo refuses, for example a disabled key', async () => {
    const { brevo } = fake([{ status: 401, json: { code: 'unauthorized', message: 'API Key is not enabled' } }])
    expect(await brevo.requestConfirmation(anna)).toEqual({ ok: false, error: 'API Key is not enabled' })
  })

  it('reports a network failure instead of throwing', async () => {
    const { brevo } = fake([new Error('getaddrinfo ENOTFOUND')])
    expect(await brevo.requestConfirmation(anna)).toEqual({ ok: false, error: 'getaddrinfo ENOTFOUND' })
  })

  it('does not call Brevo without a key', async () => {
    // An empty box in the settings counts as no key.
    const { brevo, calls } = fake([], '  ')
    expect(brevo.configured).toBe(false)
    expect(await brevo.requestConfirmation(anna)).toEqual({ ok: false, error: 'No Brevo API key is set for this site.' })
    expect(await brevo.check()).toEqual({ ok: false, error: 'No Brevo API key is set for this site.' })
    expect(calls).toEqual([])
  })

  it('reads the lists of the account with how many people are on them', async () => {
    const { brevo, calls } = fake([
      { status: 200, json: { lists: [{ id: 7, name: 'Newsletter', uniqueSubscribers: 212 }, { id: 9, name: 'Friends' }] } },
    ])
    expect(await brevo.listLists()).toEqual({
      ok: true,
      lists: [
        { id: 7, name: 'Newsletter', subscribers: 212 },
        { id: 9, name: 'Friends', subscribers: 0 },
      ],
    })
    expect(calls[0].url).toBe('https://api.brevo.com/v3/contacts/lists?limit=50&offset=0')
  })

  it('reads one email template and whether Brevo sees it as a confirmation email', async () => {
    const { brevo, calls } = fake([
      { status: 200, json: { id: 3, name: 'Confirm your address', isActive: true, doiTemplate: true } },
    ])
    expect(await brevo.template(3)).toEqual({ ok: true, name: 'Confirm your address', active: true, confirmation: true })
    expect(calls[0].url).toBe('https://api.brevo.com/v3/smtp/templates/3')
  })

  it('says so when a template is switched off or has no confirmation button', async () => {
    const { brevo } = fake([{ status: 200, json: { id: 4, name: 'Welcome', isActive: false, doiTemplate: false } }])
    expect(await brevo.template(4)).toEqual({ ok: true, name: 'Welcome', active: false, confirmation: false })
  })

  it('says so when a template does not exist', async () => {
    const { brevo } = fake([{ status: 404, json: { code: 'document_not_found', message: 'Template ID does not exist' } }])
    expect(await brevo.template(99)).toEqual({ ok: false, error: 'Template ID does not exist', missing: true })
  })

  it('reads the email templates of the account, also when there are none', async () => {
    const some = fake([
      { status: 200, json: { count: 2, templates: [{ id: 3, name: 'Confirm', isActive: true }, { id: 4, name: 'Old', isActive: false }] } },
    ])
    expect(await some.brevo.listTemplates()).toEqual({
      ok: true,
      templates: [
        { id: 3, name: 'Confirm', active: true },
        { id: 4, name: 'Old', active: false },
      ],
    })
    expect(some.calls[0].url).toBe('https://api.brevo.com/v3/smtp/templates?limit=50&offset=0')
    const none = fake([{ status: 200, json: {} }])
    expect(await none.brevo.listTemplates()).toEqual({ ok: true, templates: [] })
  })

  it('checks the key by asking for the account', async () => {
    const { brevo } = fake([{ status: 200, json: { companyName: 'Stichting Boerengroep', email: 'info@example.org' } }])
    expect(await brevo.check()).toEqual({ ok: true, account: 'Stichting Boerengroep' })
  })
})
