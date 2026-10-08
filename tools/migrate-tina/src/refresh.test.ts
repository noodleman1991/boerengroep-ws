import { describe, expect, it, vi } from 'vitest'
import { refreshSite } from './refresh'

const base = { siteUrl: 'https://example.org/', secret: 's3cret', tenantSlug: 'boerengroep', collections: ['pages', 'events'] }

describe('telling the site to refresh after an import', () => {
  it('asks the site once, for every kind of content of this tenant, with its secret', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 200 }))
    const out = await refreshSite({ ...base, fetchImpl: fetchImpl as never })
    expect(out.ok).toBe(true)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://example.org/api/revalidate')
    expect((init.headers as Record<string, string>)['x-revalidate-secret']).toBe('s3cret')
    expect(JSON.parse(init.body as string)).toEqual({ tags: ['boerengroep:pages', 'boerengroep:events'] })
  })
  it('says so when the site refuses', async () => {
    const out = await refreshSite({ ...base, fetchImpl: (async () => new Response('', { status: 401 })) as never })
    expect(out).toEqual({ ok: false, detail: 'https://example.org answered 401' })
  })
  it('says so when the site is not running, and does not throw', async () => {
    const out = await refreshSite({ ...base, fetchImpl: (async () => { throw new Error('connect ECONNREFUSED') }) as never })
    expect(out.ok).toBe(false)
    expect(out.detail).toContain('could not be reached: connect ECONNREFUSED')
  })
  it('does not call anything without an address or a secret', async () => {
    const fetchImpl = vi.fn()
    expect((await refreshSite({ ...base, siteUrl: ' ', fetchImpl: fetchImpl as never })).ok).toBe(false)
    expect((await refreshSite({ ...base, secret: null, fetchImpl: fetchImpl as never })).ok).toBe(false)
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
