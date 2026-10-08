/**
 * After an import the site still remembers what it showed before: the import writes straight
 * to the database and skips the per-item refresh, which would be thousands of calls. This tells
 * the site once to drop everything it remembers about this tenant.
 */
export async function refreshSite(input: {
  siteUrl: string | null | undefined
  secret: string | null | undefined
  tenantSlug: string
  /** Every kind of content the site may have remembered. */
  collections: string[]
  fetchImpl?: typeof fetch
  timeoutMs?: number
}): Promise<{ ok: boolean; detail: string }> {
  const origin = input.siteUrl?.trim().replace(/\/$/, '')
  if (!origin || !input.secret) return { ok: false, detail: 'the site has no address or no refresh secret in its settings' }
  const tags = input.collections.map((collection) => `${input.tenantSlug}:${collection}`)
  try {
    const res = await (input.fetchImpl ?? fetch)(`${origin}/api/revalidate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': input.secret },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(input.timeoutMs ?? 15_000),
    })
    if (!res.ok) return { ok: false, detail: `${origin} answered ${res.status}` }
    return { ok: true, detail: `${origin} dropped what it remembered (${tags.length} kinds of content)` }
  } catch (err) {
    return { ok: false, detail: `${origin} could not be reached: ${(err as Error).message}` }
  }
}
