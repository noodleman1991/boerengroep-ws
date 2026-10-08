import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

/**
 * Keys of other services that an admin saves in the settings are kept unreadable in the
 * database. They are locked with the secret of this installation, which lives with the
 * hosting and not in the database: someone who gets hold of the database alone cannot use them.
 */
const MARK = 'sealed:v1:'

const keyFrom = (secret: string) => createHash('sha256').update(`${secret}:settings-secrets`).digest()

export const isSealed = (value: unknown): value is string => typeof value === 'string' && value.startsWith(MARK)

/** Locks a text. The result differs every time, also for the same text. */
export function seal(text: string, secret: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', keyFrom(secret), iv)
  const locked = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return `${MARK}${[iv, cipher.getAuthTag(), locked].map((part) => part.toString('base64url')).join('.')}`
}

/** Unlocks a text. Gives nothing when it was locked with another secret or was tampered with. */
export function unseal(sealed: unknown, secret: string): string | undefined {
  if (!isSealed(sealed)) return undefined
  const [iv, tag, locked] = sealed.slice(MARK.length).split('.').map((part) => Buffer.from(part, 'base64url'))
  if (!iv || !tag || !locked) return undefined
  try {
    const decipher = createDecipheriv('aes-256-gcm', keyFrom(secret), iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(locked), decipher.final()]).toString('utf8')
  } catch {
    return undefined
  }
}

/** The last characters of a key, to recognise it by without showing it. */
export const hintOf = (text: string): string => `…${text.slice(-4)}`
