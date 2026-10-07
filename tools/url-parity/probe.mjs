import { normalizeLocation } from './location.mjs'

const MAX_HOPS = 6

/** Requests a path and follows redirects by hand so every hop is recorded. */
export async function probe(base, path) {
  const chain = []
  let url = new URL(path, base).toString()
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    let res
    try {
      res = await fetch(url, { redirect: 'manual', headers: { 'accept-language': 'en' } })
    } catch {
      chain.push({ status: 0 })
      return chain
    }
    const { location, duplicated } = normalizeLocation(res.headers.get('location'))
    chain.push({ status: res.status, location, ...(duplicated ? { duplicatedLocation: true } : {}) })
    if (res.status < 300 || res.status >= 400 || !location) return chain
    url = new URL(location, url).toString()
  }
  return chain
}
