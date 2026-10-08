import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * The admin panel lives in one app, and editors preview drafts of both sites from it. For
 * its own site the browser's login is proof enough. The other site cannot see that login,
 * so the admin panel hands it a signed link instead. The signature is made with the secret
 * the two already share for refreshing the site, and the link stops working after half a day.
 */
const VALID_MS = 12 * 60 * 60 * 1000

const sign = (path: string, exp: number, secret: string) => createHmac('sha256', secret).update(`${path}\n${exp}`).digest('hex')

export function signPreview(path: string, secret: string, now: number = Date.now()): { exp: number; sig: string } {
  const exp = now + VALID_MS
  return { exp, sig: sign(path, exp, secret) }
}

export function checkPreview(args: { path: string; exp: unknown; sig: unknown; secret: string | undefined; now?: number }): boolean {
  const { path, secret } = args
  const exp = typeof args.exp === 'string' && /^\d+$/.test(args.exp) ? Number(args.exp) : Number.NaN
  if (!secret || typeof args.sig !== 'string' || !Number.isFinite(exp)) return false
  if (exp < (args.now ?? Date.now())) return false
  const given = Buffer.from(args.sig, 'utf8')
  const expected = Buffer.from(sign(path, exp, secret), 'utf8')
  return given.length === expected.length && timingSafeEqual(given, expected)
}
