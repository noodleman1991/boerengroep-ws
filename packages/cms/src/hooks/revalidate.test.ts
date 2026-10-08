import { describe, expect, it, vi } from 'vitest'
import { revalidateTenant } from './revalidate'

function fakePayload(opts: { own: string; revalidateLocal?: (tags: string[]) => void; tenant?: object | null }) {
  const errors: string[] = []
  return {
    errors,
    payload: {
      config: { custom: { tenantSlug: opts.own, revalidateLocal: opts.revalidateLocal } },
      logger: { error: (msg: string) => errors.push(msg) },
      findByID: async () => {
        if (opts.tenant === null) throw new Error('not found')
        return opts.tenant ?? { id: 1, slug: opts.own, siteUrl: 'https://bg.test', revalidateSecret: 's' }
      },
    },
  }
}

describe('revalidateTenant', () => {
  it('refreshes the local cache for a document of this app tenant', async () => {
    const local = vi.fn()
    const { payload } = fakePayload({ own: 'boerengroep', revalidateLocal: local })
    const fetchImpl = vi.fn()
    const out = await revalidateTenant({ payload, tenant: 1, collection: 'pages', fetchImpl })
    expect(out).toBe('local')
    expect(local).toHaveBeenCalledWith(['boerengroep:pages'])
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('calls the other site for a document of the other tenant', async () => {
    const local = vi.fn()
    const { payload } = fakePayload({
      own: 'boerengroep',
      revalidateLocal: local,
      tenant: { id: 2, slug: 'inspringtheater', siteUrl: 'https://it.test/', revalidateSecret: 'it-secret' },
    })
    const fetchImpl = vi.fn(async () => new Response(null, { status: 200 }))
    const out = await revalidateTenant({ payload, tenant: { id: 2 }, collection: 'events', fetchImpl })
    expect(out).toBe('remote')
    expect(local).not.toHaveBeenCalled()
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://it.test/api/revalidate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-revalidate-secret': 'it-secret' },
        body: JSON.stringify({ tags: ['inspringtheater:events'] }),
      }),
    )
  })

  it('retries a failed remote call once and then gives up without throwing', async () => {
    const { payload, errors } = fakePayload({
      own: 'boerengroep',
      tenant: { id: 2, slug: 'inspringtheater', siteUrl: 'https://it.test', revalidateSecret: 'x' },
    })
    const fetchImpl = vi.fn(async () => new Response(null, { status: 500 }))
    const out = await revalidateTenant({ payload, tenant: 2, collection: 'pages', fetchImpl })
    expect(out).toBe('failed')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(errors[0]).toMatch(/inspringtheater.*500/)
  })

  it('succeeds when the retry works', async () => {
    const { payload } = fakePayload({
      own: 'boerengroep',
      tenant: { id: 2, slug: 'inspringtheater', siteUrl: 'https://it.test', revalidateSecret: 'x' },
    })
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
    expect(await revalidateTenant({ payload, tenant: 2, collection: 'pages', fetchImpl })).toBe('remote')
  })

  it('gives up on a site that does not answer, so an editor save is never left hanging', async () => {
    const { payload, errors } = fakePayload({
      own: 'boerengroep',
      tenant: { id: 2, slug: 'inspringtheater', siteUrl: 'https://it.test', revalidateSecret: 'x' },
    })
    // Answers only when the caller aborts, like a server that accepts the connection and stalls.
    const fetchImpl = vi.fn(
      (_url: unknown, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))
        }),
    )
    const started = Date.now()
    const out = await revalidateTenant({ payload, tenant: 2, collection: 'pages', fetchImpl: fetchImpl as never, timeoutMs: 30 })
    expect(out).toBe('failed')
    expect(Date.now() - started).toBeLessThan(1000)
    expect(errors[0]).toMatch(/inspringtheater/)
  }, 3000)

  it('skips a document without a tenant', async () => {
    const { payload } = fakePayload({ own: 'boerengroep' })
    expect(await revalidateTenant({ payload, tenant: undefined, collection: 'pages' })).toBe('skipped')
  })

  it('does not throw when the tenant cannot be loaded', async () => {
    const { payload, errors } = fakePayload({ own: 'boerengroep', tenant: null })
    expect(await revalidateTenant({ payload, tenant: 9, collection: 'pages' })).toBe('failed')
    expect(errors).toHaveLength(1)
  })

  it('does not throw when the local refresh throws', async () => {
    const { payload, errors } = fakePayload({
      own: 'boerengroep',
      revalidateLocal: () => {
        throw new Error('static generation store missing')
      },
    })
    expect(await revalidateTenant({ payload, tenant: 1, collection: 'pages' })).toBe('failed')
    expect(errors[0]).toMatch(/static generation store missing/)
  })
})
